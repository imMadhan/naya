import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

const { width, height } = Dimensions.get('window');

const ShopLoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://10.229.214.121:8080/business/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok || data.message === "Login successful!") {
        await AsyncStorage.setItem('shopData', JSON.stringify(data.data));
        Alert.alert("Success", "Login successful!");
        // Store user data if needed here
        console.log("Business Data:", data.data);
        router.replace('/ShopDashboardScreen');
      } else {
        Alert.alert("Error", data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Login Error:", error);
      Alert.alert("Error", "Something went wrong. Please check your connection.");
    }
  };

  const handleSignUp = () => {
    router.push('/ShopRegisterScreen');
  };

  const isFormValid = email.length > 0 && password.length >= 5;

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.shopIconContainer}>
              <LinearGradient
                colors={['#a855f7', '#9333ea']}
                style={styles.shopIconGradient}
              >
                <Text style={styles.shopIconText}>🏪</Text>
              </LinearGradient>
            </View>
            <Text style={styles.logoText}>Vybe Business</Text>
            <Text style={styles.headerSubtext}>Partner Portal</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome Back, Partner!</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to manage your business
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Email/Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email or Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.input}
                  placeholder="partner@business.com"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Password</Text>

              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔐</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
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
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isFormValid && styles.loginButtonActive
              ]}
              onPress={handleLogin}
              disabled={!isFormValid || loading}
            >
              <LinearGradient
                colors={isFormValid ? ['#a855f7', '#9333ea'] : ['#2d2440', '#2d2440']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={[
                    styles.loginButtonText,
                    isFormValid && styles.loginButtonTextActive
                  ]}>
                    Sign In to Dashboard
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

          </View>

          {/* Business Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What you'll get:</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <Text style={styles.featureText}>Real-time Analytics</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💳</Text>
                <Text style={styles.featureText}>Payment Management</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎯</Text>
                <Text style={styles.featureText}>Marketing Tools</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>⭐</Text>
                <Text style={styles.featureText}>Reviews & Ratings</Text>
              </View>
            </View>
          </View>

          {/* Sign Up Section */}
          <View style={styles.signupSection}>
            <Text style={styles.signupText}>New to Vybe Business?</Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signupLink}>Register Your Business</Text>
            </TouchableOpacity>
          </View>



          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing in, you agree to our{' '}
              <Text style={styles.footerLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  shopIconContainer: {
    marginBottom: 16,
  },
  shopIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  shopIconText: {
    fontSize: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 14,
    color: '#a855f7',
    letterSpacing: 3,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // Welcome Section
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#999',
  },

  // Form Container
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#BFC9D1',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  forgotLink: {
    fontSize: 14,
    color: '#a855f7',
    fontWeight: '600',
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
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },

  // Login Button
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 24,
  },
  loginButtonActive: {
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
  loginButtonText: {
    color: '#666',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loginButtonTextActive: {
    color: '#ffffff',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2d2440',
  },
  dividerText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 16,
    letterSpacing: 1,
  },

  // Quick Access
  quickAccessContainer: {
    marginBottom: 32,
  },
  quickAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1625',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2d2440',
    paddingVertical: 18,
    gap: 12,
  },
  quickAccessIcon: {
    fontSize: 20,
  },
  quickAccessText: {
    color: '#BFC9D1',
    fontSize: 16,
    fontWeight: '700',
  },

  // Features Section
  featuresContainer: {
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 15,
    color: '#BFC9D1',
    fontWeight: '500',
  },

  // Sign Up Section
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  signupText: {
    fontSize: 15,
    color: '#999',
  },
  signupLink: {
    fontSize: 15,
    color: '#a855f7',
    fontWeight: '700',
  },

  // Help Section
  helpSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  helpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  helpIcon: {
    fontSize: 18,
  },
  helpText: {
    color: '#BFC9D1',
    fontSize: 13,
    fontWeight: '600',
  },

  // Footer
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#a855f7',
    fontWeight: '600',
  },
});

export default ShopLoginScreen;