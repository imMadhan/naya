import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const BASE_URL = 'http://10.229.214.121:8080';

const AdminDashboardScreen = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [seasons, setSeasons] = useState([]);
  const [isSeasonModalVisible, setSeasonModalVisible] = useState(false);
  const [newSeason, setNewSeason] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  // New states for data
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingShops, setLoadingShops] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  React.useEffect(() => {
    fetchSeasons();
    fetchUsers();
    fetchShops();
    fetchProducts();
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('adminData');
      Toast.show({
        type: 'success',
        text1: 'Logged out successfully',
        text2: 'See you soon! 👋',
        position: 'top',
      });
      setTimeout(() => {
        router.replace('/AdminLoginScreen');
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

  const fetchSeasons = async () => {
    try {
      const response = await fetch(`${BASE_URL}/seasons`);
      const data = await response.json();
      setSeasons(data);
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch(`${BASE_URL}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchShops = async () => {
    try {
      setLoadingShops(true);
      const response = await fetch(`${BASE_URL}/business`);
      const data = await response.json();
      setShops(data);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoadingShops(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await fetch(`${BASE_URL}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCreateSeason = async () => {
    try {
      if (!newSeason.title || !newSeason.description || !newSeason.startDate || !newSeason.endDate) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }

      const response = await fetch(`${BASE_URL}/seasons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSeason),
      });

      if (response.ok) {
        Alert.alert('Success', 'Season created successfully');
        setSeasonModalVisible(false);
        setNewSeason({ title: '', description: '', startDate: '', endDate: '' });
        fetchSeasons();
      } else {
        Alert.alert('Error', 'Failed to create season');
      }
    } catch (error) {
      console.error('Error creating season:', error);
      Alert.alert('Error', 'Failed to create season');
    }
  };

  const statsData = {
    today: {
      users: users.length.toString(),
      businesses: shops.length.toString(),
      bookings: '1,234',
      revenue: '₹2,45,600',
    },
    week: {
      users: users.length.toString(),
      businesses: shops.length.toString(),
      bookings: '8,567',
      revenue: '₹18,45,200',
    },
    month: {
      users: users.length.toString(),
      businesses: shops.length.toString(),
      bookings: '34,567',
      revenue: '₹76,89,400',
    },
  };

  const recentActivities = [
    { id: 1, type: 'user', action: 'New user registration', user: 'Priya Sharma', time: '5 mins ago', icon: '👤' },
    { id: 2, type: 'business', action: 'New business registered', user: 'The Marina Bistro', time: '12 mins ago', icon: '🏪' },
    { id: 3, type: 'booking', action: 'Booking completed', user: 'Rahul Kumar - PVR Cinemas', time: '18 mins ago', icon: '✅' },
    { id: 4, type: 'report', action: 'Report received', user: 'Café Mocha - User complaint', time: '25 mins ago', icon: '⚠️' },
  ];

  const quickActions = [
    { id: 'users', icon: '👥', label: 'User Mgmt', color: '#537D96', count: '64.9K' },
    { id: 'businesses', icon: '🏪', label: 'Businesses', color: '#EC8F8D', count: '9.8K' },
    { id: 'bookings', icon: '📋', label: 'Bookings', color: '#537D96', count: '34.5K' },
    { id: 'reports', icon: '⚠️', label: 'Reports', color: '#EC8F8D', count: '23' },
    { id: 'analytics', icon: '📊', label: 'Analytics', color: '#537D96', count: null },
    { id: 'settings', icon: '⚙️', label: 'Settings', color: '#8B9DAB', count: null },
  ];

  const pendingApprovals = [
    { id: 1, business: 'Spice Garden Restaurant', type: 'New Business', status: 'pending', submitted: '2 hours ago' },
    { id: 2, business: 'Phoenix Mall Update', type: 'Profile Update', status: 'pending', submitted: '4 hours ago' },
    { id: 3, business: 'Café Delight', type: 'Offer Request', status: 'pending', submitted: '6 hours ago' },
  ];

  const topPerformers = [
    { id: 1, name: 'The Marina Bistro', category: 'Restaurant', bookings: 1234, rating: 4.8 },
    { id: 2, name: 'PVR Cinemas', category: 'Entertainment', bookings: 987, rating: 4.7 },
    { id: 3, name: 'Phoenix Marketcity', category: 'Shopping', bookings: 756, rating: 4.6 },
  ];

  const currentStats = statsData[selectedPeriod];

  const getActivityColor = (type) => {
    switch (type) {
      case 'user': return '#537D96';
      case 'business': return '#EC8F8D';
      case 'booking': return '#537D96';
      case 'report': return '#D4A574';
      default: return '#8B9DAB';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F0E4" />

      {/* Header */}
      <LinearGradient
        colors={['#537D96', '#6A91A8']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.adminInfo}>
            <View style={styles.adminIconContainer}>
              <Text style={styles.adminIcon}>👨‍💼</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Admin Dashboard</Text>
              <Text style={styles.subtitle}>Vybe Platform Control</Text>
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
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <LinearGradient
              colors={['#537D96', '#6A91A8']}
              style={styles.statCard}
            >
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statValue}>{currentStats.users}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#EC8F8D', '#F0A29F']}
              style={styles.statCard}
            >
              <Text style={styles.statIcon}>🏪</Text>
              <Text style={styles.statValue}>{currentStats.businesses}</Text>
              <Text style={styles.statLabel}>Businesses</Text>
            </LinearGradient>
          </View>

          
        </View>

        

        {/* Seasons Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seasons & Events</Text>
            <TouchableOpacity onPress={() => setSeasonModalVisible(true)}>
              <Text style={styles.seeAllText}>+ Add Season</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonsContainer}>
            {seasons.map((season) => (
              <LinearGradient
                key={season.id}
                colors={['#537D96', '#6A91A8']}
                style={styles.seasonCard}
              >
                <Text style={styles.seasonTitle}>{season.title}</Text>
                <Text style={styles.seasonDate}>{season.startDate} - {season.endDate}</Text>
                <Text style={styles.seasonDescription}>{season.description}</Text>
              </LinearGradient>
            ))}
            {seasons.length === 0 && (
              <View style={styles.noSeasonsCard}>
                <Text style={styles.noSeasonsText}>No active seasons</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Users Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Registered Users ({users.length})</Text>
          </View>

          {loadingUsers ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#537D96" />
            </View>
          ) : users.length === 0 ? (
            <Text style={styles.emptyText}>No users registered yet</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {users.slice(0, 10).map((user) => (
                <View key={user.id} style={styles.dataCard}>
                  <View style={styles.dataCardHeader}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.dataCardId}>#{user.id}</Text>
                  </View>
                  <Text style={styles.dataCardTitle}>{user.name}</Text>
                  <Text style={styles.dataCardSubtitle}>{user.email}</Text>
                  <Text style={styles.dataCardInfo}>📱 {user.phoneNumber}</Text>
                  <Text style={styles.dataCardInfo}>🎂 {user.birthday}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Shops Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Registered Shops ({shops.length})</Text>
          </View>

          {loadingShops ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#537D96" />
            </View>
          ) : shops.length === 0 ? (
            <Text style={styles.emptyText}>No shops registered yet</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {shops.slice(0, 10).map((shop) => (
                <TouchableOpacity 
                  key={shop.id} 
                  style={styles.dataCard}
                  onPress={() => router.push(`/shop/${shop.id}`)}
                >
                  <View style={styles.dataCardHeader}>
                    <Text style={styles.shopEmoji}>🏪</Text>
                    <Text style={styles.dataCardId}>#{shop.id}</Text>
                  </View>
                  <Text style={styles.dataCardTitle}>{shop.name}</Text>
                  <Text style={styles.dataCardSubtitle}>{shop.category} • {shop.businessType}</Text>
                  <Text style={styles.dataCardInfo}>👤 {shop.ownerName}</Text>
                  <Text style={styles.dataCardInfo}>📍 {shop.city}, {shop.pincode}</Text>
                  <Text style={styles.dataCardInfo}>📱 {shop.phoneNumber}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Products ({products.length})</Text>
          </View>

          {loadingProducts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#537D96" />
            </View>
          ) : products.length === 0 ? (
            <Text style={styles.emptyText}>No products available yet</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {products.slice(0, 10).map((product) => (
                <TouchableOpacity 
                  key={product.id} 
                  style={styles.productCard}
                  onPress={() => router.push(`/product-details/${product.id}`)}
                >
                  <View style={styles.productCardHeader}>
                    <Text style={styles.dataCardId}>#{product.id}</Text>
                    {product.discount > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountBadgeText}>{product.discount}% OFF</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.dataCardTitle} numberOfLines={2}>{product.productName}</Text>
                  <Text style={styles.dataCardSubtitle}>{product.category}</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.currentPrice}>
                      ₹{Math.round(product.price * (1 - product.discount / 100))}
                    </Text>
                    {product.discount > 0 && (
                      <Text style={styles.originalPrice}>₹{Math.round(product.price)}</Text>
                    )}
                  </View>

                  <Text style={styles.dataCardInfo}>🏪 {product.business?.name || 'N/A'}</Text>
                  <Text style={styles.dataCardInfo}>🎟️ {product.availableDiscountVouchers} vouchers left</Text>
                  <Text style={styles.dataCardInfo}>✅ {product.soldDiscountVouchers} sold</Text>
                  
                  {product.discountSeason && (
                    <View style={styles.seasonTag}>
                      <Text style={styles.seasonTagText}>🎉 {product.discountSeason.title}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Season Creation Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isSeasonModalVisible}
          onRequestClose={() => setSeasonModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New Season</Text>

              <TextInput
                style={styles.input}
                placeholder="Season Title (e.g. Christmas Sale)"
                value={newSeason.title}
                onChangeText={(text) => setNewSeason({ ...newSeason, title: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Description"
                value={newSeason.description}
                onChangeText={(text) => setNewSeason({ ...newSeason, description: text })}
                multiline
              />

              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="Start Date (YYYY-MM-DD)"
                  value={newSeason.startDate}
                  onChangeText={(text) => setNewSeason({ ...newSeason, startDate: text })}
                />
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="End Date (YYYY-MM-DD)"
                  value={newSeason.endDate}
                  onChangeText={(text) => setNewSeason({ ...newSeason, endDate: text })}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setSeasonModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
                  onPress={handleCreateSeason}
                >
                  <Text style={styles.createButtonText}>Create Season</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        

       

        

        

        

        <View style={{ height: 100 }} />
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F4F0E4',
    padding: 16,
    borderRadius: 12,
    fontSize: 14,
    color: '#333',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#EC8F8D20',
  },
  createButton: {
    backgroundColor: '#537D96',
  },
  cancelButtonText: {
    color: '#EC8F8D',
    fontWeight: '800',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '800',
  },

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
  noSeasonsCard: {
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  noSeasonsText: {
    color: '#8B9DAB',
    fontWeight: '600',
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
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(244, 240, 228, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminIcon: {
    fontSize: 24,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
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

  // Stats
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
  pendingBadge: {
    backgroundColor: '#EC8F8D',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
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
  quickActionCount: {
    fontSize: 11,
    color: '#8B9DAB',
    fontWeight: '600',
  },

  // Approvals
  approvalsContainer: {
    gap: 12,
    marginTop: 16,
  },
  approvalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  approvalHeader: {
    marginBottom: 12,
  },
  approvalInfo: {
    gap: 4,
  },
  approvalBusiness: {
    fontSize: 16,
    fontWeight: '800',
    color: '#537D96',
  },
  approvalType: {
    fontSize: 13,
    color: '#EC8F8D',
    fontWeight: '600',
  },
  approvalTime: {
    fontSize: 12,
    color: '#8B9DAB',
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#537D9620',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#537D96',
    fontSize: 13,
    fontWeight: '800',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#EC8F8D20',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#EC8F8D',
    fontSize: 13,
    fontWeight: '800',
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F4F0E4',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#537D96',
    fontSize: 13,
    fontWeight: '700',
  },

  // Activities
  activitiesContainer: {
    gap: 12,
    marginTop: 16,
  },
  activityCard: {
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
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    fontSize: 20,
  },
  activityDetails: {
    flex: 1,
    gap: 2,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '800',
    color: '#537D96',
  },
  activityUser: {
    fontSize: 13,
    color: '#8B9DAB',
  },
  activityTime: {
    fontSize: 12,
    color: '#8B9DAB',
  },

  // Performers
  performersContainer: {
    gap: 12,
    marginTop: 16,
  },
  performerCard: {
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
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EC8F8D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  performerInfo: {
    flex: 1,
    gap: 4,
  },
  performerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#537D96',
  },
  performerCategory: {
    fontSize: 12,
    color: '#8B9DAB',
  },
  performerStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  performerStat: {
    alignItems: 'flex-end',
  },
  performerStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#537D96',
  },
  performerStatLabel: {
    fontSize: 11,
    color: '#8B9DAB',
  },
  performerRating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#537D96',
  },

  // Health
  healthCard: {
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
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthInfo: {
    gap: 4,
  },
  healthLabel: {
    fontSize: 14,
    color: '#8B9DAB',
    fontWeight: '600',
  },
  healthValue: {
    fontSize: 15,
    color: '#537D96',
    fontWeight: '800',
  },
  healthIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Insight Card
  insightCard: {
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
  },
  insightRow: {
    flexDirection: 'row',
  },
  insightItem: {
    flex: 1,
    alignItems: 'center',
  },
  insightDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  insightValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
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

  // Data Cards
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8B9DAB',
    paddingVertical: 20,
    fontSize: 14,
  },
  dataCard: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dataCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#537D9620',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#537D96',
  },
  shopEmoji: {
    fontSize: 32,
  },
  dataCardId: {
    fontSize: 12,
    color: '#8B9DAB',
    fontWeight: '600',
  },
  dataCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 4,
  },
  dataCardSubtitle: {
    fontSize: 13,
    color: '#EC8F8D',
    marginBottom: 8,
    fontWeight: '600',
  },
  dataCardInfo: {
    fontSize: 12,
    color: '#8B9DAB',
    marginBottom: 4,
  },
  productCard: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EC8F8D',
  },
  originalPrice: {
    fontSize: 14,
    color: '#8B9DAB',
    textDecorationLine: 'line-through',
  },
  seasonTag: {
    backgroundColor: '#EC8F8D20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  seasonTagText: {
    fontSize: 11,
    color: '#EC8F8D',
    fontWeight: '700',
  },
});

export default AdminDashboardScreen;