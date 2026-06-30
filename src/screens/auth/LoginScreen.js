import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppInput, Card, PageIntro, Screen } from '../../components/ui/DesignSystem';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function LoginScreen({ navigation }) {
  const { error, login } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);

    try {
      await login(email, password);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen scroll style={styles.container}>
      <View style={[styles.logo, { borderColor: theme.colors.primary }]} />
      <PageIntro title="CampusVibe" subtitle="Kampus hesabina giris yap." />
      <Card style={styles.form}>
        <AppInput
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          spellCheck={false}
          textContentType="emailAddress"
          value={email}
        />
        <AppInput
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          onChangeText={setPassword}
          placeholder="Sifre"
          secureTextEntry
          spellCheck={false}
          textContentType="password"
          value={password}
        />
        {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}
        <AppButton disabled={submitting} onPress={handleSubmit}>
          {submitting ? <ActivityIndicator color="#FFFFFF" /> : 'Giris Yap'}
        </AppButton>
      </Card>
      <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.linkButton}>
        <Text style={[styles.linkText, { color: theme.colors.primary }]}>Sifremi unuttum</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkButton}>
        <Text style={[styles.linkText, { color: theme.colors.primary }]}>Yeni hesap olustur</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: 12,
    paddingTop: 88,
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 999,
    borderWidth: 2,
  },
  form: {
    gap: 12,
    padding: 16,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '700',
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
  },
});
