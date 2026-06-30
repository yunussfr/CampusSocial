import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { AppButton, AppInput, Card, PageIntro, Screen } from '../../components/ui/DesignSystem';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function RegisterScreen({ navigation }) {
  const { error, register } = useAuth();
  const { theme } = useTheme();
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
        profile: { displayName },
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen scroll style={styles.container}>
      <PageIntro title="Hesap Olustur" subtitle="Profilini sonraki adimda tamamlayacaksin." />
      <Card style={styles.form}>
        <AppInput autoCorrect={false} onChangeText={setDisplayName} placeholder="Ad Soyad" spellCheck={false} textContentType="name" value={displayName} />
        <AppInput autoCapitalize="none" autoComplete="email" autoCorrect={false} keyboardType="email-address" onChangeText={setEmail} placeholder="Email" spellCheck={false} textContentType="emailAddress" value={email} />
        <AppInput autoCapitalize="none" autoComplete="new-password" autoCorrect={false} onChangeText={setPassword} placeholder="Sifre" secureTextEntry spellCheck={false} textContentType="newPassword" value={password} />
        {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}
        <AppButton disabled={submitting} onPress={handleSubmit}>
          {submitting ? <ActivityIndicator color="#FFFFFF" /> : 'Kaydol'}
        </AppButton>
      </Card>
      <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
        <Text style={[styles.linkText, { color: theme.colors.primary }]}>Zaten hesabim var</Text>
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
