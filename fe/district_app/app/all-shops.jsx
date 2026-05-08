import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

const BASE_URL = 'http://10.229.214.121:8080';

const AllShopsScreen = () => {
  const router = useRouter();
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [showNearby, setShowNearby] = useState(false);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  useEffect(() => {
    loadUserLocation();
    fetchAllShops();
  }, []);

  const loadUserLocation = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.latitude) setUserLat(parseFloat(parsedUser.latitude));
        if (parsedUser.longitude) setUserLng(parseFloat(parsedUser.longitude));
      }
    } catch (error) {
      console.error('Failed to load user location:', error);
    }
  };

  const fetchAllShops = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/business`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`Failed: ${response.status}`);

      const data = await response.json();
      
      // Add distance calculation if user has location
      if (userLat && userLng) {
        const shopsWithDistance = data.map((shop) => {
          const shopLat = parseFloat(shop.latitude);
          const shopLng = parseFloat(shop.longitude);

          if (!isNaN(shopLat) && !isNaN(shopLng)) {
            const distance = calculateDistance(userLat, userLng, shopLat, shopLng);
            return { ...shop, distance };
          }
          return { ...shop, distance: Infinity };
        });
        
        setShops(shopsWithDistance || []);
        setFilteredShops(shopsWithDistance || []);
      } else {
        setShops(data || []);
        setFilteredShops(data || []);
      }
    } catch (err) {
      console.error('Failed to load shops:', err);
      Toast.show({
        type: 'error',
        text1: 'Could not load shops',
        text2: 'Please check your connection',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyShops = async () => {
    if (!userLat || !userLng) {
      Toast.show({
        type: 'info',
        text1: 'Location not available',
        text2: 'Showing all shops',
        position: 'top',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Try the nearby endpoint first
      try {
        const response = await fetch(
          `${BASE_URL}/business/nearby?latitude=${userLat}&longitude=${userLng}&radius=5`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setFilteredShops(data || []);
          setShowNearby(true);
          setLoading(false);
          return;
        }
      } catch (nearbyErr) {
        console.log('Nearby endpoint failed, using manual calculation');
      }

      // Fallback: Filter shops manually by distance
      const nearbyShops = shops
        .filter((shop) => shop.distance && shop.distance <= 5)
        .sort((a, b) => a.distance - b.distance);

      setFilteredShops(nearbyShops);
      setShowNearby(true);
      
      if (nearbyShops.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No nearby shops',
          text2: 'No shops found within 5km',
          position: 'top',
        });
      }
    } catch (err) {
      console.error('Failed to load nearby shops:', err);
      Toast.show({
        type: 'error',
        text1: 'Could not load nearby shops',
        text2: 'Showing all shops instead',
        position: 'top',
      });
      setFilteredShops(shops);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredShops(shops);
      return;
    }

    const filtered = shops.filter(
      (shop) =>
        shop.name.toLowerCase().includes(query.toLowerCase()) ||
        shop.category.toLowerCase().includes(query.toLowerCase()) ||
        shop.city.toLowerCase().includes(query.toLowerCase()) ||
        shop.businessType.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredShops(filtered);
  };

  const toggleNearby = () => {
    if (showNearby) {
      setFilteredShops(shops);
      setShowNearby(false);
    } else {
      fetchNearbyShops();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F0E4" />

      {/* Header */}
      <LinearGradient colors={['#537D96', '#6A91A8']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Shops</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search shops, categories, cities..."
            placeholderTextColor="rgba(83, 125, 150, 0.5)"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, !showNearby && styles.filterButtonActive]}
            onPress={() => {
              setFilteredShops(shops);
              setShowNearby(false);
            }}
          >
            <Text style={[styles.filterButtonText, !showNearby && styles.filterButtonTextActive]}>
              All Shops ({shops.length})
            </Text>
          </TouchableOpacity>

          {userLat && userLng && (
            <TouchableOpacity
              style={[styles.filterButton, showNearby && styles.filterButtonActive]}
              onPress={toggleNearby}
            >
              <Text style={[styles.filterButtonText, showNearby && styles.filterButtonTextActive]}>
                📍 Nearby
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#537D96" />
            <Text style={styles.loadingText}>Loading shops...</Text>
          </View>
        ) : filteredShops.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏪</Text>
            <Text style={styles.emptyTitle}>No shops found</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Try adjusting your search'
                : 'No shops available at the moment'}
            </Text>
          </View>
        ) : (
          <View style={styles.shopsGrid}>
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

                  <View style={styles.shopContactRow}>
                    <Text style={styles.shopContactIcon}>📱</Text>
                    <Text style={styles.shopContact}>{shop.phoneNumber}</Text>
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
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F0E4',
  },
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 240, 228, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
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
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    backgroundColor: 'rgba(244, 240, 228, 0.3)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterButtonTextActive: {
    color: '#537D96',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#537D96',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
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
  emptyText: {
    fontSize: 14,
    color: '#8B9DAB',
    textAlign: 'center',
    lineHeight: 20,
  },
  shopsGrid: {
    padding: 20,
    gap: 16,
  },
  shopCard: {
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
    height: 180,
  },
  shopImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#E8E4DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopIcon: {
    fontSize: 80,
    color: '#537D96',
  },
  shopInfo: {
    padding: 16,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 8,
  },
  shopCategory: {
    fontSize: 15,
    color: '#EC8F8D',
    fontWeight: '600',
    marginBottom: 12,
  },
  shopLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  shopLocationIcon: {
    fontSize: 16,
  },
  shopLocation: {
    fontSize: 14,
    color: '#537D96',
    flex: 1,
    fontWeight: '600',
  },
  shopContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shopContactIcon: {
    fontSize: 16,
  },
  shopContact: {
    fontSize: 14,
    color: '#8B9DAB',
    fontWeight: '600',
  },
  shopDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8E4DC',
  },
  shopDistanceIcon: {
    fontSize: 16,
  },
  shopDistance: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '700',
  },
});

export default AllShopsScreen;
