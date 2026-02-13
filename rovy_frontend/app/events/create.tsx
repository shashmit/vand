import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator, Image } from "react-native";
import { colors } from "../../src/theme/colors";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Host } from "@expo/ui/swift-ui";
import { glassEffect } from "@expo/ui/swift-ui/modifiers";
import { GlassButton } from "../../src/components/ui/GlassButton";
import { GlassView } from "../../src/components/ui/GlassView";
import { eventsService } from "../../src/services/events";
import * as ImagePicker from "expo-image-picker";
import { copilotService } from "../../src/services/copilot";

export default function CreateEventScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    latitude: "",
    longitude: "",
    startDate: "",
    endDate: "",
    description: "",
    imageUrl: "",
    category: "",
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.location || !formData.latitude || !formData.longitude || !formData.startDate) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      Alert.alert("Error", "Latitude and Longitude must be numbers");
      return;
    }

    const parsedStart = new Date(formData.startDate);
    if (Number.isNaN(parsedStart.getTime())) {
      Alert.alert("Error", "Start Date must be valid");
      return;
    }

    const parsedEnd = formData.endDate ? new Date(formData.endDate) : null;
    if (formData.endDate && Number.isNaN(parsedEnd?.getTime())) {
      Alert.alert("Error", "End Date must be valid");
      return;
    }

    try {
      setLoading(true);
      await eventsService.createEvent({
        title: formData.title,
        location: formData.location,
        latitude,
        longitude,
        startDate: parsedStart.toISOString(),
        endDate: parsedEnd ? parsedEnd.toISOString() : undefined,
        description: formData.description || undefined,
        imageUrl: formData.imageUrl || undefined,
        category: formData.category || undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to create event");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setUploading(true);
      try {
        const { url } = await copilotService.uploadImage(uri, "events");
        setFormData((prev) => ({ ...prev, imageUrl: url }));
      } catch (error) {
        Alert.alert("Error", "Image upload failed");
      } finally {
        setUploading(false);
      }
    }
  };

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
          <Text style={styles.headerTitle}>Create Event</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <GlassView style={styles.formCard} borderRadius={24} intensity="regular">
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sunset Meetup"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Joshua Tree"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.half]}>
                <Text style={styles.label}>Latitude *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="34.0522"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.latitude}
                  onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputGroup, styles.half]}>
                <Text style={styles.label}>Longitude *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="-118.2437"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.longitude}
                  onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-02-10 18:00"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.startDate}
                onChangeText={(text) => setFormData({ ...formData, startDate: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>End Date</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-02-10 20:00"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.endDate}
                onChangeText={(text) => setFormData({ ...formData, endDate: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. meetup"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage} disabled={uploading}>
                {formData.imageUrl ? (
                  <Image source={{ uri: formData.imageUrl }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>Upload Event Photo</Text>
                  </View>
                )}
                {uploading && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your event"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            <GlassButton
              onPress={handleSubmit}
              style={styles.submitButton}
              intensity="thick"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitButtonText}>Create Event</Text>
              )}
            </GlassButton>
          </GlassView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  content: {
    paddingBottom: 40,
  },
  formCard: {
    marginHorizontal: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  imagePicker: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: colors.text.muted,
    fontSize: 12,
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
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
  },
  submitButton: {
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: colors.dashboard.build,
  },
  submitButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});
