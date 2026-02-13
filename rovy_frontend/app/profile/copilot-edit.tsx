import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Pressable, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { GlassView } from '../../src/components/ui/GlassView';
import { Input } from '../../src/components/ui/Input';
import { copilotService } from '../../src/services/copilot';
import Toast from 'react-native-toast-message';
import { ArrowLeft, Save, Plus, X, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch } from 'react-redux';
import { updateCoPilotStatus } from '../../src/store/slices/authSlice';

const schema = z.object({
  isActive: z.boolean(),
  identity: z.string(),
  seeking: z.string(),
  relationshipStyle: z.string(),
  seatBeltRule: z.boolean(),
  tagline: z.string().min(1, "Tagline is required").max(100),
  photo1: z.string().optional(),
  photo2: z.string().optional(),
  photo3: z.string().optional(),
  rigPhoto: z.string().optional(),
  prompt1Q: z.string().optional(),
  prompt1A: z.string().optional(),
  prompt2Q: z.string().optional(),
  prompt2A: z.string().optional(),
  prompt3Q: z.string().optional(),
  prompt3A: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditCoPilotProfile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  
  const { control, handleSubmit, setValue, reset, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      isActive: false,
      identity: 'Male',
      seeking: 'Women',
      relationshipStyle: 'Monogamous',
      seatBeltRule: false,
      tagline: '',
      photo1: '',
      photo2: '',
      photo3: '',
      rigPhoto: '',
      prompt1Q: 'My non-negotiable',
      prompt1A: '',
      prompt2Q: 'Best camp meal',
      prompt2A: '',
      prompt3Q: 'Driving Style',
      prompt3A: '',
    }
  });

  const isActive = watch('isActive');
  const identity = watch('identity');
  const seeking = watch('seeking');
  const relationshipStyle = watch('relationshipStyle');
  const seatBeltRule = watch('seatBeltRule');
  const photo1 = watch('photo1');
  const photo2 = watch('photo2');
  const photo3 = watch('photo3');
  const rigPhoto = watch('rigPhoto');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await copilotService.getProfile();
      if (data) {
        // Map API data to flat form structure
        setValue('isActive', data.isActive || false);
        setValue('identity', data.identity || 'Male');
        setValue('seeking', data.seeking || 'Women');
        setValue('relationshipStyle', data.relationshipStyle || 'Monogamous');
        setValue('seatBeltRule', data.seatBeltRule || false);
        setValue('tagline', data.tagline || '');
        setValue('photo1', data.photos?.[0] || '');
        setValue('photo2', data.photos?.[1] || '');
        setValue('photo3', data.photos?.[2] || '');
        setValue('rigPhoto', data.rigPhotos?.[0] || '');
        
        if (data.prompts && data.prompts.length > 0) {
          setValue('prompt1Q', data.prompts[0]?.question || 'My non-negotiable');
          setValue('prompt1A', data.prompts[0]?.answer || '');
          setValue('prompt2Q', data.prompts[1]?.question || 'Best camp meal');
          setValue('prompt2A', data.prompts[1]?.answer || '');
          setValue('prompt3Q', data.prompts[2]?.question || 'Driving Style');
          setValue('prompt3A', data.prompts[2]?.answer || '');
        }
      }
    } catch (e) {
      console.log("No profile yet or failed to load");
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async (field: keyof FormData) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: field === 'rigPhoto' ? [16, 9] : [3, 4],
        quality: 0.7,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        
        // Optimistic update (show local uri while uploading)
        // Actually, we need the remote URL for the form submission.
        // We can show a spinner.
        
        setUploading(prev => ({ ...prev, [field]: true }));
        try {
            const { url } = await copilotService.uploadImage(uri, `copilot/${field}`);
            setValue(field, url);
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Upload failed' });
            console.error(e);
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }));
        }
      }
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Failed to pick image' });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      // Transform back to API structure
      const photos = [data.photo1, data.photo2, data.photo3].filter(p => p && p.length > 0) as string[];
      const rigPhotos = [data.rigPhoto].filter(p => p && p.length > 0) as string[];
      
      const prompts = [
        { question: data.prompt1Q, answer: data.prompt1A },
        { question: data.prompt2Q, answer: data.prompt2A },
        { question: data.prompt3Q, answer: data.prompt3A },
      ].filter((p): p is { question: string; answer: string } => !!p.question && !!p.answer);

      const apiData = {
        isActive: data.isActive,
        identity: data.identity,
        seeking: data.seeking,
        relationshipStyle: data.relationshipStyle,
        seatBeltRule: data.seatBeltRule,
        tagline: data.tagline,
        photos,
        rigPhotos,
        prompts
      };

      await copilotService.updateProfile(apiData);
      dispatch(updateCoPilotStatus(data.isActive));
      Toast.show({ type: 'success', text1: 'Profile updated' });
      router.back();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to update' });
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderOption = (label: string, value: string, current: string, field: any) => (
    <Pressable 
      onPress={() => setValue(field, value)} 
      style={[styles.option, current === value && styles.selectedOption]}
    >
      <Text style={[styles.optionText, current === value && styles.selectedOptionText]}>{label}</Text>
    </Pressable>
  );

  const renderPhotoUploader = (field: keyof FormData, value: string | undefined | null, label: string) => {
    const isUploading = uploading[field];
    
    return (
        <TouchableOpacity 
            onPress={() => handleImagePick(field)} 
            style={[styles.photoBox, field === 'rigPhoto' && styles.photoBoxWide]}
            disabled={isUploading}
        >
            {value ? (
                <Image source={{ uri: value }} style={styles.photoPreview} />
            ) : (
                <View style={styles.photoPlaceholder}>
                    <Camera color={colors.text.muted} size={24} />
                    <Text style={styles.photoLabel}>{label}</Text>
                </View>
            )}
            
            {isUploading && (
                <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            )}

            {value && !isUploading && (
                <TouchableOpacity 
                    style={styles.removePhoto} 
                    onPress={() => setValue(field, '')}
                >
                    <X size={12} color="#fff" />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
       <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Co-Pilot Profile</Text>
        <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={loading}>
            <Save color={colors.primary} size={24} />
        </TouchableOpacity>
      </SafeAreaView>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.activationCard}>
            <View style={styles.activationHeader}>
                <View>
                    <Text style={styles.activationTitle}>Social Radar</Text>
                    <Text style={styles.activationSubtitle}>
                        {isActive ? 'Your profile is visible to others' : 'Activate to see nearby nomads'}
                    </Text>
                </View>
                <Switch 
                    value={isActive} 
                    onValueChange={(val) => setValue('isActive', val)}
                    trackColor={{ false: "#767577", true: "#4ADE80" }}
                />
            </View>
        </View>

        <Text style={styles.sectionTitle}>The Basics</Text>
        <Input control={control} name="tagline" placeholder="Your Vibe (Tagline)" autoCapitalize="sentences" />

        <Text style={styles.sectionTitle}>Identity & Preferences</Text>
        
        <Text style={styles.label}>I am</Text>
        <View style={styles.optionsRow}>
            {['Male', 'Female', 'Non-Binary'].map(opt => 
                renderOption(opt, opt, identity, 'identity')
            )}
        </View>

        <Text style={styles.label}>Seeking</Text>
        <View style={styles.optionsRow}>
            {['Men', 'Women', 'Everyone'].map(opt => 
                renderOption(opt, opt, seeking, 'seeking')
            )}
        </View>

        <Text style={styles.label}>Relationship Style</Text>
        <View style={styles.optionsRow}>
            {['Monogamous', 'ENM', 'Open', 'Short-term'].map(opt => 
                renderOption(opt, opt, relationshipStyle, 'relationshipStyle')
            )}
        </View>

        <View style={styles.switchRow}>
            <Text style={styles.label}>Seat Belt Rule (100mi radius)</Text>
            <Switch 
                value={seatBeltRule} 
                onValueChange={(val) => setValue('seatBeltRule', val)}
                trackColor={{ false: "#767577", true: "#4ADE80" }}
            />
        </View>

        <Text style={styles.sectionTitle}>Photos</Text>
        <View style={styles.photosRow}>
            {renderPhotoUploader('photo1', photo1, 'Main')}
            {renderPhotoUploader('photo2', photo2, '2')}
            {renderPhotoUploader('photo3', photo3, '3')}
        </View>
        
        <Text style={styles.sectionTitle}>Rig Photo</Text>
        {renderPhotoUploader('rigPhoto', rigPhoto, 'Rig Check')}

        <Text style={styles.sectionTitle}>Deep Dive</Text>
        <View style={styles.promptContainer}>
            <Input control={control} name="prompt1Q" placeholder="Question 1" />
            <Input control={control} name="prompt1A" placeholder="Answer 1" multiline style={{height: 80}} />
        </View>
        <View style={styles.promptContainer}>
            <Input control={control} name="prompt2Q" placeholder="Question 2" />
            <Input control={control} name="prompt2A" placeholder="Answer 2" multiline style={{height: 80}} />
        </View>
        <View style={styles.promptContainer}>
            <Input control={control} name="prompt3Q" placeholder="Question 3" />
            <Input control={control} name="prompt3A" placeholder="Answer 3" multiline style={{height: 80}} />
        </View>
        
        <View style={{height: 100}} /> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  label: {
    color: colors.text.muted,
    marginBottom: 8,
    marginTop: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text.primary,
  },
  selectedOptionText: {
    color: '#000',
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  promptContainer: {
    marginBottom: 16,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoBox: {
    width: 100,
    height: 133, // 3:4 aspect
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  photoBoxWide: {
    width: '100%',
    height: 200, // 16:9 approx
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {
    color: colors.text.muted,
    fontSize: 12,
    marginTop: 4,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 4,
  },
  activationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    overflow: 'hidden',
  },
  activationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  activationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  activationSubtitle: {
    fontSize: 14,
    color: colors.text.muted,
  },
});
