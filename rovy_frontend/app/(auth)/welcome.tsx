import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Circle, Rect, G, Polygon } from "react-native-svg";
import { colors } from "../../src/theme/colors";
import { Host, Button } from "@expo/ui/swift-ui";
import { glassEffect, padding } from "@expo/ui/swift-ui/modifiers";

// Camper Van SVG Component
const CamperVan = ({ width = 200, height = 120 }) => (
  <Svg width={width} height={height} viewBox="0 0 200 120">
    <G>
      {/* Pop-top Roof */}
      <Path d="M40 40 L160 40 L150 20 L50 20 Z" fill="#333" />

      {/* Main Body - Boxy Camper Style */}
      <Path
        d="M20 40 L180 40 Q190 40 190 50 L190 90 L10 90 L10 50 Q10 40 20 40"
        fill="#E0E0E0" // Light gray body
      />

      {/* Stripe */}
      <Rect x="10" y="65" width="180" height="10" fill="#333" />

      {/* Windows */}
      <Rect x="30" y="45" width="40" height="15" rx="2" fill="#333" />
      <Rect x="80" y="45" width="50" height="15" rx="2" fill="#333" />
      <Path d="M140 45 L180 45 L180 60 L140 60 Z" fill="#333" />

      {/* Wheels */}
      <Circle cx="45" cy="90" r="14" fill="#1a1a1a" />
      <Circle cx="45" cy="90" r="7" fill="#555" />

      <Circle cx="155" cy="90" r="14" fill="#1a1a1a" />
      <Circle cx="155" cy="90" r="7" fill="#555" />

      {/* Headlight */}
      <Path d="M188 70 L192 70 L192 80 L188 80" fill="#FFD700" />

      {/* Spare Tire on Back */}
      <Rect x="5" y="55" width="5" height="25" rx="2" fill="#222" />
    </G>
  </Svg>
);

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  // Animation Values
  const vanPosition = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation Sequence
    Animated.sequence([
      // 1. Van drives in
      Animated.timing(vanPosition, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      // 2. Text appears (parallel fade and slide)
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]),
      // 3. Button appears
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        delay: 200,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push("/(auth)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.content}>
        {/* Animated Illustration Area */}
        <View style={styles.animationArea}>
          <Animated.View
            style={{
              transform: [{ translateX: vanPosition }],
              alignItems: "center",
            }}
          >
            <CamperVan width={260} height={156} />
          </Animated.View>
        </View>

        {/* Text Content */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslate }],
            },
          ]}
        >
          <Text style={styles.title}>Rovy</Text>
          <Text style={styles.subtitle}>
            A Place To Be You. We create this space for you to be unapologetic about yourself.
          </Text>
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View style={{ opacity: buttonOpacity, width: "100%" }}>
          <Host style={{ height: 80, width: "100%" }}>
            <Button
              onPress={handleGetStarted}
              systemImage="arrow.right"
              modifiers={[padding({ all: 10 }), glassEffect({ glass: { variant: "regular" } })]}
            >
              Get Started
            </Button>
          </Host>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // System Dark Background
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: "row",
    gap: 4,
  },
  progressBar: {
    width: 20,
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: colors.primary,
    width: 30,
  },
  skipText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  animationArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  textContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 56,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text.secondary,
    lineHeight: 26,
    textAlign: "center",
    maxWidth: "90%",
  },
  button: {
    backgroundColor: colors.primary, // White button
    height: 56,
    borderRadius: 12, // Matching system button radius
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 8,
  },
  buttonText: {
    color: colors.background, // Dark text on white button
    fontSize: 16,
    fontWeight: "700",
  },
});
