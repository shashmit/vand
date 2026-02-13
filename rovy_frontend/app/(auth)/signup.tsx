import React from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Link, router } from "expo-router";
import { Mail, Lock, Key, ArrowRight, ArrowLeft } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";

import { colors } from "../../src/theme/colors";
import { Input } from "../../src/components/ui/Input";
import { GlassButton } from "../../src/components/ui/GlassButton";
import { signupSchema, SignupFormData } from "../../src/lib/validations/auth";
import { signupUser } from "../../src/store/slices/authSlice";
import { AppDispatch, RootState } from "../../src/store";

export default function SignupScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const { control, handleSubmit } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      inviteCode: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await dispatch(signupUser(data)).unwrap();
      // Navigation is handled by RootLayout
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Signup Failed",
        text2: error || "Failed to sign up",
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Join Rovy</Text>
            <Text style={styles.subtitle}>
              An invite-only community for{"\n"}authentic van-life connections.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              control={control}
              name="email"
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              icon={<Mail color={colors.text.muted} size={20} />}
            />

            <Input
              control={control}
              name="password"
              placeholder="Password"
              secureTextEntry
              autoCapitalize="none"
              isPassword
              icon={<Lock color={colors.text.muted} size={20} />}
            />

            <Input
              control={control}
              name="inviteCode"
              placeholder="Invite Code"
              autoCapitalize="none"
              icon={<Key color={colors.text.muted} size={20} />}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                To maintain trust and safety, Rovy requires an invite code from an existing member
                or a verified builder.
              </Text>
            </View>

            <GlassButton
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              systemImage="arrow.right"
              icon={<ArrowRight color={colors.background} size={20} />}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    paddingBottom: 40,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 8,
    zIndex: 10,
    padding: 8,
  },
  header: {
    marginBottom: 40,
    marginTop: 100,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  form: {
    width: "100%",
  },
  infoBox: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  infoText: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: {
    color: colors.text.muted,
    fontSize: 14,
  },
  linkText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
