import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { WeatherCard } from './WeatherCard';
import { RoadNewsCard } from './RoadNewsCard';
import { NextEventCard } from './NextEventCard';
import { CaravanRail } from './CaravanRail';
import { colors } from '../../../theme/colors';
import { feedService, FeedData } from '../../../services/feed';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

import { FeedSectionHeader } from './FeedSectionHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

const List = FlashList as any;
const SECTIONS_STORAGE_KEY = 'feed_sections_config';

type SectionId = 'weather' | 'events' | 'caravans' | 'news' | 'travelers';

interface SectionConfig {
    id: SectionId;
    title: string;
    isExpanded: boolean;
    isPinned: boolean;
    order: number;
}

export const FeedView = () => {
  const { isAuthenticated, isNewUser } = useSelector((state: RootState) => state.auth);
  const [feedData, setFeedData] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [sections, setSections] = useState<SectionConfig[]>([
    { id: 'weather', title: 'Current Conditions', isExpanded: true, isPinned: false, order: 0 },
    { id: 'events', title: 'Nearby Events', isExpanded: true, isPinned: false, order: 1 },
    { id: 'caravans', title: 'Nearby Caravans', isExpanded: true, isPinned: false, order: 2 },
    { id: 'news', title: 'Road Updates', isExpanded: false, isPinned: false, order: 3 },
    { id: 'travelers', title: 'Heading Your Way', isExpanded: true, isPinned: false, order: 4 },
  ]);

  // Load section config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const stored = await AsyncStorage.getItem(SECTIONS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Merge with current sections to ensure new sections appear if added later
          setSections(current => {
             const merged = current.map(s => {
                 const saved = parsed.find((p: SectionConfig) => p.id === s.id);
                 return saved ? { ...s, ...saved } : s;
             });
             return merged;
          });
        }
      } catch (e) {
        console.error('Failed to load section config', e);
      }
    };
    loadConfig();
  }, []);

  // Save section config
  useEffect(() => {
    AsyncStorage.setItem(SECTIONS_STORAGE_KEY, JSON.stringify(sections)).catch(e => 
        console.error('Failed to save section config', e)
    );
  }, [sections]);

  const loadFeed = useCallback(async (isRefresh = false) => {
    if (!isAuthenticated || isNewUser) {
      setFeedData(null);
      setLoading(false);
      setRefreshing(false);
      setErrorMessage(null);
      return;
    }
    try {
      if (!isRefresh) setLoading(true);
      setErrorMessage(null);
      const data = await feedService.getFeed();
      setFeedData(data);
    } catch (e) {
      console.error('Failed to load feed', e);
      setErrorMessage('Unable to load feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, isNewUser]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleRefresh = () => {
    if (!isAuthenticated || isNewUser) {
      setRefreshing(false);
      return;
    }
    setRefreshing(true);
    loadFeed(true);
  };

  const handlePinEvent = async (id: string) => {
    // Find the event to check current status
    const event = feedData?.nearbyEvents?.find(e => e.id === id);
    if (!event) return;

    // Optimistic update
    setFeedData(prev => {
        if (!prev) return null;
        const events = prev.nearbyEvents || [];
        return {
            ...prev,
            nearbyEvents: events.map(e => 
                e.id === id ? { ...e, isPinned: !e.isPinned } : e
            )
        };
    });

    try {
        if (event.isPinned) {
            await feedService.unpinEvent(id);
        } else {
            await feedService.pinEvent(id);
        }
    } catch (e) {
        console.error('Pin action failed', e);
        // Revert (Simple implementation: just reload feed or toggle back)
    }
  };

  const toggleSection = (id: SectionId) => {
    setSections(prev => prev.map(s => 
        s.id === id ? { ...s, isExpanded: !s.isExpanded } : s
    ));
  };

  const pinSection = (id: SectionId) => {
    setSections(prev => prev.map(s => 
        // If pinning, expand. If unpinning, collapse (as per "rest in collapsed")
        s.id === id ? { ...s, isPinned: !s.isPinned, isExpanded: !s.isPinned } : s
    ));
  };

  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'section_header':
        return (
            <FeedSectionHeader 
                title={item.section.title}
                isExpanded={item.section.isExpanded}
                isPinned={item.section.isPinned}
                onToggle={() => toggleSection(item.section.id)}
                onPin={() => pinSection(item.section.id)}
            />
        );
      case 'weather':
        return <WeatherCard {...item.data} />;
      case 'event':
        return <NextEventCard {...item.data} onPinPress={handlePinEvent} />;
      case 'caravan':
        return <CaravanRail members={item.data} onMemberPress={(id) => console.log('Press', id)} hideHeader={true} />;
      case 'news':
        return <RoadNewsCard {...item.data} />;
      default:
        return null;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!feedData) {
     return (
        <View style={[styles.container, styles.center]}>
            <Text style={{color: colors.text.secondary}}>
              {errorMessage || 'Unable to load feed'}
            </Text>
        </View>
     )
  }

  // Construct flat data for FlashList based on sections
  const sortedSections = [...sections].sort((a, b) => {
      // Pinned items first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by original order
      return a.order - b.order;
  });

  const data: any[] = [];
  
  sortedSections.forEach(section => {
      // Add Header
      data.push({ type: 'section_header', section });

      // Add Content if expanded
      if (section.isExpanded) {
          switch (section.id) {
              case 'weather':
                  if (feedData.weather) data.push({ type: 'weather', data: feedData.weather });
                  break;
              case 'events':
                  feedData.nearbyEvents?.forEach(event => {
                      data.push({ type: 'event', data: event });
                  });
                  break;
              case 'caravans':
                  if (feedData.caravans?.length > 0) {
                      data.push({ type: 'caravan', data: feedData.caravans });
                  }
                  break;
              case 'news':
                  feedData.news?.forEach(news => {
                      data.push({ type: 'news', data: news });
                  });
                  break;
              case 'travelers':
                   if (feedData.travelers?.length > 0) {
                      data.push({ type: 'caravan', data: feedData.travelers });
                   }
                  break;
          }
      }
  });

  return (
    <View style={styles.container}>
      <List
        data={data}
        renderItem={renderItem}
        estimatedItemSize={100}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 12,
  }
});
