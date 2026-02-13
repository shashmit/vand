import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Animated, Pressable, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { GlassView } from '../ui/GlassView';
import { colors } from '../../theme/colors';
import { buildService, Build } from '../../services/builds';
import { garageService, GaragePro } from '../../services/garage';
import { Menu, X, Check } from 'lucide-react-native';
import { router } from 'expo-router';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

// --- Static Data for Garage ---
const CATEGORIES = ['ALL', 'SOLAR', 'CARPENTRY', 'MECHANIC', 'PLUMBING'];

// --- Components ---
const RigCard = ({ item }: { item: Build }) => (
  <Pressable onPress={() => router.push(`/builds/${item.id}`)}>
    <GlassView style={styles.card} borderRadius={20}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <GlassView style={styles.ownerBadge} borderRadius={12}>
          <Text style={styles.ownerText}>@{item.user.username || item.user.name || 'User'}</Text>
        </GlassView>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.model}>{item.model}</Text>
        </View>
        
        <View style={styles.tags}>
          {item.tags.map(tag => (
            <GlassView key={tag} style={styles.tag} borderRadius={8}>
              <Text style={styles.tagText}>{tag}</Text>
            </GlassView>
          ))}
        </View>
      </View>
    </GlassView>
  </Pressable>
);

const BusinessCard = ({ item }: { item: GaragePro }) => (
  <Pressable onPress={() => router.push(`/garage/${item.id}`)}>
    <GlassView style={styles.card} borderRadius={16}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.verified && (
          <GlassView style={styles.verifiedBadge} borderRadius={12}>
            <Text style={styles.verifiedText}>VERIFIED PRO</Text>
          </GlassView>
        )}
      </View>
      <Text style={styles.cardType}>{item.title}</Text>
      <Text style={styles.cardSub}>{item.specialty}</Text>
      <Text style={styles.cardRate}>{item.rate}</Text>
    </GlassView>
  </Pressable>
);

type BuildMode = 'rigs' | 'garage';

interface UnifiedBuildsListProps {
  mode: BuildMode;
  header?: any;
  stickyHeader?: any;
}

import { authService } from '../../services/auth';

export const UnifiedBuildsList = ({ mode, header, stickyHeader }: UnifiedBuildsListProps) => {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [garagePros, setGaragePros] = useState<GaragePro[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentUserId, setCurrentUserId] = useState<string | null | undefined>(undefined);
  
  const [loading, setLoading] = useState(true);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(menuAnim, {
      toValue: filterMenuOpen ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();
  }, [filterMenuOpen]);

  useEffect(() => {
    // Fetch user ID once
    authService.getProfile()
      .then(p => setCurrentUserId(p.id))
      .catch(() => setCurrentUserId(null));
  }, []);

  useEffect(() => {
    if (currentUserId !== undefined) { // Wait until user check is done
        loadData();
    }
  }, [mode, selectedCategory, currentUserId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const excludeId = currentUserId || undefined;

      if (mode === 'rigs') {
        // Only fetch builds if we don't have them
        if (builds.length === 0) {
            const data = await buildService.getBuilds(excludeId);
            setBuilds(data);
        }
      } else {
        // For garage, always fetch when category changes
        const data = await garageService.getPros(selectedCategory, excludeId);
        setGaragePros(data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Determine data source based on mode
  const listData = mode === 'rigs' ? builds : garagePros;
  
  // Combine sticky header with data. Use a unique ID for the sticky header based on mode
  // to force FlashList to re-measure layout when switching between Rigs (shorter) and Garage (taller)
  const stickyHeaderId = `sticky-header-${mode}`;
  const data = stickyHeader ? [{ id: stickyHeaderId, key: stickyHeaderId } as any, ...listData] : listData;

  // Fade in background when scrolling past HUD (approx 120pt)
  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [90, 120],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Cast AnimatedFlashList to any to bypass the type error for now, as FlashList props are valid but Animated wrapper types can be tricky
  const AnimatedList = AnimatedFlashList as any;

  const renderFooter = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={colors.dashboard.build} style={{ marginTop: 50 }} />;
    }
    if (!listData.length) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {mode === 'rigs' ? 'No builds found' : 'No pros found in this category'}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <AnimatedList
        data={data}
        extraData={`${mode}-${selectedCategory}-${loading}`} // Force re-render when mode, category, or loading changes
        renderItem={({ item }: { item: any }) => {
          if (item.id.startsWith('sticky-header')) {
            return (
              <Animated.View style={[styles.stickyContainer, { opacity: 1 }]}>
                <Animated.View 
                  style={[
                    StyleSheet.absoluteFill, 
                    { 
                      backgroundColor: colors.background, // Solid dark background
                      opacity: headerBackgroundOpacity 
                    }
                  ]} 
                  pointerEvents="none"
                />
                {stickyHeader}
              </Animated.View>
            );
          }
          
          return mode === 'rigs' 
            ? <RigCard item={item} /> 
            : <BusinessCard item={item} />;
        }}
        estimatedItemSize={200}
        getItemType={(item: any) => item.id.startsWith('sticky-header') ? item.id : 'row'}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={header}
        ListFooterComponent={renderFooter()}
        stickyHeaderIndices={stickyHeader ? [0] : undefined}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      />

      {/* Filter FAB & Menu (Garage Mode Only) */}
      {mode === 'garage' && (
        <>
          {/* Animated Menu Container */}
          <Animated.View 
            style={[
              styles.filterMenuContainer,
              {
                opacity: menuAnim,
                transform: [
                  { scale: menuAnim },
                  { translateY: menuAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    }) 
                  }
                ],
                pointerEvents: filterMenuOpen ? 'auto' : 'none'
              }
            ]}
          >
             <GlassView style={styles.filterMenu} borderRadius={24} intensity="thick">
                <Text style={styles.menuTitle}>Filter Pros</Text>
                {CATEGORIES.map((cat) => {
                    const isActive = cat === selectedCategory;
                    return (
                        <TouchableOpacity 
                            key={cat} 
                            style={[styles.menuItem, isActive && styles.activeMenuItem]}
                            onPress={() => {
                                setSelectedCategory(cat);
                                setFilterMenuOpen(false);
                            }}
                        >
                            <Text style={[styles.menuItemText, isActive && styles.activeMenuItemText]}>
                                {cat === 'ALL' ? 'All Categories' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                            </Text>
                            {isActive && <Check size={16} color="#fff" />}
                        </TouchableOpacity>
                    );
                })}
             </GlassView>
          </Animated.View>

          {/* FAB */}
          <TouchableOpacity 
            style={styles.fab} 
            activeOpacity={0.8}
            onPress={() => setFilterMenuOpen(!filterMenuOpen)}
          >
            <GlassView style={styles.fabGlass} borderRadius={28} intensity="regular">
                {filterMenuOpen ? <X size={24} color="#fff" /> : <Menu size={24} color="#fff" />}
            </GlassView>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    textAlign: 'center',
  },
  stickyContainer: {
    // Container for sticky header content
    zIndex: 100, // Ensure it stays on top visually if there are z-index issues
    width: '100%',
  },
  listContent: {
    paddingBottom: 100,
    // paddingHorizontal: 16, // Removed to allow full-width headers
  },
  // --- RigCard Styles ---
  card: {
    marginBottom: 20,
    marginHorizontal: 16, // Added margin to replace container padding
    overflow: 'hidden',
    // Shared card style
  },
  imageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ownerBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  ownerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  model: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 160, 122, 0.2)', // build color hint
  },
  tagText: {
    color: colors.dashboard.build,
    fontSize: 12,
    fontWeight: '600',
  },
  // --- Garage Card Styles ---
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(78, 205, 196, 0.3)', // Teal-ish transparent
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  cardType: {
    fontSize: 14,
    color: colors.dashboard.build,
    fontWeight: 'bold',
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  cardSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  cardRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  // --- Category Styles ---
  categoryContainer: {
    paddingVertical: 12,
    height: 60, 
    zIndex: 101, // Higher than sticky container base
  },
  categoryContent: {
    gap: 8,
    paddingHorizontal: 16,
    paddingRight: 32, // Extra padding to ensure last item is accessible
  },
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  activeCategoryTag: {
    backgroundColor: colors.dashboard.build,
  },
  categoryText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 'bold',
    fontSize: 12,
  },
  activeCategoryText: {
    color: '#fff',
  },
  // --- Filter Menu Styles ---
  fab: {
    position: 'absolute',
    bottom: 100, // Above tab bar (approx 80-90pt)
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGlass: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.dashboard.glassBg,
    borderWidth: 1,
    borderColor: colors.dashboard.glassBorder,
  },
  filterMenuContainer: {
    position: 'absolute',
    bottom: 166, // FAB bottom (100) + FAB height (56) + padding (10)
    right: 24,
    width: 200,
  },
  filterMenu: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
  },
  menuTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  activeMenuItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
  },
  activeMenuItemText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
