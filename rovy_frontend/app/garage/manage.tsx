import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator } from "react-native";
import { colors } from "../../src/theme/colors";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Host } from "@expo/ui/swift-ui";
import { glassEffect } from "@expo/ui/swift-ui/modifiers";
import { GlassButton } from "../../src/components/ui/GlassButton";
import { GlassView } from "../../src/components/ui/GlassView";
import { garageService } from "../../src/services/garage";

const CATEGORIES = ['SOLAR', 'CARPENTRY', 'MECHANIC', 'PLUMBING'];

export default function ManageGarageScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    specialty: "",
    rate: "",
    category: "SOLAR",
    imageUrl: "",
    phoneNumber: "",
    email: "",
    website: "",
    location: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await garageService.getMyProfile();
      if (profile) {
        setExistingId(profile.id);
        setFormData({
          name: profile.name,
          title: profile.title,
          specialty: profile.specialty,
          rate: profile.rate,
          category: profile.category,
          imageUrl: profile.imageUrl || "",
          phoneNumber: profile.phoneNumber || "",
          email: profile.email || "",
          website: profile.website || "",
          location: profile.location || "",
        });
      }
    } catch (error) {
      console.log("No existing profile or error loading");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.title || !formData.rate) {
      Alert.alert("Error", "Please fill in required fields (Name, Title, Rate)");
      return;
    }

    try {
      setSubmitting(true);
      if (existingId) {
        await garageService.updateProfile(existingId, formData);
        Alert.alert("Success", "Profile updated successfully");
      } else {
        await garageService.createProfile(formData);
        Alert.alert("Success", "Profile created successfully");
      }
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save profile");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>
            {existingId ? "Edit Garage Profile" : "Create Garage Profile"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <GlassView style={styles.formCard} borderRadius={24} intensity="regular">
            
            {/* Business Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sparky Solutions"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Job Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Certified Electrician"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            {/* Specialty */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specialty</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Lithium Installs"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.specialty}
                onChangeText={(text) => setFormData({ ...formData, specialty: text })}
              />
            </View>

            {/* Rate */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rate *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. $60/hr or Quote Basis"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.rate}
                onChangeText={(text) => setFormData({ ...formData, rate: text })}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      formData.category === cat && styles.activeCategoryChip
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat })}
                  >
                    <Text style={[
                      styles.categoryText,
                      formData.category === cat && styles.activeCategoryText
                    ]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Contact Info */}
            <Text style={styles.sectionLabel}>Contact Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 555-0123"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. pro@example.com"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. www.mysite.com"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.website}
                onChangeText={(text) => setFormData({ ...formData, website: text })}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Portland, OR"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Profile Image URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.imageUrl}
                onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.buttonRow}>
              <GlassButton
                onPress={() => router.back()}
                style={[styles.actionButton, styles.cancelButton]}
                intensity="regular"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </GlassButton>

              <GlassButton
                onPress={handleSubmit}
                loading={submitting}
                style={[styles.actionButton, styles.submitButton]}
                intensity="thick"
              >
                <Text style={styles.submitButtonText}>
                  {existingId ? "Save Changes" : "Create Profile"}
                </Text>
              </GlassButton>
            </View>

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
  sectionLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeCategoryChip: {
    backgroundColor: colors.dashboard.build,
    borderColor: colors.dashboard.build,
  },
  categoryText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: 12,
  },
  activeCategoryText: {
    color: '#000',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  submitButton: {
    backgroundColor: colors.dashboard.build,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
