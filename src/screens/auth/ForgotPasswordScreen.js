import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export function ForgotPasswordScreen({ navigation }) {
  const { error, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    await resetPassword(email);
    setSent(true);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sifre Sifirla</Text>
      <Text style={styles.subtitle}>Email adresine sifirlama baglantisi gonderilir.</Text>
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
      {sent ? <Text style={styles.success}>Sifirlama emaili gonderildi.</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={handleSubmit} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Gonder</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
        <Text style={styles.linkText}>Giris ekranina don</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  title: {
    color: '#0B1C30',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
    marginBottom: 16,
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
  success: {
    color: '#047857',
    fontSize: 14,
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
  },
});
