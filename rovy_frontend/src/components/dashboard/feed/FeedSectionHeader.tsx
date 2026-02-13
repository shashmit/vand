import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { ChevronDown, ChevronUp, Pin } from 'lucide-react-native';
import { GlassView } from '../../ui/GlassView';

interface FeedSectionHeaderProps {
  title: string;
  isExpanded: boolean;
  isPinned: boolean;
  onToggle: () => void;
  onPin: () => void;
}

export const FeedSectionHeader = ({
  title,
  isExpanded,
  isPinned,
  onToggle,
  onPin
}: FeedSectionHeaderProps) => {
  return (
    <GlassView intensity="thin" style={styles.container} contentStyle={styles.contentRow}>
      <TouchableOpacity 
        style={styles.titleContainer} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>{title}</Text>
        {isExpanded ? (
          <ChevronUp size={20} color={colors.text.secondary} />
        ) : (
          <ChevronDown size={20} color={colors.text.secondary} />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.pinButton} 
        onPress={onPin}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Pin 
          size={18} 
          color={isPinned ? colors.primary : colors.text.muted} 
          fill={isPinned ? colors.primary : 'none'} 
        />
      </TouchableOpacity>
    </GlassView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: 8,
    letterSpacing: 0.5,
  },
  pinButton: {
    padding: 4,
  }
});
