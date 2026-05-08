import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

// ────────────────────────────────────────────────
// VERY IMPORTANT: CHANGE THIS TO YOUR COMPUTER'S IP
// Examples:
//   const BASE_URL = 'http://192.168.1.102:8080';
//   const BASE_URL = 'http://192.168.43.55:8080';
//   const BASE_URL = 'http://10.0.2.2:8080';  // Android emulator special
// ────────────────────────────────────────────────
const BASE_URL = 'http://10.229.214.121:8080'; // ← CHANGE THIS !!

export default function AddProductScreen() {
  const router = useRouter();

  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);
  const [loadingSeasons, setLoadingSeasons] = useState(true);

  const [form, setForm] = useState({
    productName: '',
    imageUrl: '',
    price: '',
    discount: '',
    description: '',
    validityDate: '2026-03-01',
    totalDiscountVouchers: '',
    category: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch seasons
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        setLoadingSeasons(true);
        console.log('[DEBUG] Fetching seasons from:', `${BASE_URL}/seasons`);

        const response = await fetch(`${BASE_URL}/seasons`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setSeasons(data);

        if (data.length > 0) {
          setSelectedSeasonId(data[0].id);
        }
      } catch (err) {
        console.error('[ERROR] Seasons fetch failed:', err);
        Toast.show({
          type: 'error',
          text1: 'Connection Issue',
          text2: 'Could not load seasons. Check network & BASE_URL',
          position: 'top',
          visibilityTime: 4000,
        });
      } finally {
        setLoadingSeasons(false);
      }
    };

    fetchSeasons();
  }, []);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectSeason = (id) => {
    setSelectedSeasonId(id);
  };

  const getSelectedSeasonTitle = () => {
    if (!selectedSeasonId) return 'No season selected (general product)';
    const season = seasons.find((s) => s.id === selectedSeasonId);
    return season ? season.title : 'Unknown season';
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.productName.trim()) {
      Toast.show({ type: 'error', text1: 'Product name is required' });
      return;
    }
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      Toast.show({ type: 'error', text1: 'Enter a valid price > 0' });
      return;
    }
    if (!form.discount || isNaN(parseFloat(form.discount))) {
      Toast.show({ type: 'error', text1: 'Enter a valid discount' });
      return;
    }
    if (!form.totalDiscountVouchers || isNaN(parseInt(form.totalDiscountVouchers, 10))) {
      Toast.show({ type: 'error', text1: 'Enter total discount vouchers' });
      return;
    }

    setIsSubmitting(true);

    try {
      const shopData = await AsyncStorage.getItem('shopData');
      let businessId = 1;
      if (shopData) {
        const parsed = JSON.parse(shopData);
        businessId = parsed.id || 1;
      }

      const payload = {
        productName: form.productName.trim(),
        imageUrl: form.imageUrl.trim() || 'https://via.placeholder.com/300x300?text=Product',
        price: parseFloat(form.price),
        discount: parseFloat(form.discount),
        description: form.description.trim(),
        validityDate: form.validityDate.trim(),
        totalDiscountVouchers: parseInt(form.totalDiscountVouchers, 10),
        category: form.category.trim() || 'General',
      };

      const url = selectedSeasonId
        ? `${BASE_URL}/products/business/${businessId}?seasonId=${selectedSeasonId}`
        : `${BASE_URL}/products/business/${businessId}`;

      console.log('[DEBUG] POST →', url);
      console.log('[DEBUG] Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[DEBUG] Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('[ERROR] Server said:', errorText);
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const result = await response.json();

      // Success → show toast & go back
      Toast.show({
        type: 'success',
        text1: 'Product Added!',
        text2: `${form.productName} (ID: ${result.id || '—'})`,
        position: 'top',
        visibilityTime: 2500,
        autoHide: true,
      });

      // Wait a moment for user to see the toast, then go back
      setTimeout(() => {
        setForm({
          productName: '',
          imageUrl: '',
          price: '',
          discount: '',
          description: '',
          validityDate: '2026-03-01',
          totalDiscountVouchers: '',
          category: '',
        });
        router.back(); // or router.push('/shop-dashboard') if you want to be explicit
      }, 1800);

    } catch (err) {
      console.error('[ERROR] Add failed:', err);
      Toast.show({
        type: 'error',
        text1: 'Failed to add product',
        text2: err.message.includes('Network')
          ? 'Cannot reach server. Check BASE_URL & Wi-Fi'
          : err.message || 'Unknown error',
        position: 'top',
        visibilityTime: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Add New Product / Offer</Text>

          {/* Season Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Discount Season</Text>
            <Text style={styles.sectionSubtitle}>
              Select a season to attach this offer to
            </Text>

            {loadingSeasons ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#537D96" />
                <Text style={styles.loadingText}>Loading seasons...</Text>
              </View>
            ) : seasons.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No active seasons found</Text>
                <Text style={styles.emptySubText}>
                  Product will be added without season
                </Text>
              </View>
            ) : (
              <View style={styles.seasonsList}>
                {seasons.map((season) => (
                  <TouchableOpacity
                    key={season.id}
                    style={[
                      styles.seasonCard,
                      selectedSeasonId === season.id && styles.seasonCardSelected,
                    ]}
                    onPress={() => handleSelectSeason(season.id)}
                  >
                    <Text style={styles.seasonTitle}>{season.title}</Text>
                    <Text style={styles.seasonDates}>
                      {season.startDate} → {season.endDate}
                    </Text>
                    <Text style={styles.seasonDescription} numberOfLines={2}>
                      {season.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.selectionSummary}>
              <Text style={styles.selectionLabel}>Selected:</Text>
              <Text
                style={[
                  styles.selectionValue,
                  !selectedSeasonId && styles.selectionValueNone,
                ]}
              >
                {getSelectedSeasonTitle()}
              </Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              value={form.productName}
              onChangeText={(v) => handleChange('productName', v)}
              placeholder="e.g. Basmati Rice 5kg"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={form.category}
              onChangeText={(v) => handleChange('category', v)}
              placeholder="Grocery, Snacks, Meals..."
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>Price (₹) *</Text>
              <TextInput
                style={styles.input}
                value={form.price}
                onChangeText={(v) => handleChange('price', v)}
                keyboardType="numeric"
                placeholder="450"
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Discount (%) *</Text>
              <TextInput
                style={styles.input}
                value={form.discount}
                onChangeText={(v) => handleChange('discount', v)}
                keyboardType="numeric"
                placeholder="20"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Total Discount Vouchers *</Text>
            <TextInput
              style={styles.input}
              value={form.totalDiscountVouchers}
              onChangeText={(v) => handleChange('totalDiscountVouchers', v)}
              keyboardType="number-pad"
              placeholder="150"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(v) => handleChange('description', v)}
              multiline
              numberOfLines={4}
              placeholder="Premium quality rice..."
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Image URL (optional)</Text>
            <TextInput
              style={styles.input}
              value={form.imageUrl}
              onChangeText={(v) => handleChange('imageUrl', v)}
              placeholder="https://example.com/rice.jpg"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Validity Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={form.validityDate}
              onChangeText={(v) => handleChange('validityDate', v)}
              placeholder="2026-06-30"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast must be rendered at root level in most cases */}
      {/* If this screen is not root, move <Toast /> to your app root (e.g. _layout.tsx) */}
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F0E4',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8B9DAB',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#537D96',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF20',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#537D96',
  },
  emptySubText: {
    fontSize: 13,
    color: '#8B9DAB',
    textAlign: 'center',
    marginTop: 8,
  },
  seasonsList: {
    gap: 12,
  },
  seasonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  seasonCardSelected: {
    borderColor: '#537D96',
    backgroundColor: '#537D9610',
  },
  seasonTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 4,
  },
  seasonDates: {
    fontSize: 13,
    color: '#EC8F8D',
    fontWeight: '600',
    marginBottom: 6,
  },
  seasonDescription: {
    fontSize: 14,
    color: '#8B9DAB',
    lineHeight: 20,
  },
  selectionSummary: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#537D9620',
    borderRadius: 12,
  },
  selectionLabel: {
    fontSize: 14,
    color: '#537D96',
    fontWeight: '600',
  },
  selectionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#537D96',
    marginTop: 4,
  },
  selectionValueNone: {
    color: '#D32F2F',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#537D96',
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0DCD4',
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#537D96',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0B8C5',
    shadowOpacity: 0.15,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});