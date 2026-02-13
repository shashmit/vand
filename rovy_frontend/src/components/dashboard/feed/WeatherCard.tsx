import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassView } from '../../ui/GlassView';
import { colors } from '../../../theme/colors';
import { CloudRain, Sun, Cloud, Wind, Snowflake } from 'lucide-react-native';

interface WeatherCardProps {
  temperature: string;
  condition: string;
  location: string;
  alert?: string;
}

const getWeatherIcon = (condition: string) => {
  const c = condition.toLowerCase();
  if (c.includes('rain')) return <CloudRain color={colors.text.primary} size={32} />;
  if (c.includes('cloud')) return <Cloud color={colors.text.primary} size={32} />;
  if (c.includes('wind')) return <Wind color={colors.text.primary} size={32} />;
  if (c.includes('snow')) return <Snowflake color={colors.text.primary} size={32} />;
  return <Sun color={colors.text.primary} size={32} />;
};

export const WeatherCard = ({ temperature, condition, location, alert }: WeatherCardProps) => {
  return (
    <GlassView intensity="thin" style={styles.container}>
      <View style={styles.header}>
        <View>
            <Text style={styles.location}>{location}</Text>
            <Text style={styles.temperature}>{temperature}</Text>
        </View>
        {getWeatherIcon(condition)}
      </View>
      <View style={styles.footer}>
        <Text style={styles.condition}>{condition}</Text>
        {alert && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertText}>{alert}</Text>
          </View>
        )}
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
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  condition: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  alertBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  alertText: {
    fontSize: 12,
    color: '#FF3B30', // System red
    fontWeight: '600',
  },
});
