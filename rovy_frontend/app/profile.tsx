import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Pressable, Animated, Alert } from "react-native";
import { colors } from "../src/theme/colors";
import { useRouter, useFocusEffect } from "expo-router";
import { ArrowLeft, Plus, Settings, Edit2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Host } from "@expo/ui/swift-ui";
import { glassEffect } from "@expo/ui/swift-ui/modifiers";
import { authService } from "../src/services/auth";
import { buildService, Build } from "../src/services/builds";
import { garageService, GaragePro } from "../src/services/garage";
import { copilotService, CoPilotProfile } from "../src/services/copilot";
import { eventsService, EventItem } from "../src/services/events";
import { GlassView } from "../src/components/ui/GlassView";
import { GlassButton } from "../src/components/ui/GlassButton";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../src/store";
import { setAllowOnboardingEdit } from "../src/store/slices/authSlice";

type Tab = 'rigs' | 'garage' | 'events';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [user, setUser] = useState<any>(null);
  const [myBuilds, setMyBuilds] = useState<Build[]>([]);
  const [myGarage, setMyGarage] = useState<GaragePro | null>(null);
  const [coPilotProfile, setCoPilotProfile] = useState<CoPilotProfile | null>(null);
  const [myEvents, setMyEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('rigs');
  const [tabWidth, setTabWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await authService.getProfile();
      setUser(userData);

      const [buildsData, garageData, copilotData, eventsData] = await Promise.all([
        buildService.getMyBuilds().catch(() => []),
        garageService.getMyProfile().catch(() => null),
        copilotService.getProfile().catch(() => null),
        eventsService.getMyEvents().catch(() => []),
      ]);

      setMyBuilds(buildsData);
      setMyGarage(garageData);
      setCoPilotProfile(copilotData);
      setMyEvents(eventsData);
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEditProfile = () => {
    dispatch(setAllowOnboardingEdit(true));
    router.push({
      pathname: "/(onboarding)/",
      params: { edit: "1" },
    });
  };

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeTab === 'rigs' ? 0 : activeTab === 'garage' ? 1 : 2,
      useNativeDriver: false,
      damping: 20,
      stiffness: 120,
    }).start();
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, tabWidth, tabWidth * 2],
  });

  const handleTabsLayout = useCallback((event: any) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setTabWidth(width / 3);
    }
  }, []);

  const renderPillTabs = () => (
    <View style={styles.pillContainer}>
      <GlassView 
        style={styles.segmentedControl} 
        contentStyle={styles.segmentedControlContent}
        borderRadius={26}
      >
        <View style={styles.segmentedControlInner} onLayout={handleTabsLayout}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.slider,
              tabWidth > 0 && { width: tabWidth },
              {
                transform: [{ translateX }],
              },
            ]}
          >
            <GlassView 
              style={StyleSheet.absoluteFill} 
              borderRadius={22}
            >
              <View style={styles.sliderGlass} />
            </GlassView>
          </Animated.View>

          <Pressable
            style={styles.tab}
            onPress={() => setActiveTab('rigs')}
          >
            <Text style={[styles.tabText, activeTab === 'rigs' && styles.activeTabText]}>My Rigs</Text>
          </Pressable>
          
          <Pressable
            style={styles.tab}
            onPress={() => setActiveTab('garage')}
          >
            <Text style={[styles.tabText, activeTab === 'garage' && styles.activeTabText]}>My Garage</Text>
          </Pressable>

          <Pressable
            style={styles.tab}
            onPress={() => setActiveTab('events')}
          >
            <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>My Events</Text>
          </Pressable>
        </View>
      </GlassView>
    </View>
  );

  const renderRigsContent = () => (
    <View style={styles.tabContent}>
      <GlassButton
        onPress={() => router.push("/builds/create")}
        style={styles.addButton}
        intensity="regular"
      >
        <Plus size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Build</Text>
      </GlassButton>

      {myBuilds.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No builds yet. Start your journey!</Text>
        </View>
      ) : (
        myBuilds.map((build) => (
          <Pressable key={build.id} onPress={() => router.push(`/builds/${build.id}`)}>
            <GlassView 
              style={styles.buildCard} 
              contentStyle={styles.buildCardContent}
              borderRadius={16}
            >
              <Image source={{ uri: build.imageUrl }} style={styles.buildImage} />
              <View style={styles.buildInfo}>
                <Text style={styles.buildName}>{build.name}</Text>
                <Text style={styles.buildModel}>{build.model}</Text>
              </View>
            </GlassView>
          </Pressable>
        ))
      )}
    </View>
  );

  const renderGarageContent = () => (
    <View style={styles.tabContent}>
      {!myGarage ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Become a Pro</Text>
          <Text style={styles.emptyText}>
            Create a Garage profile to showcase your services to the community.
          </Text>
          <GlassButton
            onPress={() => router.push("/garage/manage")}
            style={styles.createProButton}
            intensity="thick"
          >
            <Text style={styles.createProButtonText}>Create Garage Profile</Text>
          </GlassButton>
        </View>
      ) : (
        <View>
          <View style={styles.editHeader}>
            <TouchableOpacity onPress={() => router.push("/garage/manage")}>
              <GlassView style={styles.editBadge} borderRadius={8}>
                <Edit2 size={14} color="#fff" />
                <Text style={styles.editText}>Edit</Text>
              </GlassView>
            </TouchableOpacity>
          </View>

          <Pressable onPress={() => router.push(`/garage/${myGarage.id}`)}>
            <GlassView style={styles.garageCard} borderRadius={16}>
              <View style={styles.garageHeader}>
                <Text style={styles.garageName}>{myGarage.name}</Text>
                {myGarage.verified && (
                  <GlassView style={styles.verifiedBadge} borderRadius={8}>
                    <Text style={styles.verifiedText}>VERIFIED</Text>
                  </GlassView>
                )}
              </View>
              <Text style={styles.garageTitle}>{myGarage.title}</Text>
              <Text style={styles.garageSpecialty}>{myGarage.specialty}</Text>
            </GlassView>
          </Pressable>
        </View>
      )}
    </View>
  );

  const handleDeleteEvent = (id: string) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await eventsService.deleteEvent(id);
            setMyEvents((prev) => prev.filter((event) => event.id !== id));
          } catch (e) {
            Alert.alert("Error", "Failed to delete event");
          }
        },
      },
    ]);
  };

  const renderEventsContent = () => (
    <View style={styles.tabContent}>
      <GlassButton
        onPress={() => router.push("/events/create")}
        style={styles.addButton}
        intensity="regular"
      >
        <Plus size={20} color="#fff" />
        <Text style={styles.addButtonText}>Create Event</Text>
      </GlassButton>

      {myEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No events yet. Create one to show on the map.</Text>
        </View>
      ) : (
        myEvents.map((event) => (
          <GlassView key={event.id} style={styles.eventCard} borderRadius={16}>
            <View style={styles.eventHeader}>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventMeta}>{event.location}</Text>
                <Text style={styles.eventMeta}>
                  {new Date(event.startDate).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteEvent(event.id)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </GlassView>
        ))
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const avatarUrl = user?.avatarUrl?.trim();
  const avatarInitial = (user?.name || user?.username || "U").charAt(0).toUpperCase();

  return (
    <Host 
      style={styles.host} 
      modifiers={[glassEffect({ glass: { variant: "regular" } })]}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity onPress={() => router.push("/settings")} style={styles.iconButton}>
            <Settings color={colors.text.primary} size={24} />
          </TouchableOpacity>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.headerRow}>
              <View style={styles.avatarContainer}>
                  {avatarUrl ? (
                    <Image 
                        source={{ uri: avatarUrl }} 
                        style={styles.avatar} 
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarText}>{avatarInitial}</Text>
                    </View>
                  )}
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.name || "User"}</Text>
                <Text style={styles.userHandle}>@{user?.username || "username"}</Text>
              </View>
              <TouchableOpacity onPress={handleEditProfile}>
                <GlassView style={styles.editBadge} borderRadius={18}>
                  <Edit2 size={16} color="#fff" />
                </GlassView>
              </TouchableOpacity>
            </View>
            {user?.bio && <Text style={styles.userBio}>{user.bio}</Text>}
            
            <TouchableOpacity 
              onPress={() => router.push('/profile/copilot-edit')} 
              style={[
                  styles.copilotButton, 
                  coPilotProfile?.isActive && styles.copilotButtonActive
              ]}
            >
                <View style={styles.copilotStatusDot}>
                    <View style={[
                        styles.statusDot, 
                        { backgroundColor: coPilotProfile?.isActive ? '#4ADE80' : '#666' } 
                    ]} />
                </View>
                <Text style={[
                    styles.copilotButtonText,
                    coPilotProfile?.isActive && styles.copilotButtonTextActive
                ]}>
                    {coPilotProfile?.isActive ? "Co-Pilot Active" : "Enable Co-Pilot"}
                </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {renderPillTabs()}
          {activeTab === 'rigs' ? renderRigsContent() : activeTab === 'garage' ? renderGarageContent() : renderEventsContent()}

        </ScrollView>
      </SafeAreaView>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  userInfo: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  avatarContainer: {
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
  },
  copilotButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  copilotButtonActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  copilotStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  copilotButtonText: {
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  copilotButtonTextActive: {
    color: '#4ADE80',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'left',
  },
  userHandle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'left',
  },
  userBio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'left',
    marginTop: 4,
  },
  pillContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  segmentedControl: {
    height: 52,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  segmentedControlContent: {
    flex: 1,
  },
  segmentedControlInner: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  slider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '33.333%',
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sliderGlass: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    fontSize: 15,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buildCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  buildCardContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    alignItems: 'center',
  },
  buildImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  buildInfo: {
    flex: 1,
  },
  buildName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  buildModel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  eventCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  eventMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,59,48,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.35)',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  createProButton: {
    paddingHorizontal: 32,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: colors.dashboard.build,
    shadowColor: colors.dashboard.build,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  createProButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  editText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  garageCard: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  garageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  garageName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  garageTitle: {
    fontSize: 16,
    color: colors.dashboard.build,
    fontWeight: '600',
    marginBottom: 4,
  },
  garageSpecialty: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});
