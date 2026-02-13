import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { colors } from "../src/theme/colors";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Host } from "@expo/ui/swift-ui";
import { glassEffect } from "@expo/ui/swift-ui/modifiers";
import { GlassView } from "../src/components/ui/GlassView";
import { GlassButton } from "../src/components/ui/GlassButton";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../src/store";
import { logoutUser } from "../src/store/slices/authSlice";

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.replace("/welcome");
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This will permanently delete your account.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Alert.alert("Not available yet", "Account deletion is not enabled.");
        },
      },
    ]);
  };

  return (
    <Host
      style={styles.host}
      modifiers={[glassEffect({ glass: { variant: "regular" } })]}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <GlassView style={styles.card} borderRadius={20} intensity="regular">
            <Text style={styles.sectionTitle}>Account</Text>
            <GlassButton
              onPress={handleLogout}
              style={styles.primaryButton}
              intensity="thick"
            >
              <Text style={styles.primaryButtonText}>Log Out</Text>
            </GlassButton>

            <GlassButton
              onPress={handleDeleteAccount}
              style={styles.destructiveButton}
              intensity="regular"
            >
              <Text style={styles.destructiveButtonText}>Delete Account</Text>
            </GlassButton>
          </GlassView>
        </View>
      </SafeAreaView>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  card: {
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 12,
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  primaryButton: {
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
  destructiveButton: {
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,59,48,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.35)",
  },
  destructiveButtonText: {
    color: "#FF3B30",
    fontWeight: "700",
    fontSize: 16,
  },
});
