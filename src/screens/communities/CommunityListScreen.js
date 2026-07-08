import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import {
  mdiBellOutline,
  mdiFilterVariant,
  mdiFlashOutline,
  mdiMagnify,
  mdiPlus,
  mdiStarOutline,
} from '@mdi/js';

import {CommunityCategoryRow} from '../../components/communities/CommunityCategoryRow';
import {CommunityEmptyState} from '../../components/communities/CommunityEmptyState';
import {CommunityFilterSheet} from '../../components/communities/CommunityFilterSheet';
import {CommunityListCard} from '../../components/communities/CommunityListCard';
import {CommunityRecommendationCard} from '../../components/communities/CommunityRecommendationCard';
import {CommunitySectionHeader} from '../../components/communities/CommunitySectionHeader';
import {CommunitySkeleton} from '../../components/communities/CommunitySkeleton';
import {Screen} from '../../components/ui/DesignSystem';
import {MdiIcon} from '../../components/ui/MdiIcon';
import {ROUTES} from '../../constants/routes';
import {useAuth} from '../../context/AuthContext';
import {useChats} from '../../context/ChatContext';
import {useCommunities} from '../../context/CommunityContext';
import {useTheme} from '../../context/ThemeContext';
import {
  COMMUNITY_CATEGORIES,
  DEFAULT_COMMUNITY_FILTERS,
} from '../../utils/communityCategories';
import {
  filterCommunities,
  getActiveCommunities,
  getActiveCommunityFilterCount,
  getRecommendedCommunities,
  communityIsJoined,
} from '../../utils/communityFilters';
import {parseMemberCount} from '../../utils/communityFormatters';

function cloneFilters(filters) {
  return {
    ...filters,
    categoryKeys: [...(filters.categoryKeys || [])],
  };
}

export function CommunityListScreen({navigation}) {
  const {profile, user} = useAuth();
  const {notifications, startNotificationsListener} = useChats();
  const {theme} = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const {width} = useWindowDimensions();
  const {
    communities = [],
    error,
    loading,
    joinSelectedCommunity,
    leaveSelectedCommunity,
    selectCommunity,
    startCommunitiesListener,
  } = useCommunities();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryKey, setActiveCategoryKey] = useState('all');
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_COMMUNITY_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_COMMUNITY_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);
  const [joiningIds, setJoiningIds] = useState([]);
  const hasUnreadNotifications = useMemo(
    () => notifications.some(item => item.read !== true),
    [notifications],
  );

  useEffect(() => {
    const unsubscribe = startCommunitiesListener?.();

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [startCommunitiesListener]);

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    return startNotificationsListener(user.uid);
  }, [startNotificationsListener, user?.uid]);

  const joinedCommunityIds = useMemo(() => {
    return [
      ...(Array.isArray(profile?.joinedCommunityIds) ? profile.joinedCommunityIds : []),
      ...(Array.isArray(user?.joinedCommunityIds) ? user.joinedCommunityIds : []),
    ];
  }, [profile?.joinedCommunityIds, user?.joinedCommunityIds]);

  const supportedFilters = useMemo(() => {
    const supportsJoinOpen = communities.some(
      community =>
        community?.isPrivate !== undefined ||
        community?.privacy !== undefined ||
        community?.visibility !== undefined ||
        community?.joinPolicy !== undefined,
    );
    const supportsJoined = joinedCommunityIds.length > 0 || communities.some(
      community => Array.isArray(community?.memberIds) || Array.isArray(community?.members),
    );

    return {
      joinOpenOnly: supportsJoinOpen,
      excludeJoined: supportsJoined,
    };
  }, [communities, joinedCommunityIds.length]);

  const safeAppliedFilters = useMemo(() => {
    return {
      ...appliedFilters,
      joinOpenOnly: supportedFilters.joinOpenOnly && appliedFilters.joinOpenOnly,
      excludeJoined: supportedFilters.excludeJoined && appliedFilters.excludeJoined,
    };
  }, [appliedFilters, supportedFilters]);

  const visibleCommunities = useMemo(() => {
    const source = filterCommunities({
      communities,
      searchQuery,
      activeCategoryKey,
      filters: safeAppliedFilters,
      user: profile || user,
      joinedCommunityIds,
    });

    if (!safeAppliedFilters.recommendedOnly) {
      return source;
    }

    const recommendedIds = new Set(
      getRecommendedCommunities(source, profile || user, joinedCommunityIds, 12).map(
        community => community.id,
      ),
    );

    return source.filter(community => recommendedIds.has(community.id));
  }, [
    activeCategoryKey,
    communities,
    joinedCommunityIds,
    profile,
    safeAppliedFilters,
    searchQuery,
    user,
  ]);

  const activeCommunities = useMemo(
    () => getActiveCommunities(visibleCommunities),
    [visibleCommunities],
  );

  const recommendedCommunities = useMemo(
    () =>
      getRecommendedCommunities(
        visibleCommunities,
        profile || user,
        joinedCommunityIds,
        6,
      ),
    [joinedCommunityIds, profile, user, visibleCommunities],
  );

  const filterCount = useMemo(
    () => getActiveCommunityFilterCount(safeAppliedFilters, supportedFilters),
    [safeAppliedFilters, supportedFilters],
  );

  const recommendationWidth = Math.min(292, width * 0.72);

  function openFilters() {
    setDraftFilters(cloneFilters(safeAppliedFilters));
    setFilterVisible(true);
  }

  function applyDraftFilters() {
    const min = draftFilters.minMembers === '' ? null : parseMemberCount(draftFilters.minMembers);
    const max = draftFilters.maxMembers === '' ? null : parseMemberCount(draftFilters.maxMembers);

    if (min !== null && max !== null && min > max) {
      Alert.alert('Filtre hatasi', 'Minimum uye sayisi maksimum uye sayisindan buyuk olamaz.');
      return;
    }

    setAppliedFilters(
      supportedFilters.joinOpenOnly
        ? cloneFilters(draftFilters)
        : {...cloneFilters(draftFilters), joinOpenOnly: false},
    );

    if (draftFilters.categoryKeys.length > 0) {
      setActiveCategoryKey('all');
    }

    setFilterVisible(false);
  }

  function clearDraftFilters() {
    setDraftFilters(cloneFilters(DEFAULT_COMMUNITY_FILTERS));
  }

  function openCommunity(community) {
    selectCommunity(community);
    navigation.navigate(ROUTES.COMMUNITY_DETAIL, {
      communityId: community.id,
    });
  }

  async function toggleMembership(community) {
    if (!user?.uid || !community?.id || joiningIds.includes(community.id)) {
      if (!user?.uid) {
        openCommunity(community);
      }
      return;
    }

    if (community?.isPrivate) {
      openCommunity(community);
      return;
    }

    setJoiningIds(current => [...current, community.id]);

    try {
      if (communityIsJoined(community, user.uid, joinedCommunityIds)) {
        await leaveSelectedCommunity(community.id, user.uid);
      } else {
        await joinSelectedCommunity(community.id, user.uid);
      }
    } catch (membershipError) {
      Alert.alert('Islem tamamlanamadi', membershipError.message);
    } finally {
      setJoiningIds(current => current.filter(id => id !== community.id));
    }
  }

  function getEmptyType() {
    if (error) {
      return 'error';
    }

    if (searchQuery.trim()) {
      return 'search';
    }

    if (filterCount > 0 || activeCategoryKey !== 'all') {
      return 'filter';
    }

    return 'empty';
  }

  const renderCommunity = ({item}) => (
    <CommunityListCard
      community={item}
      isJoining={joiningIds.includes(item.id)}
      isMember={communityIsJoined(item, user?.uid, joinedCommunityIds)}
      theme={theme}
      onJoin={() => toggleMembership(item)}
      onPress={() => openCommunity(item)}
    />
  );

  return (
    <Screen padded={false}>
      <FlatList
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: tabBarHeight + 28,
            backgroundColor: theme.colors.background,
          },
        ]}
        data={loading && communities.length === 0 ? [] : activeCommunities}
        initialNumToRender={8}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={
          loading && communities.length === 0 ? (
            <CommunitySkeleton theme={theme} />
          ) : (
            <CommunityEmptyState
              actionLabel={error ? undefined : 'Yeni Topluluk'}
              onAction={() => navigation.navigate(ROUTES.CREATE_COMMUNITY)}
              theme={theme}
              type={getEmptyType()}
            />
          )
        }
        ListHeaderComponent={
          <View>
            <View style={styles.pageHeader}>
              <View style={styles.pageHeaderText}>
                <Text style={[styles.pageTitle, {color: theme.colors.text}]}>
                  Topluluklar
                </Text>
                <Text style={[styles.pageSubtitle, {color: theme.colors.mutedText}]}>
                  Sana uygun kampus topluluklarini kesfet
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
                style={[
                  styles.headerIconButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    shadowColor: theme.colors.shadow,
                  },
                ]}>
                <MdiIcon path={mdiBellOutline} size={25} color={theme.colors.text} />
                {hasUnreadNotifications ? (
                  <View style={styles.notificationDot} />
                ) : null}
              </Pressable>
            </View>

            <View style={styles.searchRow}>
              <View
                style={[
                  styles.searchBox,
                  {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
                ]}>
                <MdiIcon path={mdiMagnify} size={25} color={theme.colors.subtleText} />
                <TextInput
                  autoCorrect={false}
                  onChangeText={setSearchQuery}
                  placeholder="Topluluk veya ilgi alani ara..."
                  placeholderTextColor={theme.colors.subtleText}
                  returnKeyType="search"
                  spellCheck={false}
                  style={[styles.searchInput, {color: theme.colors.text}]}
                  value={searchQuery}
                />
              </View>

              <Pressable
                onPress={openFilters}
                style={[
                  styles.filterButton,
                  {backgroundColor: theme.colors.surface, borderColor: '#BFD0FF'},
                ]}>
                <MdiIcon path={mdiFilterVariant} size={21} color={theme.colors.primary} />
                <Text style={[styles.filterText, {color: theme.colors.primary}]}>
                  Filtrele
                </Text>
                {filterCount > 0 ? (
                  <View style={[styles.filterCount, {backgroundColor: theme.colors.primary}]}>
                    <Text style={styles.filterCountText}>{filterCount}</Text>
                  </View>
                ) : null}
              </Pressable>
            </View>

            <CommunityCategoryRow
              activeCategoryKey={activeCategoryKey}
              categories={COMMUNITY_CATEGORIES}
              onCategoryPress={setActiveCategoryKey}
              theme={theme}
            />

            <View style={styles.createRow}>
              <Pressable
                onPress={() => navigation.navigate(ROUTES.CREATE_COMMUNITY)}
                style={styles.createButtonWrap}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.accent]}
                  style={styles.createButton}>
                  <MdiIcon path={mdiPlus} size={21} color="#FFFFFF" />
                  <Text style={styles.createText}>Yeni Topluluk</Text>
                </LinearGradient>
              </Pressable>
            </View>

            {error ? (
              <View style={styles.inlineState}>
                <CommunityEmptyState theme={theme} type="error" />
              </View>
            ) : null}

            {recommendedCommunities.length > 0 ? (
              <>
                <CommunitySectionHeader
                  actionLabel="Tumunu Gor"
                  icon={mdiStarOutline}
                  theme={theme}
                  title="Sana Onerilen Topluluklar"
                />
                <FlatList
                  horizontal
                  contentContainerStyle={styles.recommendationsContent}
                  data={recommendedCommunities}
                  keyExtractor={item => String(item.id)}
                  renderItem={({item}) => (
                    <CommunityRecommendationCard
                      community={item}
                      isJoining={joiningIds.includes(item.id)}
                      isMember={communityIsJoined(item, user?.uid, joinedCommunityIds)}
                      theme={theme}
                      width={recommendationWidth}
                      onJoin={() => toggleMembership(item)}
                      onPress={() => openCommunity(item)}
                    />
                  )}
                  showsHorizontalScrollIndicator={false}
                />
              </>
            ) : communities.length > 0 && !loading ? (
              <View style={styles.inlineState}>
                <CommunityEmptyState theme={theme} type="recommendation" />
              </View>
            ) : null}

            <CommunitySectionHeader
              icon={mdiFlashOutline}
              theme={theme}
              title="Aktif Topluluklar"
            />
          </View>
        }
        renderItem={renderCommunity}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        windowSize={7}
      />

      <CommunityFilterSheet
        categories={COMMUNITY_CATEGORIES}
        draftFilters={draftFilters}
        onApply={applyDraftFilters}
        onChange={setDraftFilters}
        onClear={clearDraftFilters}
        onClose={() => setFilterVisible(false)}
        supportedFilters={supportedFilters}
        theme={theme}
        visible={filterVisible}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingTop: 22,
    paddingHorizontal: 16,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  pageHeaderText: {
    minWidth: 0,
    flex: 1,
    paddingRight: 12,
  },
  pageTitle: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
  },
  pageSubtitle: {
    marginTop: 3,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  headerIconButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 16,
    shadowOffset: {width: 0, height: 7},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 5,
    backgroundColor: '#7C3AED',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  searchBox: {
    minWidth: 0,
    minHeight: 58,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 18,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 15,
    fontWeight: '600',
  },
  filterButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 14,
    borderWidth: 1.2,
    borderRadius: 18,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '900',
  },
  filterCount: {
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderRadius: 10,
  },
  filterCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  createRow: {
    marginTop: 16,
  },
  createButtonWrap: {
    overflow: 'hidden',
    borderRadius: 15,
  },
  createButton: {
    minHeight: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
  },
  createText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  recommendationsContent: {
    gap: 12,
    paddingRight: 16,
    paddingBottom: 4,
  },
  separator: {
    height: 12,
  },
  inlineState: {
    marginTop: 16,
  },
});

export default CommunityListScreen;
