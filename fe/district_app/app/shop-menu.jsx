import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

// ────────────────────────────────────────────────
//  IMPORTANT: Use the same BASE_URL as in AddProductScreen
// ────────────────────────────────────────────────
const BASE_URL = 'http://10.229.214.121:8080'; // ← CHANGE THIS to match your network!

export default function ShopProductsScreen() {
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [businessId, setBusinessId] = useState(null);

    const fetchProducts = async () => {
        if (!businessId) return;

        try {
            setLoading(true);
            console.log(`[DEBUG] Fetching products for business/${businessId}`);

            const response = await fetch(`${BASE_URL}/products/business/${businessId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Failed: ${response.status} - ${errText}`);
            }

            const data = await response.json();
            setProducts(data || []);
        } catch (err) {
            console.error('[ERROR] Products fetch failed:', err);
            Toast.show({
                type: 'error',
                text1: 'Could not load products',
                text2: err.message.includes('Network') ? 'Check server & network' : err.message,
                position: 'top',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Load business ID once
    useEffect(() => {
        const loadBusinessId = async () => {
            try {
                const stored = await AsyncStorage.getItem('shopData');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const id = parsed.id || 1;
                    setBusinessId(id);
                } else {
                    setBusinessId(1); // fallback
                }
            } catch (e) {
                console.error('Failed to read shopData:', e);
                setBusinessId(1);
            }
        };

        loadBusinessId();
    }, []);

    // Fetch products when businessId is ready
    useEffect(() => {
        if (businessId) {
            fetchProducts();
        }
    }, [businessId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    if (loading && products.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#537D96" />
                    <Text style={styles.loadingText}>Loading your products...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Products & Offers</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/shop-add-product')}
                >
                    <Text style={styles.addButtonText}>+ Add New</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {products.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No products yet</Text>
                        <Text style={styles.emptySubText}>
                            Add your first product or offer using the button above
                        </Text>
                    </View>
                ) : (
                    products.map((product) => (
                        <TouchableOpacity
                            key={product.id}
                            style={styles.productCard}
                            onPress={() => router.push(`/product-details/${product.id}`)}
                            onLongPress={() => router.push(`/edit-product/${product.id}`)}
                            delayLongPress={500}
                            activeOpacity={0.85}
                        >
                            <Image
                                source={{ uri: product.imageUrl || 'https://via.placeholder.com/120' }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />

                            <View style={styles.productContent}>
                                <Text style={styles.productName}>{product.productName}</Text>

                                <View style={styles.priceRow}>
                                    <Text style={styles.price}>₹{product.price.toFixed(0)}</Text>
                                    {product.discount > 0 && (
                                        <View style={styles.discountBadge}>
                                            <Text style={styles.discountText}>{product.discount}% OFF</Text>
                                        </View>
                                    )}
                                </View>

                                <Text style={styles.categoryTag}>{product.category || 'General'}</Text>

                                <Text style={styles.validUntil}>
                                    Valid until: {formatDate(product.validityDate)}
                                </Text>

                                <View style={styles.voucherInfo}>
                                    <Text style={styles.vouchersLeft}>
                                        Vouchers left: {product.availableDiscountVouchers} / {product.totalDiscountVouchers}
                                    </Text>
                                    {product.discountSeason && (
                                        <Text style={styles.seasonName}>
                                            {product.discountSeason.title}
                                        </Text>
                                    )}
                                </View>

                                {product.description && (
                                    <Text style={styles.description} numberOfLines={2}>
                                        {product.description}
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <Toast />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F0E4' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#537D96',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    addButton: {
        backgroundColor: '#EC8F8D',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    content: { flex: 1, padding: 16 },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#537D96',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 120,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#537D96',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 15,
        color: '#8B9DAB',
        textAlign: 'center',
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#537D96',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 4,
    },
    productImage: {
        width: 120,
        height: 120,
    },
    productContent: {
        flex: 1,
        padding: 14,
    },
    productName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#537D96',
        marginBottom: 6,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6,
    },
    price: {
        fontSize: 20,
        fontWeight: '900',
        color: '#EC8F8D',
    },
    discountBadge: {
        backgroundColor: '#4CAF5020',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    discountText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4CAF50',
    },
    categoryTag: {
        fontSize: 13,
        color: '#8B9DAB',
        backgroundColor: '#E8E4DC',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 6,
    },
    validUntil: {
        fontSize: 13,
        color: '#537D96',
        fontWeight: '600',
        marginBottom: 8,
    },
    voucherInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    vouchersLeft: {
        fontSize: 13,
        color: '#537D96',
        fontWeight: '600',
    },
    seasonName: {
        fontSize: 13,
        color: '#EC8F8D',
        fontWeight: '700',
    },
    description: {
        fontSize: 13,
        color: '#8B9DAB',
        lineHeight: 18,
    },
});