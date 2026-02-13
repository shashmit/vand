import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { colors } from "../../src/theme/colors";
import { useSelector } from "react-redux";
import { RootState } from "../../src/store";

export default function TabLayout() {
  const user = useSelector((state: RootState) => state.auth.user);
  const showCoPilot = user?.coPilotProfile?.isActive;

  return (
    <NativeTabs
      tintColor={colors.primary}
      backgroundColor={colors.background}
    >
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="map">
        <Label>Map</Label>
        <Icon sf="map.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="builds">
        <Label>Builds</Label>
        <Icon sf="hammer.fill" />
      </NativeTabs.Trigger>

      {showCoPilot && (
        <NativeTabs.Trigger name="copilot">
          <Label>Co-Pilot</Label>
          <Icon sf="heart.fill" />
        </NativeTabs.Trigger>
      )}
    </NativeTabs>
  );
}
