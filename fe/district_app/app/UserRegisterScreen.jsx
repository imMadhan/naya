import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import { useState } from "react";
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
} from "react-native";
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get("window");

const UserRegisterScreen = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2: Personal Details
  const [gender, setGender] = useState("Male");
  const [birthday, setBirthday] = useState("");
  const [anniversary, setAnniversary] = useState("");

  // Step 3: Location
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  // Step 4: Account Security
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

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

  const isStep1Valid =
    fullName.length > 0 && email.length > 0 && phone.length === 10;

  // Basic date validation regex (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const isStep2Valid =
    gender.length > 0 &&
    dateRegex.test(birthday) &&
    (anniversary === "" || dateRegex.test(anniversary));

  const isStep3Valid = address.length > 0 && latitude !== "" && longitude !== "";

  const isStep4Valid =
    password.length >= 5 && password === confirmPassword && agreeToTerms;

  const getStepValid = () => {
    switch (currentStep) {
      case 1:
        return isStep1Valid;
      case 2:
        return isStep2Valid;
      case 3:
        return isStep3Valid;
      case 4:
        return isStep4Valid;
      default:
        return false;
    }
  };

  const handleRegister = async () => {
    const payload = {
      name: fullName,
      phoneNumber: phone,
      email: email,
      gender: gender,
      birthday: birthday,
      anniversary: anniversary,
      password: password,
      address: address,
      latitude: latitude,
      longitude: longitude
    };

    console.log("Register User Payload:", payload);
    setLoading(true);

    try {
      const response = await fetch("http://10.229.214.121:8080/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.data) {
        // Store the newly registered user data
        await AsyncStorage.setItem('userData', JSON.stringify(data.data));
        
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: `Welcome ${data.data.name || 'User'}! 🎉`
        });
        
        console.log("User registered:", data.data);
        
        setTimeout(() => {
          router.replace("/UserDashboardScreen");
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



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#537D96" />

      {/* Header */}
      <LinearGradient colors={["#537D96", "#6A91A8"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() =>
              currentStep === 1 ? router.back() : handlePrevious()
            }
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentStep / 4) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>Step {currentStep} of 4</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Let's Get Started!</Text>
              <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#8B9DAB"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#8B9DAB"
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
                    placeholderTextColor="#8B9DAB"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
                {phone.length > 0 && phone.length < 10 && (
                  <Text style={styles.errorText}>
                    Phone number must be 10 digits
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Step 2: Personal Details */}
          {currentStep === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Personal Details</Text>
              <Text style={styles.stepSubtitle}>
                A few more details about you
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Gender *</Text>
                <View style={styles.genderContainer}>
                  {["Male", "Female", "Other"].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderButton,
                        gender === g && styles.genderButtonActive
                      ]}
                      onPress={() => setGender(g)}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          gender === g && styles.genderTextActive
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Birthday (YYYY-MM-DD) *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🎂</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1995-05-10"
                    placeholderTextColor="#8B9DAB"
                    value={birthday}
                    onChangeText={setBirthday}
                    maxLength={10}
                  />
                </View>
                {!dateRegex.test(birthday) && birthday.length > 0 && (
                  <Text style={styles.errorText}>Format: YYYY-MM-DD</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Anniversary (YYYY-MM-DD)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>💍</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2020-06-15"
                    placeholderTextColor="#8B9DAB"
                    value={anniversary}
                    onChangeText={setAnniversary}
                    maxLength={10}
                  />
                </View>
                {!dateRegex.test(anniversary) && anniversary.length > 0 && (
                  <Text style={styles.errorText}>Format: YYYY-MM-DD</Text>
                )}
              </View>
            </View>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Add Your Location</Text>
              <Text style={styles.stepSubtitle}>So we can serve you better</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Address *</Text>
                <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingVertical: 10 }]}>
                  <Text style={[styles.inputIcon, { marginTop: 5 }]}>📍</Text>
                  <TextInput
                    style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                    placeholder="Enter your full address"
                    placeholderTextColor="#8B9DAB"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                  />
                </View>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(83, 125, 150, 0.1)',
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#537D96',
                  alignItems: 'center',
                  marginBottom: 20,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 10
                }}
                onPress={handleGetLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color="#537D96" />
                ) : (
                  <>
                    <Text style={{ fontSize: 20 }}>📍</Text>
                    <Text style={{ color: '#537D96', fontWeight: '700', fontSize: 16 }}>
                      Fetch My Current Location
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {latitude !== '' && longitude !== '' && (
                <Text style={{ color: '#537D96', textAlign: 'center', backgroundColor: '#e8f4f8', padding: 10, borderRadius: 8 }}>
                  Lat: {latitude}, Long: {longitude}
                </Text>
              )}
            </View>
          )}

          {/* Step 4: Security */}
          {currentStep === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Secure Your Account</Text>
              <Text style={styles.stepSubtitle}>Create a strong password</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔐</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Minimum 5 characters"
                    placeholderTextColor="#8B9DAB"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeIcon}>
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {password.length > 0 && password.length < 5 && (
                  <Text style={styles.errorText}>
                    Password must be at least 5 characters
                  </Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔐</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor="#8B9DAB"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeIcon}>
                      {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreeToTerms && styles.checkboxActive,
                  ]}
                >
                  {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  I agree to the{" "}
                  <Text style={styles.linkText}>Terms of Service</Text> and{" "}
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
              getStepValid() && styles.nextButtonActive,
            ]}
            onPress={handleNext}
            disabled={!getStepValid()}
          >
            <LinearGradient
              colors={
                getStepValid() ? ["#537D96", "#6A91A8"] : ["#E8E4DC", "#E8E4DC"]
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text
                style={[
                  styles.nextButtonText,
                  getStepValid() && styles.nextButtonTextActive,
                ]}
              >
                Next Step
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, isStep4Valid && styles.nextButtonActive]}
            onPress={handleRegister}
            disabled={!isStep4Valid || loading}
          >
            <LinearGradient
              colors={
                isStep4Valid ? ["#EC8F8D", "#F0A29F"] : ["#E8E4DC", "#E8E4DC"]
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text
                  style={[
                    styles.nextButtonText,
                    isStep4Valid && styles.nextButtonTextActive,
                  ]}
                >
                  Create Account
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.push("/")}>
          <Text style={styles.loginLink}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F0E4",
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 28,
    color: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },

  // Progress Bar
  progressContainer: {
    marginBottom: 0,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    textAlign: "center",
  },

  // Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#537D96",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#8B9DAB",
    marginBottom: 32,
  },

  // Input Styles
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#537D96",
    fontWeight: "700",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E8E4DC",
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#537D96",
    fontSize: 16,
    paddingVertical: 16,
  },
  phoneInput: {
    paddingLeft: 12,
  },
  countryCode: {
    color: "#537D96",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: "#E8E4DC",
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorText: {
    fontSize: 12,
    color: "#EC8F8D",
    marginTop: 4,
    marginLeft: 4,
  },

  // Gender Buttons
  genderContainer: {
    flexDirection: "row",
    gap: 10,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E8E4DC",
    alignItems: "center",
  },
  genderButtonActive: {
    backgroundColor: "#537D9620",
    borderColor: "#537D96",
  },
  genderText: {
    color: "#8B9DAB",
    fontWeight: "600",
  },
  genderTextActive: {
    color: "#537D96",
    fontWeight: "800",
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E8E4DC",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: "#537D96",
    borderColor: "#537D96",
  },
  checkboxLabel: {
    flex: 1,
    color: "#8B9DAB",
    fontSize: 14,
    lineHeight: 20,
  },
  linkText: {
    color: "#537D96",
    fontWeight: "700",
  },
  checkmark: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14
  },

  // Bottom Navigation
  bottomNavigation: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E4DC",
  },
  nextButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  nextButtonActive: {
    shadowColor: "#537D96",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#8B9DAB",
    fontSize: 17,
    fontWeight: "800",
  },
  nextButtonTextActive: {
    color: "#FFFFFF",
  },
  loginLink: {
    color: "#537D96",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default UserRegisterScreen;
