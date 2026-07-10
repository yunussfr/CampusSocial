import DateTimePicker from '@react-native-community/datetimepicker';
import React, {useEffect, useMemo, useState} from 'react';
import {
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {mdiArrowLeft} from '@mdi/js';
import {launchImageLibrary} from 'react-native-image-picker';

import {MdiIcon} from '../../components/ui/MdiIcon';
import {useAnalytics} from '../../context/AnalyticsContext';
import {useAuth} from '../../context/AuthContext';
import {useEvents} from '../../context/EventContext';
import {uploadEventCover} from '../../services/storageService';
import {ANALYTICS_EVENTS} from '../../services/analyticsService';

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

const DEFAULT_REGION = {
  latitude: 41.0082,
  longitude: 28.9784,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const STEPS = ['Bilgiler', 'Zaman ve Konum', 'Yayın'];

export function CreateEventScreen({navigation}) {
  const stepMotion = useMemo(() => new Animated.Value(1), []);
  const {logEvent} = useAnalytics();
  const {profile, user} = useAuth();
  const {addEvent, setEventCover} = useEvents();
  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const [startDate, setStartDate] = useState(() => {
    const nextDate = new Date();
    nextDate.setMinutes(0, 0, 0);
    nextDate.setHours(nextDate.getHours() + 1);
    return nextDate;
  });
  const [endDate, setEndDate] = useState(() => {
    const nextDate = new Date();
    nextDate.setMinutes(0, 0, 0);
    nextDate.setHours(nextDate.getHours() + 2);
    return nextDate;
  });
  const [activePicker, setActivePicker] = useState(null);
  const [capacity, setCapacity] = useState('');
  const [coverAsset, setCoverAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    stepMotion.setValue(0);
    Animated.timing(stepMotion, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [activeStep, stepMotion]);

  function goToStep(step) {
    setError(null);
    setActiveStep(Math.max(0, Math.min(STEPS.length - 1, step)));
  }

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

    if (!location) {
      setSubmitting(false);
      setError('Lütfen haritadan etkinlik konumu seç.');
      goToStep(1);
      return;
    }

    if (endDate <= startDate) {
      setSubmitting(false);
      setError('Bitiş tarihi başlangıç tarihinden sonra olmalı.');
      goToStep(1);
      return;
    }

    try {
      const eventId = await addEvent(
        {
          title,
          description,
          category,
          location,
          locationLabel: formatCoordinate(location),
          capacity,
          startDate,
          endDate,
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

      logEvent(ANALYTICS_EVENTS.EVENT_CREATE_SUCCESS, {
        event_id: eventId,
        category,
      });
      navigation.goBack();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDateChange(event, selectedDate) {
    if (Platform.OS === 'android') {
      setActivePicker(null);
    }

    if (!selectedDate || event.type === 'dismissed') {
      return;
    }

    if (activePicker?.target === 'start') {
      setStartDate(selectedDate);

      if (selectedDate >= endDate) {
        const nextEndDate = new Date(selectedDate);
        nextEndDate.setHours(nextEndDate.getHours() + 1);
        setEndDate(nextEndDate);
      }
    } else {
      setEndDate(selectedDate);
    }
  }

  function handleMapPress(event) {
    const coordinate = event.nativeEvent.coordinate;

    setLocation(coordinate);
    setMapRegion(currentRegion => ({
      ...currentRegion,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    }));
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <MdiIcon path={mdiArrowLeft} size={24} color="#0B1C30" />
        </Pressable>
        <Text style={styles.title}>Etkinlik Oluştur</Text>
        <Text style={styles.subtitle}>Temel etkinlik bilgilerini ekle.</Text>
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
          {activeStep === 0 ? renderInfoStep() : null}
          {activeStep === 1 ? renderTimeLocationStep() : null}
          {activeStep === 2 ? renderPublishStep() : null}
        </Animated.View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        {activeStep > 0 ? (
          <Pressable onPress={() => goToStep(activeStep - 1)} style={styles.secondaryFooterButton}>
            <Text style={styles.secondaryFooterText}>Geri</Text>
          </Pressable>
        ) : null}
        <Pressable
          disabled={submitting}
          onPress={activeStep === STEPS.length - 1 ? handleSubmit : () => goToStep(activeStep + 1)}
          style={styles.primaryFooterButton}>
          <Text style={styles.primaryButtonText}>
            {activeStep === STEPS.length - 1
              ? submitting
                ? 'Kaydediliyor...'
                : 'Etkinliği Kaydet'
              : 'Devam Et'}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  function renderInfoStep() {
    return (
      <>
        <TextInput
          autoCorrect={false}
          onChangeText={setTitle}
          placeholder="Başlık"
          spellCheck={false}
          style={styles.input}
          value={title}
        />
        <TextInput
          multiline
          autoCorrect={false}
          onChangeText={setDescription}
          placeholder="Açıklama"
          spellCheck={false}
          style={[styles.input, styles.multilineInput]}
          value={description}
        />
        <Pressable
          onPress={() => setShowCategories(prev => !prev)}
          style={[styles.input, styles.categorySelector]}>
          <Text
            style={[
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
                <Text
                  style={[
                    styles.categoryOptionText,
                    category === cat && styles.categoryOptionTextActive,
                  ]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </>
    );
  }

  function renderTimeLocationStep() {
    return (
      <>
        <View style={styles.dateSection}>
          <DateButton label="Başlangıç tarihi" value={formatDate(startDate)} onPress={() => setActivePicker({target: 'start', mode: 'date'})} />
          <DateButton label="Başlangıç saati" value={formatTime(startDate)} onPress={() => setActivePicker({target: 'start', mode: 'time'})} />
          <DateButton label="Bitiş tarihi" value={formatDate(endDate)} onPress={() => setActivePicker({target: 'end', mode: 'date'})} />
          <DateButton label="Bitiş saati" value={formatTime(endDate)} onPress={() => setActivePicker({target: 'end', mode: 'time'})} />
        </View>

        {activePicker ? (
          <DateTimePicker
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={activePicker.target === 'end' ? startDate : undefined}
            mode={activePicker.mode}
            onChange={handleDateChange}
            value={activePicker.target === 'start' ? startDate : endDate}
          />
        ) : null}

        <View style={styles.mapSection}>
          <Text style={styles.mapTitle}>Konumu haritadan seç</Text>
          <Text style={styles.mapSubtitle}>
            Etkinlik konumu elle yazılmaz. Haritada etkinliğin yapılacağı noktaya dokun.
          </Text>
          <MapView
            initialRegion={DEFAULT_REGION}
            onPress={handleMapPress}
            onRegionChangeComplete={setMapRegion}
            region={mapRegion}
            style={styles.map}>
            {location ? <Marker coordinate={location} /> : null}
          </MapView>
          <Text style={styles.selectedLocation}>
            {location
              ? `Seçilen konum: ${formatCoordinate(location)}`
              : 'Henüz konum seçilmedi.'}
          </Text>
        </View>
      </>
    );
  }

  function renderPublishStep() {
    return (
      <>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setCapacity}
          placeholder="Kapasite"
          style={styles.input}
          value={capacity}
        />
        <Pressable onPress={handlePickCover} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>
            {coverAsset ? 'Cover değiştir' : 'Cover seç'}
          </Text>
        </Pressable>
        {coverAsset?.uri ? (
          <Image source={{uri: coverAsset.uri}} style={styles.coverPreview} />
        ) : null}
        <Text style={styles.note}>Cover görseli Storage'a yüklenir.</Text>
      </>
    );
  }
}

function StepIndicator({activeStep}) {
  return (
    <View style={styles.stepRow}>
      {STEPS.map((step, index) => {
        const active = index === activeStep;
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

function DateButton({label, onPress, value}) {
  return (
    <Pressable onPress={onPress} style={styles.dateButton}>
      <Text style={styles.dateLabel}>{label}</Text>
      <Text style={styles.dateValue}>{value}</Text>
    </Pressable>
  );
}

function formatDate(date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatCoordinate(coordinate) {
  return `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    gap: 12,
    padding: 24,
    paddingBottom: 118,
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
  subtitle: {
    color: '#64748B',
    fontSize: 15,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  stepPill: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 11,
    borderRadius: 17,
    backgroundColor: '#E2E8F0',
  },
  stepPillActive: {
    backgroundColor: '#004AC6',
  },
  stepText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
  },
  stepTextActive: {
    color: '#FFFFFF',
  },
  stepBody: {
    gap: 12,
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
    minHeight: 48,
  },
  categorySelectorText: {
    flex: 1,
    color: '#0B1C30',
    fontSize: 14,
  },
  categoryPlaceholder: {
    color: '#94A3B8',
  },
  categoryArrow: {
    marginLeft: 8,
    color: '#64748B',
    fontSize: 11,
  },
  categoryDropdown: {
    overflow: 'hidden',
    marginTop: -8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
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
    color: '#334155',
    fontSize: 14,
  },
  categoryOptionTextActive: {
    color: '#004AC6',
    fontWeight: '700',
  },
  dateSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dateButton: {
    flexGrow: 1,
    minWidth: '47%',
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  dateLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  dateValue: {
    marginTop: 3,
    color: '#0B1C30',
    fontSize: 14,
    fontWeight: '800',
  },
  mapSection: {
    gap: 8,
  },
  mapTitle: {
    color: '#0B1C30',
    fontSize: 16,
    fontWeight: '800',
  },
  mapSubtitle: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  map: {
    width: '100%',
    height: 230,
    borderRadius: 12,
  },
  selectedLocation: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
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
  error: {
    color: '#DC2626',
    fontSize: 14,
  },
  note: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
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
  secondaryFooterButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  secondaryFooterText: {
    color: '#004AC6',
    fontSize: 15,
    fontWeight: '800',
  },
  primaryFooterButton: {
    flex: 2,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#004AC6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
