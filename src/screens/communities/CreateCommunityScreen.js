import React, {useMemo, useState} from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {launchImageLibrary} from 'react-native-image-picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  mdiCameraOutline,
  mdiChevronLeft,
  mdiCodeTags,
  mdiImagePlusOutline,
  mdiLockOutline,
  mdiPlus,
  mdiShieldCheckOutline,
  mdiWeb,
} from '@mdi/js';

import {MdiIcon} from '../../components/ui/MdiIcon';
import {useAuth} from '../../context/AuthContext';
import {useCommunities} from '../../context/CommunityContext';
import {useTheme} from '../../context/ThemeContext';
import {
  uploadCommunityCover,
  uploadCommunityIcon,
} from '../../services/storageService';
import {
  COMMUNITY_CATEGORIES,
  getCommunityCategoryByKey,
} from '../../utils/communityCategories';

export function CreateCommunityScreen({navigation}) {
  const {theme} = useTheme();
  const {profile, user} = useAuth();
  const {addCommunity, setCommunityMedia} = useCommunities();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [coverAsset, setCoverAsset] = useState(null);
  const [iconAsset, setIconAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const selectedCategory = useMemo(
    () => getCommunityCategoryByKey(category),
    [category],
  );

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

  function validateForm() {
    if (!user?.uid) {
      return 'Topluluk oluşturmak için oturum açmalısın.';
    }

    if (!name.trim()) {
      return 'Topluluk adı boş olamaz.';
    }

    if (!description.trim()) {
      return 'Topluluk açıklaması boş olamaz.';
    }

    if (!selectedCategory) {
      return 'Lütfen bir topluluk kategorisi seç.';
    }

    return null;
  }

  async function handleSubmit() {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const communityId = await addCommunity(
        {
          name,
          description,
          category: selectedCategory.firestoreValue,
          isPrivate: !isPublic,
          privacy: isPublic ? 'public' : 'private',
          tags: [selectedCategory.firestoreValue.trim().toLowerCase()],
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
    <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.colors.background}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={[styles.backButton, {backgroundColor: theme.colors.surface}]}>
              <MdiIcon path={mdiChevronLeft} size={28} color={theme.colors.text} />
            </Pressable>
            <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
              Topluluk Oluştur
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.previewBlock}>
            <Pressable
              accessibilityRole="button"
              onPress={() => pickImage(setCoverAsset)}
              style={styles.coverPicker}>
              {coverAsset?.uri ? (
                <ImageBackground
                  imageStyle={styles.coverRadius}
                  resizeMode="cover"
                  source={{uri: coverAsset.uri}}
                  style={styles.coverPreview}>
                  <View style={styles.coverOverlay}>
                    <MdiIcon path={mdiImagePlusOutline} size={24} color="#FFFFFF" />
                    <Text style={styles.coverOverlayText}>Cover değiştir</Text>
                  </View>
                </ImageBackground>
              ) : (
                <LinearGradient
                  colors={[selectedCategory?.color || '#2563EB', '#0F4FD8', '#FF8A1F']}
                  end={{x: 1, y: 1}}
                  start={{x: 0, y: 0}}
                  style={styles.coverPreview}>
                  <MdiIcon path={mdiImagePlusOutline} size={34} color="#FFFFFF" />
                  <Text style={styles.coverTitle}>Cover görseli seç</Text>
                  <Text style={styles.coverSubtitle}>
                    Topluluğunu ilk bakışta tanıtan bir görsel ekle.
                  </Text>
                </LinearGradient>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => pickImage(setIconAsset)}
              style={styles.iconPicker}>
              {iconAsset?.uri ? (
                <Image source={{uri: iconAsset.uri}} style={styles.iconPreview} />
              ) : (
                <LinearGradient
                  colors={[selectedCategory?.color || '#2563EB', '#1D4ED8']}
                  style={styles.iconPreview}>
                  <MdiIcon path={selectedCategory?.icon || mdiCodeTags} size={32} color="#FFFFFF" />
                </LinearGradient>
              )}
              <View style={styles.iconBadge}>
                <MdiIcon path={mdiCameraOutline} size={15} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>

          <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Temel Bilgiler
            </Text>
            <TextInput
              autoCorrect={false}
              onChangeText={setName}
              placeholder="Topluluk adı"
              placeholderTextColor={theme.colors.subtleText}
              spellCheck={false}
              style={[styles.input, {borderColor: theme.colors.border, color: theme.colors.text}]}
              value={name}
            />
            <TextInput
              multiline
              autoCorrect={false}
              onChangeText={setDescription}
              placeholder="Topluluğun amacı, kapsamı ve kimlere hitap ettiği..."
              placeholderTextColor={theme.colors.subtleText}
              spellCheck={false}
              style={[
                styles.input,
                styles.multilineInput,
                {borderColor: theme.colors.border, color: theme.colors.text},
              ]}
              value={description}
            />
          </View>

          <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Kategori
            </Text>
            <View style={styles.categoryGrid}>
              {COMMUNITY_CATEGORIES.map(cat => {
                const active = category === cat.key;

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={cat.key}
                    onPress={() => setCategory(cat.key)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: active ? cat.color : theme.colors.surfaceAlt,
                        borderColor: active ? cat.color : theme.colors.border,
                      },
                    ]}>
                    <MdiIcon
                      path={cat.icon}
                      size={18}
                      color={active ? '#FFFFFF' : theme.colors.primary}
                    />
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.categoryText,
                        {color: active ? '#FFFFFF' : theme.colors.text},
                      ]}>
                      {cat.shortLabel || cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.card, styles.privacyCard, {backgroundColor: theme.colors.surface}]}>
            <View style={styles.privacyIcon}>
              <MdiIcon
                path={isPublic ? mdiWeb : mdiLockOutline}
                size={28}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.privacyTextBlock}>
              <Text style={[styles.privacyTitle, {color: theme.colors.text}]}>
                {isPublic ? 'Açık Topluluk' : 'Özel Topluluk'}
              </Text>
              <Text style={[styles.privacyDescription, {color: theme.colors.mutedText}]}>
                {isPublic
                  ? 'Kullanıcılar doğrudan katılabilir.'
                  : 'Katılım isteği gerekir. Gönderileri sadece üyeler görebilir.'}
              </Text>
            </View>
            <Switch
              onValueChange={setIsPublic}
              thumbColor="#FFFFFF"
              trackColor={{false: '#CBD5E1', true: theme.colors.primary}}
              value={isPublic}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            disabled={submitting}
            onPress={handleSubmit}
            style={[styles.submitWrap, submitting && styles.disabledButton]}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.accent]}
              end={{x: 1, y: 1}}
              start={{x: 0, y: 0}}
              style={styles.submitButton}>
              <MdiIcon
                path={submitting ? mdiShieldCheckOutline : mdiPlus}
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.submitText}>
                {submitting ? 'Kaydediliyor...' : 'Topluluğu Kaydet'}
              </Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    gap: 16,
    padding: 16,
    paddingBottom: 34,
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '900',
  },
  headerSpacer: {
    width: 46,
  },
  previewBlock: {
    minHeight: 236,
  },
  coverPicker: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  coverPreview: {
    height: 184,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 18,
    borderRadius: 20,
  },
  coverRadius: {
    borderRadius: 20,
  },
  coverOverlay: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(15,23,42,0.42)',
  },
  coverOverlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  coverTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  coverSubtitle: {
    maxWidth: 260,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.86)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  iconPicker: {
    position: 'absolute',
    left: 18,
    bottom: 0,
    width: 92,
    height: 92,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    borderRadius: 46,
    backgroundColor: '#EEF4FF',
  },
  iconPreview: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 46,
  },
  iconBadge: {
    position: 'absolute',
    right: -2,
    bottom: 5,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 14,
    backgroundColor: '#2563EB',
  },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 14,
    fontSize: 15,
    fontWeight: '600',
  },
  multilineInput: {
    minHeight: 118,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  categoryChip: {
    minHeight: 42,
    maxWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderRadius: 21,
  },
  categoryText: {
    minWidth: 0,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '900',
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  privacyIcon: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    backgroundColor: '#EEF4FF',
  },
  privacyTextBlock: {
    minWidth: 0,
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  privacyDescription: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  submitWrap: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  submitButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 16,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.68,
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
});
