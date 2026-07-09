import React, {useEffect, useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';

import {CategoryFilterBar} from '../../components/discover/CategoryFilterBar';
import {DiscoverStatsStrip} from '../../components/discover/DiscoverStatsStrip';
import {FeaturedEventCard} from '../../components/discover/FeaturedEventCard';
import {LiveEventCard} from '../../components/discover/LiveEventCard';
import {PopularCommunityCard} from '../../components/discover/PopularCommunityCard';
import {SectionHeader} from '../../components/discover/SectionHeader';
import {UpcomingEventCard} from '../../components/discover/UpcomingEventCard';
import {AppInput, Screen, StateView} from '../../components/ui/DesignSystem';
import {IconButton} from '../../components/ui/IconButton';
import {DISCOVER_CATEGORIES} from '../../constants/discoverCategories';
import {ICONS} from '../../constants/assets';
import {ROUTES} from '../../constants/routes';
import {useAuth} from '../../context/AuthContext';
import {useCommunities} from '../../context/CommunityContext';
import {useEvents} from '../../context/EventContext';
import {useTheme} from '../../context/ThemeContext';
import {
  derivePopularCommunities,
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

function HorizontalRail({children}) {
  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.horizontalRail}
      showsHorizontalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

export function DiscoverScreen({navigation}) {
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {width: screenWidth} = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
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
      if (typeof unsubscribeEvents === 'function') {
        unsubscribeEvents();
      }

      if (typeof unsubscribeCommunities === 'function') {
        unsubscribeCommunities();
      }
    };
  }, [startCommunitiesListener, startEventsListener]);

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

  const upcomingEvents = useMemo(() => {
    return selectUpcomingEvents(filteredEvents, 8);
  }, [filteredEvents]);

  const activeEvents = useMemo(() => {
    return selectActiveEvents(filteredEvents, 3);
  }, [filteredEvents]);

  const popularCommunities = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);
    const realCommunities = Array.isArray(communities) ? communities : [];

    if (realCommunities.length > 0) {
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
    }

    return derivePopularCommunities(searchedEvents, 6);
  }, [communities, searchedEvents, searchQuery]);

  const todayEventCount = useMemo(() => getTodayEventCount(events), [events]);
  const topCategory = useMemo(() => getTopCategory(events), [events]);
  const nearbyEventCount = useMemo(() => getNearbyEventCount(events), [events]);

  const profileDisplayName = getTextValue(profile?.displayName, 'Campus');
  const featuredCardWidth = Math.min(620, screenWidth - 32);
  const upcomingCardWidth = Math.min(230, Math.max(172, (screenWidth - 48) / 2));
  const communityCardWidth = Math.min(160, Math.max(132, screenWidth * 0.36));
  const hasEvents = filteredEvents.length > 0;

  function openEvent(event) {
    if (!event) {
      return;
    }

    selectEvent(event);

    navigation.navigate(ROUTES.EVENT_DETAIL, {
      eventId: event.id,
    });
  }

  function openCommunity(community) {
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
  }

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: tabBarHeight + 124,
            backgroundColor: theme.colors.background || '#F8FAFC',
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={[styles.brandTitle, {color: theme.colors.primary}]}>
              CampusMerge
            </Text>

            <Text style={[styles.greeting, {color: theme.colors.text}]}>
              {getGreeting()}, {profileDisplayName} 👋
            </Text>

            <Text style={[styles.subtitle, {color: theme.colors.mutedText}]}>
              Bugün kampüste neler oluyor keşfet.
            </Text>
          </View>

          <IconButton
            accessibilityLabel="Bildirimler"
            icon={ICONS.bell}
            onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
            size={22}
          />
        </View>

        <View style={styles.searchWrap}>
          <AppInput
            onChangeText={setSearchQuery}
            rightIcon={ICONS.search}
            placeholder="Etkinlik, topluluk veya mekan ara..."
            returnKeyType="search"
            value={searchQuery}
          />
        </View>

        <CategoryFilterBar
          activeCategoryId={activeCategoryId}
          onChangeCategory={setActiveCategoryId}
          theme={theme}
        />

        <StateView
          error={error}
          loading={loading && events.length === 0}
          title="Etkinlikler yükleniyor..."
        />

        {!loading && !error && !hasEvents ? (
          <StateView
            empty
            title="Bu kategoride etkinlik bulunamadı."
          />
        ) : null}

        {!loading && !error && hasEvents ? (
          <>
            <View style={styles.section}>
              <SectionHeader
                actionText="Tümünü Gör"
                marker="✦"
                onActionPress={() => setActiveCategoryId('all')}
                theme={theme}
                title="Öne Çıkan Etkinlikler"
              />

              <HorizontalRail>
                {featuredEvents.map(event => (
                  <FeaturedEventCard
                    event={event}
                    key={String(event.id)}
                    onPress={() => openEvent(event)}
                    theme={theme}
                    width={featuredCardWidth}
                  />
                ))}
              </HorizontalRail>
            </View>

            {popularCommunities.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader
                  actionText="Tümünü Gör"
                  marker="●"
                  theme={theme}
                  title="En Aktif Topluluklar"
                />

                <HorizontalRail>
                  {popularCommunities.map((community, index) => (
                    <PopularCommunityCard
                      community={community}
                      index={index}
                      key={String(community.id)}
                      onPress={() => openCommunity(community)}
                      theme={theme}
                      width={communityCardWidth}
                    />
                  ))}
                </HorizontalRail>
              </View>
            ) : null}

            {upcomingEvents.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader
                  actionText="Tümünü Gör"
                  theme={theme}
                  title="Yaklaşan Etkinlikler"
                />

                <HorizontalRail>
                  {upcomingEvents.map(event => (
                    <UpcomingEventCard
                      event={event}
                      key={String(event.id)}
                      onPress={() => openEvent(event)}
                      theme={theme}
                      width={upcomingCardWidth}
                    />
                  ))}
                </HorizontalRail>
              </View>
            ) : null}

            <View style={styles.section}>
              <SectionHeader
                actionText={activeEvents.length > 0 ? 'Canlı Yayınlar' : null}
                marker="●"
                theme={theme}
                title="Bugün Aktif"
              />

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

            <View style={styles.section}>
              <DiscoverStatsStrip
                nearbyEventCount={nearbyEventCount}
                theme={theme}
                todayEventCount={todayEventCount}
                topCategory={topCategory}
              />
            </View>
          </>
        ) : null}
      </ScrollView>

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
              <Text style={styles.fabPlus}>＋</Text>
              <Text style={styles.fabText}>Senin Etkinliğin</Text>
            </LinearGradient>
          )}
        </Pressable>
      </View>
    </Screen>
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
