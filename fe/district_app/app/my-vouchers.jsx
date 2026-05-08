import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
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

export default function MyVouchersScreen() {
    const router = useRouter();

    const [userId, setUserId] = useState(null);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [usingId, setUsingId] = useState(null); // tracks which voucher is being "used"

    // ── Load userId from AsyncStorage ────────────────────────────────────────
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

    // ── Fetch vouchers ────────────────────────────────────────────────────────
    const fetchVouchers = useCallback(async (uid, isRefresh = false) => {
        if (!uid) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/vouchers/user/${uid}`);
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const data = await res.json();
            setVouchers(Array.isArray(data) ? data : []);
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: 'Could not load vouchers',
                text2: err.message,
                position: 'top',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (userId) fetchVouchers(userId);
    }, [userId, fetchVouchers]);

    // ── Use voucher ───────────────────────────────────────────────────────────
    const handleUseVoucher = (voucher) => {
        if (voucher.used) return;
        Alert.alert(
            'Use Voucher',
            `Mark "${voucher.voucherCode.slice(0, 8)}…" as used?\nThis cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    style: 'destructive',
                    onPress: async () => {
                        setUsingId(voucher.id);
                        try {
                            const res = await fetch(`${BASE_URL}/vouchers/use/${voucher.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                            });
                            if (!res.ok) throw new Error(`Error ${res.status}`);
                            const updated = await res.json();
                            // Replace the voucher in list with updated data
                            setVouchers((prev) =>
                                prev.map((v) => (v.id === updated.id ? updated : v))
                            );
                            Toast.show({
                                type: 'success',
                                text1: '✅ Voucher Marked as Used',
                                text2: `Code: ${updated.voucherCode.slice(0, 12)}…`,
                                position: 'top',
                            });
                        } catch (err) {
                            Toast.show({
                                type: 'error',
                                text1: 'Failed to use voucher',
                                text2: err.message,
                                position: 'top',
                            });
                        } finally {
                            setUsingId(null);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    // ── Download voucher ──────────────────────────────────────────────────────
    const handleDownload = async (voucher) => {
        const url = `${BASE_URL}/vouchers/download/${voucher.id}`;
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Toast.show({ type: 'error', text1: 'Cannot open download link', position: 'top' });
            }
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Download failed', text2: err.message, position: 'top' });
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    const groupedVouchers = {
        active: vouchers.filter((v) => !v.used),
        used: vouchers.filter((v) => v.used),
    };

    const renderVoucher = (voucher) => {
        const isUsed = voucher.used;
        const isUsing = usingId === voucher.id;
        const product = voucher.product;
        const discount = product?.discount ?? 0;
        const finalPrice = product
            ? (product.price * (1 - discount / 100)).toFixed(0)
            : null;

        return (
            <View key={voucher.id} style={[styles.card, isUsed && styles.cardUsed]}>
                {/* Image + discount ribbon */}
                <View style={styles.cardImageWrapper}>
                    {product?.imageUrl ? (
                        <Image source={{ uri: product.imageUrl }} style={styles.cardImage} />
                    ) : (
                        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                            <Text style={styles.cardImagePlaceholderIcon}>🎟</Text>
                        </View>
                    )}
                    {discount > 0 && (
                        <View style={[styles.ribbon, isUsed && styles.ribbonUsed]}>
                            <Text style={styles.ribbonText}>{discount}% OFF</Text>
                        </View>
                    )}
                </View>

                {/* Card body */}
                <View style={styles.cardBody}>
                    {/* Product name & business */}
                    <Text style={styles.productName} numberOfLines={1}>
                        {product?.productName ?? '—'}
                    </Text>
                    <Text style={styles.businessName} numberOfLines={1}>
                        {product?.business?.name ?? ''}
                    </Text>

                    {/* Price row */}
                    {product && (
                        <View style={styles.priceRow}>
                            <Text style={styles.finalPrice}>₹{finalPrice}</Text>
                            {discount > 0 && (
                                <Text style={styles.originalPrice}>₹{product.price.toFixed(0)}</Text>
                            )}
                        </View>
                    )}

                    {/* Validity */}
                    {product?.validityDate && (
                        <Text style={styles.validity}>Valid until {product.validityDate}</Text>
                    )}

                    {/* Code */}
                    <View style={styles.codeRow}>
                        <Text style={styles.codeLabel}>CODE</Text>
                        <Text style={styles.codeValue} numberOfLines={1}>
                            {voucher.voucherCode}
                        </Text>
                    </View>

                    {/* Claimed date + status badge */}
                    <View style={styles.metaRow}>
                        <Text style={styles.metaText}>Claimed {voucher.downloadDate}</Text>
                        <View style={[styles.statusBadge, isUsed ? styles.badgeUsed : styles.badgeActive]}>
                            <Text style={[styles.statusText, isUsed ? styles.statusUsedText : styles.statusActiveText]}>
                                {isUsed ? 'Used' : 'Active'}
                            </Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        {/* Download */}
                        <TouchableOpacity
                            style={styles.downloadBtn}
                            onPress={() => handleDownload(voucher)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.downloadBtnText}>⬇  Download</Text>
                        </TouchableOpacity>

                        {/* Use — only for active vouchers */}
                        {!isUsed && (
                            <TouchableOpacity
                                style={[styles.useBtn, isUsing && styles.btnDisabled]}
                                onPress={() => handleUseVoucher(voucher)}
                                disabled={isUsing}
                                activeOpacity={0.8}
                            >
                                {isUsing ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.useBtnText}>✓  Use</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
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
                <Text style={styles.headerTitle}>My Vouchers</Text>
                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={() => fetchVouchers(userId, true)}
                    disabled={refreshing}
                >
                    <Text style={styles.refreshBtnText}>{refreshing ? '…' : '⟳'}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#537D96" />
                    <Text style={styles.loadingText}>Loading your vouchers…</Text>
                </View>
            ) : vouchers.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyIcon}>🎟</Text>
                    <Text style={styles.emptyTitle}>No vouchers yet</Text>
                    <Text style={styles.emptySubtitle}>Claim vouchers from product pages to see them here.</Text>
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
                            onRefresh={() => fetchVouchers(userId, true)}
                            colors={['#537D96']}
                            tintColor="#537D96"
                        />
                    }
                >
                    {/* Summary strip */}
                    <View style={styles.summaryStrip}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryNum}>{vouchers.length}</Text>
                            <Text style={styles.summaryLabel}>Total</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryNum, { color: '#4CAF50' }]}>{groupedVouchers.active.length}</Text>
                            <Text style={styles.summaryLabel}>Active</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryNum, { color: '#8B9DAB' }]}>{groupedVouchers.used.length}</Text>
                            <Text style={styles.summaryLabel}>Used</Text>
                        </View>
                    </View>

                    {/* Active vouchers */}
                    {groupedVouchers.active.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Active 🟢</Text>
                            {groupedVouchers.active.map(renderVoucher)}
                        </>
                    )}

                    {/* Used vouchers */}
                    {groupedVouchers.used.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Used ✓</Text>
                            {groupedVouchers.used.map(renderVoucher)}
                        </>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}

            <Toast />
        </SafeAreaView>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F0E4' },

    // ── Header ────────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#537D96',
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
    },
    refreshBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    refreshBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },

    // ── Loading / Empty ───────────────────────────────────────────────────────
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    loadingText: { marginTop: 16, color: '#537D96', fontWeight: '600', fontSize: 15 },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyTitle: { fontSize: 22, fontWeight: '900', color: '#537D96', marginBottom: 8 },
    emptySubtitle: { fontSize: 15, color: '#8B9DAB', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    exploreBtn: {
        backgroundColor: '#537D96',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 14,
    },
    exploreBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

    // ── Scroll ────────────────────────────────────────────────────────────────
    scrollContent: { padding: 16 },

    // ── Summary strip ─────────────────────────────────────────────────────────
    summaryStrip: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 16,
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'space-around',
        shadowColor: '#537D96',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    summaryItem: { alignItems: 'center', flex: 1 },
    summaryNum: { fontSize: 24, fontWeight: '900', color: '#EC8F8D' },
    summaryLabel: { fontSize: 12, color: '#8B9DAB', marginTop: 2 },
    summaryDivider: { width: 1, height: 36, backgroundColor: '#E0D9CC' },

    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#537D96',
        marginBottom: 12,
        marginTop: 4,
    },

    // ── Card ──────────────────────────────────────────────────────────────────
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#537D96',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardUsed: { opacity: 0.75 },

    cardImageWrapper: { position: 'relative' },
    cardImage: {
        width: '100%',
        height: 160,
        backgroundColor: '#EDE6D8',
    },
    cardImagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardImagePlaceholderIcon: { fontSize: 48 },

    ribbon: {
        position: 'absolute',
        top: 12,
        right: 0,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },
    ribbonUsed: { backgroundColor: '#8B9DAB' },
    ribbonText: { color: '#fff', fontWeight: '900', fontSize: 13 },

    // Card body
    cardBody: { padding: 16 },

    productName: { fontSize: 18, fontWeight: '900', color: '#537D96', marginBottom: 2 },
    businessName: { fontSize: 13, color: '#8B9DAB', marginBottom: 10 },

    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
    finalPrice: { fontSize: 22, fontWeight: '900', color: '#EC8F8D' },
    originalPrice: { fontSize: 16, color: '#8B9DAB', textDecorationLine: 'line-through' },

    validity: { fontSize: 13, color: '#537D96', fontWeight: '600', marginBottom: 12 },

    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#537D9612',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 10,
        marginBottom: 10,
    },
    codeLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#537D96',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    codeValue: { flex: 1, fontSize: 13, color: '#537D96', fontWeight: '700', letterSpacing: 0.8 },

    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    metaText: { fontSize: 12, color: '#8B9DAB' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    badgeActive: { backgroundColor: '#4CAF5020' },
    badgeUsed: { backgroundColor: '#8B9DAB20' },
    statusText: { fontSize: 12, fontWeight: '800' },
    statusActiveText: { color: '#4CAF50' },
    statusUsedText: { color: '#8B9DAB' },

    // Action buttons
    actions: { flexDirection: 'row', gap: 10 },
    downloadBtn: {
        flex: 1,
        backgroundColor: '#537D96',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    downloadBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
    useBtn: {
        flex: 1,
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    useBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
    btnDisabled: { opacity: 0.6 },
});
