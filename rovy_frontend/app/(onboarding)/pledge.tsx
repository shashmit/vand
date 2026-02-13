import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { colors } from "../../src/theme/colors";
import { Button } from "../../src/components/ui/Button";
import { completeOnboarding } from "../../src/store/slices/authSlice";
import { AppDispatch } from "../../src/store";
import { OnboardingData } from "../../src/types/auth";

export default function PledgeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [canPledge, setCanPledge] = useState(false);

  const formData: OnboardingData = params.data ? JSON.parse(params.data as string) : null;

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: any) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const handlePledge = async () => {
    // if (!canPledge) return;

    if (!formData) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Missing profile data",
      });
      return;
    }

    try {
      setLoading(true);
      await dispatch(completeOnboarding(formData)).unwrap();

      Toast.show({
        type: "success",
        text1: "Welcome to Rovy!",
        text2: "You have successfully joined the community.",
      });

      // Redirect handled by root layout based on isNewUser state change
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to complete onboarding",
      });
    } finally {
      setLoading(false);
    }
  };

  const PledgeItem = ({ icon, title, text }: { icon: any; title: string; text: string }) => (
    <View style={styles.pledgeItem}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.pledgeTitle}>{title}</Text>
        <Text style={styles.pledgeText}>{text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Before you enter...</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            setCanPledge(true);
          }
        }}
        scrollEventThrottle={400}
      >
        <Text style={styles.intro}>The Code of the Road</Text>

        <PledgeItem
          icon="leaf-outline"
          title="Leave No Trace"
          text="I will respect the land and pack out what I pack in."
        />

        <PledgeItem
          icon="volume-mute-outline"
          title="Respect the Privacy"
          text="I understand that a van is a home. I will not intrude without invitation."
        />

        <PledgeItem
          icon="shield-checkmark-outline"
          title="Keep it Safe"
          text="I am here to build community, not to harass or endanger others."
        />

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="I Pledge & Enter"
          onPress={handlePledge}
          loading={loading}
          // disabled={!canPledge}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  intro: {
    fontSize: 18,
    color: colors.text.muted,
    marginBottom: 32,
  },
  pledgeItem: {
    flexDirection: "row",
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  pledgeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  pledgeText: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  spacer: {
    height: 40,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  button: {
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
