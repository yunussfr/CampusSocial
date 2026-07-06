import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const EVENT_CATEGORIES = [
  'Akademik',
  'Eğitim ve Atölye',
  'Kariyer',
  'Teknoloji',
  'Yarışma ve Hackathon',
  'Kültür ve Sanat',
  'Müzik',
  'Spor',
  'Sosyal ve Eğlence',
  'Gönüllülük',
  'Festival',
  'Topluluk Etkinliği',
  'Diğer',
];
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { uploadEventCover } from '../../services/storageService';

export function CreateEventScreen({ navigation }) {
  const { profile, user } = useAuth();
  const { addEvent, setEventCover } = useEvents();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [coverAsset, setCoverAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handlePickCover() {
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

    setCoverAsset(result.assets?.[0] || null);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const eventId = await addEvent(
        {
          title,
          description,
          category,
          location,
          capacity,
          tags: category ? [category.trim().toLowerCase()] : [],
          isOnline: false,
          organizerName: profile?.displayName || user?.displayName || '',
        },
        {
          uid: user.uid,
          displayName: profile?.displayName || user?.displayName || '',
          photoURL: profile?.photoURL || user?.photoURL || '',
        },
      );

      if (coverAsset?.uri) {
        const coverURL = await uploadEventCover(eventId, coverAsset);
        await setEventCover(eventId, coverURL);
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
      <Text style={styles.title}>Etkinlik Olustur</Text>
      <Text style={styles.subtitle}>Temel etkinlik bilgilerini ekle.</Text>
      <TextInput
        autoCorrect={false}
        onChangeText={setTitle}
        placeholder="Baslik"
        spellCheck={false}
        style={styles.input}
        value={title}
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
          {EVENT_CATEGORIES.map(cat => (
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
      <TextInput
        autoCorrect={false}
        onChangeText={setLocation}
        placeholder="Konum"
        spellCheck={false}
        style={styles.input}
        value={location}
      />
      <TextInput
        keyboardType="number-pad"
        onChangeText={setCapacity}
        placeholder="Kapasite"
        style={styles.input}
        value={capacity}
      />
      <Pressable onPress={handlePickCover} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>
          {coverAsset ? 'Cover degistir' : 'Cover sec'}
        </Text>
      </Pressable>
      {coverAsset?.uri ? (
        <Image source={{ uri: coverAsset.uri }} style={styles.coverPreview} />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        disabled={submitting}
        onPress={handleSubmit}
        style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>
          {submitting ? 'Kaydediliyor...' : 'Etkinligi Kaydet'}
        </Text>
      </Pressable>
      <Text style={styles.note}>Cover gorseli Storage'a yuklenir.</Text>
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
  secondaryButtonText: {
    color: '#004AC6',
    fontSize: 15,
    fontWeight: '700',
  },
  coverPreview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
  },
  note: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
});
