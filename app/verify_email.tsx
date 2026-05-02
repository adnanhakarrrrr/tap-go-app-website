import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const API_BASE =
  "https://nonliturgic-lakenya-haggishly.ngrok-free.dev/tapandgo_api";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams();

  const email = typeof params.email === "string" ? params.email : "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email || !code.trim()) {
      Alert.alert("Missing info", "Please enter the verification code.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/verify_email.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          email,
          code: code.trim(),
        }),
      });

      const raw = await response.text();

      let data: any;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Verification response was not valid JSON.");
      }

      if (data.success) {
        Alert.alert(
          "Verified",
          "Your email has been verified. You can now log in.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/"),
            },
          ],
        );
      } else {
        Alert.alert("Verification failed", data.message || "Invalid code.");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Could not verify email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to:</Text>
        <Text style={styles.email}>{email}</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter code"
          placeholderTextColor="#94A3B8"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Verify Email</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.replace("/")}>
          <Text style={styles.backText}>Back to Login</Text>
        </Pressable>
      </View>
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
    justifyContent: "center",
    padding: 24,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    color: "#AAB4C3",
    fontSize: 15,
    textAlign: "center",
  },

  email: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 4,
    color: "#111827",
    marginBottom: 18,
  },

  button: {
    backgroundColor: "#1D4ED8",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 18,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  backText: {
    color: "#AAB4C3",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
  },
});
