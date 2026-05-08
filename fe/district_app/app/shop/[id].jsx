import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import ShopMap from '../../components/ShopMap';


const BASE_URL = 'http://10.229.214.121:8080'; // ← your network IP

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams(); // id = business ID
  const router = useRouter();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch shop details
  useEffect(() => {
    if (!id) return;

    const fetchShop = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/business/${id}`);
        if (!res.ok) throw new Error(`Shop fetch failed: ${res.status}`);
        const data = await res.json();
        setShop(data);
      } catch (err) {
        console.error('Shop fetch error:', err);
        Toast.show({
          type: 'error',
          text1: 'Failed to load shop details',
          text2: err.message || 'Please try again',
          position: 'top',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [id]);

  // Fetch products of this shop
  useEffect(() => {
    if (!id) return;

    const fetchShopProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await fetch(`${BASE_URL}/products/business/${id}`);
        if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error('Products fetch error:', err);
        Toast.show({
          type: 'error',
          text1: 'Could not load products',
          text2: 'Shop may have no products yet',
          position: 'top',
        });
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchShopProducts();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F0E4" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#537D96" />
          <Text style={styles.loadingText}>Loading shop details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!shop) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F0E4" />
        <View style={styles.center}>
          <Text style={styles.errorText}>Shop not found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F0E4" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Shop Header / Image */}
        {shop.imageUrl ? (
          <Image
            source={{ uri: shop.imageUrl }}
            style={styles.shopHeaderImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.shopHeaderPlaceholder}>
            <Text style={styles.shopIcon}>🏪</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.shopType}>
            {shop.category} • {shop.businessType}
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Owner:</Text>
              <Text style={styles.value}>{shop.ownerName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{shop.phoneNumber}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{shop.emailId}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>
                {shop.address}, {shop.city} - {shop.pincode}
              </Text>
            </View>

            {/* Added Shop Map */}
            {shop.latitude && shop.longitude && (
              <View style={{ marginTop: 10 }}>
                <ShopMap shop={shop} />
              </View>
            )}
          </View>


          {/* Products Sold by This Shop */}
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Products & Offers</Text>

            {loadingProducts ? (
              <View style={styles.center}>
                <ActivityIndicator size="small" color="#537D96" />
                <Text style={{ marginTop: 8, color: '#537D96' }}>Loading products...</Text>
              </View>
            ) : products.length === 0 ? (
              <Text style={styles.noProductsText}>
                This shop has no products listed yet
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 8, gap: 16 }}
              >
                {products.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productMiniCard}
                    onPress={() => router.push(`/product/${product.id}`)}
                  >
                    <Image
                      source={{ uri: product.imageUrl || 'https://via.placeholder.com/140' }}
                      style={styles.productMiniImage}
                      resizeMode="cover"
                    />

                    {product.discount > 0 && (
                      <View style={styles.miniBadge}>
                        <Text style={styles.miniBadgeText}>{product.discount}% OFF</Text>
                      </View>
                    )}

                    <View style={styles.productMiniInfo}>
                      <Text style={styles.productMiniName} numberOfLines={1}>
                        {product.productName}
                      </Text>
                      <Text style={styles.productMiniPrice}>
                        ₹{Math.round(product.price * (1 - (product.discount || 0) / 100))}
                        {product.discount > 0 && (
                          <Text style={styles.miniOriginalPrice}>
                            {' '}₹{Math.round(product.price)}
                          </Text>
                        )}
                      </Text>
                      <Text style={styles.productMiniVouchers}>
                        Vouchers: {product.availableDiscountVouchers}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>Back to Shops</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F0E4',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    color: '#537D96',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#D32F2F',
    marginBottom: 20,
    textAlign: 'center',
  },
  shopHeaderImage: {
    width: '100%',
    height: 220,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  shopHeaderPlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: '#E8E4DC',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  shopIcon: {
    fontSize: 80,
    color: '#537D96',
  },
  content: {
    padding: 20,
  },
  shopName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 6,
  },
  shopType: {
    fontSize: 16,
    color: '#8B9DAB',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 15,
    color: '#537D96',
    fontWeight: '600',
    width: 90,
  },
  value: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  productsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 12,
  },
  noProductsText: {
    textAlign: 'center',
    color: '#8B9DAB',
    fontSize: 15,
    paddingVertical: 20,
  },
  productMiniCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  productMiniImage: {
    width: '100%',
    height: 100,
  },
  miniBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  miniBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  productMiniInfo: {
    padding: 10,
  },
  productMiniName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#537D96',
    marginBottom: 4,
  },
  productMiniPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EC8F8D',
    marginBottom: 4,
  },
  miniOriginalPrice: {
    fontSize: 12,
    color: '#8B9DAB',
    textDecorationLine: 'line-through',
  },
  productMiniVouchers: {
    fontSize: 12,
    color: '#537D96',
  },
  backBtn: {
    backgroundColor: '#537D96',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  backText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});