import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {launchImageLibrary} from 'react-native-image-picker';

import {ListingFormSection} from '../../components/market/listing/ListingFormSection';
import {ListingPaymentSelector} from '../../components/market/listing/ListingPaymentSelector';
import {ListingPhotoPicker} from '../../components/market/listing/ListingPhotoPicker';
import {ListingSelectField} from '../../components/market/listing/ListingSelectField';
import {ListingSegmentedControl} from '../../components/market/listing/ListingSegmentedControl';
import {ListingSwitchRow} from '../../components/market/listing/ListingSwitchRow';
import {ListingTextField} from '../../components/market/listing/ListingTextField';
import {
  DEFAULT_LISTING_FORM,
  LISTING_BOOLEAN_OPTIONS,
  LISTING_CURRENCIES,
  LISTING_DELIVERY_OPTIONS,
  LISTING_MAX_PHOTOS,
  LISTING_SELLER_TYPES,
  LISTING_SHIPPING_PAYER_OPTIONS,
  LISTING_STATUS_OPTIONS,
} from '../../constants/listingOptions';
import {useAuth} from '../../context/AuthContext';
import {useMarket} from '../../context/MarketContext';
import {uploadListingImages} from '../../services/storageService';
import {buildListingPayload, buildSellerSnapshot} from '../../utils/listingPayload';
import {validateListingForm} from '../../utils/listingValidation';
import {
  MARKET_CATEGORIES,
  MARKET_CONDITIONS,
} from '../../utils/marketCategories';
import {useAnalytics} from '../../context/AnalyticsContext';
import {ANALYTICS_EVENTS} from '../../services/analyticsService';

const FORM_STEPS = ['Temel', 'Detay', 'Yayın'];

export function CreateListingScreen({navigation}) {
  const stepMotion = useMemo(() => new Animated.Value(1), []);
  const {logEvent} = useAnalytics();
  const {profile, user} = useAuth();
  const {addListing, setListingImages} = useMarket();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(DEFAULT_LISTING_FORM);
  const [assets, setAssets] = useState([]);
  const [openSelect, setOpenSelect] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    stepMotion.setValue(0);
    Animated.timing(stepMotion, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [activeStep, stepMotion]);

  function goToStep(step) {
    setSubmitError(null);
    setActiveStep(Math.max(0, Math.min(FORM_STEPS.length - 1, step)));
  }

  function updateField(key, value) {
    setForm(current => ({...current, [key]: value}));
    setErrors(current => ({...current, [key]: undefined}));
  }

  async function handlePickImages() {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.82,
      selectionLimit: Math.max(1, LISTING_MAX_PHOTOS - assets.length),
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorMessage) {
      setSubmitError(result.errorMessage);
      return;
    }

    setAssets(current =>
      [...current, ...(result.assets || [])].slice(0, LISTING_MAX_PHOTOS),
    );
  }

  function removeAsset(index) {
    setAssets(current => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleSubmit() {
    if (submitting) {
      return;
    }

    const validation = validateListingForm(form, assets);
    setErrors(validation.errors);
    setSubmitError(null);

    if (!validation.valid) {
      setSubmitError('Lutfen zorunlu alanlari kontrol edin.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = buildListingPayload(form, []);
      const seller = buildSellerSnapshot(user, profile);
      const listingId = await addListing(payload, seller);

      if (assets.length > 0) {
        const imageURLs = await uploadListingImages(listingId, assets);
        await setListingImages(listingId, imageURLs);
      }

      logEvent(ANALYTICS_EVENTS.LISTING_CREATE_SUCCESS, {
        listing_id: listingId,
        category: form.category || '',
      });
      navigation.goBack();
    } catch (error) {
      setSubmitError(error.message);
      Alert.alert('Ilan kaydedilemedi', error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function renderSelect({name, label, options, placeholder, required}) {
    return (
      <ListingSelectField
        label={label}
        open={openSelect === name}
        options={options}
        placeholder={placeholder}
        required={required}
        value={form[name]}
        errorText={errors[name]}
        onToggle={() => setOpenSelect(current => (current === name ? null : name))}
        onSelect={option => {
          updateField(name, option.firestoreValue || option.key);
          setOpenSelect(null);
        }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}>
        <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <StepIndicator activeStep={activeStep} />

        <Animated.View
          style={[
            styles.stepBody,
            {
              opacity: stepMotion,
              transform: [
                {
                  translateX: stepMotion.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            },
          ]}>
          {activeStep === 0 ? (
            <>
              <ListingFormSection title="Fotoğraflar">
                <ListingPhotoPicker
                  assets={assets}
                  errorText={errors.images}
                  onPick={handlePickImages}
                  onRemove={removeAsset}
                />
              </ListingFormSection>

              <ListingFormSection title="Temel Bilgiler">
                <ListingTextField
                  required
                  errorText={errors.title}
                  label="Başlık"
                  onChangeText={value => updateField('title', value)}
                  placeholder="Çalışma Masası"
                  value={form.title}
                />
                <ListingTextField
                  multiline
                  required
                  errorText={errors.description}
                  label="Açıklama"
                  maxLength={500}
                  onChangeText={value => updateField('description', value)}
                  placeholder="Ürünün durumunu ve detaylarını anlat..."
                  value={form.description}
                />
                <View style={styles.twoColumn}>
                  <View style={styles.column}>
                    {renderSelect({
                      name: 'category',
                      label: 'Kategori',
                      options: MARKET_CATEGORIES,
                      placeholder: 'Kategori seç',
                      required: true,
                    })}
                  </View>
                  <View style={styles.column}>
                    <ListingTextField
                      label="Alt Kategori"
                      onChangeText={value => updateField('subCategory', value)}
                      placeholder="Masa"
                      value={form.subCategory}
                    />
                  </View>
                </View>
                {renderSelect({
                  name: 'condition',
                  label: 'Durum',
                  options: MARKET_CONDITIONS,
                  placeholder: 'Durum seç',
                  required: true,
                })}
                <View style={styles.twoColumn}>
                  <View style={styles.column}>
                    <ListingTextField
                      required
                      errorText={errors.price}
                      keyboardType="decimal-pad"
                      label="Fiyat"
                      onChangeText={value => updateField('price', value)}
                      placeholder="1250"
                      value={form.price}
                    />
                  </View>
                  <View style={styles.column}>
                    {renderSelect({
                      name: 'currency',
                      label: 'Para Birimi',
                      options: LISTING_CURRENCIES,
                      placeholder: 'TRY',
                    })}
                  </View>
                </View>
              </ListingFormSection>
            </>
          ) : null}

        {activeStep === 1 ? (
          <>
        <ListingFormSection title="Detaylı Bilgiler">
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <ListingTextField label="Marka" value={form.brand} onChangeText={value => updateField('brand', value)} placeholder="IKEA" />
            </View>
            <View style={styles.column}>
              <ListingTextField label="Model" value={form.model} onChangeText={value => updateField('model', value)} placeholder="Linnmon" />
            </View>
          </View>
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <ListingTextField label="Renk" value={form.color} onChangeText={value => updateField('color', value)} placeholder="Açık Ahşap" />
            </View>
            <View style={styles.column}>
              <ListingTextField label="Materyal" value={form.material} onChangeText={value => updateField('material', value)} placeholder="Ahşap" />
            </View>
          </View>
          <ListingTextField label="Boyut" value={form.dimensions} onChangeText={value => updateField('dimensions', value)} placeholder="120 x 60 x 75 cm" />
          <ListingTextField label="Kullanım Süresi" value={form.usageDuration} onChangeText={value => updateField('usageDuration', value)} placeholder="1 yıl" />
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              {renderSelect({name: 'warranty', label: 'Garanti', options: LISTING_BOOLEAN_OPTIONS, placeholder: 'Belirtilmedi'})}
            </View>
            <View style={styles.column}>
              {renderSelect({name: 'invoice', label: 'Fatura', options: LISTING_BOOLEAN_OPTIONS, placeholder: 'Belirtilmedi'})}
            </View>
          </View>
          {renderSelect({name: 'originalBox', label: 'Orijinal Kutu', options: LISTING_BOOLEAN_OPTIONS, placeholder: 'Belirtilmedi'})}
        </ListingFormSection>

        <ListingFormSection title="Kargo ve Ödeme">
          <Text style={styles.fieldTitle}>Teslimat Tercihi</Text>
          <ListingSegmentedControl
            options={LISTING_DELIVERY_OPTIONS}
            value={form.deliveryPreference}
            onChange={value => updateField('deliveryPreference', value)}
          />
          <Text style={styles.fieldTitle}>Kargoyu Kim Öder</Text>
          <ListingSegmentedControl
            options={LISTING_SHIPPING_PAYER_OPTIONS}
            value={form.shippingPayer}
            onChange={value => updateField('shippingPayer', value)}
          />
          <ListingPaymentSelector
            errorText={errors.paymentMethods}
            value={form.paymentMethods}
            onChange={value => updateField('paymentMethods', value)}
          />
          <Text style={styles.fieldTitle}>Satıcı Tipi</Text>
          <ListingSegmentedControl
            options={LISTING_SELLER_TYPES}
            value={form.sellerType}
            onChange={value => updateField('sellerType', value)}
          />
        </ListingFormSection>
          </>
        ) : null}

        {activeStep === 2 ? (
          <>
        <ListingFormSection title="Konum">
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <ListingTextField required errorText={errors.city} label="İl" value={form.city} onChangeText={value => updateField('city', value)} placeholder="İstanbul" />
            </View>
            <View style={styles.column}>
              <ListingTextField required errorText={errors.district} label="İlçe" value={form.district} onChangeText={value => updateField('district', value)} placeholder="Kadıköy" />
            </View>
          </View>
          <ListingTextField label="Mahalle / Detaylı Konum" value={form.neighborhood} onChangeText={value => updateField('neighborhood', value)} placeholder="Moda, Caferağa Mah." />
        </ListingFormSection>

        <ListingFormSection title="Durum ve Yayınlama">
          <Text style={styles.fieldTitle}>İlan Durumu</Text>
          <ListingSegmentedControl
            options={LISTING_STATUS_OPTIONS}
            value={form.status}
            onChange={value => updateField('status', value)}
          />
          <ListingSwitchRow
            title="Fiyat pazarlığa açık"
            value={form.negotiable}
            onValueChange={value => updateField('negotiable', value)}
          />
          <ListingTextField label="Etiketler" value={form.tags} onChangeText={value => updateField('tags', value)} placeholder="masa, ahşap, çalışma" />
        </ListingFormSection>
          </>
        ) : null}
        </Animated.View>

        {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        {activeStep > 0 ? (
          <Pressable onPress={() => goToStep(activeStep - 1)} style={styles.backStepButton}>
            <Text style={styles.backStepText}>Geri</Text>
          </Pressable>
        ) : null}
        <Pressable
          disabled={submitting}
          onPress={activeStep === FORM_STEPS.length - 1 ? handleSubmit : () => goToStep(activeStep + 1)}
          style={styles.submitWrap}>
          <LinearGradient colors={['#4F46E5', '#6D28D9']} style={styles.submitButton}>
            <Text style={styles.submitText}>
              {activeStep === FORM_STEPS.length - 1
                ? submitting
                  ? 'Yayınlanıyor...'
                  : 'İlanı Yayınla'
                : 'Devam Et'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function StepIndicator({activeStep}) {
  return (
    <View style={styles.stepRow}>
      {FORM_STEPS.map((step, index) => {
        const active = activeStep === index;
        return (
          <View key={step} style={[styles.stepPill, active && styles.stepPillActive]}>
            <Text style={[styles.stepText, active && styles.stepTextActive]}>
              {index + 1}. {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#F8FAFC'},
  content: {gap: 14, padding: 16, paddingBottom: 118},
  stepBody: {gap: 14},
  stepRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  stepPill: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 11,
    borderRadius: 17,
    backgroundColor: '#E2E8F0',
  },
  stepPillActive: {backgroundColor: '#4F46E5'},
  stepText: {color: '#475569', fontSize: 12, fontWeight: '800'},
  stepTextActive: {color: '#FFFFFF'},
  twoColumn: {flexDirection: 'row', gap: 10},
  column: {flex: 1, minWidth: 0},
  fieldTitle: {color: '#64748B', fontSize: 12, fontWeight: '800'},
  error: {color: '#DC2626', fontSize: 13, fontWeight: '800'},
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backStepButton: {
    flex: 1,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  backStepText: {color: '#4F46E5', fontSize: 15, fontWeight: '900'},
  submitWrap: {flex: 2, overflow: 'hidden', borderRadius: 14},
  submitButton: {minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 14},
  submitText: {color: '#FFFFFF', fontSize: 15, fontWeight: '900'},
});

export default CreateListingScreen;
