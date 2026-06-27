import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export function RegisterScreen({ navigation }) {
  const { error, register } = useAuth();
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
        profile: {
          displayName,
        },
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hesap Olustur</Text>
      <Text style={styles.subtitle}>Profilini sonraki adimda tamamlayacaksin.</Text>

      <View style={styles.form}>
        <TextInput
          autoCorrect={false}
          onChangeText={setDisplayName}
          placeholder="Ad Soyad"
          spellCheck={false}
          style={styles.input}
          textContentType="name"
          value={displayName}
        />
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          spellCheck={false}
          style={styles.input}
          textContentType="emailAddress"
          value={email}
        />
        <TextInput
          autoCapitalize="none"
          autoComplete="new-password"
          autoCorrect={false}
          onChangeText={setPassword}
          placeholder="Sifre"
          secureTextEntry
          spellCheck={false}
          style={styles.input}
          textContentType="newPassword"
          value={password}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          disabled={submitting}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed || submitting ? styles.pressed : null,
          ]}>
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Kaydol</Text>
          )}
        </Pressable>
      </View>

      <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
        <Text style={styles.linkText}>Zaten hesabim var</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  title: {
    color: '#0B1C30',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
    marginBottom: 28,
  },
  form: {
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
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#004AC6',
  },
  pressed: {
    opacity: 0.72,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkText: {
    color: '#004AC6',
    fontSize: 15,
    fontWeight: '600',
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
  },
});
