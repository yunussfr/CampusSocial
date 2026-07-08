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
  mdiAccountCheckOutline,
  mdiAccountOutline,
  mdiChevronRight,
  mdiEmailOutline,
  mdiEyeOffOutline,
  mdiLockOutline,
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

export function RegisterScreen({navigation}) {
  const {error, register} = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);

    try {
      await register({
        email,
        password,
        profile: {displayName},
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
        <BrandMark />
        <Text style={styles.brandTitle}>CampusMerge</Text>
        <Text style={styles.brandSubtitle}>Kampüs hesabıma giriş yap.</Text>

        <Text style={styles.title}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>Profilini sonraki adımda tamamlayacaksın.</Text>

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
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            icon={mdiEmailOutline}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            spellCheck={false}
            textContentType="emailAddress"
            value={email}
          />
          <AuthInput
            autoCapitalize="none"
            autoComplete="new-password"
            autoCorrect={false}
            icon={mdiLockOutline}
            onChangeText={setPassword}
            placeholder="Şifre"
            rightIcon={mdiEyeOffOutline}
            secureTextEntry
            spellCheck={false}
            textContentType="newPassword"
            value={password}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton disabled={submitting} onPress={handleSubmit}>
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : 'Kaydol'}
          </PrimaryButton>
        </View>

        <Pressable onPress={() => navigation.navigate('Login')} style={styles.bottomLink}>
          <MdiIcon path={mdiAccountCheckOutline} size={30} color={COLORS.primary} />
          <Text style={styles.bottomLinkText}>Zaten hesabım var</Text>
          <MdiIcon path={mdiChevronRight} size={24} color={COLORS.primary} />
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
        <Text style={styles.logoText}>M</Text>
      </LinearGradient>
      <Text style={[styles.sparkle, styles.sparkleLeft]}>✦</Text>
      <Text style={[styles.sparkle, styles.sparkleRight]}>✦</Text>
    </View>
  );
}

function AuthInput({icon, rightIcon, style, ...props}) {
  return (
    <View style={[styles.inputShell, style]}>
      <MdiIcon path={icon} size={27} color={COLORS.primary} />
      <TextInput
        {...props}
        placeholderTextColor={COLORS.placeholder}
        style={styles.input}
      />
      {rightIcon ? <MdiIcon path={rightIcon} size={27} color={COLORS.placeholder} /> : null}
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
  logoHalo: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  logo: {
    width: 118,
    height: 118,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: '#FFFFFF',
    borderRadius: 59,
    shadowColor: COLORS.accent,
    shadowOffset: {width: 0, height: 18},
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 50,
    fontWeight: '900',
  },
  sparkle: {
    position: 'absolute',
    color: COLORS.accent,
    fontSize: 22,
    fontWeight: '900',
  },
  sparkleLeft: {
    left: -36,
    bottom: 20,
  },
  sparkleRight: {
    right: -34,
    top: 9,
    color: COLORS.primary,
  },
  brandTitle: {
    color: COLORS.text,
    fontSize: 39,
    lineHeight: 47,
    fontWeight: '900',
    textAlign: 'center',
  },
  brandSubtitle: {
    marginTop: 8,
    color: COLORS.muted,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '500',
    textAlign: 'center',
  },
  title: {
    marginTop: 40,
    color: COLORS.text,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 34,
    color: COLORS.muted,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    gap: 20,
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
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
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
    fontWeight: '700',
  },
  bottomLink: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 42,
  },
  bottomLinkText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
});
