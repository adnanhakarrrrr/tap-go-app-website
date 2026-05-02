import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!studentId.trim() || !password.trim()) {
      Alert.alert("Missing info", "Please enter your ID and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://nonliturgic-lakenya-haggishly.ngrok-free.dev/tapandgo_api/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ studentId, password }),
        },
      );

      const raw = await response.text();
      console.log("RAW RESPONSE:", raw);

      let data: any;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Login response was not valid JSON.");
      }

      console.log("LOGIN DATA:", data);

      if (data.success) {
        if (data.user_type === "student") {
          await AsyncStorage.setItem(
            "student_id",
            String(data.student.student_id),
          );

          router.replace({
            pathname: "/dashboard",
            params: {
              studentId: String(data.student.student_id),
              fullName: data.student.full_name,
              balance: String(data.student.credit_balance),
            },
          });

          return;
        }

        if (data.user_type === "driver") {
          await AsyncStorage.setItem(
            "driver_id",
            String(data.driver.driver_id),
          );

          await AsyncStorage.setItem(
            "driver_name",
            String(data.driver.full_name),
          );

          router.replace({
            pathname: "/driver_dashboard",
            params: {
              driverId: String(data.driver.driver_id),
              driverName: data.driver.full_name,
            },
          });

          return;
        }

        Alert.alert("Login failed", "Unknown user type.");
      } else {
        Alert.alert("Login failed", data.message || "Unknown error");
      }
    } catch (error: any) {
      console.log("ERROR:", error);
      Alert.alert("Error", error?.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/tap&go_logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.appName}>Tap&Go</Text>
          <Text style={styles.subtitle}>Bus Booking System</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeText}>
            Sign in to view buses, book them, and transport through the city
            with ease.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Student ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your ID"
              placeholderTextColor="#8A94A6"
              value={studentId}
              onChangeText={setStudentId}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#8A94A6"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </Pressable>

          <Pressable onPress={() => router.push("/forgot_password" as any)}>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/register")}>
            <Text style={styles.registerLink}>
              Don&apos;t have an account?{" "}
              <Text style={styles.registerHighlight}>Register</Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.bottomText}>
            Smart booking. Easy tracking. Better transport.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1220",
  },

  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: "#0B1220",
  },

  topSection: {
    alignItems: "center",
    marginTop: 20,
  },

  logoContainer: {
    width: 118,
    height: 118,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },

  logo: {
    width: "100%",
    height: "100%",
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

  welcomeTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },

  welcomeText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 24,
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

  loginButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#1D4ED8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },

  loginButtonDisabled: {
    opacity: 0.75,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  forgotPassword: {
    textAlign: "center",
    color: "#1D4ED8",
    fontSize: 14,
    fontWeight: "700",
  },

  registerLink: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 14,
  },

  registerHighlight: {
    color: "#2952D1",
    fontWeight: "bold",
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
