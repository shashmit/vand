import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import Toast from "react-native-toast-message";

import { colors } from "../../src/theme/colors";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { onboardingSchema, OnboardingFormData } from "../../src/lib/validations/auth";
import { authService } from "../../src/services/auth";
import { copilotService } from "../../src/services/copilot";
import { AppDispatch } from "../../src/store";
import { completeOnboarding, setAllowOnboardingEdit } from "../../src/store/slices/authSlice";

const GENDER_OPTIONS = ["Male", "Female", "Non-Binary", "Prefer not to say"];
const VEHICLE_OPTIONS = [
  { id: "sprinter", name: "Sprinter", icon: "bus-outline" },
  { id: "skoolie", name: "Skoolie", icon: "bus" },
  { id: "truck_camper", name: "Truck Camper", icon: "car-sport-outline" },
  { id: "minivan", name: "Minivan", icon: "car-outline" },
  { id: "rv", name: "RV", icon: "bus-outline" },
  { id: "car_camper", name: "Car Camper", icon: "car" },
];
const BUILD_STATUS_OPTIONS = ["Self-Built", "Pro-Build", "Work in Progress", "Weekend Warrior"];

export default function NomadProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ edit?: string }>();
  const isEditMode = params.edit === "1";
  const dispatch = useDispatch<AppDispatch>();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<"selfie" | "rigPhoto", boolean>>({
    selfie: false,
    rigPhoto: false,
  });

  const { control, handleSubmit, setValue, watch } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: "",
      name: "",
      age: "",
      gender: "",
      vehicleType: "",
      buildStatus: "",
      selfie: null,
      rigPhoto: null,
      enableCoPilot: false,
    },
  });

  const selfie = watch("selfie");
  const rigPhoto = watch("rigPhoto");
  const enableCoPilot = watch("enableCoPilot");

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const profile = await authService.getProfile();
        if (!isMounted || !profile) return;
        setValue("username", profile.username || "");
        setValue("name", profile.name || "");
        setValue("age", profile.age ? String(profile.age) : "");
        setValue("gender", profile.gender || "");
        setValue("vehicleType", profile.vehicleType || "");
        setValue("buildStatus", profile.buildStatus || "");
        setValue("selfie", profile.avatarUrl || null);
        setValue("rigPhoto", profile.rigPhotoUrl || null);
        setValue("enableCoPilot", !!profile.coPilotProfile?.isActive);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load profile",
        });
      }
    };
    if (isEditMode) {
      loadProfile();
    }
    return () => {
      isMounted = false;
      dispatch(setAllowOnboardingEdit(false));
    };
  }, [dispatch, isEditMode, setValue]);

  const pickImage = async (fieldName: "selfie" | "rigPhoto") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setUploading((prev) => ({ ...prev, [fieldName]: true }));
      try {
        const { url } = await copilotService.uploadImage(uri, `profiles/${fieldName}`);
        setValue(fieldName, url);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Upload failed",
        });
      } finally {
        setUploading((prev) => ({ ...prev, [fieldName]: false }));
      }
    }
  };

  const handleUpdate = async (data: OnboardingFormData) => {
    try {
      setSaving(true);
      const payload = {
        username: data.username,
        name: data.name,
        age: parseInt(data.age),
        gender: data.gender,
        vehicleType: data.vehicleType,
        buildStatus: data.buildStatus,
        avatarUrl: data.selfie,
        rigPhotoUrl: data.rigPhoto,
        enableCoPilot: data.enableCoPilot,
      };
      await dispatch(completeOnboarding(payload as any)).unwrap();
      Toast.show({
        type: "success",
        text1: "Profile updated",
      });
      dispatch(setAllowOnboardingEdit(false));
      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: error?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = (data: OnboardingFormData) => {
    if (isEditMode) {
      handleUpdate(data);
      return;
    }
    const payload = {
      username: data.username,
      name: data.name,
      age: parseInt(data.age),
      gender: data.gender,
      vehicleType: data.vehicleType,
      buildStatus: data.buildStatus,
      avatarUrl: data.selfie, // Using selfie as avatarUrl
      rigPhotoUrl: data.rigPhoto,
      enableCoPilot: data.enableCoPilot,
    };

    router.push({
      pathname: "/(onboarding)/pledge",
      params: { data: JSON.stringify(payload) },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>{isEditMode ? "Edit Profile" : "The Nomad Profile"}</Text>
        <Text style={styles.subtitle}>
          {isEditMode ? "Update your onboarding details." : "Build your Digital Dash Card."}
        </Text>

        {/* 1. The Basics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. The Basics</Text>

          <Text style={styles.label}>Username</Text>
          <Input control={control} name="username" placeholder="@username" autoCapitalize="none" />

          <Text style={styles.label}>Name</Text>
          <Input control={control} name="name" placeholder="Your Name" autoCapitalize="none" />

          <Text style={styles.label}>Age</Text>
          <Input
            control={control}
            name="age"
            placeholder="Age"
            keyboardType="numeric"
            maxLength={3}
          />

          <Text style={styles.label}>Gender</Text>
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <View style={styles.pillsContainer}>
                  {GENDER_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.pill, value === opt && styles.pillSelected]}
                      onPress={() => onChange(opt)}
                    >
                      <Text style={[styles.pillText, value === opt && styles.pillTextSelected]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* 2. The Rig */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. The Rig</Text>
          <Text style={styles.label}>What are you driving?</Text>
          <Controller
            control={control}
            name="vehicleType"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                >
                  {VEHICLE_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.card, value === opt.id && styles.cardSelected]}
                      onPress={() => onChange(opt.id)}
                    >
                      <Ionicons
                        name={opt.icon as any}
                        size={32}
                        color={value === opt.id ? colors.background : colors.text.primary}
                      />
                      <Text style={[styles.cardText, value === opt.id && styles.cardTextSelected]}>
                        {opt.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />

          <Text style={styles.label}>Build Status</Text>
          <Controller
            control={control}
            name="buildStatus"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <View style={styles.tagsContainer}>
                  {BUILD_STATUS_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.tag, value === opt && styles.tagSelected]}
                      onPress={() => onChange(opt)}
                    >
                      <Text style={[styles.tagText, value === opt && styles.tagTextSelected]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* 3. Visual Verification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Visual Verification</Text>
          <Text style={styles.label}>Identity & Ride</Text>

          <View style={styles.photosContainer}>
            <TouchableOpacity
              style={styles.photoBox}
              onPress={() => pickImage("selfie")}
              disabled={uploading.selfie}
            >
              {selfie ? (
                <Image source={{ uri: selfie }} style={styles.photo} />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={32} color={colors.text.muted} />
                  <Text style={styles.photoText}>Upload Selfie</Text>
                  <Text style={styles.photoSubText}>So we know who to look for.</Text>
                </>
              )}
              {uploading.selfie && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoBox}
              onPress={() => pickImage("rigPhoto")}
              disabled={uploading.rigPhoto}
            >
              {rigPhoto ? (
                <Image source={{ uri: rigPhoto }} style={styles.photo} />
              ) : (
                <>
                  <Ionicons name="car-sport-outline" size={32} color={colors.text.muted} />
                  <Text style={styles.photoText}>Upload Rig</Text>
                  <Text style={styles.photoSubText}>So we know what to knock on.</Text>
                </>
              )}
              {uploading.rigPhoto && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Social Radar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Co-Pilot</Text>
          <Text style={styles.subtitle}>Activate your Social Radar to find nearby nomads.</Text>
          
          <TouchableOpacity 
            style={[styles.coPilotToggle, enableCoPilot && styles.coPilotToggleActive]}
            onPress={() => setValue("enableCoPilot", !enableCoPilot)}
          >
             <Ionicons 
                name={enableCoPilot ? "radio-button-on" : "radio-button-off"} 
                size={24} 
                color={enableCoPilot ? colors.background : colors.text.secondary} 
             />
             <Text style={[styles.coPilotText, enableCoPilot && styles.coPilotTextActive]}>
                {enableCoPilot ? "Co-Pilot Enabled" : "Enable Co-Pilot"}
             </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isEditMode ? "Save Changes" : "Continue to Pledge"}
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
          loading={saving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  coPilotToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 12,
  },
  coPilotToggleActive: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  },
  coPilotText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  coPilotTextActive: {
    color: '#000000',
  },
  content: {
    padding: 16,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.muted,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
    marginTop: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    color: colors.text.secondary,
  },
  pillTextSelected: {
    color: colors.background,
    fontWeight: "bold",
  },
  horizontalScroll: {
    marginBottom: 16,
    marginHorizontal: -16, // Break out of container padding
    paddingHorizontal: 16,
  },
  card: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cardText: {
    marginTop: 8,
    color: colors.text.secondary,
    fontSize: 12,
    textAlign: "center",
  },
  cardTextSelected: {
    color: colors.background,
    fontWeight: "bold",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tagSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  tagTextSelected: {
    color: colors.background,
    fontWeight: "bold",
  },
  photosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  photoBox: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  photoText: {
    color: colors.text.primary,
    marginTop: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  photoSubText: {
    color: colors.text.muted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
  },
  spacer: {
    height: 40,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  button: {
    width: "100%",
  },
});
