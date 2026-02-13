import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Modal } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { 
  Ghost, 
  Radio, 
  Flame, 
  Users, 
  AlertTriangle,
  Briefcase,
  Shield,
  Menu,
  X,
  MapPinned,
  Compass,
  ChevronDown,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { GlassView } from '../ui/GlassView';
import { eventsService, EventItem, MapPersonItem, MapSafetyItem, MapWorkItem } from '../../services/events';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

// --- Custom Map Style ---
const RADAR_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#1C1C1E" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#8E8E93" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#1C1C1E" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#263c3f" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#6b9a76" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#2C2C2E" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9ca5b3" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#3A3A3C" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#1f2835" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#f3d19c" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#000000" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#515c6d" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#17263c" }]
  }
];

const DEFAULT_REGION = {
  latitude: 34.0522,
  longitude: -118.2437,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// --- Components ---

const FilterPill = ({ label, icon: Icon, active, onPress }: { label: string, icon: any, active: boolean, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={{ marginRight: 8 }}>
    <View 
      style={[
        styles.filterPill, 
        active && styles.filterPillActive
      ]}
    >
      <Icon size={14} color={active ? '#fff' : colors.text.muted} strokeWidth={2.5} />
      {active && <Text style={styles.filterTextActive}>{label}</Text>}
    </View>
  </TouchableOpacity>
);

export const RadarView = () => {
  const { isAuthenticated, isNewUser } = useSelector((state: RootState) => state.auth);
  const insets = useSafeAreaInsets();
  const [visibilityMode, setVisibilityMode] = useState<'ghost' | 'beacon'>('ghost');
  const [activeFilters, setActiveFilters] = useState<string[]>(['PEOPLE', 'EVENTS']);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(0));
  const [events, setEvents] = useState<EventItem[]>([]);
  const [people, setPeople] = useState<MapPersonItem[]>([]);
  const [work, setWork] = useState<MapWorkItem[]>([]);
  const [safety, setSafety] = useState<MapSafetyItem[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  
  // Bottom Sheet
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const sheetAnimation = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    Animated.spring(sheetAnimation, {
      toValue: isBottomSheetOpen ? 0 : Dimensions.get('window').height,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [isBottomSheetOpen]);

  useEffect(() => {
    let cancelled = false;
    const initLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (cancelled) return;
        const coords = { latitude: current.coords.latitude, longitude: current.coords.longitude };
        setUserLocation(coords);
        setMapRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: DEFAULT_REGION.latitudeDelta,
          longitudeDelta: DEFAULT_REGION.longitudeDelta,
        });
        if (isAuthenticated && !isNewUser) {
          await eventsService.updateLocation(coords);
        }
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 25 },
          (update: Location.LocationObject) => {
            const uc = { latitude: update.coords.latitude, longitude: update.coords.longitude };
            setUserLocation(uc);
            if (visibilityMode === 'beacon') {
              setMapRegion((r) => ({
                ...r,
                latitude: uc.latitude,
                longitude: uc.longitude,
              }));
            }
            if (isAuthenticated && !isNewUser) {
              eventsService.updateLocation(uc).catch(() => {});
            }
          }
        );
        locationSubRef.current = sub;
      } catch {}
    };
    initLocation();
    return () => {
      cancelled = true;
      if (locationSubRef.current) {
        locationSubRef.current.remove();
        locationSubRef.current = null;
      }
    };
  }, [isAuthenticated, isNewUser, activeFilters, visibilityMode]);

  useEffect(() => {
    if (!isAuthenticated || isNewUser) {
      setEvents([]);
      setPeople([]);
      setWork([]);
      setSafety([]);
      return;
    }
    const loadMapData = async () => {
      try {
        const center = userLocation ?? { latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude };
        const data = await eventsService.getMapData({
          latitude: center.latitude,
          longitude: center.longitude,
          radiusKm: 50,
          include: ['EVENTS', 'PEOPLE', 'WORK', 'SAFETY'],
        });
        setEvents(data.events);
        setPeople(data.people);
        setWork(data.work);
        setSafety(data.safety);
      } catch (e) {
        console.error("Failed to load map data", e);
      }
    };

    loadMapData();
  }, [isAuthenticated, isNewUser, userLocation]);

  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const toggleMenu = () => {
    const toValue = isFilterMenuOpen ? 0 : 1;
    setIsFilterMenuOpen(!isFilterMenuOpen);
    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
      friction: 6,
      tension: 50,
    }).start();
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        customMapStyle={RADAR_MAP_STYLE}
        initialRegion={mapRegion}
        region={mapRegion}
        userInterfaceStyle="dark"
        showsUserLocation
      >
        <Marker coordinate={{ latitude: userLocation?.latitude ?? DEFAULT_REGION.latitude, longitude: userLocation?.longitude ?? DEFAULT_REGION.longitude }}>
          <View style={styles.userMarkerContainer}>
            {visibilityMode === 'beacon' && (
              <View style={styles.beaconPulse} />
            )}
            <View style={[
              styles.userDot, 
              { 
                borderColor: visibilityMode === 'beacon' ? colors.radar.beacon : colors.radar.ghost,
                shadowColor: visibilityMode === 'beacon' ? colors.radar.beacon : '#fff',
              }
            ]} />
          </View>
        </Marker>

        {activeFilters.includes('EVENTS') && events.map(event => (
          <Marker
            key={event.id}
            coordinate={{ latitude: event.latitude, longitude: event.longitude }}
          >
            <GlassView style={styles.eventMarker} borderRadius={16}>
              <Flame size={16} color={colors.dashboard.campfire} fill={colors.dashboard.campfire} />
            </GlassView>
          </Marker>
        ))}

        {activeFilters.includes('PEOPLE') && people.map(person => (
          <Marker
            key={person.id}
            coordinate={{ latitude: person.latitude, longitude: person.longitude }}
          >
            <GlassView style={styles.caravanMarker} borderRadius={20}>
              <Users size={16} color="#fff" />
              <Text style={styles.caravanText}>1</Text>
            </GlassView>
          </Marker>
        ))}

        {activeFilters.includes('WORK') && work.map(item => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
          >
            <GlassView style={styles.workMarker} borderRadius={16}>
              <Briefcase size={16} color="#fff" />
            </GlassView>
          </Marker>
        ))}

        {activeFilters.includes('SAFETY') && safety.map(item => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
          >
            <GlassView style={styles.safetyMarker} borderRadius={16}>
              <Shield size={16} color={colors.radar.sos} />
            </GlassView>
          </Marker>
        ))}
      </MapView>

      {/* Top Container: Only Ghost/Live Pills */}
      <View style={[styles.topContainer, { top: insets.top + 10 }]}>
        <GlassView style={styles.filterBar} borderRadius={24} intensity="thin">
          <View style={styles.modeContainer}>
            {/* Ghost / Live Mode Pills */}
            <FilterPill 
              label="GHOST" 
              icon={Ghost} 
              active={visibilityMode === 'ghost'} 
              onPress={() => setVisibilityMode('ghost')} 
            />
            <FilterPill 
              label="LIVE" 
              icon={Radio} 
              active={visibilityMode === 'beacon'} 
              onPress={() => setVisibilityMode('beacon')} 
            />
          </View>
        </GlassView>
      </View>

      {/* Bottom Sheet for List View */}
      <Animated.View 
        style={[
          styles.bottomSheet, 
          { transform: [{ translateY: sheetAnimation }] }
        ]}
      >
        <GlassView style={styles.sheetContent} borderRadius={0} intensity="thick">
           {/* Header / Grabber */}
           <TouchableOpacity 
             style={styles.sheetHeader} 
             activeOpacity={0.8} 
             onPress={() => setIsBottomSheetOpen(false)}
           >
             <View style={styles.sheetGrabber} />
             <Text style={styles.sheetTitle}>Explore</Text>
             <ChevronDown size={24} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', right: 20 }} />
           </TouchableOpacity>

           {/* Content List */}
           <ScrollView contentContainerStyle={styles.sheetScroll}>
             {/* Section: People */}
             <View style={styles.sheetSection}>
               <View style={styles.sheetSectionHeader}>
                 <Users size={18} color={colors.text.muted} />
                 <Text style={styles.sheetSectionTitle}>People Nearby</Text>
               </View>
               <View style={styles.sheetCard}>
                  <View style={styles.sheetRow}>
                    <View style={[styles.statusDot, { backgroundColor: colors.radar.beacon }]} />
                    <Text style={styles.sheetItemTitle}>Nomad Group</Text>
                    <Text style={styles.sheetItemMeta}>3 users • 2mi</Text>
                  </View>
               </View>
             </View>

             {/* Section: Events */}
             <View style={styles.sheetSection}>
               <View style={styles.sheetSectionHeader}>
                 <Flame size={18} color={colors.text.muted} />
                 <Text style={styles.sheetSectionTitle}>Events</Text>
               </View>
               <View style={styles.sheetCard}>
                  <View style={styles.sheetRow}>
                    <Text style={styles.sheetItemTitle}>Beach Bonfire</Text>
                    <Text style={styles.sheetItemMeta}>Tonight 8PM</Text>
                  </View>
               </View>
             </View>
             
             {/* Section: Safety */}
             <View style={styles.sheetSection}>
               <View style={styles.sheetSectionHeader}>
                 <Shield size={18} color={colors.text.muted} />
                 <Text style={styles.sheetSectionTitle}>Safety</Text>
               </View>
               <View style={styles.sheetCard}>
                  <View style={styles.sheetRow}>
                    <Text style={styles.sheetItemTitle}>Safe Parking Zone</Text>
                    <Text style={styles.sheetItemMeta}>Verified</Text>
                  </View>
               </View>
             </View>
           </ScrollView>
        </GlassView>
      </Animated.View>

      {/* Bottom Controls */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 60, gap: 2 }]}>
        
        {/* Left: Filter Menu (Burger) */}
        <View style={{ position: 'relative', width: 60, alignItems: 'center' }}>
          {/* Popover Menu */}
          <Animated.View 
            style={[
              styles.filterMenu, 
              { 
                opacity: menuAnimation,
                transform: [
                  { translateY: menuAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, -10]
                    }) 
                  },
                  { scale: menuAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1]
                    }) 
                  }
                ],
                pointerEvents: isFilterMenuOpen ? 'auto' : 'none'
              }
            ]}
          >
            <GlassView style={styles.filterMenuContent} borderRadius={20} intensity="thick">
              <Text style={styles.filterMenuTitle}>FILTERS</Text>
              <View style={styles.filterGrid}>
                <FilterPill label="PEOPLE" icon={Users} active={activeFilters.includes('PEOPLE')} onPress={() => toggleFilter('PEOPLE')} />
                <FilterPill label="EVENTS" icon={Flame} active={activeFilters.includes('EVENTS')} onPress={() => toggleFilter('EVENTS')} />
                <FilterPill label="WORK" icon={Briefcase} active={activeFilters.includes('WORK')} onPress={() => toggleFilter('WORK')} />
                <FilterPill label="SAFETY" icon={Shield} active={activeFilters.includes('SAFETY')} onPress={() => toggleFilter('SAFETY')} />
              </View>
            </GlassView>
          </Animated.View>

          {/* Burger Button */}
          <TouchableOpacity activeOpacity={0.8} onPress={toggleMenu}>
            <GlassView style={styles.controlButton} borderRadius={30} intensity="thin">
               {isFilterMenuOpen ? (
                 <X size={24} color="#fff" strokeWidth={2.5} />
               ) : (
                 <Menu size={24} color="#fff" strokeWidth={2.5} />
               )}
            </GlassView>
          </TouchableOpacity>
        </View>

        {/* Center: List/Sheet Button */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => setIsBottomSheetOpen(!isBottomSheetOpen)}>
          <GlassView 
            style={styles.centerPill} 
            contentStyle={styles.centerPillContent}
            borderRadius={30} 
            intensity="thick"
          >
            {isBottomSheetOpen ? (
              <>
                <MapPinned size={20} color="#fff" strokeWidth={2.5} />
                <Text style={styles.centerPillText}>MAP</Text>
              </>
            ) : (
              <>
                <Compass size={20} color="#fff" strokeWidth={2.5} />
                <Text style={styles.centerPillText}>EXPLORE</Text>
              </>
            )}
          </GlassView>
        </TouchableOpacity>

        {/* Right: SOS Button */}
        <TouchableOpacity activeOpacity={0.8} style={{ width: 60, alignItems: 'center' }}>
          <GlassView 
            style={[styles.controlButton, styles.sosButtonActive]} 
            borderRadius={30}
          >
             <AlertTriangle size={24} color={colors.radar.sos} strokeWidth={2.5} />
          </GlassView>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.radar.background,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  topContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  filterBar: {
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    maxWidth: 400,
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    
    gap: 8,
  },
  // Menu
  controlButton: {
    width: 56,
    height: 56,
    padding:14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sosButtonActive: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    borderColor: 'rgba(255, 69, 58, 0.3)',
  },
  filterMenu: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    width: 140,
    zIndex: 10,
    marginBottom: 10,
  },
  filterMenuContent: {
    padding: 16,
    backgroundColor: 'rgba(20,20,20,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  filterMenuTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
  },
  filterGrid: {
    gap: 10,
    alignItems: 'flex-start',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 36,
  },
  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    top: 50, // Leave some space at top
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  sheetContent: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.95)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  sheetHeader: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sheetGrabber: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    position: 'absolute',
    top: 8,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sheetScroll: {
    padding: 16,
    paddingBottom: 120,
  },
  sheetSection: {
    marginBottom: 24,
  },
  sheetSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sheetSectionTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sheetCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sheetItemTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  sheetItemMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterPillActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterText: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between', // Separate SOS from Controls
    alignItems: 'center',
    zIndex: 50,
  },
  // Markers
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
  },
  userDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  beaconPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.1)',
  },
  eventMarker: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: colors.dashboard.campfire,
  },
  caravanMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  caravanText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  workMarker: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  safetyMarker: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.5)',
  },
  centerPill: {
    paddingHorizontal: 0,
    height: 56,
    width: 160,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: colors.radar.beacon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  centerPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
    width: '100%',
    height: '100%',
  },
  centerPillText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    zIndex: 1,
  },
});
