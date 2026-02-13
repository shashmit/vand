import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';

interface CaravanMember {
  id: string;
  name: string;
  avatarUrl: string;
  distance: string;
}

interface CaravanRailProps {
  members: CaravanMember[];
  onMemberPress: (id: string) => void;
  hideHeader?: boolean;
}

const MemberItem = ({ item, onPress }: { item: CaravanMember; onPress: () => void }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <View style={styles.avatarContainer}>
      <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
      <View style={styles.statusBadge} />
    </View>
    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
    <Text style={styles.distance}>{item.distance}</Text>
  </TouchableOpacity>
);

export const CaravanRail = ({ members, onMemberPress, hideHeader = false }: CaravanRailProps) => {
  return (
    <View style={[styles.container, hideHeader && styles.noHeaderContainer]}>
      {!hideHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>Nearby Caravans</Text>
          <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        horizontal
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MemberItem item={item} onPress={() => onMemberPress(item.id)} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  noHeaderContainer: {
    marginTop: 8, // Reduced top margin when header is external
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    alignItems: 'center',
    width: 72,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#34C759', // System Green
    borderWidth: 2,
    borderColor: colors.background,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  distance: {
    fontSize: 10,
    color: colors.text.secondary,
  },
});
