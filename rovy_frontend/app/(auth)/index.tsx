import React from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { Mail, Lock, ArrowRight } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { colors } from "../../src/theme/colors";
import { Input } from "../../src/components/ui/Input";
import { GlassButton } from "../../src/components/ui/GlassButton";
import { loginSchema, LoginFormData } from "../../src/lib/validations/auth";
import { loginUser } from "../../src/store/slices/authSlice";
import { AppDispatch, RootState } from "../../src/store";

export default function LoginScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(loginUser(data)).unwrap();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error || "Failed to login",
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
        <View style={styles.header}>
          <Text style={styles.title}>Rovy</Text>
          <Text style={styles.subtitle}>Find your road community</Text>
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

          <GlassButton
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            systemImage="arrow.right"
            icon={<ArrowRight color={colors.background} size={20} />}
            style={{ marginTop: 8 }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to the road? </Text>
            <Link href="/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Join the convoy</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
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
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 48,
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.text.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 8,
    fontWeight: "500",
  },
  form: {
    width: "100%",
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
