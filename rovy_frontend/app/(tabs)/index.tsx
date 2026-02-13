import { View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "../../src/theme/colors";
import { HUD } from "../../src/components/dashboard/HUD";
import { FeedView } from "../../src/components/dashboard/feed/FeedView";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Zone 1: HUD */}
        <HUD 
          onProfilePress={() => router.push("/profile")} 
          onSearchPress={() => router.push("/search")}
          minimal
        />

        {/* Zone 3: Viewport */}
        <View style={styles.viewport}>
          <FeedView />
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  viewport: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
