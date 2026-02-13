import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../../theme/colors';
import { X, MessageCircle, Check, Caravan } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface ControlStickProps {
  onPass: () => void;
  onLike: () => void;
  onMessage: () => void;
}

const { width } = Dimensions.get('window');
const TRACK_WIDTH = width * 0.55;
const HANDLE_SIZE = 50;

export const ControlStick = ({ onPass, onLike, onMessage }: ControlStickProps) => {
  const translateX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const success = useSharedValue(0); // 0 = Van, 1 = Check
  const trackWidth = useSharedValue(0); // Dynamically measured track width

  // Hardcoded tab bar height + extra spacing since useBottomTabBarHeight might not be available
  // or reliable with custom native tabs. 
  // Standard TabBar is ~49-83pt. We add extra to be safe above it.
  const BOTTOM_OFFSET = 90; 

  const pan = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      // Clamp the movement between 0 and trackWidth - HANDLE_SIZE
      // Subtract padding (5 left + 5 right = 10)
      const maxTranslate = trackWidth.value - HANDLE_SIZE - 10;
      translateX.value = Math.max(0, Math.min(event.translationX, maxTranslate));
      
      // Haptic feedback during drag (simulating engine rumble)
      if (Math.abs(event.translationX) % 10 < 2) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    })
    .onEnd(() => {
      const maxTranslate = trackWidth.value - HANDLE_SIZE - 10;
      if (translateX.value > maxTranslate * 0.8) {
        // Successful slide
        translateX.value = withTiming(maxTranslate, {}, () => {
          success.value = withTiming(1, { duration: 200 });
          runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
          runOnJS(onLike)();
          // Reset after delay
          setTimeout(() => {
            translateX.value = withSpring(0);
            success.value = withTiming(0);
          }, 500);
        });
      } else {
        // Reset
        translateX.value = withSpring(0);
      }
      isDragging.value = false;
    });

  const animatedHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    backgroundColor: success.value > 0.5 ? '#4CD964' : colors.primary, // Green when success
  }));

  const vanStyle = useAnimatedStyle(() => ({
    opacity: 1 - success.value,
    transform: [{ scale: 1 - success.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: success.value,
    transform: [{ scale: success.value }],
    position: 'absolute',
  }));

  const animatedTrackStyle = useAnimatedStyle(() => {
    const maxTranslate = trackWidth.value - HANDLE_SIZE - 10;
    const progress = maxTranslate > 0 ? translateX.value / maxTranslate : 0;
    return {
      backgroundColor: `rgba(255, 255, 255, ${0.1 + progress * 0.2})`,
    };
  });

  return (
    <View style={styles.container}>
      {/* Left: Pass Button */}
      <View style={styles.sideButtonContainer}>
        <BlurView intensity={20} tint="dark" style={styles.sideButton}>
          <X color="#fff" size={24} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
            onPass();
          }} />
        </BlurView>
      </View>

      {/* Center: Caravan Slider */}
      <View 
        style={styles.sliderContainer}
        onLayout={(e) => {
          trackWidth.value = e.nativeEvent.layout.width;
        }}
      >
        <BlurView intensity={40} tint="dark" style={styles.sliderBackground}>
          <Animated.View style={[styles.track, animatedTrackStyle]}>
            <Animated.Text style={styles.trackText}>Join Caravan</Animated.Text>
            <GestureDetector gesture={pan}>
              <Animated.View style={[styles.handle, animatedHandleStyle]}>
                 <Animated.View style={vanStyle}>
                   <Caravan size={24} color="#020202ff" />
                 </Animated.View>
                 <Animated.View style={checkStyle}>
                   <Check size={28} color="#fff" />
                 </Animated.View>
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </BlurView>
      </View>

      {/* Right: Message Button */}
      <View style={styles.sideButtonContainer}>
        <BlurView intensity={20} tint="dark" style={styles.sideButton}>
          <MessageCircle color="#fff" size={24} onPress={onMessage} />
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 100, // Position above the tab bar
    left: 0,
    right: 0,
    gap: 12,
    zIndex: 50,
  },
  sideButtonContainer: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  sideButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sliderContainer: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  sliderBackground: {
    flex: 1,
    justifyContent: 'center',
    padding: 5,
  },
  track: {
    flex: 1,
    borderRadius: 25,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  trackText: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    left:5,
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  handle: {
    position: 'absolute',
    left: 5,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
