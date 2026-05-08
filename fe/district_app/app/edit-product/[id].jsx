import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';

// ────────────────────────────────────────────────
// Use the same BASE_URL as in other screens
// ────────────────────────────────────────────────
const BASE_URL = 'http://10.229.214.121:8080'; // ← CHANGE THIS to match your network!

export default function EditProductScreen() {
    const { id } = useLocalSearchParams(); // from /edit-product/1 → id = "1"
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        productName: '',
        imageUrl: '',
        price: '',
        discount: '',
        description: '',
        validityDate: '',
        totalDiscountVouchers: '',
        category: '',
    });

    // Fetch existing product data
    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${BASE_URL}/products/${id}`);
                if (!response.ok) throw new Error(`Failed: ${response.status}`);

                const data = await response.json();

                setForm({
                    productName: data.productName || '',
                    imageUrl: data.imageUrl || '',
                    price: data.price?.toString() || '',
                    discount: data.discount?.toString() || '',
                    description: data.description || '',
                    validityDate: data.validityDate || '',
                    totalDiscountVouchers: data.totalDiscountVouchers?.toString() || '',
                    category: data.category || '',
                });
            } catch (err) {
                console.error('[ERROR] Fetch product failed:', err);
                Toast.show({
                    type: 'error',
                    text1: 'Failed to load product',
                    text2: 'Check connection or product ID',
                    position: 'top',
                });
                router.back();
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleChange = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        // Basic validation (same as add screen)
        if (!form.productName.trim()) {
            Toast.show({ type: 'error', text1: 'Product name is required' });
            return;
        }
        if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
            Toast.show({ type: 'error', text1: 'Valid price > 0 required' });
            return;
        }
        if (!form.discount || isNaN(parseFloat(form.discount))) {
            Toast.show({ type: 'error', text1: 'Valid discount required' });
            return;
        }
        if (!form.totalDiscountVouchers || isNaN(parseInt(form.totalDiscountVouchers, 10))) {
            Toast.show({ type: 'error', text1: 'Total vouchers required' });
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

            const response = await fetch(`${BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`, // add when auth is implemented
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            const result = await response.json();

            Toast.show({
                type: 'success',
                text1: 'Product Updated!',
                text2: `${form.productName} (ID: ${result.id})`,
                position: 'top',
                visibilityTime: 2500,
            });

            setTimeout(() => {
                router.back(); // or router.push('/shop-menu') to go to list
            }, 1800);
        } catch (err) {
            console.error('[ERROR] Update failed:', err);
            Toast.show({
                type: 'error',
                text1: 'Update failed',
                text2: err.message.includes('Network')
                    ? 'Cannot reach server. Check BASE_URL & Wi-Fi'
                    : err.message || 'Server error',
                position: 'top',
                visibilityTime: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#537D96" />
                    <Text style={styles.loadingText}>Loading product data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>Edit Product</Text>

                    {/* Form - almost identical to add screen, but pre-filled */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Product Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={form.productName}
                            onChangeText={(v) => handleChange('productName', v)}
                            placeholder="e.g. Basmati Rice 10kg"
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
                                placeholder="900"
                            />
                        </View>

                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Discount (%) *</Text>
                            <TextInput
                                style={styles.input}
                                value={form.discount}
                                onChangeText={(v) => handleChange('discount', v)}
                                keyboardType="numeric"
                                placeholder="10"
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
                            placeholder="Updated premium quality rice..."
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Image URL (optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={form.imageUrl}
                            onChangeText={(v) => handleChange('imageUrl', v)}
                            placeholder="https://example.com/rice-new.jpg"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Validity Date (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.input}
                            value={form.validityDate}
                            onChangeText={(v) => handleChange('validityDate', v)}
                            placeholder="2026-05-01"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? 'Updating...' : 'Update Product'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <View style={{ height: 80 }} />
                </ScrollView>
            </KeyboardAvoidingView>

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
        marginBottom: 24,
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
    cancelButton: {
        marginTop: 16,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#EC8F8D',
        fontSize: 16,
        fontWeight: '700',
    },
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
});