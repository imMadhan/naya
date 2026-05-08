import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
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

const { width, height } = Dimensions.get("window");

const AdminLoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    if (email === "admin@gmail.com" && password === "admin") {
      router.replace("/AdminDashboardScreen");
    } else {
      Alert.alert("Login Failed", "Invalid credentials. Please try again.");
    }
  };

  const isFormValid = email.length > 0 && password.length >= 5;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1a1625" />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#1a1625", "#2d1b3d", "#1a1625"]}
        style={styles.gradientBackground}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>V</Text>
            </View>
            <Text style={styles.logoText}>Vybe</Text>
            <Text style={styles.logoSubtext}>ADMIN PORTAL</Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>
            Sign in to manage your platform
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="admin@vybe.com"
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
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
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
                <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
          </View>



          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isFormValid && styles.loginButtonActive,
            ]}
            onPress={handleLogin}
            disabled={!isFormValid}
          >
            <LinearGradient
              colors={
                isFormValid ? ["#a855f7", "#9333ea"] : ["#2d2440", "#2d2440"]
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text
                style={[
                  styles.loginButtonText,
                  isFormValid && styles.loginButtonTextActive,
                ]}
              >
                Sign In
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Shop Portal Link */}
          <View style={styles.shopPortalContainer}>
            <Text style={styles.shopPortalText}>Manage a business?</Text>
            <TouchableOpacity onPress={() => router.push("/ShopLoginScreen")}>
              <Text style={styles.shopPortalLink}>Shop Portal Login</Text>
            </TouchableOpacity>
          </View>



          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Text style={styles.securityIcon}>🔐</Text>
            <Text style={styles.securityText}>
              This is a secure admin area. Unauthorized access is prohibited.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Vybe. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },

  // Logo Section
  logoSection: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(168, 85, 247, 0.2)",
    borderWidth: 2,
    borderColor: "#a855f7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#a855f7",
  },
  logoText: {
    fontSize: 42,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -1,
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 11,
    color: "#a855f7",
    letterSpacing: 4,
    fontWeight: "700",
  },

  // Form Container
  formContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: "#999",
    marginBottom: 40,
  },

  // Input Styles
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: "#BFC9D1",
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
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
  input: {
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

  // Options Row
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#2d2440",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: "#a855f7",
    borderColor: "#a855f7",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  checkboxLabel: {
    color: "#BFC9D1",
    fontSize: 14,
  },
  forgotText: {
    color: "#a855f7",
    fontSize: 14,
    fontWeight: "600",
  },

  // Login Button
  loginButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 32,
  },
  loginButtonActive: {
    shadowColor: "#a855f7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGradient: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#666",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  loginButtonTextActive: {
    color: "#ffffff",
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2d2440",
  },
  dividerText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 16,
    letterSpacing: 1,
  },

  // SSO Buttons
  ssoContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  ssoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1625",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2d2440",
    paddingVertical: 16,
    gap: 12,
  },
  ssoIcon: {
    fontSize: 20,
    fontWeight: "900",
    color: "#a855f7",
  },
  ssoText: {
    color: "#BFC9D1",
    fontSize: 15,
    fontWeight: "600",
  },

  // Shop Portal Link
  shopPortalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  shopPortalText: {
    color: "#999",
    fontSize: 14,
  },
  shopPortalLink: {
    color: "#a855f7",
    fontSize: 14,
    fontWeight: "700",
  },

  // Security Notice
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.2)",
    marginBottom: 32,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  securityText: {
    flex: 1,
    color: "#BFC9D1",
    fontSize: 12,
    lineHeight: 18,
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    color: "#666",
    fontSize: 12,
  },
});

export default AdminLoginScreen;
