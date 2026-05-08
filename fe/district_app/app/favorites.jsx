import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const BASE_URL = 'http://10.229.214.121:8080';

export default function FavoritesScreen() {
    const router = useRouter();

    const [userId, setUserId] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    // ── Load userId ───────────────────────────────────────────────────────────
    useEffect(() => {
        const loadUser = async () => {
            try {
                const stored = await AsyncStorage.getItem('userData');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setUserId(parsed.id);
                }
            } catch (e) {
                console.error('Failed to read userId:', e);
            }
        };
        loadUser();
    }, []);

    // ── Fetch favourites ──────────────────────────────────────────────────────
    const fetchFavorites = useCallback(async (uid, isRefresh = false) => {
        if (!uid) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/favorites/user/${uid}`);
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const data = await res.json();
            setFavorites(Array.isArray(data) ? data : []);
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: 'Could not load favourites',
                text2: err.message,
                position: 'top',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (userId) fetchFavorites(userId);
    }, [userId, fetchFavorites]);

    // ── Remove from favourites ────────────────────────────────────────────────
    const handleRemove = async (product) => {
        if (!userId) return;
        setRemovingId(product.id);
        try {
            const res = await fetch(
                `${BASE_URL}/favorites/remove?userId=${userId}&productId=${product.id}`,
                { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }
            );
            if (!res.ok) throw new Error(`Error ${res.status}`);
            // Optimistic remove
            setFavorites((prev) => prev.filter((p) => p.id !== product.id));
            Toast.show({
                type: 'success',
                text1: '💔 Removed from Favourites',
                text2: product.productName,
                position: 'top',
                visibilityTime: 2000,
            });
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: 'Could not remove favourite',
                text2: err.message,
                position: 'top',
            });
        } finally {
            setRemovingId(null);
        }
    };

    // ── Render each card ──────────────────────────────────────────────────────
    const renderCard = (product) => {
        const discount = product.discount ?? 0;
        const finalPrice = (product.price * (1 - discount / 100)).toFixed(0);
        const isRemoving = removingId === product.id;

        return (
            <TouchableOpacity
                key={product.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => router.push(`/product/${product.id}`)}
            >
                {/* Product image */}
                <View style={styles.cardImageWrapper}>
                    {product.imageUrl ? (
                        <Image source={{ uri: product.imageUrl }} style={styles.cardImage} />
                    ) : (
                        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                            <Text style={styles.placeholderIcon}>🛍️</Text>
                        </View>
                    )}

                    {/* Discount ribbon */}
                    {discount > 0 && (
                        <View style={styles.ribbon}>
                            <Text style={styles.ribbonText}>{discount}% OFF</Text>
                        </View>
                    )}

                    {/* Remove heart button */}
                    <TouchableOpacity
                        style={styles.heartBtn}
                        onPress={() => handleRemove(product)}
                        disabled={isRemoving}
                        activeOpacity={0.8}
                    >
                        {isRemoving ? (
                            <ActivityIndicator color="#EC8F8D" size="small" />
                        ) : (
                            <Text style={styles.heartBtnText}>❤️</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Card info */}
                <View style={styles.cardBody}>
                    <Text style={styles.productName} numberOfLines={1}>
                        {product.productName}
                    </Text>
                    <Text style={styles.businessName} numberOfLines={1}>
                        {product.business?.name ?? ''}
                    </Text>

                    {/* Price */}
                    <View style={styles.priceRow}>
                        <Text style={styles.finalPrice}>₹{finalPrice}</Text>
                        {discount > 0 && (
                            <Text style={styles.originalPrice}>₹{product.price.toFixed(0)}</Text>
                        )}
                    </View>

                    {/* Meta: category + validity */}
                    <View style={styles.metaRow}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{product.category}</Text>
                        </View>
                        {product.validityDate && (
                            <Text style={styles.validity}>Exp {product.validityDate}</Text>
                        )}
                    </View>

                    {/* Vouchers left */}
                    <View style={styles.vouchersRow}>
                        <Text style={styles.vouchersText}>
                            🎟 {product.availableDiscountVouchers} vouchers left
                        </Text>
                        <TouchableOpacity
                            style={styles.viewBtn}
                            onPress={() => router.push(`/product/${product.id}`)}
                        >
                            <Text style={styles.viewBtnText}>View →</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => (router.canGoBack() ? router.back() : router.replace('/UserDashboardScreen'))}
                    activeOpacity={0.8}
                >
                    <Text style={styles.backBtnText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Favourites</Text>
                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={() => fetchFavorites(userId, true)}
                    disabled={refreshing}
                >
                    <Text style={styles.refreshBtnText}>{refreshing ? '…' : '⟳'}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#EC8F8D" />
                    <Text style={styles.loadingText}>Loading your favourites…</Text>
                </View>
            ) : favorites.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyIcon}>🤍</Text>
                    <Text style={styles.emptyTitle}>No favourites yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Tap the ❤️ on any product to save it here.
                    </Text>
                    <TouchableOpacity
                        style={styles.exploreBtn}
                        onPress={() => router.replace('/UserDashboardScreen')}
                    >
                        <Text style={styles.exploreBtnText}>Explore Products</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchFavorites(userId, true)}
                            colors={['#EC8F8D']}
                            tintColor="#EC8F8D"
                        />
                    }
                >
                    {/* Count strip */}
                    <View style={styles.countStrip}>
                        <Text style={styles.countText}>
                            ❤️  {favorites.length} saved {favorites.length === 1 ? 'product' : 'products'}
                        </Text>
                    </View>

                    {favorites.map(renderCard)}

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}

            <Toast />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F0E4' },

    // ── Header ────────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#EC8F8D',
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center', justifyContent: 'center',
    },
    backBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '900', color: '#fff' },
    refreshBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center', justifyContent: 'center',
    },
    refreshBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },

    // ── States ────────────────────────────────────────────────────────────────
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    loadingText: { marginTop: 16, color: '#EC8F8D', fontWeight: '600', fontSize: 15 },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyTitle: { fontSize: 22, fontWeight: '900', color: '#537D96', marginBottom: 8 },
    emptySubtitle: { fontSize: 15, color: '#8B9DAB', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    exploreBtn: {
        backgroundColor: '#EC8F8D',
        paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14,
    },
    exploreBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

    scrollContent: { padding: 16 },

    // ── Count strip ───────────────────────────────────────────────────────────
    countStrip: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 12,
        marginBottom: 16,
        shadowColor: '#EC8F8D',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    },
    countText: { fontSize: 15, fontWeight: '700', color: '#537D96' },

    // ── Card ──────────────────────────────────────────────────────────────────
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#537D96',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    },

    cardImageWrapper: { position: 'relative' },
    cardImage: { width: '100%', height: 200, backgroundColor: '#EDE6D8' },
    cardImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
    placeholderIcon: { fontSize: 48 },

    ribbon: {
        position: 'absolute', top: 12, right: 0,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 14, paddingVertical: 5,
        borderTopLeftRadius: 10, borderBottomLeftRadius: 10,
    },
    ribbonText: { color: '#fff', fontWeight: '900', fontSize: 13 },

    heartBtn: {
        position: 'absolute', top: 12, left: 12,
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.85)',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
    },
    heartBtnText: { fontSize: 20 },

    cardBody: { padding: 16 },
    productName: { fontSize: 18, fontWeight: '900', color: '#537D96', marginBottom: 2 },
    businessName: { fontSize: 13, color: '#8B9DAB', marginBottom: 10 },

    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    finalPrice: { fontSize: 22, fontWeight: '900', color: '#EC8F8D' },
    originalPrice: { fontSize: 16, color: '#8B9DAB', textDecorationLine: 'line-through' },

    metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    categoryBadge: {
        backgroundColor: '#537D9615',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    },
    categoryText: { fontSize: 12, color: '#537D96', fontWeight: '700' },
    validity: { fontSize: 12, color: '#8B9DAB' },

    vouchersRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1, borderTopColor: '#F0EAE0',
        paddingTop: 12,
    },
    vouchersText: { fontSize: 13, color: '#537D96', fontWeight: '600' },
    viewBtn: {
        backgroundColor: '#537D96',
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
    },
    viewBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
