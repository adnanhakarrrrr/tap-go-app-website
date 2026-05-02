import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_BASE =
  "https://nonliturgic-lakenya-haggishly.ngrok-free.dev/tapandgo_api";

type Step = "email" | "reset";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const requestResetCode = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      Alert.alert("Missing email", "Please enter your account email.");
      return;
    }

    if (!cleanEmail.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/forgot_password.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          action: "request_code",
          email: cleanEmail,
        }),
      });

      const raw = await response.text();

      let data: any;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Invalid server response.\n${raw}`);
      }

      if (!data.success) {
        throw new Error(data.message || "Could not send reset code.");
      }

      setEmail(cleanEmail);
      setStep("reset");

      Alert.alert(
        "Code Sent",
        data.message || "A password reset code was sent to your email.",
      );
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();
    const cleanPassword = newPassword.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (!cleanEmail || !cleanCode || !cleanPassword || !cleanConfirmPassword) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    if (cleanCode.length !== 6) {
      Alert.alert("Invalid code", "Please enter the 6-digit code.");
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/forgot_password.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          action: "reset_password",
          email: cleanEmail,
          code: cleanCode,
          new_password: cleanPassword,
        }),
      });

      const raw = await response.text();

      let data: any;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Invalid server response.\n${raw}`);
      }

      if (!data.success) {
        throw new Error(data.message || "Password reset failed.");
      }

      Alert.alert(
        "Success",
        "Password reset successfully. You can now log in.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const goBackToEmailStep = () => {
    setStep("email");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>T&G</Text>
            </View>

            <Text style={styles.appName}>Tap&Go</Text>
            <Text style={styles.subtitle}>Reset your account password</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Forgot Password</Text>

            {step === "email" ? (
              <>
                <Text style={styles.cardSubtitle}>
                  Enter your account email. We will send you a 6-digit reset
                  code.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your account email"
                    placeholderTextColor="#8A94A6"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <Pressable
                  style={[styles.resetButton, loading && styles.disabledButton]}
                  onPress={requestResetCode}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.resetButtonText}>Send Reset Code</Text>
                  )}
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.cardSubtitle}>Enter the code sent to:</Text>

                <Text style={styles.emailText}>{email}</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Verification Code</Text>
                  <TextInput
                    style={styles.codeInput}
                    placeholder="123456"
                    placeholderTextColor="#8A94A6"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#8A94A6"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor="#8A94A6"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>

                <Pressable
                  style={[styles.resetButton, loading && styles.disabledButton]}
                  onPress={resetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.resetButtonText}>Reset Password</Text>
                  )}
                </Pressable>

                <Pressable onPress={requestResetCode} disabled={loading}>
                  <Text style={styles.secondaryText}>Resend code</Text>
                </Pressable>

                <Pressable onPress={goBackToEmailStep} disabled={loading}>
                  <Text style={styles.secondaryText}>
                    Use a different email
                  </Text>
                </Pressable>
              </>
            )}

            <Pressable onPress={() => router.replace("/")}>
              <Text style={styles.backText}>
                Back to <Text style={styles.backHighlight}>Login</Text>
              </Text>
            </Pressable>
          </View>

          <View style={styles.bottomSection}>
            <Text style={styles.bottomText}>Smart booking. Easy tracking.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1220",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },

  topSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 22,
  },

  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#1D4ED8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
  },

  appName: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 6,
  },

  subtitle: {
    color: "#AAB4C3",
    fontSize: 15,
    fontWeight: "500",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 10,
  },

  cardTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },

  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 10,
  },

  emailText: {
    fontSize: 15,
    color: "#1D4ED8",
    fontWeight: "800",
    marginBottom: 18,
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: "#D1D9E6",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },

  codeInput: {
    height: 58,
    borderWidth: 1,
    borderColor: "#D1D9E6",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    backgroundColor: "#F9FAFB",
    textAlign: "center",
    letterSpacing: 5,
  },

  resetButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#1D4ED8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },

  disabledButton: {
    opacity: 0.7,
  },

  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryText: {
    textAlign: "center",
    color: "#1D4ED8",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },

  backText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
  },

  backHighlight: {
    color: "#1D4ED8",
    fontWeight: "800",
  },

  bottomSection: {
    alignItems: "center",
    marginTop: 20,
  },

  bottomText: {
    color: "#94A3B8",
    fontSize: 13,
    textAlign: "center",
  },
});
