import React, { useRef } from "react";
import {
  View,
  ActivityIndicator,
  Platform,
  StyleProp,
  ViewStyle,
  Pressable,
  Animated,
  StyleSheet,
  Easing,
} from "react-native";
import { Host, Button as ExpoButton } from "@expo/ui/swift-ui";
import { glassEffect, padding, cornerRadius } from "@expo/ui/swift-ui/modifiers";
import { colors } from "../../theme/colors";
import { Button as StandardButton } from "./Button";

interface GlassButtonProps {
  title?: string; // Made optional
  onPress: () => void;
  loading?: boolean;
  systemImage?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode; // Added children prop support
  intensity?: 'regular' | 'thick' | 'thin' | 'ultraThin'; // Added intensity prop
}

export const GlassButton = ({
  title,
  onPress,
  loading,
  systemImage,
  style,
  disabled,
  icon,
  children,
  intensity = 'regular',
}: GlassButtonProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Use StandardButton for non-iOS platforms or if children are provided (since StandardButton doesn't support children either, we render a custom View)
  if (Platform.OS !== "ios") {
    // If children provided, render custom Pressable for Android
    if (children) {
        return (
            <Pressable 
                onPress={onPress} 
                disabled={disabled || loading}
                style={({ pressed }) => [
                    style, 
                    { opacity: pressed ? 0.8 : 1 }
                ]}
            >
                {loading ? <ActivityIndicator color="#fff" /> : children}
            </Pressable>
        );
    }

    return (
      <StandardButton
        title={title || ''}
        onPress={onPress}
        loading={loading}
        disabled={disabled}
        style={style}
        icon={icon}
      />
    );
  }

  // If children are provided, render a custom Glass container (simpler than the animated text/icon logic below)
  if (children) {
    const blurStyle = {
      'regular': 'systemMaterialDark',
      'thick': 'systemThickMaterialDark',
      'thin': 'systemThinMaterialDark',
      'ultraThin': 'systemUltraThinMaterialDark',
    }[intensity] || 'systemMaterialDark';

    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.container, style]}
      >
         <View style={StyleSheet.absoluteFill}>
          <Host
            modifiers={[
              { name: 'glassEffect', style: blurStyle } as any,
              { name: 'cornerRadius', value: (style as any)?.borderRadius || 16 } as any
            ]}
            style={{ flex: 1 }}
          >
            <View style={{ flex: 1 }} />
          </Host>
        </View>
        <View style={styles.content}>
             {loading ? <ActivityIndicator color="#fff" /> : children}
        </View>
      </Pressable>
    );
  }


  const handlePressIn = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  const textOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const textTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const iconOpacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const iconTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[styles.container, style]}
    >
      <View style={{ width: "100%", height: "100%" }} pointerEvents="none">
        <Host style={{ width: "100%", height: "100%" }}>
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 12,
              }}
            >
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <ExpoButton
              onPress={() => {}} // Handled by Pressable
              modifiers={[
                padding({ top: 18, bottom: 16, leading: 0, trailing: 0 }),
                glassEffect({ glass: { variant: "regular" } }),
                cornerRadius(12),
              ]}
            >
              <View style={styles.contentContainer}>
                <Animated.Text
                  style={[
                    styles.text,
                    {
                      opacity: textOpacity,
                      transform: [{ translateX: textTranslateX }],
                    },
                  ]}
                >
                  {title}
                </Animated.Text>

                {icon && (
                  <Animated.View
                    style={[
                      styles.iconContainer,
                      {
                        opacity: iconOpacity,
                        transform: [{ translateX: iconTranslateX }],
                      },
                    ]}
                  >
                    {React.isValidElement(icon)
                      ? React.cloneElement(icon as React.ReactElement<any>, {
                          color: colors.primary,
                        })
                      : icon}
                  </Animated.View>
                )}
              </View>
            </ExpoButton>
          )}
        </Host>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  iconContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
