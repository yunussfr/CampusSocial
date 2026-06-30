import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export function UserProfileScreen({ route }) {
  const { followProfile, unfollowProfile } = useAuth();
  const [following, setFollowing] = useState(false);
  const [saving, setSaving] = useState(false);
  const userProfile = route.params?.userProfile;
  const userId = route.params?.userId || userProfile?.uid;

  async function handleToggleFollow() {
    setSaving(true);

    try {
      if (following) {
        await unfollowProfile(userId);
        setFollowing(false);
      } else {
        await followProfile(userId);
        setFollowing(true);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {userProfile?.displayName || 'Kullanici Profili'}
      </Text>
      <Text style={styles.subtitle}>{userProfile?.department || userId}</Text>
      <Text style={styles.body}>{userProfile?.bio || 'Profil bilgisi yok.'}</Text>
      {userId ? (
        <Pressable
          disabled={saving}
          onPress={handleToggleFollow}
          style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>
            {saving ? 'Isleniyor...' : following ? 'Takibi Birak' : 'Takip Et'}
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  title: {
    color: '#0B1C30',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 15,
  },
  body: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#004AC6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
