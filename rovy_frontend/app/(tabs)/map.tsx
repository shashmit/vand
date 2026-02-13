import { View, StyleSheet } from "react-native";
import { colors } from "../../src/theme/colors";
import { RadarView } from "../../src/components/dashboard/RadarView";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { useLayoutEffect } from "react";

export default function MapScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: "none" },
      // For native tabs, we might need a different property or this might not work directly.
      // But this is the standard Expo Router way.
      headerShown: false, 
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <RadarView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.radar.background,
  },
});
