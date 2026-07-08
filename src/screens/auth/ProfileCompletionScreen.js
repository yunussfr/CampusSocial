import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  mdiAccountOutline,
  mdiBookOpenPageVariantOutline,
  mdiExitToApp,
  mdiNumeric,
  mdiPencilOutline,
  mdiSchoolOutline,
  mdiStarOutline,
} from '@mdi/js';
import {MdiIcon} from '../../components/ui/MdiIcon';
import {useAuth} from '../../context/AuthContext';

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0B1C30',
  muted: '#64748B',
  placeholder: '#94A3B8',
  primary: '#2563EB',
  accent: '#7C3AED',
  border: '#E2E8F0',
  danger: '#DC2626',
};

export function ProfileCompletionScreen() {
  const {completeProfile, error, logout, profile, user} = useAuth();
  const [displayName, setDisplayName] = useState(
    profile?.displayName || user?.displayName || '',
  );
  const [department, setDepartment] = useState(profile?.department || '');
  const [year, setYear] = useState(profile?.year ? String(profile.year) : '');
  const [interests, setInterests] = useState(
    profile?.interests?.join(', ') || '',
  );
  const [bio, setBio] = useState(profile?.bio || '');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);

    try {
      await completeProfile({
        displayName,
        department,
        year,
        interests: interests
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
        bio,
        photoURL: profile?.photoURL || '',
        fcmToken: profile?.fcmToken || null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}>
      <Decorations />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <BrandMark />
          <View>
            <Text style={styles.brandTitle}>CampusMerge</Text>
            <Text style={styles.brandSubtitle}>Kampüs hesabına giriş yap.</Text>
          </View>
        </View>

        <Text style={styles.title}>Profilini Tamamla</Text>
        <Text style={styles.subtitle}>
          Ana uygulamaya geçmeden önce temel bilgilerini ekle.
        </Text>

        <View style={styles.card}>
          <AuthInput
            autoCorrect={false}
            icon={mdiAccountOutline}
            onChangeText={setDisplayName}
            placeholder="Ad Soyad"
            spellCheck={false}
            textContentType="name"
            value={displayName}
          />
          <AuthInput
            autoCorrect={false}
            icon={mdiSchoolOutline}
            onChangeText={setDepartment}
            placeholder="Bölüm / Fakülte"
            spellCheck={false}
            value={department}
          />
          <AuthInput
            icon={mdiNumeric}
            keyboardType="number-pad"
            onChangeText={setYear}
            placeholder="Sınıf"
            value={year}
          />
          <AuthInput
            autoCorrect={false}
            icon={mdiStarOutline}
            onChangeText={setInterests}
            placeholder="İlgi alanları, virgülle ayır"
            spellCheck={false}
            value={interests}
          />
          <AuthInput
            autoCorrect={false}
            icon={mdiPencilOutline}
            multiline
            onChangeText={setBio}
            placeholder="Kısa bio"
            spellCheck={false}
            style={styles.bioInputShell}
            textAlignVertical="top"
            value={bio}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton disabled={submitting} onPress={handleSubmit}>
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : 'Profili Kaydet'}
          </PrimaryButton>
        </View>

        <Pressable onPress={logout} style={styles.bottomLink}>
          <MdiIcon path={mdiExitToApp} size={30} color={COLORS.primary} />
          <Text style={styles.bottomLinkText}>Çıkış yap</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Decorations() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.topBlob} />
      <View style={styles.bottomBlob} />
      <View style={styles.dotGrid}>
        {Array.from({length: 24}).map((_, index) => (
          <View key={index} style={styles.dot} />
        ))}
      </View>
    </View>
  );
}

function BrandMark() {
  return (
    <View style={styles.logoHalo}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.logo}>
        <MdiIcon path={mdiBookOpenPageVariantOutline} size={42} color="#FFFFFF" />
      </LinearGradient>
      <Text style={[styles.sparkle, styles.sparkleLeft]}>✦</Text>
      <Text style={[styles.sparkle, styles.sparkleRight]}>✦</Text>
    </View>
  );
}

function AuthInput({icon, multiline, style, ...props}) {
  return (
    <View style={[styles.inputShell, multiline && styles.multilineShell, style]}>
      <MdiIcon path={icon} size={27} color={COLORS.primary} />
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={COLORS.placeholder}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

function PrimaryButton({children, disabled, onPress}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.primaryButton,
        (pressed || disabled) && styles.pressed,
      ]}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        start={{x: 0, y: 0.5}}
        end={{x: 1, y: 0.5}}
        style={styles.primaryGradient}>
        {typeof children === 'string' ? (
          <Text style={styles.primaryText}>{children}</Text>
        ) : (
          children
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 42,
  },
  topBlob: {
    position: 'absolute',
    top: -68,
    right: -54,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  bottomBlob: {
    position: 'absolute',
    left: -42,
    right: -42,
    bottom: -96,
    height: 210,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 220,
    backgroundColor: 'rgba(37,99,235,0.06)',
  },
  dotGrid: {
    position: 'absolute',
    top: 88,
    left: 28,
    width: 130,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(37,99,235,0.13)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 48,
  },
  logoHalo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 7,
    borderColor: '#FFFFFF',
    borderRadius: 28,
    shadowColor: COLORS.accent,
    shadowOffset: {width: 0, height: 14},
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 7,
  },
  sparkle: {
    position: 'absolute',
    color: COLORS.accent,
    fontSize: 20,
    fontWeight: '900',
  },
  sparkleLeft: {
    left: -28,
    bottom: 18,
  },
  sparkleRight: {
    right: -30,
    top: -6,
    color: COLORS.primary,
  },
  brandTitle: {
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '900',
  },
  brandSubtitle: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '500',
  },
  title: {
    color: COLORS.text,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 14,
    marginBottom: 32,
    color: COLORS.muted,
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '500',
  },
  card: {
    gap: 18,
    padding: 22,
    borderRadius: 30,
    backgroundColor: COLORS.card,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 18},
    shadowOpacity: 0.08,
    shadowRadius: 26,
    elevation: 5,
  },
  inputShell: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.card,
  },
  multilineShell: {
    minHeight: 124,
    alignItems: 'flex-start',
    paddingTop: 18,
  },
  bioInputShell: {
    minHeight: 132,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  multilineInput: {
    minHeight: 92,
    paddingTop: 0,
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 18,
    shadowColor: COLORS.accent,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  primaryGradient: {
    minHeight: 66,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.76,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  bottomLink: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 34,
  },
  bottomLinkText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
});
