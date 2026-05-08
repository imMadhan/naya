import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

// ────────────────────────────────────────────────
// Use the same BASE_URL as in other screens
// ────────────────────────────────────────────────
const BASE_URL = 'http://10.229.214.121:8080'; // ← CHANGE THIS to match your network!

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams(); // dynamic route param: /product-details/1
    const router = useRouter();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log(`[DEBUG] Fetching product ${id} from: ${BASE_URL}/products/${id}`);

                const response = await fetch(`${BASE_URL}/products/${id}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`Failed: ${response.status} - ${errText}`);
                }

                const data = await response.json();
                setProduct(data);
            } catch (err) {
                console.error('[ERROR] Product fetch failed:', err);
                setError(err.message);
                Toast.show({
                    type: 'error',
                    text1: 'Could not load product details',
                    text2: err.message.includes('Network') ? 'Check server & connection' : err.message,
                    position: 'top',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const calculateDiscountedPrice = () => {
        if (!product) return null;
        const original = product.price;
        const discount = product.discount || 0;
        return (original * (1 - discount / 100)).toFixed(2);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#537D96" />
                    <Text style={styles.loadingText}>Loading product details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !product) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text style={styles.errorText}>Product not found or failed to load</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Image */}
                <Image
                    source={{ uri: product.imageUrl || 'https://via.placeholder.com/400x300' }}
                    style={styles.headerImage}
                    resizeMode="cover"
                />


                {/* Floating Edit Button - top right of image */}
                <TouchableOpacity
                    style={styles.floatingEditButton}
                    onPress={() => router.push(`/edit-product/${id}`)}
                >
                    <Text style={styles.floatingEditText}>✏️ Edit</Text>
                </TouchableOpacity>
                {/* Main Content */}
                <View style={styles.content}>
                    <Text style={styles.productName}>{product.productName}</Text>

                    {/* Price & Discount */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.currentPrice}>
                            ₹{calculateDiscountedPrice()}
                        </Text>
                        {product.discount > 0 && (
                            <>
                                <Text style={styles.originalPrice}>
                                    ₹{product.price.toFixed(0)}
                                </Text>
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>{product.discount}% OFF</Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Category & Validity */}
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Category</Text>
                            <Text style={styles.metaValue}>{product.category || 'General'}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Valid until</Text>
                            <Text style={styles.metaValue}>{formatDate(product.validityDate)}</Text>
                        </View>
                    </View>

                    {/* Vouchers */}
                    <View style={styles.voucherCard}>
                        <Text style={styles.voucherTitle}>Discount Vouchers</Text>
                        <View style={styles.voucherRow}>
                            <Text style={styles.voucherCount}>
                                Available: <Text style={styles.highlight}>{product.availableDiscountVouchers}</Text>
                            </Text>
                            <Text style={styles.voucherTotal}>
                                Total issued: <Text style={styles.highlight}>{product.totalDiscountVouchers}</Text>
                            </Text>
                        </View>
                        {product.soldDiscountVouchers > 0 && (
                            <Text style={styles.voucherSold}>
                                Sold: {product.soldDiscountVouchers}
                            </Text>
                        )}
                    </View>

                    {/* Season */}
                    {product.discountSeason && (
                        <View style={styles.seasonCard}>
                            <Text style={styles.seasonTitle}>Discount Season</Text>
                            <Text style={styles.seasonName}>{product.discountSeason.title}</Text>
                            <Text style={styles.seasonDates}>
                                {product.discountSeason.startDate} → {product.discountSeason.endDate}
                            </Text>
                            <Text style={styles.seasonDescription}>
                                {product.discountSeason.description}
                            </Text>
                        </View>
                    )}

                    {/* Description */}
                    <View style={styles.descriptionSection}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>
                            {product.description || 'No description provided.'}
                        </Text>
                    </View>

                    {/* Business Info (optional) */}
                    {product.business && (
                        <View style={styles.businessSection}>
                            <Text style={styles.sectionTitle}>From</Text>
                            <Text style={styles.businessName}>{product.business.name}</Text>
                            <Text style={styles.businessType}>{product.business.businessType || product.business.category}</Text>
                            <Text style={styles.businessLocation}>
                                {product.business.city}, {product.business.pincode}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.backButtonLarge}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonTextLarge}>Back to List</Text>
                    </TouchableOpacity>

                    <View style={{ height: 60 }} />
                </View>
            </ScrollView>

            <Toast />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F0E4' },
    scrollContent: { paddingBottom: 40 },
    headerImage: {
        width: '100%',
        height: 280,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    // Add these styles
    floatingEditButton: {
        position: 'absolute',
        top: 40,                    // below status bar + some padding
        right: 20,
        backgroundColor: '#EC8F8D',
        borderRadius: 30,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 10,
    },
    floatingEditText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    content: {
        padding: 20,
    },
    productName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#537D96',
        marginBottom: 12,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    currentPrice: {
        fontSize: 32,
        fontWeight: '900',
        color: '#EC8F8D',
    },
    originalPrice: {
        fontSize: 20,
        color: '#8B9DAB',
        textDecorationLine: 'line-through',
    },
    discountBadge: {
        backgroundColor: '#4CAF5020',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    discountText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4CAF50',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    metaItem: {
        alignItems: 'center',
    },
    metaLabel: {
        fontSize: 13,
        color: '#8B9DAB',
        marginBottom: 4,
    },
    metaValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#537D96',
    },
    voucherCard: {
        backgroundColor: '#537D9610',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#537D9640',
    },
    voucherTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#537D96',
        marginBottom: 12,
    },
    voucherRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    voucherCount: {
        fontSize: 16,
        color: '#537D96',
    },
    voucherTotal: {
        fontSize: 16,
        color: '#537D96',
    },
    highlight: {
        fontWeight: '800',
        color: '#EC8F8D',
    },
    voucherSold: {
        fontSize: 14,
        color: '#D32F2F',
        fontWeight: '600',
    },
    seasonCard: {
        backgroundColor: '#EC8F8D10',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#EC8F8D40',
    },
    seasonTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#EC8F8D',
        marginBottom: 6,
    },
    seasonName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#D32F2F',
        marginBottom: 6,
    },
    seasonDates: {
        fontSize: 14,
        color: '#537D96',
        fontWeight: '600',
        marginBottom: 8,
    },
    seasonDescription: {
        fontSize: 15,
        color: '#8B9DAB',
        lineHeight: 22,
    },
    descriptionSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#537D96',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#537D96',
        lineHeight: 24,
    },
    businessSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#537D96',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    businessName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#537D96',
    },
    businessType: {
        fontSize: 15,
        color: '#8B9DAB',
        marginVertical: 4,
    },
    businessLocation: {
        fontSize: 14,
        color: '#537D96',
    },
    backButtonLarge: {
        backgroundColor: '#537D96',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    backButtonTextLarge: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#D32F2F',
        textAlign: 'center',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#537D96',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});