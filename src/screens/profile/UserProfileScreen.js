import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useChats } from '../../context/ChatContext';

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0B1C30',
  muted: '#64748B',
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  accent: '#7C3AED',
  border: '#E2E8F0',
  success: '#16A34A',
  danger: '#DC2626',
};

function getDisplayName(userProfile) {
  return userProfile?.displayName || 'Kullanıcı Profili';
}

function getAvatarLetter(displayName) {
  return displayName?.trim?.().charAt(0).toUpperCase() || 'K';
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function formatStat(value) {
  if (typeof value !== 'number') {
    return '0';
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  }

  return String(value);
}

function StatItem({ icon, label, value }) {
  return (
    <View style={styles.statItem}>
      <View style={styles.statIconWrap}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{formatStat(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ icon, title, showAction }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleWrap}>
        <View style={styles.sectionIconWrap}>
          <Text style={styles.sectionIcon}>{icon}</Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {showAction ? <Text style={styles.sectionAction}>Tümünü Gör ›</Text> : null}
    </View>
  );
}

function CommunityCard({ item }) {
  const title = typeof item === 'string' ? item : item?.name || item?.title;
  const members = typeof item === 'string' ? null : item?.members || item?.memberCount;

  if (!title) {
    return null;
  }

  return (
    <View style={styles.communityCard}>
      <View style={styles.communityBadge}>
        <Text style={styles.communityBadgeText}>{getAvatarLetter(title)}</Text>
      </View>
      <Text style={styles.communityTitle} numberOfLines={2}>
        {title}
      </Text>
      {members ? (
        <Text style={styles.communityMeta}>{formatStat(members)} üye</Text>
      ) : null}
    </View>
  );
}

function ActivityCard({ item }) {
  const title = typeof item === 'string' ? item : item?.title || item?.name;
  const description =
    typeof item === 'string' ? null : item?.description || item?.body || item?.summary;
  const type = typeof item === 'string' ? 'Etkinlik' : item?.type || 'Etkinlik';
  const date = typeof item === 'string' ? null : item?.date || item?.createdAtLabel;

  if (!title) {
    return null;
  }

  return (
    <View style={styles.activityCard}>
      <View style={styles.activityImage}>
        <Text style={styles.activityImageText}>AI</Text>
      </View>
      <View style={styles.activityBody}>
        <View style={styles.activityTopRow}>
          <Text style={styles.activityTag}>{type}</Text>
          {date ? <Text style={styles.activityDate}>{date}</Text> : null}
        </View>
        <Text style={styles.activityTitle} numberOfLines={1}>
          {title}
        </Text>
        {description ? (
          <Text style={styles.activityDescription} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function UserProfileScreen({ route, navigation }) {
  const { followProfile, profile, unfollowProfile, user } = useAuth();
  const { startDirectChat } = useChats();
  const [following, setFollowing] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [saving, setSaving] = useState(false);
  const userProfile = route.params?.userProfile;
  const userId = route.params?.userId || userProfile?.uid;

  const displayName = getDisplayName(userProfile);
  const avatarLetter = getAvatarLetter(displayName);
  const interests = normalizeList(userProfile?.interests);
  const communities = normalizeList(userProfile?.communities);
  const recentActivities = normalizeList(
    userProfile?.recentEvents || userProfile?.activities,
  );
  const bio = userProfile?.bio || 'Profil bilgisi yok.';

  const profileMeta = useMemo(() => {
    const items = [];

    if (userProfile?.university) {
      items.push(userProfile.university);
    }

    if (userProfile?.department) {
      items.push(userProfile.department);
    }

    if (userProfile?.year) {
      items.push(`${userProfile.year}. Sınıf`);
    }

    return items;
  }, [userProfile]);

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

  async function handleMessagePress() {
    if (!user?.uid || !userId || startingChat) {
      return;
    }

    setStartingChat(true);

    try {
      const chatId = await startDirectChat({
        currentUser: {
          uid: user.uid,
          displayName: profile?.displayName || user.displayName || '',
          photoURL: profile?.photoURL || user.photoURL || '',
        },
        otherUser: {
          uid: userId,
          displayName: userProfile?.displayName || '',
          photoURL: userProfile?.photoURL || '',
        },
      });

      navigation?.navigate?.('ChatTab', {
        screen: ROUTES.CHAT_DETAIL,
        params: { chatId },
      });
    } catch (error) {
      Alert.alert('Mesaj açılamadı', error.message);
    } finally {
      setStartingChat(false);
    }
  }

  function handleGoBack() {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
  }

  const followButtonText = saving
    ? 'İşleniyor...'
    : following
      ? 'Takibi Bırak'
      : 'Takip Et';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroDecorTop} />
          <View style={styles.heroDecorBottom} />
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              onPress={handleGoBack}
              style={styles.headerIconButton}>
              <Text style={styles.headerIcon}>‹</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Kullanıcı Profili</Text>
            <View style={styles.headerActions}>
              <View style={styles.headerIconButton}>
                <Text style={styles.headerEmoji}>♡</Text>
              </View>
              <View style={styles.headerIconButton}>
                <Text style={styles.headerEmoji}>•••</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileRow}>
            <View style={styles.avatarOuter}>
              {userProfile?.photoURL ? (
                <Image source={{ uri: userProfile.photoURL }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarLetter}>{avatarLetter}</Text>
                </View>
              )}
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>{displayName}</Text>
              <Text style={styles.userId} numberOfLines={1}>
                {userProfile?.department || userId || 'Profil detayı'}
              </Text>
              {profileMeta.length ? (
                <Text style={styles.metaText} numberOfLines={2}>
                  {profileMeta.join('  •  ')}
                </Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.quoteText}>“ {bio}</Text>
        </View>

        <View style={styles.statsCard}>
          <StatItem
            icon="👥"
            label="Takipçi"
            value={userProfile?.followersCount || 0}
          />
          <View style={styles.statDivider} />
          <StatItem
            icon="○"
            label="Takip"
            value={userProfile?.followingCount || 0}
          />
          <View style={styles.statDivider} />
          <StatItem
            icon="⌘"
            label="Topluluk"
            value={userProfile?.communitiesCount || 0}
          />
          <View style={styles.statDivider} />
          <StatItem
            icon="□"
            label="Etkinlik"
            value={userProfile?.eventsCount || 0}
          />
        </View>

        <View style={styles.actionsRow}>
          {userId ? (
            <Pressable
              disabled={saving}
              onPress={handleToggleFollow}
              style={({ pressed }) => [
                styles.primaryButton,
                following && styles.unfollowButton,
                (pressed || saving) && styles.buttonPressed,
              ]}>
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonIcon}>＋</Text>
              )}
              <Text style={styles.primaryButtonText}>{followButtonText}</Text>
            </Pressable>
          ) : null}

          <Pressable
            disabled={startingChat || !userId}
            onPress={handleMessagePress}
            style={({ pressed }) => [
              styles.secondaryButton,
              (pressed || startingChat) && styles.buttonPressed,
            ]}>
            <Text style={styles.secondaryButtonIcon}>✈</Text>
            <Text style={styles.secondaryButtonText}>
              {startingChat ? 'Açılıyor...' : 'Mesaj Gönder'}
            </Text>
          </Pressable>
        </View>

        {interests.length ? (
          <View style={styles.chipRow}>
            {interests.map(interest => (
              <View key={interest} style={styles.chip}>
                <Text style={styles.chipText}>{interest}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.infoCard}>
          <SectionHeader icon="○" title="Hakkında" />
          <Text style={styles.aboutText}>{bio}</Text>
        </View>

        {communities.length ? (
          <View style={styles.section}>
            <SectionHeader icon="□" title="Katıldığı Topluluklar" showAction />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.communityList}>
              {communities.map((community, index) => (
                <CommunityCard
                  key={
                    typeof community === 'string'
                      ? community
                      : community?.id || community?.name || index
                  }
                  item={community}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader icon="◉" title="Son Etkinlikler" showAction />
          {recentActivities.length ? (
            <View style={styles.activityList}>
              {recentActivities.map((activity, index) => (
                <ActivityCard
                  key={
                    typeof activity === 'string'
                      ? activity
                      : activity?.id || activity?.title || index
                  }
                  item={activity}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Henüz etkinlik bilgisi yok.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  container: {
    paddingBottom: 32,
    backgroundColor: COLORS.bg,
  },
  hero: {
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
    backgroundColor: '#EEF5FF',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroDecorTop: {
    position: 'absolute',
    top: -80,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#F3D8FF',
  },
  heroDecorBottom: {
    position: 'absolute',
    bottom: -90,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#DBEAFE',
  },
  header: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  headerIcon: {
    marginTop: -2,
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '400',
  },
  headerEmoji: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  profileRow: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 42,
  },
  avatarOuter: {
    width: 116,
    height: 116,
    padding: 6,
    borderRadius: 58,
    backgroundColor: COLORS.card,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
    backgroundColor: '#DBEAFE',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 52,
    backgroundColor: COLORS.primary,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
  },
  onlineDot: {
    position: 'absolute',
    right: 5,
    bottom: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: COLORS.card,
    backgroundColor: '#22C55E',
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  displayName: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
  },
  userId: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 14,
  },
  metaText: {
    marginTop: 10,
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  quoteText: {
    zIndex: 1,
    marginTop: 18,
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: -4,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  statIconWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#EEF2FF',
  },
  statIcon: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  statValue: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: '#475569',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 54,
    backgroundColor: COLORS.border,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1.2,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 4,
  },
  unfollowButton: {
    backgroundColor: COLORS.danger,
    shadowColor: COLORS.danger,
  },
  buttonPressed: {
    opacity: 0.78,
  },
  primaryButtonIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.card,
  },
  secondaryButtonIcon: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 18,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
  },
  chipText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    backgroundColor: COLORS.card,
  },
  section: {
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
  },
  sectionIcon: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionAction: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  aboutText: {
    marginTop: 10,
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
  },
  communityList: {
    gap: 12,
    paddingHorizontal: 20,
  },
  communityCard: {
    width: 150,
    minHeight: 112,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  communityBadge: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: '#EDE9FE',
  },
  communityBadgeText: {
    color: COLORS.accent,
    fontSize: 20,
    fontWeight: '900',
  },
  communityTitle: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  communityMeta: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 12,
  },
  activityList: {
    gap: 12,
    marginHorizontal: 20,
  },
  activityCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.card,
  },
  activityImage: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
  },
  activityImageText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  activityBody: {
    flex: 1,
    minWidth: 0,
  },
  activityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  activityTag: {
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    color: COLORS.accent,
    backgroundColor: '#F3E8FF',
    fontSize: 12,
    fontWeight: '800',
  },
  activityDate: {
    color: COLORS.muted,
    fontSize: 12,
  },
  activityTitle: {
    marginTop: 8,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  activityDescription: {
    marginTop: 4,
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
  emptyCard: {
    marginHorizontal: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.card,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
  },
});
