import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import {mdiArrowLeft} from '@mdi/js';
import {MdiIcon} from '../../components/ui/MdiIcon';
import { useAuth } from '../../context/AuthContext';
import { uploadUserAvatar } from '../../services/storageService';

export function EditProfileScreen({ navigation }) {
  const { profile, updateProfile, user } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [year, setYear] = useState(String(profile?.year || ''));
  const [bio, setBio] = useState(profile?.bio || '');
  const [interests, setInterests] = useState(
    Array.isArray(profile?.interests) ? profile.interests.join(', ') : '',
  );
  const [avatarAsset, setAvatarAsset] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handlePickAvatar() {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.82,
      selectionLimit: 1,
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorMessage) {
      setError(result.errorMessage);
      return;
    }

    setAvatarAsset(result.assets?.[0] || null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      let photoURL = profile?.photoURL || '';

      if (avatarAsset?.uri) {
        photoURL = await uploadUserAvatar(user.uid, avatarAsset);
      }

      await updateProfile({
        displayName,
        department,
        year,
        bio,
        photoURL,
        interests: interests
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
      });
      navigation.goBack();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <MdiIcon path={mdiArrowLeft} size={24} color="#0B1C30" />
      </Pressable>
      <Text style={styles.title}>Profili Düzenle</Text>
      <TextInput
        autoCorrect={false}
        onChangeText={setDisplayName}
        placeholder="Ad Soyad"
        spellCheck={false}
        style={styles.input}
        value={displayName}
      />
      <TextInput
        autoCorrect={false}
        onChangeText={setDepartment}
        placeholder="Bolum"
        spellCheck={false}
        style={styles.input}
        value={department}
      />
      <TextInput
        keyboardType="number-pad"
        onChangeText={setYear}
        placeholder="Sinif"
        style={styles.input}
        value={year}
      />
      <TextInput
        multiline
        autoCorrect={false}
        onChangeText={setBio}
        placeholder="Bio"
        spellCheck={false}
        style={[styles.input, styles.multilineInput]}
        value={bio}
      />
      <TextInput
        autoCorrect={false}
        onChangeText={setInterests}
        placeholder="Ilgi alanlari, virgulle"
        spellCheck={false}
        style={styles.input}
        value={interests}
      />
      <Pressable onPress={handlePickAvatar} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>
          {avatarAsset ? 'Avatar değiştir' : 'Avatar seç'}
        </Text>
      </Pressable>
      {avatarAsset?.uri ? (
        <Image source={{ uri: avatarAsset.uri }} style={styles.preview} />
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Pressable
        disabled={saving}
        onPress={handleSave}
        style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#0B1C30',
    fontSize: 28,
    fontWeight: '800',
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    color: '#0B1C30',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    minHeight: 110,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#004AC6',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#004AC6',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
});
