import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Image, ActivityIndicator } from "react-native";
import { colors } from "../../src/theme/colors";
import { useRouter } from "expo-router";
import { ArrowLeft, Upload, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Host } from "@expo/ui/swift-ui";
import { glassEffect } from "@expo/ui/swift-ui/modifiers";
import { GlassButton } from "../../src/components/ui/GlassButton";
import { GlassView } from "../../src/components/ui/GlassView";
import { buildService } from "../../src/services/builds";
import * as ImagePicker from "expo-image-picker";
import { copilotService } from "../../src/services/copilot";

export default function CreateBuildScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    description: "",
    imageUrl: "",
    tags: "",
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.model || !formData.imageUrl) {
      Alert.alert("Error", "Please fill in all required fields (Name, Model, Image URL)");
      return;
    }

    try {
      setLoading(true);
      await buildService.createBuild({
        ...formData,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to create build");
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
        const { url } = await copilotService.uploadImage(uri, "builds");
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
          <Text style={styles.headerTitle}>Add New Build</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <GlassView style={styles.formCard} borderRadius={24} intensity="regular">
            
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rig Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. The Nomad Sprinter"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            {/* Model */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Model *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Mercedes Sprinter 144"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.model}
                onChangeText={(text) => setFormData({ ...formData, model: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Image *</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage} disabled={uploading}>
                {formData.imageUrl ? (
                  <Image source={{ uri: formData.imageUrl }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Upload color={colors.text.muted} size={22} />
                    <Text style={styles.imagePlaceholderText}>Upload Build Photo</Text>
                  </View>
                )}
                {uploading && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                )}
                {formData.imageUrl && !uploading && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                  >
                    <X size={14} color="#fff" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us about your build..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Tags */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="Solar, Off-grid, 4x4"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.tags}
                onChangeText={(text) => setFormData({ ...formData, tags: text })}
              />
            </View>

            <GlassButton
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
              intensity="thick"
            >
              <Text style={styles.submitButtonText}>Create Build</Text>
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
  content: {
    padding: 16,
  },
  formCard: {
    padding: 16,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  imagePicker: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    color: colors.text.muted,
    fontSize: 12,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: colors.dashboard.build,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
