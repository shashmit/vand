import React, { useMemo, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GlassView } from '../ui/GlassView';
import { colors } from '../../theme/colors';
import { BlurView } from 'expo-blur';
import { copilotService } from '../../services/copilot';

interface ProfileDetailSheetProps {
  driverId: string;
  initialData?: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileDetailSheet = ({ driverId, initialData, isOpen, onClose }: ProfileDetailSheetProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['80%'], []);
  
  const [fullDriverData, setFullDriverData] = useState<any>(initialData || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
      if (driverId) {
          loadDetails();
      }
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen, driverId]);

  const loadDetails = async () => {
    try {
        setLoading(true);
        const data = await copilotService.getDetail(driverId);
        setFullDriverData(data);
    } catch (e) {
        console.error("Failed to load details", e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundComponent={({ style }) => (
        <BlurView intensity={80} tint="dark" style={[style, styles.blurBackground]} />
      )}
      handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{fullDriverData.name}, {fullDriverData.age}</Text>
          <Text style={styles.vehicle}>{fullDriverData.vehicle}</Text>
        </View>

        {loading ? (
             <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
            <>
                {/* Rig Check Section */}
                <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rig Check</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rigScroll}>
                    {fullDriverData.rigPhotos?.length > 0 ? fullDriverData.rigPhotos.map((photo: string, index: number) => (
                    <View key={index} style={styles.rigImageContainer}>
                        <Image source={{ uri: photo }} style={styles.rigImage} />
                    </View>
                    )) : (
                        <Text style={{ color: colors.text.muted, marginLeft: 16 }}>No rig photos available</Text>
                    )}
                </ScrollView>
                </View>

                {/* Q&A Prompts */}
                <View style={styles.section}>
                <Text style={styles.sectionTitle}>The Vibe</Text>
                <View style={styles.promptsContainer}>
                    {fullDriverData.prompts?.map((prompt: any, index: number) => (
                    <GlassView key={index} style={styles.promptBubble} intensity="thin" borderRadius={16}>
                        <Text style={styles.promptQuestion}>{prompt.question}</Text>
                        <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                    </GlassView>
                    ))}
                    {(!fullDriverData.prompts || fullDriverData.prompts.length === 0) && (
                         <Text style={{ color: colors.text.muted }}>No details provided yet.</Text>
                    )}
                </View>
                </View>
            </>
        )}


        {/* Spacer for bottom safe area + Tab Bar */}
        <View style={{ height: 100 }} />
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  blurBackground: {
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: 'rgba(28, 28, 30, 0.85)', // Deep Graphite with transparency
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  vehicle: {
    fontSize: 18,
    color: colors.text.secondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  rigScroll: {
    marginHorizontal: -24, // Break out of container padding
    paddingHorizontal: 24,
  },
  rigImageContainer: {
    width: 200,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  rigImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  promptsContainer: {
    gap: 16,
  },
  promptBubble: {
    padding: 16,
    marginBottom: 0,
  },
  promptQuestion: {
    fontSize: 14,
    color: colors.dashboard.coPilot, // Use accent color
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  promptAnswer: {
    fontSize: 18,
    color: colors.text.primary,
    lineHeight: 24,
  },
});
