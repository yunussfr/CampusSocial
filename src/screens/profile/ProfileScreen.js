import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton, Card, Screen } from '../../components/ui/DesignSystem';
import { getProfilePlaceholder, IMAGES } from '../../constants/assets';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function ProfileScreen({ navigation }) {
  const { profile } = useAuth();
  const { theme } = useTheme();

  return (
    <Screen scroll style={styles.container}>
      <View
        style={[
          styles.banner,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
          },
        ]}>
        <View style={styles.avatarWrap}>
          <Image
            source={
              profile?.photoURL
                ? { uri: profile.photoURL }
                : getProfilePlaceholder(profile)
            }
            style={styles.avatar}
          />
        </View>
        <Text style={styles.bannerTitle}>{profile?.displayName || 'Profil'}</Text>
        <Text style={styles.bannerSubtitle}>
          {profile?.department || '-'} {profile?.year ? `- ${profile.year}. sınıf` : ''}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <Stat label="Takipci" value={profile?.followersCount || 0} />
        <Stat label="Takip" value={profile?.followingCount || 0} />
        <Stat label="İlgileri" value={profile?.interests?.length || 0} />
      </View>

      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Hakkinda</Text>
        <Text style={[styles.body, { color: theme.colors.mutedText }]}>
          {profile?.bio || 'Bio eklenmemis.'}
        </Text>
        {profile?.interests?.length ? (
          <View style={styles.interests}>
            {profile.interests.map(interest => (
              <View
                key={interest}
                style={[styles.interestChip, { backgroundColor: theme.colors.primarySoft }]}>
                <Text style={[styles.interestText, { color: theme.colors.primary }]}>
                  {interest}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>

      <View style={styles.actions}>
        <AppButton onPress={() => navigation.navigate(ROUTES.EDIT_PROFILE)}>
          Profili Duzenle
        </AppButton>
        <AppButton onPress={() => navigation.navigate(ROUTES.SETTINGS)} variant="secondary">
          Ayarlar
        </AppButton>
        <AppButton onPress={()=> navigation.navigate(ROUTES.NOTIFICATIONS)} variant="secondary">
          Bildirimler
        </AppButton>
      </View>
    </Screen>
  );
}

function Stat({ label, value }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.subtleText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingTop: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  banner: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 22,
    elevation: 4,
  },
  avatarWrap: {
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  bannerTitle: {
    color: '#c1b6b6',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '900',
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.84)',
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  card: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  interestChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  interestText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  actions: {
    gap: 10,
  },
});
