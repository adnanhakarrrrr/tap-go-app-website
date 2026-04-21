import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
const API_BASE = "https://swarm-july-shiftless.ngrok-free.dev/tapandgo_api";

type StudentProfile = {
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  credit_balance: string;
};

export default function ProfileScreen() {
  const params = useLocalSearchParams();
  const studentId =
    typeof params.studentId === "string" ? params.studentId : "";

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/get_profile.php?student_id=${encodeURIComponent(studentId)}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      const raw = await response.text();

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Server returned invalid JSON.");
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to load profile.");
      }

      setProfile(data.student);
      setFullName(data.student.full_name);
      setEmail(data.student.email);
      setPhone(data.student.phone);
    } catch (error: any) {
      setError(error?.message || "Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchProfile();
    } else {
      setLoading(false);
      setError("Missing student ID.");
    }
  }, [studentId]);
  const handleSaveProfile = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_BASE}/update_profile.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          student_id: studentId,
          full_name: fullName,
          email,
          phone,
        }),
      });

      const raw = await response.text();

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Server returned invalid JSON.");
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to update profile.");
      }

      Alert.alert("Success", "Profile updated successfully.");

      setProfile({
        student_id: studentId,
        full_name: fullName,
        email,
        phone,
        credit_balance: profile?.credit_balance || "0.00",
      });

      setIsEditing(false);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };
  const handleLogout = async () => {
    await AsyncStorage.removeItem("student_id");
    router.replace("/");
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>View your student account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator size="large" color="#1D4ED8" />
            <Text style={styles.centerText}>Loading profile...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerCard}>
            <Text style={styles.errorTitle}>Could not load profile</Text>
            <Text style={styles.centerText}>{error}</Text>

            <Pressable style={styles.retryButton} onPress={fetchProfile}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : profile ? (
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>

              <Text style={styles.name}>{profile.full_name}</Text>
              <Text style={styles.studentId}>
                Student ID: {profile.student_id}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Account Details</Text>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter full name"
                  />
                ) : (
                  <Text style={styles.value}>{profile.full_name}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Email</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                ) : (
                  <Text style={styles.value}>{profile.email}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Phone</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.value}>{profile.phone}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Credit Balance</Text>
                <Text style={styles.value}>
                  {profile.credit_balance} credits
                </Text>
              </View>
            </View>
            {isEditing ? (
              <>
                <Pressable
                  style={styles.actionButton}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  <Text style={styles.actionButtonText}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditing(false);
                    setFullName(profile.full_name);
                    setEmail(profile.email);
                    setPhone(profile.phone);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.actionButtonText}>Edit Profile</Text>
                </Pressable>

                <Pressable
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </Pressable>
              </>
            )}

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1220",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#AAB4C3",
    fontSize: 13,
    marginTop: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
  },
  centerText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  errorTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#1D4ED8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  name: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  studentId: {
    color: "#6B7280",
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 14,
  },
  label: {
    color: "#6B7280",
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  actionButton: {
    backgroundColor: "#1D4ED8",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  logoutButton: {
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#B91C1C",
    fontSize: 16,
    fontWeight: "800",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  cancelButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },

  backButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  backButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
});
