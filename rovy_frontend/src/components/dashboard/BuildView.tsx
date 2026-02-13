import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { GlassView } from '../ui/GlassView';
import { UnifiedBuildsList } from './UnifiedBuildsList';
import { HUD } from './HUD';
import { router } from 'expo-router';

type BuildTab = 'rigs' | 'garage';

export const BuildView = () => {
  const [activeTab, setActiveTab] = useState<BuildTab>('rigs');
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeTab === 'rigs' ? 0 : 1,
      useNativeDriver: false,
      damping: 20,
      stiffness: 120,
    }).start();
  }, [activeTab]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderHUD = (
    <HUD 
      onProfilePress={() => router.push("/profile")} 
      onSearchPress={() => router.push("/search")}
    />
  );

  const renderTabs = (
    <View style={styles.header}>
      <GlassView 
        style={styles.segmentedControl} 
        contentStyle={styles.segmentedControlContent}
        borderRadius={26}
      >
        {/* Animated Slider */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.slider,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <GlassView 
            style={StyleSheet.absoluteFill} 
            borderRadius={22}
          >
            <View style={styles.sliderGlass} />
          </GlassView>
        </Animated.View>

        <Pressable
          style={styles.tab}
          onPress={() => setActiveTab('rigs')}
        >
          <Text style={[styles.tabText, activeTab === 'rigs' && styles.activeTabText]}>Rigs</Text>
        </Pressable>
        
        <Pressable
          style={styles.tab}
          onPress={() => setActiveTab('garage')}
        >
          <Text style={[styles.tabText, activeTab === 'garage' && styles.activeTabText]}>Garage</Text>
        </Pressable>
      </GlassView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        <UnifiedBuildsList 
          mode={activeTab}
          header={renderHUD}
          stickyHeader={renderTabs}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  segmentedControl: {
    height: 52,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  segmentedControlContent: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  slider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '50%',
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    // elevation: 2, // Removed elevation to avoid conflicts
  },
  sliderGlass: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    fontSize: 15,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    flex: 1,
  },
});
