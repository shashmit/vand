import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { GlassView } from '../../src/components/ui/GlassView';
import { colors } from '../../src/theme/colors';
import { buildService, Build } from '../../src/services/builds';
import { ChevronLeft } from 'lucide-react-native';

export default function BuildDetailScreen() {
  const { id } = useLocalSearchParams();
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id === 'string') {
      loadBuild(id);
    }
  }, [id]);

  const loadBuild = async (buildId: string) => {
    try {
      const data = await buildService.getBuildById(buildId);
      setBuild(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.dashboard.build} style={{ marginTop: 100 }} />
      </View>
    );
  }

  if (!build) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Build not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: build.imageUrl }} style={styles.image} />
          
          <Pressable onPress={() => router.back()} style={styles.backIcon}>
             <GlassView borderRadius={20} style={styles.iconContainer}>
                 <ChevronLeft color="#fff" size={24} />
             </GlassView>
          </Pressable>

          <GlassView style={styles.ownerBadge} borderRadius={12}>
            <Image 
                source={{ uri: build.user.avatarUrl || 'https://via.placeholder.com/150' }} 
                style={styles.avatar} 
            />
            <Text style={styles.ownerText}>@{build.user.username || build.user.name || 'User'}</Text>
          </GlassView>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{build.name}</Text>
            <Text style={styles.model}>{build.model}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tags}>
              {build.tags.map(tag => (
                <GlassView key={tag} style={styles.tag} borderRadius={8}>
                  <Text style={styles.tagText}>{tag}</Text>
                </GlassView>
              ))}
            </View>
          </View>

          {build.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this build</Text>
              <Text style={styles.description}>{build.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    height: 350,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backIcon: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  ownerBadge: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    paddingRight: 12,
    paddingVertical: 6,
    paddingLeft: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  ownerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  model: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.dashboard.build,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 160, 122, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 122, 0.3)',
  },
  tagText: {
    color: colors.dashboard.build,
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: colors.surface,
    alignSelf: 'center',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
  },
});
