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

export function ProfileCompletionScreen() {
  const { completeProfile, error, logout, profile, user } = useAuth();
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
    <View style={styles.container}>
      <Text style={styles.title}>Profilini Tamamla</Text>
      <Text style={styles.subtitle}>Ana uygulamaya gecmeden once temel bilgilerini ekle.</Text>

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
          autoCorrect={false}
          onChangeText={setDepartment}
          placeholder="Bolum / Fakulte"
          spellCheck={false}
          style={styles.input}
          value={department}
        />
        <TextInput
          keyboardType="number-pad"
          onChangeText={setYear}
          placeholder="Sinif"
          style={styles.input}
          value={year}
        />
        <TextInput
          autoCorrect={false}
          onChangeText={setInterests}
          placeholder="Ilgi alanlari, virgulle ayir"
          spellCheck={false}
          style={styles.input}
          value={interests}
        />
        <TextInput
          multiline
          autoCorrect={false}
          onChangeText={setBio}
          placeholder="Kisa bio"
          spellCheck={false}
          style={[styles.input, styles.bioInput]}
          value={bio}
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
            <Text style={styles.primaryButtonText}>Profili Kaydet</Text>
          )}
        </Pressable>
      </View>

      <Pressable onPress={logout} style={styles.linkButton}>
        <Text style={styles.linkText}>Cikis yap</Text>
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
    marginBottom: 24,
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
  bioInput: {
    minHeight: 92,
    paddingTop: 12,
    textAlignVertical: 'top',
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
