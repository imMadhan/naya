import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const BASE_URL = 'http://10.229.214.121:8080';

const ShopDashboardScreen = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [businessName, setBusinessName] = useState("Business");
  const [businessType, setBusinessType] = useState("Restaurant");
  const [businessId, setBusinessId] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Logout function
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('shopData');
      Toast.show({
        type: 'success',
        text1: 'Logged out successfully',
        text2: 'See you soon! 👋',
        position: 'top',
      });
      setTimeout(() => {
        router.replace('/ShopLoginScreen');
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      Toast.show({
        type: 'error',
        text1: 'Logout failed',
        text2: 'Please try again',
        position: 'top',
      });
    }
  };

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch(`${BASE_URL}/seasons`);
        const data = await response.json();
        setSeasons(data);
      } catch (error) {
        console.error('Error fetching seasons:', error);
      }
    };
    fetchSeasons();
  }, []);

  useEffect(() => {
    const getShopData = async () => {
      try {
        const storedShop = await AsyncStorage.getItem('shopData');
        if (storedShop) {
          const parsedShop = JSON.parse(storedShop);
          setBusinessName(parsedShop.name || "Business");
          setBusinessType(parsedShop.category || parsedShop.businessType || "Restaurant");
          setBusinessId(parsedShop.id);
        }
      } catch (error) {
        console.error('Failed to load shop data', error);
      }
    };
    getShopData();
  }, []);

  // Fetch products for this business
  useEffect(() => {
    if (!businessId) return;

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch(`${BASE_URL}/products/business/${businessId}`);
        if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`);
        const data = await response.json();
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [businessId]);

  const statsData = {
    today: {
      revenue: '₹12,450',
      orders: 24,
      views: 156,
      rating: 4.5,
    },
    week: {
      revenue: '₹89,200',
      orders: 168,
      views: 1240,
      rating: 4.6,
    },
    month: {
      revenue: '₹3,45,600',
      orders: 672,
      views: 5420,
      rating: 4.5,
    },
  };

  const quickActions = [
    { id: 'menu', icon: '📋', label: 'Menu', color: '#537D96' },
    { id: 'add-product', icon: '➕', label: 'Add Product', color: '#4CAF50' },
  ];

  const currentStats = statsData[selectedPeriod];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F0E4" />

      {/* Header */}
      <LinearGradient
        colors={['#537D96', '#6A91A8']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.businessInfo}>
            <View style={styles.businessIconContainer}>
              <Text style={styles.businessIcon}>🏪</Text>
            </View>
            <View style={styles.businessDetails}>
              <Text style={styles.businessName}>{businessName}</Text>
              <Text style={styles.businessType}>{businessType}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            
            

            <TouchableOpacity
              style={styles.profileButton}
              onPress={handleLogout}
            >
              <Text style={styles.profileIcon}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

       
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        

        {/* Active Seasons - Visible to Shop Owners */}
        {
          seasons.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Seasons</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonsContainer}>
                {seasons.map((season) => (
                  <LinearGradient
                    key={season.id}
                    colors={['#EC8F8D', '#F0A29F']}
                    style={styles.seasonCard}
                  >
                    <Text style={styles.seasonTitle}>{season.title}</Text>
                    <Text style={styles.seasonDate}>{season.startDate} - {season.endDate}</Text>
                    <Text style={styles.seasonDescription}>{season.description}</Text>
                  </LinearGradient>
                ))}
              </ScrollView>
            </View>
          )
        }

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => router.push(`/shop-${action.id}`)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Text style={styles.quickActionEmoji}>{action.icon}</Text>
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Products</Text>
            <TouchableOpacity onPress={() => router.push('/shop-menu')}>
              <Text style={styles.seeAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {loadingProducts ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#537D96" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyProductsCard}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No Products Yet</Text>
              <Text style={styles.emptyDescription}>
                Start adding products to showcase your offerings
              </Text>
              <TouchableOpacity
                style={styles.addProductButton}
                onPress={() => router.push('/shop-add-product')}
              >
                <Text style={styles.addProductButtonText}>+ Add Your First Product</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsScroll}
            >
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => router.push(`/product-details/${product.id}`)}
                >
                  <Image
                    source={{ uri: product.imageUrl || 'https://via.placeholder.com/160x120' }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />

                  {product.discount > 0 && (
                    <View style={styles.productDiscountBadge}>
                      <Text style={styles.productDiscountText}>{product.discount}% OFF</Text>
                    </View>
                  )}

                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.productName}
                    </Text>

                    <View style={styles.productPriceRow}>
                      <Text style={styles.productCurrentPrice}>
                        ₹{Math.round(product.price * (1 - (product.discount || 0) / 100))}
                      </Text>
                      {product.discount > 0 && (
                        <Text style={styles.productOriginalPrice}>
                          ₹{Math.round(product.price)}
                        </Text>
                      )}
                    </View>

                    <Text style={styles.productCategory}>{product.category}</Text>

                    <View style={styles.productVouchersRow}>
                      <Text style={styles.productVouchersAvailable}>
                        {product.availableDiscountVouchers} available
                      </Text>
                      <Text style={styles.productVouchersSold}>
                        {product.soldDiscountVouchers} sold
                      </Text>
                    </View>

                    {product.discountSeason && (
                      <View style={styles.productSeasonBadge}>
                        <Text style={styles.productSeasonText} numberOfLines={1}>
                          🎉 {product.discountSeason.title}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#EC8F8D', '#F0A29F']}
            style={styles.helpCard}
          >
            <Text style={styles.helpIcon}>💬</Text>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpDescription}>
              Contact our support team 24/7
            </Text>
            
          </LinearGradient>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView >

      
    </View >
  );
};

const styles = StyleSheet.create({
  // Season Styles
  seasonsContainer: {
    marginTop: 16,
    flexDirection: 'row',
  },
  seasonCard: {
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    width: 280,
  },
  seasonTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  seasonDate: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  seasonDescription: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },

  container: {
    flex: 1,
    backgroundColor: '#F4F0E4',
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  businessIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(244, 240, 228, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessIcon: {
    fontSize: 24,
  },
  businessDetails: {
    gap: 4,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  businessType: {
    fontSize: 13,
    color: '#F4F0E4',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(244, 240, 228, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EC8F8D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(244, 240, 228, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },

  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#F4F0E4',
  },
  periodButtonText: {
    fontSize: 14,
    color: 'rgba(244, 240, 228, 0.7)',
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#537D96',
    fontWeight: '800',
  },

  // Content
  content: {
    flex: 1,
  },

  // Stats Cards
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  statCardLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statIconDark: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statValueDark: {
    fontSize: 24,
    fontWeight: '900',
    color: '#537D96',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  statLabelDark: {
    fontSize: 13,
    color: '#537D96',
    fontWeight: '600',
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#537D96',
  },
  seeAllText: {
    fontSize: 14,
    color: '#EC8F8D',
    fontWeight: '700',
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  quickActionCard: {
    width: (width - 64) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#537D96',
    fontWeight: '700',
    textAlign: 'center',
  },

  // Orders
  ordersContainer: {
    gap: 12,
    marginTop: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#8B9DAB',
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EC8F8D',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  orderTime: {
    fontSize: 12,
    color: '#8B9DAB',
  },

  // Status Card
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    marginTop: 16,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 15,
    color: '#8B9DAB',
    fontWeight: '600',
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusValue: {
    fontSize: 15,
    color: '#537D96',
    fontWeight: '800',
  },

  // Insights
  insightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 20,
    marginTop: 16,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  insightItem: {
    flexDirection: 'row',
    gap: 12,
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightEmoji: {
    fontSize: 24,
  },
  insightContent: {
    flex: 1,
    gap: 4,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#537D96',
  },
  insightDescription: {
    fontSize: 13,
    color: '#8B9DAB',
    lineHeight: 18,
  },

  // Help Card
  helpCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  helpIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  helpDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  helpButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  helpButtonText: {
    color: '#EC8F8D',
    fontSize: 14,
    fontWeight: '800',
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E4DC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navIconActive: {
    backgroundColor: '#537D9620',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconText: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: 11,
    color: '#8B9DAB',
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#537D96',
    fontWeight: '800',
  },

  // Products Section
  productsScroll: {
    paddingVertical: 8,
    gap: 16,
  },
  productCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E8E4DC',
  },
  productDiscountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  productDiscountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 6,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  productCurrentPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EC8F8D',
  },
  productOriginalPrice: {
    fontSize: 14,
    color: '#8B9DAB',
    textDecorationLine: 'line-through',
  },
  productCategory: {
    fontSize: 13,
    color: '#8B9DAB',
    marginBottom: 8,
  },
  productVouchersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productVouchersAvailable: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  productVouchersSold: {
    fontSize: 12,
    color: '#8B9DAB',
    fontWeight: '600',
  },
  productSeasonBadge: {
    backgroundColor: '#EC8F8D20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productSeasonText: {
    fontSize: 11,
    color: '#EC8F8D',
    fontWeight: '700',
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 12,
    color: '#537D96',
    fontSize: 16,
  },
  emptyProductsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#8B9DAB',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  addProductButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addProductButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default ShopDashboardScreen;