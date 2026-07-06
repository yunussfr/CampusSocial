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

const LISTING_CATEGORIES = [
  'Kitap ve Ders Materyali',
  'Kırtasiye',
  'Bilgisayar ve Teknoloji',
  'Telefon ve Aksesuar',
  'Elektronik',
  'Giyim ve Aksesuar',
  'Yurt ve Ev Eşyası',
  'Spor ve Kamp',
  'Müzik Aletleri',
  'Hobi ve Oyun',
  'El Yapımı Ürünler',
  'Ücretsþz ve Bağış',
  'Diğer',
];
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
  const [showCategories, setShowCategories] = useState(false);
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
          {LISTING_CATEGORIES.map(cat => (
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
