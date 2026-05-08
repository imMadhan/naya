import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const ShopRegisterScreen = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Step 1: Business Details
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Step 2: Contact Information
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 3: Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Step 4: Authentication
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const businessTypes = [
    { id: 'Restaurant', label: 'Restaurant', icon: '🍽️' },
    { id: 'Cafe', label: 'Café', icon: '☕' },
    { id: 'Shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'Entertainment', label: 'Entertainment', icon: '🎭' },
    { id: 'Cinema', label: 'Cinema', icon: '🎬' },
    { id: 'Salon', label: 'Salon & Spa', icon: '💅' },
  ];

  const animateStep = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (currentStep < 4) {
      animateStep();
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      animateStep();
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        setLocationLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(String(location.coords.latitude));
      setLongitude(String(location.coords.longitude));
      Alert.alert("Success", "Location fetched successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch location.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleRegister = async () => {
    const payload = {
      name: businessName,
      businessType: businessType, // This will now match the IDs I updated above (Capitalized)
      category: businessCategory,
      ownerName: ownerName,
      emailId: email,
      phoneNumber: phone,
      address: address,
      latitude: latitude,
      longitude: longitude,
      city: city,
      pincode: pincode,
      password: password,
      imageUrl: imageUrl || null,
    };

    console.log('Register Business Payload:', payload);
    setLoading(true);

    try {
      const response = await fetch("http://10.229.214.121:8080/business/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.data) {
        // Store the newly registered shop data
        await AsyncStorage.setItem('shopData', JSON.stringify(data.data));
        
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: `Welcome ${data.data.name}! 🎉`
        });
        
        console.log('Shop registered:', data.data);
        
        setTimeout(() => {
          router.replace("/ShopDashboardScreen");
        }, 1500);
      } else {
        Alert.alert("Error", data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Registration Error:", error);
      Alert.alert("Error", "Something went wrong. Please check your connection.");
    }
  };

  const isStep1Valid = businessName.length > 0 && businessType.length > 0;
  const isStep2Valid = ownerName.length > 0 && email.length > 0 && phone.length === 10;
  const isStep3Valid = address.length > 0 && city.length > 0 && pincode.length === 6 && latitude !== '' && longitude !== '';
  const isStep4Valid = password.length >= 8 && password === confirmPassword && agreeToTerms;

  const getStepValid = () => {
    switch (currentStep) {
      case 1: return isStep1Valid;
      case 2: return isStep2Valid;
      case 3: return isStep3Valid;
      case 4: return isStep4Valid;
      default: return false;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1a1625" />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#1a1625', '#2d1b3d', '#1a1625']}
        style={styles.gradientBackground}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => currentStep === 1 ? router.back() : handlePrevious()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Your Business</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#a855f7', '#9333ea']}
            style={[styles.progressFill, { width: `${(currentStep / 4) * 100}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={styles.progressText}>Step {currentStep} of 4</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Step 1: Business Details */}
          {currentStep === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Business Details</Text>
              <Text style={styles.stepSubtitle}>Tell us about your business</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Business Name *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🏪</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your business name"
                    placeholderTextColor="#666"
                    value={businessName}
                    onChangeText={setBusinessName}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Business Type *</Text>
                <View style={styles.categoryGrid}>
                  {businessTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.categoryCard,
                        businessType === type.id && styles.categoryCardActive
                      ]}
                      onPress={() => setBusinessType(type.id)}
                    >
                      <Text style={styles.categoryIcon}>{type.icon}</Text>
                      <Text style={[
                        styles.categoryLabel,
                        businessType === type.id && styles.categoryLabelActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Category / Cuisine (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🏷️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Italian, Fast Food, Fashion"
                    placeholderTextColor="#666"
                    value={businessCategory}
                    onChangeText={setBusinessCategory}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Shop Image URL (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🖼️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://example.com/shop-image.jpg"
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                    keyboardType="url"
                    value={imageUrl}
                    onChangeText={setImageUrl}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Contact Information</Text>
              <Text style={styles.stepSubtitle}>How can we reach you?</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Owner / Manager Name *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Full name"
                    placeholderTextColor="#666"
                    value={ownerName}
                    onChangeText={setOwnerName}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="business@example.com"
                    placeholderTextColor="#666"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📱</Text>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder="10-digit number"
                    placeholderTextColor="#666"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
                {phone.length > 0 && phone.length < 10 && (
                  <Text style={styles.errorText}>Phone number must be 10 digits</Text>
                )}
              </View>
            </View>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Business Location</Text>
              <Text style={styles.stepSubtitle}>Where is your business located?</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Address *</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <Text style={styles.inputIcon}>📍</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Street, Building, Landmark"
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={3}
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>City *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🏙️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your city"
                    placeholderTextColor="#666"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>PIN Code *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📮</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="6-digit PIN code"
                    placeholderTextColor="#666"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={pincode}
                    onChangeText={setPincode}
                  />
                </View>
                {pincode.length > 0 && pincode.length < 6 && (
                  <Text style={styles.errorText}>PIN code must be 6 digits</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.mapButton}
                onPress={handleGetLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color="#a855f7" />
                ) : (
                  <>
                    <Text style={styles.mapIcon}>�</Text>
                    <Text style={styles.mapText}>Fetch My Current Location</Text>
                  </>
                )}
              </TouchableOpacity>

              {latitude !== '' && longitude !== '' && (
                <Text style={{ color: '#fff', marginTop: 10, textAlign: 'center' }}>
                  Lat: {latitude}, Long: {longitude}
                </Text>
              )}
            </View>
          )}

          {/* Step 4: Security & Terms */}
          {currentStep === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Security & Terms</Text>
              <Text style={styles.stepSubtitle}>Create your account password</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔐</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Minimum 8 characters"
                    placeholderTextColor="#666"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
                {password.length > 0 && password.length < 8 && (
                  <Text style={styles.errorText}>Password must be at least 8 characters</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔐</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor="#666"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                )}
              </View>

              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>Password must contain:</Text>
                <Text style={[styles.requirementItem, password.length >= 8 && styles.requirementMet]}>
                  • At least 8 characters
                </Text>
                <Text style={[styles.requirementItem, /[A-Z]/.test(password) && styles.requirementMet]}>
                  • One uppercase letter
                </Text>
                <Text style={[styles.requirementItem, /[0-9]/.test(password) && styles.requirementMet]}>
                  • One number
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
              >
                <View style={[styles.checkbox, agreeToTerms && styles.checkboxActive]}>
                  {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  I agree to the{' '}
                  <Text style={styles.linkText}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {currentStep < 4 ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              getStepValid() && styles.nextButtonActive
            ]}
            onPress={handleNext}
            disabled={!getStepValid()}
          >
            <LinearGradient
              colors={getStepValid() ? ['#a855f7', '#9333ea'] : ['#2d2440', '#2d2440']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[
                styles.nextButtonText,
                getStepValid() && styles.nextButtonTextActive
              ]}>
                Next Step
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.nextButton,
              isStep4Valid && styles.nextButtonActive
            ]}
            onPress={handleRegister}
            disabled={!isStep4Valid || loading}
          >
            <LinearGradient
              colors={isStep4Valid ? ['#a855f7', '#9333ea'] : ['#2d2440', '#2d2440']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={[
                  styles.nextButtonText,
                  isStep4Valid && styles.nextButtonTextActive
                ]}>
                  Complete Registration
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.push('/ShopLoginScreen')}>
          <Text style={styles.loginLink}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1625',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },

  // Progress Bar
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2d2440',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#a855f7',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 32,
  },

  // Input Styles
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#BFC9D1',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1625',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2d2440',
    paddingHorizontal: 16,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 18,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  phoneInput: {
    paddingLeft: 12,
  },
  countryCode: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#2d2440',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 4,
    marginLeft: 4,
  },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 64) / 2,
    backgroundColor: '#1a1625',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2d2440',
    padding: 20,
    alignItems: 'center',
  },
  categoryCardActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: '#a855f7',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#BFC9D1',
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: '#a855f7',
  },

  // Map Button
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#a855f7',
    paddingVertical: 16,
    gap: 12,
    marginTop: 12,
  },
  mapIcon: {
    fontSize: 20,
  },
  mapText: {
    color: '#a855f7',
    fontSize: 16,
    fontWeight: '700',
  },

  // Password Requirements
  passwordRequirements: {
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    color: '#BFC9D1',
    fontWeight: '700',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  requirementMet: {
    color: '#4ade80',
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2d2440',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  checkboxLabel: {
    flex: 1,
    color: '#BFC9D1',
    fontSize: 14,
    lineHeight: 20,
  },
  linkText: {
    color: '#a855f7',
    fontWeight: '600',
  },

  // Bottom Navigation
  bottomNavigation: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#0a0810',
    borderTopWidth: 1,
    borderTopColor: '#2d2440',
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  nextButtonActive: {
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#666',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  nextButtonTextActive: {
    color: '#ffffff',
  },
  loginLink: {
    color: '#a855f7',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default ShopRegisterScreen;