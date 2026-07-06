import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const COMMUNITY_CATEGORIES = [
  'Akademik ve Bölüm',
  'Teknoloji ve Yazılım',
  'Kariyer ve Girişimcilik',
  'Kültür ve Sanat',
  'Spor',
  'Sosyal ve Hobi',
  'Gönüllülük',
  'Dil ve Uluslararası',
  'Bilim ve Araştırma',
  'Medya ve İletişim',
  'Mezuniyet ve Networking',
  'Diğer',
];
import { useAuth } from '../../context/AuthContext';
import { useCommunities } from '../../context/CommunityContext';
import {
  uploadCommunityCover,
  uploadCommunityIcon,
} from '../../services/storageService';

export function CreateCommunityScreen({ navigation }) {
  const { profile, user } = useAuth();
  const { addCommunity, setCommunityMedia } = useCommunities();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverAsset, setCoverAsset] = useState(null);
  const [iconAsset, setIconAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function pickImage(setAsset) {
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

    setAsset(result.assets?.[0] || null);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const communityId = await addCommunity(
        {
          name,
          description,
          category,
          isPrivate,
          tags: category ? [category.trim().toLowerCase()] : [],
          rules: [],
        },
        {
          uid: user.uid,
          displayName: profile?.displayName || user?.displayName || '',
          photoURL: profile?.photoURL || user?.photoURL || '',
        },
      );

      const media = {};

      if (coverAsset?.uri) {
        media.coverURL = await uploadCommunityCover(communityId, coverAsset);
      }

      if (iconAsset?.uri) {
        media.iconURL = await uploadCommunityIcon(communityId, iconAsset);
      }

      if (Object.keys(media).length > 0) {
        await setCommunityMedia(communityId, media);
      }

      navigation.goBack();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Topluluk Olustur</Text>
      <Text style={styles.subtitle}>Topluluk bilgilerini ekle.</Text>
      <TextInput
        autoCorrect={false}
        onChangeText={setName}
        placeholder="Topluluk adi"
        spellCheck={false}
        style={styles.input}
        value={name}
      />
      <TextInput
        multiline
        autoCorrect={false}
        onChangeText={setDescription}
        placeholder="Aciklama"
        spellCheck={false}
        style={[styles.input, styles.multilineInput]}
        value={description}
      />
      <Pressable
        onPress={() => setShowCategories(prev => !prev)}
        style={[styles.input, styles.categorySelector]}>
        <Text style={[
          styles.categorySelectorText,
          !category && styles.categoryPlaceholder,
        ]}>
          {category || 'Kategori seç'}
        </Text>
        <Text style={styles.categoryArrow}>
          {showCategories ? '▲' : '▼'}
        </Text>
      </Pressable>
      {showCategories ? (
        <View style={styles.categoryDropdown}>
          {COMMUNITY_CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              onPress={() => {
                setCategory(cat);
                setShowCategories(false);
              }}
              style={[
                styles.categoryOption,
                category === cat && styles.categoryOptionActive,
              ]}>
              <Text style={[
                styles.categoryOptionText,
                category === cat && styles.categoryOptionTextActive,
              ]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Private topluluk</Text>
        <Switch onValueChange={setIsPrivate} value={isPrivate} />
      </View>
      <Pressable
        onPress={() => pickImage(setCoverAsset)}
        style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>
          {coverAsset ? 'Cover degistir' : 'Cover sec'}
        </Text>
      </Pressable>
      {coverAsset?.uri ? (
        <Image source={{ uri: coverAsset.uri }} style={styles.coverPreview} />
      ) : null}
      <Pressable
        onPress={() => pickImage(setIconAsset)}
        style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>
          {iconAsset ? 'Icon degistir' : 'Icon sec'}
        </Text>
      </Pressable>
      {iconAsset?.uri ? (
        <Image source={{ uri: iconAsset.uri }} style={styles.iconPreview} />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        disabled={submitting}
        onPress={handleSubmit}
        style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>
          {submitting ? 'Kaydediliyor...' : 'Toplulugu Kaydet'}
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
  title: {
    color: '#0B1C30',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 15,
    marginBottom: 12,
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
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    minHeight: 48,
  },
  categorySelectorText: {
    fontSize: 14,
    color: '#0B1C30',
    flex: 1,
  },
  categoryPlaceholder: {
    color: '#94A3B8',
  },
  categoryArrow: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 8,
  },
  categoryDropdown: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginTop: -8,
  },
  categoryOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryOptionActive: {
    backgroundColor: '#EEF4FF',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#334155',
  },
  categoryOptionTextActive: {
    color: '#004AC6',
    fontWeight: '700',
  },
  switchRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    color: '#0B1C30',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#004AC6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
  secondaryButtonText: {
    color: '#004AC6',
    fontSize: 15,
    fontWeight: '700',
  },
  coverPreview: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  iconPreview: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
  },
});
