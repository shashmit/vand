import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassView } from '../../ui/GlassView';
import { colors } from '../../../theme/colors';
import { AlertTriangle, Info, MapPin } from 'lucide-react-native';

interface RoadNewsCardProps {
  type: 'alert' | 'info' | 'traffic';
  title: string;
  description: string;
  timestamp: string;
}

export const RoadNewsCard = ({ type, title, description, timestamp }: RoadNewsCardProps) => {
  const getIcon = () => {
    switch (type) {
      case 'alert': return <AlertTriangle color="#FF3B30" size={24} />;
      case 'traffic': return <MapPin color="#FF9500" size={24} />;
      case 'info': default: return <Info color="#007AFF" size={24} />;
    }
  };

  return (
    <GlassView intensity="thin" style={styles.container}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <View style={styles.content}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.timestamp}>{timestamp}</Text>
            </View>
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        </View>
      </View>
    </GlassView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
