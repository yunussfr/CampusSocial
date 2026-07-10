import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {
  mdiAccountCircleOutline,
  mdiAccountGroup,
  mdiChevronRight,
  mdiReload,
} from '@mdi/js';

import {MdiIcon} from '../../components/ui/MdiIcon';
import {getProfilePlaceholder} from '../../constants/assets';
import {ROUTES} from '../../constants/routes';
import {useTheme} from '../../context/ThemeContext';
import {
  subscribeToFollowers,
  subscribeToFollowing,
} from '../../services/authService';

const TABS = {
  FOLLOWERS: 'followers',
  FOLLOWING: 'following',
};

function normalizeError(error) {
  if (!error) {
    return 'Takip bilgileri yüklenemedi.';
  }

  if (
    error.code === 'firestore/permission-denied' ||
    error.code === 'permission-denied'
  ) {
    return 'Takip bilgilerini okuma izni reddedildi. Firestore kurallarını yayımlayıp tekrar deneyin.';
  }

  return error.message || 'Takip bilgileri yüklenemedi.';
}

export function FollowConnectionsScreen({navigation, route}) {
  const {theme} = useTheme();
  const tabBarHeight = useBottomTabBarHeight();

  const userId = route.params?.userId;
  const titleName = route.params?.titleName;
  const initialTab = route.params?.initialTab || TABS.FOLLOWERS;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);

  const [followersError, setFollowersError] = useState('');
  const [followingError, setFollowingError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!userId) {
      setFollowers([]);
      setFollowing([]);
      setLoadingFollowers(false);
      setLoadingFollowing(false);
      setFollowersError('Kullanıcı kimliği bulunamadı.');
      setFollowingError('Kullanıcı kimliği bulunamadı.');
      return undefined;
    }

    let active = true;

    setFollowersError('');
    setFollowingError('');
    setLoadingFollowers(true);
    setLoadingFollowing(true);

    let unsubscribeFollowers;
    let unsubscribeFollowing;

    try {
      unsubscribeFollowers = subscribeToFollowers(
        userId,
        nextFollowers => {
          if (!active) {
            return;
          }

          setFollowers(Array.isArray(nextFollowers) ? nextFollowers : []);
          setFollowersError('');
          setLoadingFollowers(false);
        },
        error => {
          if (!active) {
            return;
          }

          setFollowers([]);
          setFollowersError(normalizeError(error));
          setLoadingFollowers(false);
        },
      );
    } catch (error) {
      setFollowers([]);
      setFollowersError(normalizeError(error));
      setLoadingFollowers(false);
    }

    try {
      unsubscribeFollowing = subscribeToFollowing(
        userId,
        nextFollowing => {
          if (!active) {
            return;
          }

          setFollowing(Array.isArray(nextFollowing) ? nextFollowing : []);
          setFollowingError('');
          setLoadingFollowing(false);
        },
        error => {
          if (!active) {
            return;
          }

          setFollowing([]);
          setFollowingError(normalizeError(error));
          setLoadingFollowing(false);
        },
      );
    } catch (error) {
      setFollowing([]);
      setFollowingError(normalizeError(error));
      setLoadingFollowing(false);
    }

    return () => {
      active = false;

      if (typeof unsubscribeFollowers === 'function') {
        unsubscribeFollowers();
      }

      if (typeof unsubscribeFollowing === 'function') {
        unsubscribeFollowing();
      }
    };
  }, [reloadKey, userId]);

  const activeItems =
    activeTab === TABS.FOLLOWERS ? followers : following;

  const loading =
    activeTab === TABS.FOLLOWERS
      ? loadingFollowers
      : loadingFollowing;

  const activeError =
    activeTab === TABS.FOLLOWERS
      ? followersError
      : followingError;

  const emptyText =
    activeTab === TABS.FOLLOWERS
      ? 'Henüz takipçi yok.'
      : 'Henüz kimseyi takip etmiyor.';

  const headerTitle = useMemo(() => {
    return titleName ? `${titleName} takipleri` : 'Takipler';
  }, [titleName]);

  function handleUserPress(profile) {
    const nextUserId = profile?.uid || profile?.id;

    if (!nextUserId) {
      return;
    }

    navigation.navigate(ROUTES.USER_PROFILE, {
      userId: nextUserId,
      userProfile: profile,
    });
  }

  function handleRetry() {
    setReloadKey(current => current + 1);
  }

  return (
    <View style={[styles.screen, {backgroundColor: theme.colors.background}]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {paddingBottom: tabBarHeight + 32},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MdiIcon
              path={mdiAccountGroup}
              size={28}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.headerTextWrap}>
            <Text style={[styles.title, {color: theme.colors.text}]}>
              {headerTitle}
            </Text>

            <Text style={[styles.subtitle, {color: theme.colors.mutedText}]}>
              Takipçi ve takip edilen kişileri görüntüle.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.tabs,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <TabButton
            active={activeTab === TABS.FOLLOWERS}
            count={followers.length}
            label="Takipçiler"
            onPress={() => setActiveTab(TABS.FOLLOWERS)}
            theme={theme}
          />

          <TabButton
            active={activeTab === TABS.FOLLOWING}
            count={following.length}
            label="Takip Edilenler"
            onPress={() => setActiveTab(TABS.FOLLOWING)}
            theme={theme}
          />
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : activeError ? (
          <View
            style={[
              styles.stateCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <Text style={[styles.errorText, {color: theme.colors.danger}]}>
              {activeError}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={handleRetry}
              style={[
                styles.retryButton,
                {backgroundColor: theme.colors.primary},
              ]}>
              <MdiIcon path={mdiReload} size={18} color="#FFFFFF" />
              <Text style={styles.retryText}>Tekrar dene</Text>
            </Pressable>
          </View>
        ) : activeItems.length > 0 ? (
          <View style={styles.list}>
            {activeItems.map(profile => (
              <ConnectionRow
                key={profile.uid || profile.id}
                onPress={() => handleUserPress(profile)}
                profile={profile}
                theme={theme}
              />
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.stateCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <MdiIcon
              path={mdiAccountCircleOutline}
              size={42}
              color={theme.colors.subtleText}
            />

            <Text style={[styles.emptyText, {color: theme.colors.mutedText}]}>
              {emptyText}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function TabButton({active, count, label, onPress, theme}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.tabButton,
        active && {backgroundColor: theme.colors.primary},
      ]}>
      <Text
        style={[
          styles.tabText,
          {color: active ? '#FFFFFF' : theme.colors.mutedText},
        ]}>
        {label}
      </Text>

      <View
        style={[
          styles.tabCount,
          {
            backgroundColor: active
              ? 'rgba(255,255,255,0.18)'
              : theme.colors.primarySoft,
          },
        ]}>
        <Text
          style={[
            styles.tabCountText,
            {color: active ? '#FFFFFF' : theme.colors.primary},
          ]}>
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

function ConnectionRow({onPress, profile, theme}) {
  const displayName = profile.displayName || 'Kullanıcı';

  const subtitle = [
    profile.department,
    profile.year ? `${profile.year}. sınıf` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const avatarSource = profile.photoURL
    ? {uri: profile.photoURL}
    : getProfilePlaceholder(profile);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow || '#0F172A',
        },
        pressed && styles.pressed,
      ]}>
      <Image source={avatarSource} style={styles.avatar} />

      <View style={styles.rowText}>
        <Text
          numberOfLines={1}
          style={[styles.name, {color: theme.colors.text}]}>
          {displayName}
        </Text>

        <Text
          numberOfLines={1}
          style={[styles.rowSubtitle, {color: theme.colors.mutedText}]}>
          {subtitle || profile.email || 'Profil bilgisi yok'}
        </Text>
      </View>

      <MdiIcon
        path={mdiChevronRight}
        size={22}
        color={theme.colors.subtleText}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  tabs: {
    minHeight: 58,
    flexDirection: 'row',
    gap: 8,
    padding: 6,
    borderWidth: 1,
    borderRadius: 18,
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '900',
  },
  tabCount: {
    minWidth: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
    borderRadius: 13,
  },
  tabCountText: {
    fontSize: 12,
    fontWeight: '900',
  },
  list: {
    gap: 10,
  },
  row: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 18,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  rowSubtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  loadingWrap: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateCard: {
    minHeight: 170,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 18,
    borderWidth: 1,
    borderRadius: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  retryButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.82,
  },
});
