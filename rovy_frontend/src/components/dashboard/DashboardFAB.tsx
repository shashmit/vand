import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { GlassView } from '../ui/GlassView';

interface DashboardFABProps {
  onPress: () => void;
}

export const DashboardFAB = ({ onPress }: DashboardFABProps) => {
  const config = { 
    color: 'rgba(255, 107, 107, 0.5)', 
    iconColor: '#fff', 
    label: 'Update Status' 
  };

  return (
    <Pressable 
      onPress={onPress}
      style={styles.container}
    >
      <GlassView 
        style={[styles.fab, { backgroundColor: config.color }]} 
        borderRadius={32}
      >
        <Plus color={config.iconColor} size={32} strokeWidth={3} />
      </GlassView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    zIndex: 100,
  },
  fab: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
