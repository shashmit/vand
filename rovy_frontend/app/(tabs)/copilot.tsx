import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, FlatList, Image, ActivityIndicator, RefreshControl, Pressable, Animated } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../src/theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CoPilotView } from "../../src/components/dashboard/CoPilotView";
import { HUD } from "../../src/components/dashboard/HUD";
import { GlassView } from "../../src/components/ui/GlassView";
import { copilotService } from "../../src/services/copilot";

type ActiveTab = "profile" | "chat";

type ChatItem = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  lastMessage: string;
  sentAt: string;
  type: "message" | "match";
};

export default function CoPilotScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [tabWidth, setTabWidth] = useState(0);

  const [items, setItems] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeTab === "profile" ? 0 : 1,
      useNativeDriver: false,
      damping: 20,
      stiffness: 120,
    }).start();
  }, [activeTab, slideAnim]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth],
  });

  const handleTabsLayout = useCallback((event: any) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setTabWidth(width / 2);
    }
  }, []);

  const loadChat = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        const data = await copilotService.getChats();
        setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    if (activeTab === "chat") {
      loadChat();
    }
  }, [activeTab, loadChat]);

  const formatTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: ChatItem }) => {
    const initial = item.name?.charAt(0).toUpperCase() || "N";
    return (
      <Pressable
        onPress={() => {
          router.push({
            pathname: "/copilot/chat/[id]",
            params: {
              id: item.id,
              name: item.name,
              avatarUrl: item.avatarUrl || ""
            }
          });
        }}
      >
        <GlassView style={styles.itemCard} borderRadius={16}>
          <View style={styles.avatarContainer}>
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            )}
          </View>
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <Text style={styles.nameText}>{item.name}</Text>
              <View style={styles.headerRight}>
                {item.type === "match" && <Text style={styles.matchBadge}>MATCH</Text>}
                <Text style={styles.timeText}>{formatTime(item.sentAt)}</Text>
              </View>
            </View>
            <Text style={styles.messageText} numberOfLines={2}>
              {item.lastMessage}
            </Text>
          </View>
        </GlassView>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.hudWrapper, { paddingTop: insets.top }]}>
        <HUD onProfilePress={() => router.push("/profile")} onSearchPress={() => router.push("/search")} minimal />
      </View>

      <View style={styles.switcherWrapper}>
        <GlassView style={styles.segmentedControl} contentStyle={styles.segmentedControlContent} borderRadius={26}>
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
              <GlassView style={StyleSheet.absoluteFill} borderRadius={22}>
                <View style={styles.sliderGlass} />
              </GlassView>
            </Animated.View>

            <Pressable style={styles.tab} onPress={() => setActiveTab("profile")}>
              <Text style={[styles.tabText, activeTab === "profile" && styles.activeTabText]}>Profile</Text>
            </Pressable>

            <Pressable style={styles.tab} onPress={() => setActiveTab("chat")}>
              <Text style={[styles.tabText, activeTab === "chat" && styles.activeTabText]}>Chat</Text>
            </Pressable>
          </View>
        </GlassView>
      </View>

      <View style={styles.content}>
        {activeTab === "profile" ? (
          <CoPilotView />
        ) : loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loading} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadChat(true)} tintColor={colors.primary} />}
            ListEmptyComponent={<Text style={styles.emptyText}>No messages yet.</Text>}
          />
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hudWrapper: {
    paddingHorizontal: 12,
  },
  switcherWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  segmentedControl: {
    height: 48,
    padding: 4,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  segmentedControlContent: {
    flex: 1,
  },
  segmentedControlInner: {
    flex: 1,
    flexDirection: "row",
    position: "relative",
  },
  slider: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sliderGlass: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  tabText: {
    color: colors.text.secondary,
    fontWeight: "600",
    fontSize: 14,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  loading: {
    marginTop: 24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: 14,
    textAlign: "center",
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  itemContent: {
    flex: 1,
    gap: 6,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  matchBadge: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  nameText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
  },
  timeText: {
    color: colors.text.muted,
    fontSize: 12,
  },
  messageText: {
    color: colors.text.secondary,
    fontSize: 13,
  },
});
