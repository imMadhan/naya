import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

// ────────────────────────────────────────────────
//  IMPORTANT: Use your computer's real IP (same as shop screens)
// ────────────────────────────────────────────────
const BASE_URL = 'http://10.229.214.121:8080';

const { width, height } = Dimensions.get('window');

const UserDashboardScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [userCity, setUserCity] = useState('Your City');
  const [selectedDiscountFilter, setSelectedDiscountFilter] = useState(null);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);

  const [seasons, setSeasons] = useState([]);
  const [loadingSeasons, setLoadingSeasons] = useState(true);

  // Filtered results
  const [filteredShops, setFilteredShops] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Logout function
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      Toast.show({
        type: 'success',
        text1: 'Logged out successfully',
        text2: 'See you soon! 👋',
        position: 'top',
      });
      setTimeout(() => {
        router.replace('/');
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

  // Load user data
  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        if (!storedUser) {
          Toast.show({
            type: 'info',
            text1: 'Please login',
            text2: 'You need to login to continue',
            position: 'top',
          });
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUserName(parsedUser.name || 'User');
        setUserEmail(parsedUser.email || '');
        setUserId(parsedUser.id || null);

        if (parsedUser.address) {
          const addressParts = parsedUser.address.split(',');
          const city = addressParts[addressParts.length - 1]?.trim() || 'Your City';
          setUserCity(city);
        }

        if (parsedUser.latitude) setUserLat(parseFloat(parsedUser.latitude));
        if (parsedUser.longitude) setUserLng(parseFloat(parsedUser.longitude));
      } catch (error) {
        console.error('Failed to load user data:', error);
        Toast.show({
          type: 'error',
          text1: 'Error loading user data',
          text2: 'Please try logging in again',
          position: 'top',
        });
      }
    };
    getUserData();
  }, []);

  // Fetch seasons
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        setLoadingSeasons(true);
        const response = await fetch(`${BASE_URL}/seasons`);
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const data = await response.json();
        setSeasons(data || []);
      } catch (err) {
        console.error('Failed to load seasons:', err);
        Toast.show({
          type: 'error',
          text1: 'Could not load discount seasons',
          text2: 'Please check your connection',
          position: 'top',
        });
      } finally {
        setLoadingSeasons(false);
      }
    };
    fetchSeasons();
  }, []);

  // Fetch all products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch(`${BASE_URL}/products`);
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const data = await response.json();
        setProducts(data || []);
      } catch (err) {
        console.error('Failed to load products:', err);
        Toast.show({
          type: 'error',
          text1: 'Could not load offers',
          text2: 'Please check your connection',
          position: 'top',
        });
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchAllProducts();
  }, []);

  // Fetch nearby shops
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoadingShops(true);

        if (userLat && userLng) {
          try {
            const nearbyResponse = await fetch(
              `${BASE_URL}/business/nearby?latitude=${userLat}&longitude=${userLng}&radius=5`
            );
            if (nearbyResponse.ok) {
              const data = await nearbyResponse.json();
              setShops(data || []);
              setLoadingShops(false);
              return;
            }
          } catch (e) {
            console.log('Nearby endpoint failed, falling back...');
          }
        }

        // Fallback: all shops + distance calculation
        const response = await fetch(`${BASE_URL}/business`);
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const allShops = await response.json();

        if (userLat && userLng) {
          const shopsWithDistance = allShops
            .map((shop) => {
              const shopLat = parseFloat(shop.latitude);
              const shopLng = parseFloat(shop.longitude);
              if (!isNaN(shopLat) && !isNaN(shopLng)) {
                const distance = calculateDistance(userLat, userLng, shopLat, shopLng);
                return { ...shop, distance };
              }
              return { ...shop, distance: Infinity };
            })
            .filter((s) => s.distance <= 5)
            .sort((a, b) => a.distance - b.distance);
          setShops(shopsWithDistance);
        } else {
          setShops(allShops || []);
        }
      } catch (err) {
        console.error('Failed to load shops:', err);
        Toast.show({
          type: 'error',
          text1: 'Could not load nearby shops',
          text2: 'Please check your connection',
          position: 'top',
        });
      } finally {
        setLoadingShops(false);
      }
    };

    fetchShops();
  }, [userLat, userLng]);

  // Haversine distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // SEARCH FILTERING LOGIC
  useEffect(() => {
    // Filter shops
    let shopResult = shops;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      shopResult = shops.filter(
        (shop) =>
          shop.name?.toLowerCase().includes(q) ||
          shop.category?.toLowerCase().includes(q) ||
          shop.businessType?.toLowerCase().includes(q) ||
          shop.city?.toLowerCase().includes(q)
      );
    }
    setFilteredShops(shopResult);

    // Filter products (search + discount filter)
    let productResult = products;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      productResult = products.filter(
        (p) =>
          p.productName?.toLowerCase().includes(q) ||
          p.business?.name?.toLowerCase().includes(q)
      );
    }

    if (selectedDiscountFilter) {
      productResult = productResult.filter((p) => {
        const d = p.discount || 0;
        return d >= selectedDiscountFilter.min && d <= selectedDiscountFilter.max;
      });
    }

    setFilteredProducts(productResult);
  }, [searchQuery, shops, products, selectedDiscountFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).replace(',', '');
    } catch {
      return dateStr.split('-').reverse().join('-').slice(0, -5);
    }
  };

  const discountFilters = [
    { id: 'all', label: 'All', min: 0, max: 100 },
    { id: '1-30', label: '1-30%', min: 1, max: 30 },
    { id: '30-60', label: '30-60%', min: 30, max: 60 },
    { id: '60-90', label: '60-90%', min: 60, max: 90 },
    { id: '90-100', label: '90-100%', min: 90, max: 100 },
  ];

  const quickActions = [
    { id: 'favorites', icon: '❤️', label: 'Favorites', color: '#EC8F8D' },
    { id: 'my-vouchers', icon: '🎟', label: 'Vouchers', color: '#4CAF50' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F0E4" />

      {/* Header */}
      <LinearGradient colors={['#537D96', '#6A91A8']} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Hello, {userName}! 👋</Text>
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.location}>{userCity}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
            <Text style={styles.profileIcon}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar with clear button */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search shops, products, categories..."
            placeholderTextColor="rgba(83, 125, 150, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => router.push(`/${action.id}`)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Text style={styles.quickActionEmoji}>{action.icon}</Text>
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nearby Shops */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Nearby Shops</Text>
              {userLat && userLng && (
                <Text style={styles.sectionSubtitle}>📍 Within 5 km of you</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => router.push('/all-shops')}>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          </View>

          {loadingShops ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#537D96" />
              <Text style={{ marginTop: 12, color: '#537D96' }}>Finding shops near you...</Text>
            </View>
          ) : filteredShops.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#8B9DAB', paddingVertical: 20 }}>
              {searchQuery.trim()
                ? `No shops found for "${searchQuery}"`
                : 'No shops available right now'}
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8, gap: 16 }}
            >
              {filteredShops.map((shop) => (
                <TouchableOpacity
                  key={shop.id}
                  style={styles.shopCard}
                  onPress={() => router.push(`/shop/${shop.id}`)}
                >
                  {shop.imageUrl ? (
                    <Image
                      source={{ uri: shop.imageUrl }}
                      style={styles.shopImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.shopImagePlaceholder}>
                      <Text style={styles.shopIcon}>🏪</Text>
                    </View>
                  )}

                  <View style={styles.shopInfo}>
                    <Text style={styles.shopName} numberOfLines={1}>
                      {shop.name}
                    </Text>
                    <Text style={styles.shopCategory}>
                      {shop.category} • {shop.businessType}
                    </Text>
                    <View style={styles.shopLocationRow}>
                      <Text style={styles.shopLocationIcon}>📍</Text>
                      <Text style={styles.shopLocation} numberOfLines={1}>
                        {shop.city}, {shop.pincode}
                      </Text>
                    </View>
                    {shop.distance && shop.distance !== Infinity && (
                      <View style={styles.shopDistanceRow}>
                        <Text style={styles.shopDistanceIcon}>🚗</Text>
                        <Text style={styles.shopDistance}>
                          {shop.distance < 1
                            ? `${(shop.distance * 1000).toFixed(0)}m away`
                            : `${shop.distance.toFixed(1)}km away`}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Available Offers & Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Offers & Products</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {discountFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedDiscountFilter?.id === filter.id && styles.filterButtonActive,
                ]}
                onPress={() =>
                  setSelectedDiscountFilter(
                    selectedDiscountFilter?.id === filter.id ? null : filter
                  )
                }
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedDiscountFilter?.id === filter.id && styles.filterButtonTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loadingProducts ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#537D96" />
              <Text style={{ marginTop: 12, color: '#537D96' }}>Loading offers...</Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#8B9DAB', paddingVertical: 20 }}>
              {searchQuery.trim()
                ? `No offers found for "${searchQuery}"`
                : selectedDiscountFilter
                ? `No offers in ${selectedDiscountFilter.label} range`
                : 'No offers available right now'}
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8, gap: 16 }}
            >
              {filteredProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productOfferCard}
                  onPress={() => router.push(`/product/${product.id}`)}
                >
                  <Image
                    source={{ uri: product.imageUrl || 'https://via.placeholder.com/220x140' }}
                    style={styles.productOfferImage}
                    resizeMode="cover"
                  />

                  {product.discount > 0 && (
                    <View style={styles.productOfferBadge}>
                      <Text style={styles.productOfferBadgeText}>{product.discount}% OFF</Text>
                    </View>
                  )}

                  <View style={styles.productOfferInfo}>
                    <Text style={styles.productOfferName} numberOfLines={1}>
                      {product.productName}
                    </Text>

                    <View style={styles.productOfferPriceRow}>
                      <Text style={styles.productOfferCurrentPrice}>
                        ₹{((product.price * (1 - (product.discount || 0) / 100)).toFixed(0))}
                      </Text>
                      {product.discount > 0 && (
                        <Text style={styles.productOfferOriginalPrice}>
                          ₹{product.price.toFixed(0)}
                        </Text>
                      )}
                    </View>

                    <Text style={styles.productOfferBusiness}>
                      {product.business?.name || 'Local Shop'}
                    </Text>

                    <Text style={styles.productOfferVouchers}>
                      Vouchers: {product.availableDiscountVouchers} left
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Seasons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current & Upcoming Seasons in {userCity}</Text>
            <TouchableOpacity onPress={() => router.push('/seasons')}>
              <Text style={styles.seeAllText}>All Seasons →</Text>
            </TouchableOpacity>
          </View>

          {loadingSeasons ? (
            <View style={styles.center}>
              <ActivityIndicator size="small" color="#537D96" />
            </View>
          ) : seasons.length === 0 ? (
            <Text style={styles.emptyText}>No active or upcoming seasons right now</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {seasons.map((season) => (
                <View key={season.id} style={styles.seasonCard}>
                  <View style={styles.seasonHeader}>
                    <Text style={styles.seasonTitle}>{season.title}</Text>
                    <View style={styles.seasonDateBadge}>
                      <Text style={styles.seasonDateText}>
                        {formatDate(season.startDate)} – {formatDate(season.endDate)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.seasonDescription} numberOfLines={3}>
                    {season.description}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F0E4',
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(244, 240, 228, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: {
    fontSize: 12,
  },
  location: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
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
    marginLeft: 12,
  },
  profileIcon: {
    fontSize: 20,
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#537D96',
  },

  // Content
  content: {
    flex: 1,
  },

  // Section
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
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
  sectionSubtitle: {
    fontSize: 12,
    color: '#8B9DAB',
    fontWeight: '600',
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: '#EC8F8D',
    fontWeight: '700',
  },

  // Categories
  categoriesScroll: {
    paddingVertical: 8,
    gap: 12,
  },
  categoryCard: {
    alignItems: 'center',
    gap: 8,
  },
  categoryIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#537D96',
  },

  // Bookings
  bookingsContainer: {
    gap: 12,
  },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#537D9620',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingIcon: {
    fontSize: 24,
  },
  bookingDetails: {
    flex: 1,
    gap: 2,
  },
  bookingVenue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#537D96',
  },
  bookingType: {
    fontSize: 13,
    color: '#8B9DAB',
    fontWeight: '600',
  },
  bookingDate: {
    fontSize: 13,
    color: '#EC8F8D',
    fontWeight: '600',
  },
  bookingRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  bookingSeats: {
    fontSize: 13,
    color: '#537D96',
    fontWeight: '700',
  },
  bookingArrow: {
    fontSize: 20,
    color: '#537D96',
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
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
    fontWeight: '700',
    color: '#537D96',
  },

  // Trending Places
  placesScroll: {
    paddingVertical: 8,
    gap: 16,
  },
  placeCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  placeImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E8E4DC',
  },
  offerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#EC8F8D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  offerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  placeInfo: {
    padding: 12,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 4,
  },
  placeCategory: {
    fontSize: 13,
    color: '#8B9DAB',
    marginBottom: 8,
  },
  placeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    fontSize: 14,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: '#537D96',
  },
  distance: {
    fontSize: 12,
    color: '#8B9DAB',
    fontWeight: '600',
  },

  // Recommendation
  recommendationCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  recommendationIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  recommendationButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  recommendationButtonText: {
    color: '#EC8F8D',
    fontSize: 14,
    fontWeight: '800',
  },

  // Event Card
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventDateBadge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#537D96',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDay: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  eventMonth: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  eventDetails: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#537D96',
  },
  eventLocation: {
    fontSize: 13,
    color: '#8B9DAB',
  },
  eventTime: {
    fontSize: 12,
    color: '#EC8F8D',
    fontWeight: '600',
  },
  eventButton: {
    backgroundColor: '#EC8F8D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  eventButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
  productOfferCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  productOfferImage: {
    width: '100%',
    height: 140,
  },
  productOfferBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  productOfferBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  productOfferInfo: {
    padding: 12,
  },
  productOfferName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 6,
  },
  productOfferPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  productOfferCurrentPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EC8F8D',
  },
  productOfferOriginalPrice: {
    fontSize: 15,
    color: '#8B9DAB',
    textDecorationLine: 'line-through',
  },
  productOfferBusiness: {
    fontSize: 13,
    color: '#8B9DAB',
    marginBottom: 4,
  },
  productOfferVouchers: {
    fontSize: 13,
    color: '#537D96',
    fontWeight: '600',
  },
  shopCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  shopImage: {
    width: '100%',
    height: 140,
  },
  shopImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#E8E4DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopIcon: {
    fontSize: 60,
    color: '#537D96',
  },
  shopInfo: {
    padding: 12,
  },
  shopName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 6,
  },
  shopCategory: {
    fontSize: 14,
    color: '#8B9DAB',
    marginBottom: 8,
  },
  shopLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shopLocationIcon: {
    fontSize: 14,
  },
  shopLocation: {
    fontSize: 13,
    color: '#537D96',
    flex: 1,
  },
  shopDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  shopDistanceIcon: {
    fontSize: 14,
  },
  shopDistance: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '700',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  seasonCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EC8F8D30',
  },

  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  seasonTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D32F2F',
    flex: 1,
    marginRight: 12,
  },

  seasonDateBadge: {
    backgroundColor: '#537D9615',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  seasonDateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#537D96',
  },

  seasonDescription: {
    fontSize: 14,
    color: '#8B9DAB',
    lineHeight: 20,
    marginBottom: 16,
  },

  seasonButton: {
    backgroundColor: '#EC8F8D',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },

  seasonButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  emptyText: {
    textAlign: 'center',
    color: '#8B9DAB',
    fontSize: 15,
    paddingVertical: 20,
  },

  // Discount Filter Styles
  filterScroll: {
    paddingVertical: 12,
    gap: 10,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8E4DC',
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#537D96',
    borderColor: '#537D96',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#537D96',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchIcon: {
    fontSize: 20,
    color: '#537D96',
  },
  clearIcon: {
    fontSize: 24,
    color: '#999',
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#537D96',
  },
});

export default UserDashboardScreen;