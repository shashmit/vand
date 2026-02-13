import React from 'react';
import { View, Platform, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { Host } from '@expo/ui/swift-ui';
import { glassEffect, cornerRadius } from '@expo/ui/swift-ui/modifiers';

interface GlassViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: 'regular' | 'thick' | 'thin' | 'ultraThin';
  borderRadius?: number;
}

export const GlassView = ({ children, style, contentStyle, intensity = 'regular', borderRadius = 16 }: GlassViewProps) => {
  if (Platform.OS === 'ios') {
    const blurStyle = {
      'regular': 'systemMaterialDark',
      'thick': 'systemThickMaterialDark',
      'thin': 'systemThinMaterialDark',
      'ultraThin': 'systemUltraThinMaterialDark',
    }[intensity] || 'systemMaterialDark';

    return (
      <View style={[styles.container, { borderRadius }, style]}>
        <View style={StyleSheet.absoluteFill}>
          <Host
            modifiers={[{ name: 'glassEffect', style: blurStyle } as any]}
            style={{ flex: 1 }}
          >
            <View style={{ flex: 1 }} />
          </Host>
        </View>
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.androidContainer, { borderRadius }, style]}>
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden', // Ensure glass effect doesn't bleed
    backgroundColor: 'transparent', // Let glass show
    // Border for subtle definition
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    // flex: 1, // Removed to allow auto-height behavior. Use contentStyle={{ flex: 1 }} if needed.
  },
  androidContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)', // Deep semi-transparent dark
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
