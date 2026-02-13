import { Slot, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store, AppDispatch, RootState } from "../src/store";
import { useEffect, useState } from "react";
import { checkAuth } from "../src/store/slices/authSlice";
import { View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import { colors } from "../src/theme/colors";
import { toastConfig } from "../src/components/ui/ToastConfig";

function InitialLayout() {
  const { isAuthenticated, isLoading, isNewUser, allowOnboardingEdit } = useSelector((state: RootState) => state.auth);
  const segments = useSegments();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await dispatch(checkAuth());
      setIsReady(true);
    };
    init();
  }, [dispatch]);

  useEffect(() => {
    if (!isReady || isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    // const inWelcome = segments[0] === "welcome"; // No longer needed as welcome is in (auth)

    // console.log("Nav state:", { isAuthenticated, isNewUser, segments, inAuthGroup });

    if (isAuthenticated) {
      if (isNewUser && !inOnboardingGroup) {
        // Explicitly redirect to the index route of the onboarding group
        router.replace("/(onboarding)/");
      } else if (!isNewUser && (inAuthGroup || (inOnboardingGroup && !allowOnboardingEdit))) {
        router.replace("/(tabs)");
      }
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace("/welcome");
    }
  }, [isAuthenticated, isNewUser, segments, isLoading, isReady, allowOnboardingEdit]);

  if (!isReady || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen
        name="profile"
        options={{
          presentation: "transparentModal",
          animation: "fade",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <InitialLayout />
        <Toast config={toastConfig} position="bottom" bottomOffset={40} />
      </GestureHandlerRootView>
    </Provider>
  );
}
