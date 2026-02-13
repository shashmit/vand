import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { MapPin, Search, Wifi, Sun, Sunset, Activity } from 'lucide-react-native';
import { GlassView } from '../ui/GlassView';
import { authService } from '../../services/auth';
import { Profile } from '../../types/auth';
import { useFocusEffect } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface HUDProps {
  onProfilePress: () => void;
  onSearchPress?: () => void;
  minimal?: boolean;
}

export const HUD = ({ onProfilePress, onSearchPress, minimal = false }: HUDProps) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [profile, setProfile] = useState<Profile | null>(null);
  const avatarUrl = profile?.avatarUrl?.trim();
  const avatarInitial = (profile?.name || profile?.username || "U").charAt(0).toUpperCase();

  // Mock Data
  const tickerItems = [
    { label: "SIGNAL", value: "5G" },
    { label: "TEMP", value: "72°F" },
    { label: "SUNSET", value: "19:42" },
    { label: "TRAFFIC", value: "CLEAR" },
    { label: "ELEVATION", value: "1250 FT" },
  ];
  
  const tickerText = tickerItems.map(i => `${i.label}: ${i.value}`).join("  ///  ") + "  ///  ";

  const loadProfile = useCallback(async () => {
    try {
      const p = await authService.getProfile();
      setProfile(p);
    } catch (e) {
      // console.log('Failed to load profile for HUD', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );
  
  useEffect(() => {
    if (minimal) return;

    const startAnimation = () => {
        scrollX.setValue(SCREEN_WIDTH);
        Animated.loop(
            Animated.timing(scrollX, {
                toValue: -SCREEN_WIDTH * 1.5, // Adjust based on text length
                duration: 12000, // Slower for better readability
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };

    startAnimation();
  }, [minimal]);

  return (
    <View style={[styles.container, minimal && styles.minimalContainer]}>
      <GlassView 
        style={styles.glassContainer} 
        contentStyle={styles.glassContent}
        borderRadius={24}
        intensity="regular"
      >
        <View style={styles.topRow}>
          <View style={styles.locationWrapper}>
            <View style={styles.locationIconBg}>
                <MapPin color={colors.primary} size={14} />
            </View>
            <View>
                <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
                <Text style={styles.locationText}>Los Angeles, CA</Text>
            </View>
          </View>
          
          <View style={styles.rightContainer}>
            {onSearchPress && (
              <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
                <Search color={colors.text.primary} size={22} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.profileContainer} onPress={onProfilePress}>
                {avatarUrl ? (
                  <Image 
                      source={{ uri: avatarUrl }} 
                      style={styles.avatarImage} 
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{avatarInitial}</Text>
                  </View>
                )}
            </TouchableOpacity>
          </View>
        </View>

        {!minimal && (
          <View style={styles.tickerContainer}>
            <View style={styles.tickerFadeLeft} />
            <Animated.Text 
                style={[
                    styles.tickerText, 
                    { transform: [{ translateX: scrollX }] }
                ]}
                numberOfLines={1}
            >
              {tickerText}{tickerText}
            </Animated.Text>
            <View style={styles.tickerFadeRight} />
          </View>
        )}
      </GlassView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingHorizontal: 12,
    minHeight: 90,
    marginBottom: 8,
  },
  minimalContainer: {
    minHeight: 70,
  },
  glassContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    // Add a subtle border for more definition
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  glassContent: {
    justifyContent: 'space-between',
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationIconBg: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 69, 58, 0.15)', // Subtle red tint for pin
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationLabel: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  locationText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  profileContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 14, // Match container
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tickerContainer: {
    height: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', 
    borderRadius: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tickerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', // Techy font
    fontWeight: '600',
    width: 2000, // Ensure enough width
    letterSpacing: 1,
  },
  tickerFadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    zIndex: 1,
    // Simple gradient simulation
    backgroundColor: 'rgba(0,0,0,0.1)', 
  },
  tickerFadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    zIndex: 1,
  },
});
