import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { GlassView } from '../../ui/GlassView';
import { colors } from '../../../theme/colors';
import { MapPin, Calendar, Pin } from 'lucide-react-native';

export interface NextEventCardProps {
  id: string;
  title: string;
  location: string;
  distance: string;
  date: string;
  imageUrl?: string;
  isPinned?: boolean;
  onPinPress: (id: string) => void;
}

export const NextEventCard = ({ id, title, location, distance, date, imageUrl, isPinned, onPinPress }: NextEventCardProps) => {
  return (
    <GlassView intensity="thin" style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.label}>NEXT EVENT NEARBY</Text>
            <TouchableOpacity 
                onPress={() => onPinPress(id)}
                style={styles.pinButton}
            >
                <Pin 
                    size={20} 
                    color={isPinned ? colors.primary : colors.text.secondary} 
                    fill={isPinned ? colors.primary : 'none'} 
                />
            </TouchableOpacity>
        </View>

        <View style={styles.content}>
            {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                
                <View style={styles.row}>
                    <MapPin size={14} color={colors.text.secondary} />
                    <Text style={styles.text}>{location} <Text style={styles.dot}>•</Text> {distance}</Text>
                </View>

                <View style={styles.row}>
                    <Calendar size={14} color={colors.text.secondary} />
                    <Text style={styles.text}>{date}</Text>
                </View>
            </View>
        </View>
    </GlassView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 1,
  },
  pinButton: {
    padding: 4,
  },
  content: {
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  dot: {
    color: colors.text.muted,
  },
});
