
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get("window");

const DistrictLoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginStep, setLoginStep] = useState(1); // 1 = email, 2 = password
  const [activePin, setActivePin] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [pinAnim1] = useState(new Animated.Value(0));
  const [pinAnim2] = useState(new Animated.Value(0));
  const [pinAnim3] = useState(new Animated.Value(0));
  const [carouselRotation] = useState(new Animated.Value(0));
  const [labelOpacity] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);

  // Ref to track mounted state for cleaning up async animations/intervals
  const isMounted = useRef(true);
  const carouselInterval = useRef(null);

  

  const pins = [
    {
      id: 0,
      name: "MOVIES & THEATRES",
      image:
        "https://i.pinimg.com/736x/44/78/43/447843db72698b83c4879c5543a40298.jpg",
    },
    {
      id: 1,
      name: "RESTAURANTS",
      image:
        "https://i.pinimg.com/736x/66/b5/d9/66b5d97c12690fefe09555747c80d4ac.jpg",
    },
    {
      id: 2,
      name: "SHOPPING",
      image:
        "https://i.pinimg.com/736x/ea/44/db/ea44dbe8fd2df46c1f86d81fbf7aceb8.jpg",
    },
  ];

  useEffect(() => {
    isMounted.current = true;

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered pin animations
    Animated.stagger(200, [
      Animated.spring(pinAnim1, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(pinAnim2, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(pinAnim3, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (isMounted.current) {
        startCarousel();
      }
    });

    return () => {
      isMounted.current = false;
      if (carouselInterval.current) {
        clearInterval(carouselInterval.current);
      }
    };
  }, []);

  const startCarousel = () => {
    Animated.timing(labelOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    carouselInterval.current = setInterval(() => {
      if (!isMounted.current) return;

      setActivePin((prev) => {
        const nextPin = (prev + 1) % 3;
        animateCarousel(nextPin);
        return nextPin;
      });
    }, 3000);
  };

  const animateCarousel = (nextPin) => {
    if (!isMounted.current) return;

    Animated.timing(labelOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (!isMounted.current) return;

      Animated.spring(carouselRotation, {
        toValue: nextPin,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start(() => {
        if (!isMounted.current) return;

        Animated.timing(labelOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    });
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleContinue = async () => {
    if (loginStep === 1) {
      if (validateEmail(email)) {
        setLoginStep(2);
      } else {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
      }
    } else if (loginStep === 2) {
      if (password.length >= 5) {
        setLoading(true);
        try {
          const response = await fetch("http://10.229.214.121:8080/users/login", {
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

          if (response.ok && data.data) {
            // Store user data in AsyncStorage
            await AsyncStorage.setItem('userData', JSON.stringify(data.data));
            
            Toast.show({
              type: 'success',
              text1: 'Login Successful',
              text2: `Welcome back, ${data.data.name || 'User'}! 👋`
            });
            
            console.log("User logged in:", data.data);
            
            setTimeout(() => {
              router.replace("/UserDashboardScreen");
            }, 1500);
          } else {
            Alert.alert("Error", data.message || "Login failed. Please check your credentials.");
          }
        } catch (error) {
          setLoading(false);
          console.error("Login Error:", error);
          Alert.alert("Error", "Something went wrong. Please check your connection.");
        }
      } else {
        Alert.alert("Invalid Password", "Password must be at least 5 characters.");
      }
    }
  };

  const handleBack = () => {
    if (loginStep === 2) {
      setLoginStep(1);
      setPassword("");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1625" />

      <LinearGradient
        colors={["#1a1625", "#2d1b3d", "#1a1625"]}
        style={styles.gradientBackground}
      />

      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => router.push("/AdminLoginScreen")}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Back Button (only show on password step) */}
      {loginStep === 2 && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      )}

      {/* Logo and Animation Section */}
      <Animated.View
        style={[
          styles.logoSection,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Vybe</Text>
          <Text style={styles.logoSubtext}>DISCOVER YOUR CITY</Text>
        </View>

        {/* 3D Pin Animation Container */}
        <View style={styles.pinsContainer}>
          {pins.map((pin, index) => {
            return (
              <Animated.View
                key={pin.id}
                style={[
                  styles.pinWrapper,
                  {
                    zIndex: activePin === index ? 10 : 1,
                    opacity: [pinAnim1, pinAnim2, pinAnim3][index],
                  },
                ]}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        translateX: carouselRotation.interpolate({
                          inputRange: [0, 1, 2],
                          outputRange:
                            index === 0
                              ? [0, width * 0.25, -width * 0.25]
                              : index === 1
                                ? [-width * 0.25, 0, width * 0.25]
                                : [width * 0.25, -width * 0.25, 0],
                        }),
                      },
                      {
                        scale: carouselRotation.interpolate({
                          inputRange: [0, 1, 2],
                          outputRange:
                            index === 0
                              ? [1.25, 0.85, 0.85]
                              : index === 1
                                ? [0.85, 1.25, 0.85]
                                : [0.85, 0.85, 1.25],
                        }),
                      },
                      {
                        translateY: [pinAnim1, pinAnim2, pinAnim3][
                          index
                        ].interpolate({
                          inputRange: [0, 1],
                          outputRange: [-50, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <View style={styles.pin}>
                    <Image
                      source={{ uri: pin.image }}
                      style={styles.pinImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.pinShadow} />
                </Animated.View>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View
          style={[styles.pinLabelContainer, { opacity: labelOpacity }]}
        >
          <Text style={styles.pinLabel}>{pins[activePin].name}</Text>
        </Animated.View>

        <View style={styles.platformGlow} />
      </Animated.View>

      {/* Bottom Section */}
      <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
        <Text style={styles.tagline}>
          {loginStep === 1 ? "For all your going\nout plans" : "Welcome Back!"}
        </Text>

        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>
            {loginStep === 1 ? "LOG IN OR SIGN UP" : "ENTER YOUR PASSWORD"}
          </Text>

          {loginStep === 1 ? (
            // Step 1: Email
            <View style={styles.inputRow}>
              <View style={styles.emailIconContainer}>
                <Text style={styles.emailIcon}>✉️</Text>
              </View>

              <TextInput
                style={styles.emailInput}
                placeholder="Enter your email address"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          ) : (
            // Step 2: Password
            <>
              <View style={styles.emailDisplay}>
                <Text style={styles.emailDisplayLabel}>Email Address</Text>
                <Text style={styles.emailDisplayValue}>{email}</Text>
              </View>

              <View style={styles.passwordContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔐</Text>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#666"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoFocus
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

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              ((loginStep === 1 && validateEmail(email)) ||
                (loginStep === 2 && password.length >= 5)) &&
              styles.continueButtonActive,
            ]}
            onPress={handleContinue}
            disabled={
              loading ||
              (loginStep === 1 && !validateEmail(email)) ||
              (loginStep === 2 && password.length < 5)
            }
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text
                style={[
                  styles.continueButtonText,
                  ((loginStep === 1 && validateEmail(email)) ||
                    (loginStep === 2 && password.length >= 5)) &&
                  styles.continueButtonTextActive,
                ]}
              >
                {loginStep === 1 ? "Continue" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>New to Vybe? </Text>
            <TouchableOpacity onPress={() => router.push("/UserRegisterScreen")}>
              <Text style={styles.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.taglineContainer}>
            <Text style={styles.brandTagline}>Your vibe. Your city.</Text>
          </View>
        </View>
      </Animated.View >
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1625",
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "500",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#999",
    fontSize: 28,
    fontWeight: "500",
  },

  taglineContainer: {
    marginTop: 10,
    alignItems: "center",
  },

  brandTagline: {
    color: "#BFC9D1",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 2,
    textAlign: "center",
    textTransform: "uppercase",
  },

  logoSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  logoText: {
    fontSize: 42,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -1,
  },
  logoSubtext: {
    fontSize: 11,
    color: "#999",
    letterSpacing: 4,
    marginTop: 4,
    fontWeight: "600",
  },

  pinsContainer: {
    width: width,
    height: 200,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  pinWrapper: {
    position: "absolute",
    alignItems: "center",
  },
  pin: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pinShadow: {
    width: 60,
    height: 8,
    backgroundColor: "rgba(168, 85, 247, 0.3)",
    borderRadius: 30,
    marginTop: 100,
    opacity: 0.6,
    transform: [{ scaleX: 1.5 }],
  },

  pinImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  platformGlow: {
    width: width * 0.8,
    height: 4,
    backgroundColor: "rgba(168, 85, 247, 0.2)",
    borderRadius: 50,
    marginTop: 80,
    shadowColor: "#a855f7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },

  pinLabelContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  pinLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#a855f7",
    letterSpacing: 0.5,
  },

  bottomSection: {
    backgroundColor: "#0a0810",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  tagline: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 40,
  },
  loginContainer: {
    width: "100%",
  },
  loginTitle: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 30,
  },

  // Email Input (Step 1)
  inputRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  emailIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1625",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#2d2440",
  },
  emailIcon: {
    fontSize: 20,
  },
  emailInput: {
    flex: 1,
    backgroundColor: "#1a1625",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    color: "#ffffff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2d2440",
  },

  // Password Input (Step 2)
  emailDisplay: {
    backgroundColor: "#1a1625",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2d2440",
  },
  emailDisplayLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  emailDisplayValue: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  passwordContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1625",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2d2440",
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  passwordInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
    paddingVertical: 18,
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    color: "#a855f7",
    fontSize: 14,
    fontWeight: "600",
  },

  // Continue Button
  continueButton: {
    backgroundColor: "#2d2440",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  continueButtonActive: {
    backgroundColor: "#a855f7",
  },
  continueButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "700",
  },
  continueButtonTextActive: {
    color: "#ffffff",
  },

  // Sign Up Link
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  signupText: {
    color: "#666",
    fontSize: 14,
  },
  signupLink: {
    color: "#a855f7",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default DistrictLoginScreen;