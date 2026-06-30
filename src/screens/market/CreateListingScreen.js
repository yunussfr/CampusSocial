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
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { uploadListingImages } from '../../services/storageService';

export function CreateListingScreen({ navigation }) {
  const { profile, user } = useAuth();
  const { addListing, setListingImages } = useMarket();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('used');
  const [assets, setAssets] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handlePickImages() {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.82,
      selectionLimit: 5,
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorMessage) {
      setError(result.errorMessage);
      return;
    }

    setAssets(result.assets || []);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const listingId = await addListing(
        {
          title,
          description,
          price,
          category,
          condition,
          imageURLs: [],
          tags: category ? [category.trim().toLowerCase()] : [],
        },
        {
          uid: user.uid,
          displayName: profile?.displayName || user.displayName || '',
          photoURL: profile?.photoURL || user.photoURL || '',
        },
      );

      if (assets.length > 0) {
        const imageURLs = await uploadListingImages(listingId, assets);
        await setListingImages(listingId, imageURLs);
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
      <Text style={styles.title}>Ilan Olustur</Text>
      <Text style={styles.subtitle}>Urun bilgisini ve fotograflari ekle.</Text>
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
      <TextInput
        keyboardType="decimal-pad"
        onChangeText={setPrice}
        placeholder="Fiyat"
        style={styles.input}
        value={price}
      />
      <TextInput
        autoCorrect={false}
        onChangeText={setCategory}
        placeholder="Kategori"
        spellCheck={false}
        style={styles.input}
        value={category}
      />
      <TextInput
        autoCorrect={false}
        onChangeText={setCondition}
        placeholder="Durum"
        spellCheck={false}
        style={styles.input}
        value={condition}
      />
      <Pressable onPress={handlePickImages} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>
          {assets.length > 0 ? `${assets.length} fotograf secildi` : 'Fotograf Sec'}
        </Text>
      </Pressable>
      {assets[0]?.uri ? (
        <Image source={{ uri: assets[0].uri }} style={styles.preview} />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        disabled={submitting}
        onPress={handleSubmit}
        style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>
          {submitting ? 'Kaydediliyor...' : 'Ilani Kaydet'}
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
  error: {
    color: '#DC2626',
    fontSize: 14,
  },
});
