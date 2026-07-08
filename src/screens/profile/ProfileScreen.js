import React, {useEffect, useMemo} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import {
  mdiAccountGroup,
  mdiBellOutline,
  mdiBookmarkMultipleOutline,
  mdiChevronRight,
  mdiCogOutline,
  mdiHeart,
  mdiMapMarkerOutline,
  mdiPencilOutline,
  mdiSchoolOutline,
  mdiShieldAccountOutline,
  mdiStarCircleOutline,
} from '@mdi/js';
import {Card} from '../../components/ui/DesignSystem';
import {MdiIcon} from '../../components/ui/MdiIcon';
import {getProfilePlaceholder} from '../../constants/assets';
import {ROUTES} from '../../constants/routes';
import {useAuth} from '../../context/AuthContext';
import {useChats} from '../../context/ChatContext';
import {useTheme} from '../../context/ThemeContext';

const FALLBACK_COLORS = {
  background: '#F8FAFC',
  border: '#E2E8F0',
  mutedText: '#64748B',
  primary: '#2563EB',
  primarySoft: '#DBEAFE',
  surface: '#FFFFFF',
  text: '#0F172A',
};

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function getDisplayValue(value) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return '';
}

function getItemTitle(item, fallback = '') {
  if (typeof item === 'string') {
    return item;
  }

  return (
    item?.title ||
    item?.name ||
    item?.label ||
    item?.displayName ||
    fallback
  );
}

function getItemSubtitle(item) {
  if (typeof item === 'string') {
    return '';
  }

  return item?.subtitle || item?.description || item?.role || item?.date || '';
}

export function ProfileScreen({navigation}) {
  const {profile, user} = useAuth();
  const {notifications, startNotificationsListener} = useChats();
  const {theme} = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const colors = {...FALLBACK_COLORS, ...(theme?.colors || {})};

  const interests = useMemo(() => asArray(profile?.interests), [profile]);
  const achievements = useMemo(() => asArray(profile?.achievements), [profile]);
  const communities = useMemo(
    () => asArray(profile?.communities || profile?.communityIds),
    [profile],
  );
  const activities = useMemo(() => asArray(profile?.activities), [profile]);
  const hasUnreadNotifications = useMemo(
    () => notifications.some(item => item.read !== true),
    [notifications],
  );

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    return startNotificationsListener(user.uid);
  }, [startNotificationsListener, user?.uid]);

  const name = profile?.displayName || 'Profil';
  const department = getDisplayValue(profile?.department);
  const year = getDisplayValue(profile?.year);
  const university = getDisplayValue(profile?.university);
  const campus = getDisplayValue(profile?.campusName || profile?.location);
  const educationText = [department, year ? `${year}. sınıf` : '']
    .filter(Boolean)
    .join(' · ');
  const avatarSource = profile?.photoURL
    ? {uri: profile.photoURL}
    : getProfilePlaceholder(profile);
  const actionItems = [
    {
      icon: mdiCogOutline,
      label: 'Ayarlar',
      onPress: () => navigation.navigate(ROUTES.SETTINGS),
    },
    {
      icon: mdiBellOutline,
      label: 'Bildirimler',
      onPress: () => navigation.navigate(ROUTES.NOTIFICATIONS),
      badge: hasUnreadNotifications,
    },
    {
      icon: mdiBookmarkMultipleOutline,
      label: 'Kaydedilenler',
      onPress: () => navigation.navigate(ROUTES.SAVED_ITEMS),
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingBottom: tabBarHeight + 40,
        },
      ]}
      showsVerticalScrollIndicator={false}>
     

      <LinearGradient
        colors={['#1D4ED8', '#2563EB', '#4F46E5']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.hero}>
        <View style={styles.heroOrbLarge} />
        <View style={styles.heroOrbSmall} />


        <View style={styles.heroContent}>
          <View style={styles.avatarFrame}>
            <Image source={avatarSource} style={styles.avatar} />
            <View
              style={[
                styles.onlineDot,
                profile?.isOnline === false
                  ? styles.onlineDotOffline
                  : styles.onlineDotOnline,
              ]}
            />
          </View>

          <View style={styles.heroText}>
            <Text numberOfLines={2} style={styles.heroName}>
              {name}
            </Text>
            {educationText ? (
              <Text numberOfLines={2} style={styles.heroSubtitle}>
                {educationText}
              </Text>
            ) : null}
            <View style={styles.heroMetaRow}>
              {university ? (
                <MetaPill icon={mdiSchoolOutline} text={university} />
              ) : null}
              {campus ? <MetaPill icon={mdiMapMarkerOutline} text={campus} /> : null}
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <StatCard
          colors={colors}
          icon={mdiAccountGroup}
          label="Takipçi"
          tone="#2563EB"
          value={Number(profile?.followersCount || 0)}
        />
        <StatCard
          colors={colors}
          icon={mdiAccountGroup}
          label="Takip"
          tone="#7C3AED"
          value={Number(profile?.followingCount || 0)}
        />
        <StatCard
          colors={colors}
          icon={mdiHeart}
          label="İlgi Alanı"
          tone="#DB2777"
          value={interests.length}
        />
      </View>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Hakkında</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate(ROUTES.EDIT_PROFILE)}
            style={styles.inlineAction}>
            <MdiIcon path={mdiPencilOutline} size={17} color={colors.primary} />
            <Text style={[styles.inlineActionText, {color: colors.primary}]}>
              Düzenle
            </Text>
          </Pressable>
        </View>
        <Text style={[styles.bioText, {color: colors.mutedText}]}>
          {profile?.bio || 'Bio eklenmemiş.'}
        </Text>
        {interests.length > 0 ? (
          <View style={styles.chipWrap}>
            {interests.map(interest => (
              <View
                key={String(interest)}
                style={[
                  styles.interestChip,
                  {backgroundColor: colors.primarySoft || '#DBEAFE'},
                ]}>
                <Text style={[styles.interestText, {color: colors.primary}]}>
                  {String(interest)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.emptyText, {color: colors.subtleText}]}>
            Henüz ilgi alanı eklenmemiş.
          </Text>
        )}
      </Card>

      {achievements.length > 0 ? (
        <HorizontalSection
          colors={colors}
          icon={mdiStarCircleOutline}
          items={achievements}
          title="Başarılar"
        />
      ) : null}

      {communities.length > 0 ? (
        <HorizontalSection
          colors={colors}
          icon={mdiAccountGroup}
          items={communities}
          title="Topluluklarım"
        />
      ) : null}

      {activities.length > 0 ? (
        <ActivitySection colors={colors} items={activities} />
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate(ROUTES.EDIT_PROFILE)}
        style={({pressed}) => [styles.editButtonWrap, pressed && styles.pressed]}>
        <LinearGradient
          colors={['#2563EB', '#1D4ED8']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.editButton}>
          <MdiIcon path={mdiPencilOutline} size={24} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Profili Düzenle</Text>
        </LinearGradient>
      </Pressable>

      <View style={styles.actionGrid}>
        {actionItems.map(item => (
          <ActionTile
            badge={item.badge}
            colors={colors}
            icon={item.icon}
            key={item.label}
            label={item.label}
            onPress={item.onPress}
          />
        ))}
        <ActionTile
          colors={colors}
          disabled
          icon={mdiShieldAccountOutline}
          label="Gizlilik"
        />
      </View>
    </ScrollView>
  );
}

function MetaPill({icon, text}) {
  return (
    <View style={styles.metaPill}>
      <MdiIcon path={icon} size={16} color="rgba(255,255,255,0.86)" />
      <Text numberOfLines={1} style={styles.metaPillText}>
        {text}
      </Text>
    </View>
  );
}

function StatCard({colors, icon, label, tone, value}) {
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow || '#0F172A',
        },
      ]}>
      <View style={[styles.statIcon, {backgroundColor: `${tone}12`}]}>
        <MdiIcon path={icon} size={24} color={tone} />
      </View>
      <View>
        <Text style={[styles.statValue, {color: colors.text}]}>{value}</Text>
        <Text style={[styles.statLabel, {color: colors.mutedText}]}>{label}</Text>
      </View>
    </View>
  );
}

function HorizontalSection({colors, icon, items, title}) {
  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{title}</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.horizontalList}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {items.map((item, index) => (
          <View
            key={`${title}-${index}-${getItemTitle(item, index)}`}
            style={[
              styles.compactCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <View style={styles.compactIcon}>
              <MdiIcon path={icon} size={23} color="#2563EB" />
            </View>
            <View style={styles.compactTextWrap}>
              <Text numberOfLines={2} style={[styles.compactTitle, {color: colors.text}]}>
                {getItemTitle(item, title)}
              </Text>
              {getItemSubtitle(item) ? (
                <Text
                  numberOfLines={1}
                  style={[styles.compactSubtitle, {color: colors.mutedText}]}>
                  {getItemSubtitle(item)}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
    </Card>
  );
}

function ActivitySection({colors, items}) {
  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Son Aktiviteler</Text>
      </View>
      <View>
        {items.slice(0, 4).map((item, index) => (
          <View
            key={`activity-${index}-${getItemTitle(item, index)}`}
            style={[
              styles.activityRow,
              index > 0 && styles.activityDivider,
              index > 0 && {borderTopColor: colors.border},
            ]}>
            <View style={styles.activityIcon}>
              <MdiIcon path={mdiStarCircleOutline} size={22} color="#7C3AED" />
            </View>
            <View style={styles.activityTextWrap}>
              <Text numberOfLines={2} style={[styles.activityTitle, {color: colors.text}]}>
                {getItemTitle(item, 'Aktivite')}
              </Text>
              {getItemSubtitle(item) ? (
                <Text style={[styles.activitySubtitle, {color: colors.mutedText}]}>
                  {getItemSubtitle(item)}
                </Text>
              ) : null}
            </View>
            <MdiIcon path={mdiChevronRight} size={20} color={colors.subtleText} />
          </View>
        ))}
      </View>
    </Card>
  );
}

function ActionTile({badge, colors, disabled, icon, label, onPress}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.actionTile,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: disabled ? 0.52 : 1,
          shadowColor: colors.shadow || '#0F172A',
        },
        pressed && styles.pressed,
      ]}>
      <View>
        <MdiIcon path={icon} size={27} color={disabled ? colors.mutedText : '#475569'} />
        {badge ? <View style={styles.actionBadge} /> : null}
      </View>
      <Text style={[styles.actionLabel, {color: colors.mutedText}]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  topBar: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
  },
  logoButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 16,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  brandLogo: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },
  hero: {
    overflow: 'hidden',
    minHeight: 196,
    justifyContent: 'flex-end',
    padding: 20,
    borderRadius: 22,
    shadowColor: '#1D4ED8',
    shadowOffset: {width: 0, height: 14},
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
  heroOrbLarge: {
    position: 'absolute',
    left: -74,
    bottom: -64,
    width: 220,
    height: 220,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroOrbSmall: {
    position: 'absolute',
    right: -36,
    bottom: -18,
    width: 160,
    height: 120,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.09)',
    transform: [{rotate: '-24deg'}],
  },
  qrBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 18,
    backgroundColor: 'rgba(15,23,42,0.16)',
  },
  qrText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  avatarFrame: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    borderRadius: 54,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  onlineDot: {
    position: 'absolute',
    right: 3,
    bottom: 8,
    width: 24,
    height: 24,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 12,
  },
  onlineDotOnline: {
    backgroundColor: '#22C55E',
  },
  onlineDotOffline: {
    backgroundColor: '#94A3B8',
  },
  heroText: {
    flex: 1,
    paddingTop: 32,
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
  },
  heroSubtitle: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  metaPill: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaPillText: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    borderWidth: 1,
    borderRadius: 18,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  statIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  statValue: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  sectionCard: {
    gap: 12,
    padding: 16,
    borderRadius: 18,
  },
  sectionHeader: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
  },
  inlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  inlineActionText: {
    fontSize: 14,
    fontWeight: '900',
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  interestChip: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 17,
  },
  interestText: {
    fontSize: 13,
    fontWeight: '900',
  },
  horizontalList: {
    gap: 10,
    paddingRight: 6,
  },
  compactCard: {
    width: 172,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 14,
  },
  compactIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
  },
  compactTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  compactTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  compactSubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },
  activityRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  activityDivider: {
    borderTopWidth: 1,
  },
  activityIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#F3E8FF',
  },
  activityTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  activityTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },
  activitySubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  editButtonWrap: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  editButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionTile: {
    width: '48.5%',
    minHeight: 84,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 18,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  actionBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.82,
  },
});
