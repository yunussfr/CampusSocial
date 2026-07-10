import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import {mdiBellOutline, mdiMagnify} from '@mdi/js';

import {CategoryFilterBar} from '../../components/discover/CategoryFilterBar';
import {DiscoverStatsStrip} from '../../components/discover/DiscoverStatsStrip';
import {FeaturedEventCard} from '../../components/discover/FeaturedEventCard';
import {LiveEventCard} from '../../components/discover/LiveEventCard';
import {PopularCommunityCard} from '../../components/discover/PopularCommunityCard';
import {SectionHeader} from '../../components/discover/SectionHeader';
import {UpcomingEventCard} from '../../components/discover/UpcomingEventCard';
import {AppInput, Screen, StateView} from '../../components/ui/DesignSystem';
import {IconButton} from '../../components/ui/IconButton';
import {MdiIcon} from '../../components/ui/MdiIcon';
import {ShimmerPlaceholder} from '../../components/ui/ShimmerPlaceholder';
import {DISCOVER_CATEGORIES} from '../../constants/discoverCategories';
import {ROUTES} from '../../constants/routes';
import {useAnalytics} from '../../context/AnalyticsContext';
import {useAuth} from '../../context/AuthContext';
import {useCommunities} from '../../context/CommunityContext';
import {useEvents} from '../../context/EventContext';
import {useTheme} from '../../context/ThemeContext';
import {ANALYTICS_EVENTS} from '../../services/analyticsService';
import {
  filterEventsByCategory,
  getNearbyEventCount,
  getTodayEventCount,
  getTopCategory,
  selectActiveEvents,
  selectFeaturedEvents,
  selectUpcomingEvents,
} from '../../utils/eventSelectors';
import {getTextValue} from '../../utils/eventFormatters';

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Günaydın';
  }

  if (hour < 18) {
    return 'İyi günler';
  }

  return 'İyi akşamlar';
}

function HorizontalRail({data, keyExtractor, renderItem}) {
  return (
    <FlatList
      horizontal
      contentContainerStyle={styles.horizontalRail}
      data={data}
      initialNumToRender={3}
      keyExtractor={keyExtractor}
      maxToRenderPerBatch={4}
      removeClippedSubviews
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      updateCellsBatchingPeriod={48}
      windowSize={5}
    />
  );
}

export function DiscoverScreen({navigation}) {
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const {width: screenWidth} = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const {logEvent} = useAnalytics();
  const {theme} = useTheme();
  const {profile} = useAuth();
  const {events, error, loading, selectEvent, startEventsListener} = useEvents();
  const {
    communities,
    selectCommunity,
    startCommunitiesListener,
  } = useCommunities();

  useEffect(() => {
    const unsubscribeEvents = startEventsListener();
    const unsubscribeCommunities = startCommunitiesListener();

    return () => {
      unsubscribeEvents?.();
      unsubscribeCommunities?.();
    };
  }, [startCommunitiesListener, startEventsListener]);

  useEffect(() => {
    setShowAllUpcoming(false);
  }, [activeCategoryId, searchQuery]);

  useEffect(() => {
    const normalizedQuery = searchQuery.trim();

    if (!normalizedQuery) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      logEvent(ANALYTICS_EVENTS.DISCOVER_SEARCH, {
        query_length: normalizedQuery.length,
      });
    }, 650);

    return () => clearTimeout(timeoutId);
  }, [logEvent, searchQuery]);

  const activeCategory = useMemo(() => {
    return DISCOVER_CATEGORIES.find(category => category.id === activeCategoryId) ||
      DISCOVER_CATEGORIES[0];
  }, [activeCategoryId]);

  const searchedEvents = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);

    if (!normalizedQuery) {
      return events;
    }

    return events.filter(event => {
      const searchableText = [
        event?.title,
        event?.name,
        event?.category,
        event?.locationName,
        event?.locationLabel,
        event?.location,
        event?.venue,
        event?.place,
        event?.communityName,
        event?.community?.name,
        event?.organizerName,
        event?.organizer?.name,
      ]
        .map(value => normalizeText(value))
        .join(' ');

      return searchableText.includes(normalizedQuery);
    });
  }, [events, searchQuery]);

  const filteredEvents = useMemo(() => {
    return filterEventsByCategory(searchedEvents, activeCategory);
  }, [activeCategory, searchedEvents]);

  const featuredEvents = useMemo(() => {
    return selectFeaturedEvents(filteredEvents, 4);
  }, [filteredEvents]);

  const allUpcomingEvents = useMemo(() => {
    return selectUpcomingEvents(filteredEvents);
  }, [filteredEvents]);

  const upcomingEvents = useMemo(() => {
    return showAllUpcoming
      ? allUpcomingEvents
      : allUpcomingEvents.slice(0, 8);
  }, [allUpcomingEvents, showAllUpcoming]);

  const activeEvents = useMemo(() => {
    return selectActiveEvents(filteredEvents, 3);
  }, [filteredEvents]);

  const popularCommunities = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);
    const realCommunities = Array.isArray(communities) ? communities : [];

    return realCommunities
      .filter(community => {
        if (!normalizedQuery) {
          return true;
        }

        return normalizeText(community?.name).includes(normalizedQuery);
      })
      .map(community => ({
        id: community.id,
        raw: community,
        name: community.name || 'Topluluk',
        logoURL: community.iconURL || community.logoURL || community.coverURL || null,
        memberCount: Number(community.memberCount || 0) || null,
        eventCount: Number(community.eventCount || 0) || 0,
        score: Number(community.memberCount || 0) + Number(community.eventCount || 0) * 10,
      }))
      .sort((first, second) => second.score - first.score)
      .slice(0, 6)
      .map((community, index) => ({
        ...community,
        rank: index + 1,
      }));
  }, [communities, searchQuery]);

  const todayEventCount = useMemo(() => getTodayEventCount(events), [events]);
  const topCategory = useMemo(() => getTopCategory(events), [events]);
  const nearbyEventCount = useMemo(() => getNearbyEventCount(events), [events]);

  const profileDisplayName = getTextValue(profile?.displayName, 'Campus');
  const featuredCardWidth = Math.min(620, screenWidth - 32);
  const upcomingCardWidth = Math.min(230, Math.max(172, (screenWidth - 48) / 2));
  const communityCardWidth = Math.min(160, Math.max(132, screenWidth * 0.36));
  const hasEvents = filteredEvents.length > 0;

  const openEvent = useCallback(
    event => {
      if (!event) {
        return;
      }

      logEvent(ANALYTICS_EVENTS.EVENT_OPEN, {
        event_id: event.id,
        category: event.category || '',
      });
      selectEvent(event);

      navigation.navigate(ROUTES.EVENT_DETAIL, {
        eventId: event.id,
      });
    },
    [logEvent, navigation, selectEvent],
  );

  const openCommunity = useCallback(
    community => {
      if (!community?.id) {
        return;
      }

      if (community.raw) {
        selectCommunity(community.raw);
      }

      navigation.navigate('CommunitiesTab', {
        screen: ROUTES.COMMUNITY_DETAIL,
        params: {
          communityId: community.id,
        },
      });
    },
    [navigation, selectCommunity],
  );

  const openCommunitiesTab = useCallback(() => {
    navigation.navigate('CommunitiesTab', {
      screen: ROUTES.COMMUNITY_LIST,
    });
  }, [navigation]);

  const handleCategoryChange = useCallback(
    categoryId => {
      setActiveCategoryId(categoryId);
      logEvent(ANALYTICS_EVENTS.DISCOVER_CATEGORY_SELECT, {
        category_id: categoryId,
      });
    },
    [logEvent],
  );

  const showAllUpcomingEvents = useCallback(() => {
    if (showAllUpcoming || allUpcomingEvents.length <= upcomingEvents.length) {
      Alert.alert('Daha fazla yaklaşan etkinlik yok');
      return;
    }

    logEvent(ANALYTICS_EVENTS.DISCOVER_SHOW_ALL_UPCOMING, {
      total_count: allUpcomingEvents.length,
    });
    setShowAllUpcoming(true);
  }, [allUpcomingEvents.length, logEvent, showAllUpcoming, upcomingEvents.length]);

  const sections = useMemo(() => {
    if (loading && events.length === 0) {
      return [{type: 'loading'}];
    }

    if (error || !hasEvents) {
      return [];
    }

    return [
      featuredEvents.length > 0 ? {type: 'featured'} : null,
      popularCommunities.length > 0 ? {type: 'communities'} : null,
      upcomingEvents.length > 0 ? {type: 'upcoming'} : null,
      {type: 'active'},
      {type: 'stats'},
    ].filter(Boolean);
  }, [
    error,
    events.length,
    featuredEvents.length,
    hasEvents,
    loading,
    popularCommunities.length,
    upcomingEvents.length,
  ]);

  const renderSection = useCallback(
    ({item}) => {
      if (item.type === 'loading') {
        return <DiscoverSkeleton theme={theme} />;
      }

      if (item.type === 'featured') {
        return (
          <View style={styles.section}>
            <SectionHeader marker="✦" theme={theme} title="Öne Çıkan Etkinlikler" />
            <HorizontalRail
              data={featuredEvents}
              keyExtractor={event => String(event.id)}
              renderItem={({item: event}) => (
                <FeaturedEventCard
                  event={event}
                  onPress={() => openEvent(event)}
                  theme={theme}
                  width={featuredCardWidth}
                />
              )}
            />
          </View>
        );
      }

      if (item.type === 'communities') {
        return (
          <View style={styles.section}>
            <SectionHeader
              actionText="Tümünü Gör"
              marker="●"
              onActionPress={openCommunitiesTab}
              theme={theme}
              title="En Aktif Topluluklar"
            />
            <HorizontalRail
              data={popularCommunities}
              keyExtractor={community => String(community.id)}
              renderItem={({item: community, index}) => (
                <PopularCommunityCard
                  community={community}
                  index={index}
                  onPress={() => openCommunity(community)}
                  theme={theme}
                  width={communityCardWidth}
                />
              )}
            />
          </View>
        );
      }

      if (item.type === 'upcoming') {
        return (
          <View style={styles.section}>
            <SectionHeader
              actionText="Tümünü Gör"
              onActionPress={showAllUpcomingEvents}
              theme={theme}
              title="Yaklaşan Etkinlikler"
            />
            {showAllUpcoming ? (
              <View style={styles.upcomingExpandedList}>
                {upcomingEvents.map(event => (
                  <UpcomingEventCard
                    event={event}
                    key={String(event.id)}
                    onPress={() => openEvent(event)}
                    theme={theme}
                    width={screenWidth - 32}
                  />
                ))}
              </View>
            ) : (
              <HorizontalRail
                data={upcomingEvents}
                keyExtractor={event => String(event.id)}
                renderItem={({item: event}) => (
                  <UpcomingEventCard
                    event={event}
                    onPress={() => openEvent(event)}
                    theme={theme}
                    width={upcomingCardWidth}
                  />
                )}
              />
            )}
          </View>
        );
      }

      if (item.type === 'active') {
        return (
          <View style={styles.section}>
            <SectionHeader marker="●" theme={theme} title="Bugün Aktif" />
            {activeEvents.length > 0 ? (
              <View style={styles.liveStack}>
                {activeEvents.map(event => (
                  <LiveEventCard
                    event={event}
                    key={String(event.id)}
                    onPress={() => openEvent(event)}
                    theme={theme}
                  />
                ))}
              </View>
            ) : (
              <View
                style={[
                  styles.activeEmpty,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <Text style={[styles.activeEmptyText, {color: theme.colors.mutedText}]}>
                  Şu anda aktif etkinlik yok.
                </Text>
              </View>
            )}
          </View>
        );
      }

      return (
        <View style={styles.section}>
          <DiscoverStatsStrip
            nearbyEventCount={nearbyEventCount}
            theme={theme}
            todayEventCount={todayEventCount}
            topCategory={topCategory}
          />
        </View>
      );
    },
    [
      activeEvents,
      communityCardWidth,
      featuredCardWidth,
      featuredEvents,
      nearbyEventCount,
      openCommunitiesTab,
      openCommunity,
      openEvent,
      popularCommunities,
      screenWidth,
      showAllUpcoming,
      showAllUpcomingEvents,
      theme,
      todayEventCount,
      topCategory,
      upcomingCardWidth,
      upcomingEvents,
    ],
  );

  const listHeader = (
    <View>
      <View style={styles.header}>
        <View style={styles.headerTextBlock}>
          <Text style={[styles.brandTitle, {color: theme.colors.primary}]}>
            CampusMerge
          </Text>
          <Text style={[styles.greeting, {color: theme.colors.text}]}>
            {getGreeting()}, {profileDisplayName}
          </Text>
          <Text style={[styles.subtitle, {color: theme.colors.mutedText}]}>
            Bugün kampüste neler oluyor keşfet.
          </Text>
        </View>
        <IconButton
          accessibilityLabel="Bildirimler"
          icon={mdiBellOutline}
          onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
          size={22}
        />
      </View>

      <View style={styles.searchWrap}>
        <AppInput
          onChangeText={setSearchQuery}
          placeholder="Etkinlik, topluluk veya mekan ara..."
          returnKeyType="search"
          rightIcon={<MdiIcon path={mdiMagnify} size={22} color={theme.colors.subtleText} />}
          value={searchQuery}
        />
      </View>

      <CategoryFilterBar
        activeCategoryId={activeCategoryId}
        onChangeCategory={handleCategoryChange}
        theme={theme}
      />

      <StateView error={error} />

      {!loading && !error && !hasEvents ? (
        <StateView empty title="Bu kategoride etkinlik bulunamadı." />
      ) : null}
    </View>
  );

  return (
    <Screen padded={false}>
      <FlatList
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: tabBarHeight + 124,
            backgroundColor: theme.colors.background || '#F8FAFC',
          },
        ]}
        data={sections}
        initialNumToRender={4}
        keyExtractor={item => item.type}
        ListHeaderComponent={listHeader}
        maxToRenderPerBatch={4}
        removeClippedSubviews
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        updateCellsBatchingPeriod={48}
        windowSize={7}
      />

      <View style={[styles.fabContainer, {bottom: tabBarHeight + 38}]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate(ROUTES.CREATE_EVENT)}
          style={styles.fabPressable}>
          {({pressed}) => (
            <LinearGradient
              colors={['#2563EB', '#1D4ED8']}
              end={{x: 1, y: 1}}
              start={{x: 0, y: 0}}
              style={[styles.fabGradient, pressed && styles.fabPressed]}>
              <Text style={styles.fabPlus}>+</Text>
              <Text style={styles.fabText}>Senin Etkinliğin</Text>
            </LinearGradient>
          )}
        </Pressable>
      </View>
    </Screen>
  );
}

function DiscoverSkeleton({theme}) {
  return (
    <View style={styles.skeletonWrap}>
      <ShimmerPlaceholder height={220} style={styles.skeletonHero} />
      <View style={styles.skeletonRow}>
        {[0, 1].map(item => (
          <View key={item} style={styles.skeletonCard}>
            <ShimmerPlaceholder height={132} />
            <ShimmerPlaceholder height={14} style={styles.skeletonLine} />
            <ShimmerPlaceholder height={12} style={styles.skeletonLine} width="62%" />
          </View>
        ))}
      </View>
      <Text style={[styles.skeletonText, {color: theme.colors.mutedText}]}>
        Etkinlikler yükleniyor...
      </Text>
    </View>
  );
}

function normalizeText(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'object') {
    if (typeof value.latitude === 'number' && typeof value.longitude === 'number') {
      return `${value.latitude} ${value.longitude}`;
    }

    return '';
  }

  return String(value)
    .trim()
    .toLocaleLowerCase('tr-TR');
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 26,
  },
  header: {
    minHeight: 98,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerTextBlock: {
    minWidth: 0,
    flex: 1,
  },
  brandTitle: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900',
  },
  greeting: {
    marginTop: 18,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },
  searchWrap: {
    marginBottom: 16,
  },
  section: {
    marginTop: 28,
  },
  horizontalRail: {
    gap: 12,
    paddingRight: 16,
  },
  upcomingExpandedList: {
    gap: 14,
  },
  liveStack: {
    gap: 12,
  },
  activeEmpty: {
    minHeight: 86,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 1,
    borderRadius: 18,
  },
  activeEmptyText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  skeletonWrap: {
    gap: 14,
    marginTop: 24,
  },
  skeletonHero: {
    borderRadius: 22,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skeletonCard: {
    flex: 1,
    overflow: 'hidden',
    paddingBottom: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  skeletonLine: {
    marginTop: 10,
    marginHorizontal: 12,
  },
  skeletonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  fabContainer: {
    position: 'absolute',
    right: 18,
    borderRadius: 28,
    shadowColor: '#2563EB',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 10,
  },
  fabPressable: {
    overflow: 'hidden',
    borderRadius: 28,
  },
  fabGradient: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
    borderRadius: 28,
  },
  fabPressed: {
    opacity: 0.88,
    transform: [{scale: 0.98}],
  },
  fabPlus: {
    width: 40,
    height: 40,
    overflow: 'hidden',
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#2563EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    fontSize: 25,
    lineHeight: 40,
    fontWeight: '700',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
