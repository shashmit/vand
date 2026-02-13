import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../src/theme/colors";
import { GlassView } from "../src/components/ui/GlassView";
import { Host } from "@expo/ui/swift-ui";
import { glassEffect } from "@expo/ui/swift-ui/modifiers";
import { searchService, SearchResult } from "../src/services/search";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const data = await searchService.search(query);
          setResults(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (text: string) => {
    setQuery(text);
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => {
        if (item.type === "build") router.push(`/builds/${item.id}`);
        else if (item.type === "garage") router.push(`/garage/${item.id}`);
        // else router.push(`/user/${item.id}`); // User profile route not standard yet
      }}
    >
      <GlassView style={styles.resultCard} borderRadius={12}>
        <Image source={{ uri: item.image }} style={styles.resultImage} />
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle}>{item.title}</Text>
          <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{item.type.toUpperCase()}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
      </GlassView>
    </TouchableOpacity>
  );

  return (
    <Host style={styles.host} modifiers={[glassEffect({ glass: { variant: "regular" } })]}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search rigs, builders, people..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={query}
              onChangeText={handleSearch}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
            <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            keyboardDismissMode="on-drag"
            ListEmptyComponent={
                query.length > 0 ? (
                    <Text style={styles.emptyText}>No results found.</Text>
                ) : null
            }
            />
        )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    height: "100%",
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
  resultItem: {
    marginBottom: 12,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginTop: 2,
  },
  tagContainer: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  tagText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
  },
});
