import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassView } from '../../src/components/ui/GlassView';
import { colors } from '../../src/theme/colors';
import { garageService, GaragePro } from '../../src/services/garage';
import { Ionicons } from '@expo/vector-icons';
import { GlassButton } from '../../src/components/ui/GlassButton';

export default function GarageDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [pro, setPro] = useState<GaragePro | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id === 'string') {
      loadPro(id);
    }
  }, [id]);

  const loadPro = async (proId: string) => {
    try {
      const data = await garageService.getProById(proId);
      setPro(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (pro?.phoneNumber) {
      Linking.openURL(`tel:${pro.phoneNumber}`);
    }
  };

  const handleEmail = () => {
    if (pro?.email) {
      Linking.openURL(`mailto:${pro.email}`);
    }
  };

  const handleWebsite = () => {
    if (pro?.website) {
      let url = pro.website;
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.dashboard.build} />
      </View>
    );
  }

  if (!pro) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Pro not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Image */}
      {pro.imageUrl && (
        <Image source={{ uri: pro.imageUrl }} style={styles.backgroundImage} blurRadius={20} />
      )}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <GlassButton 
            onPress={() => router.back()} 
            style={styles.backButton}
            intensity="regular"
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </GlassButton>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Card */}
          <GlassView style={styles.mainCard} borderRadius={24} intensity="regular">
            {/* Pro Image */}
            <View style={styles.imageWrapper}>
                {pro.imageUrl ? (
                    <Image source={{ uri: pro.imageUrl }} style={styles.proImage} />
                ) : (
                    <View style={[styles.proImage, styles.placeholderImage]}>
                        <Ionicons name="construct-outline" size={40} color="rgba(255,255,255,0.5)" />
                    </View>
                )}
            </View>

            {/* Title & Badge */}
            <View style={styles.titleRow}>
              <Text style={styles.name}>{pro.name}</Text>
              {pro.verified && (
                <GlassView style={styles.verifiedBadge} borderRadius={12}>
                  <Text style={styles.verifiedText}>VERIFIED</Text>
                </GlassView>
              )}
            </View>

            <Text style={styles.jobTitle}>{pro.title}</Text>
            <Text style={styles.specialty}>{pro.specialty}</Text>
            
            {/* Location */}
            {pro.location && (
                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.locationText}>{pro.location}</Text>
                </View>
            )}

            <View style={styles.divider} />

            {/* Rate */}
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>Rate</Text>
              <Text style={styles.rateValue}>{pro.rate}</Text>
            </View>
          </GlassView>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {pro.phoneNumber && (
                <GlassButton 
                    onPress={handleCall} 
                    style={styles.actionButton}
                    intensity="regular"
                >
                    <Ionicons name="call" size={24} color={colors.dashboard.build} />
                    <Text style={styles.actionText}>Call</Text>
                </GlassButton>
            )}

            {pro.email && (
                <GlassButton 
                    onPress={handleEmail} 
                    style={styles.actionButton}
                    intensity="regular"
                >
                    <Ionicons name="mail" size={24} color="#4ECDC4" />
                    <Text style={styles.actionText}>Email</Text>
                </GlassButton>
            )}

            {pro.website && (
                <GlassButton 
                    onPress={handleWebsite} 
                    style={styles.actionButton}
                    intensity="regular"
                >
                    <Ionicons name="globe-outline" size={24} color="#FF9F1C" />
                    <Text style={styles.actionText}>Website</Text>
                </GlassButton>
            )}
          </View>
          
          {/* Booking Button - Primary Call to Action */}
          <GlassButton 
            onPress={() => {
                // For now, this could just open email with a subject line
                if (pro.email) {
                     Linking.openURL(`mailto:${pro.email}?subject=Booking Request: ${pro.name}`);
                } else if (pro.phoneNumber) {
                     Linking.openURL(`sms:${pro.phoneNumber}`);
                }
            }}
            style={styles.bookButton}
            intensity="thick"
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </GlassButton>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  mainCard: {
    padding: 16,
    alignItems: 'center',
  },
  imageWrapper: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  proImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(78, 205, 196, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  jobTitle: {
    fontSize: 18,
    color: colors.dashboard.build,
    fontWeight: '600',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  rateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bookButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.dashboard.build, // Use brand color
    marginTop: 8,
  },
  bookButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
