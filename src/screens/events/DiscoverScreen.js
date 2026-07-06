import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

import {IconButton} from '../../components/ui/IconButton';
import {
  AppInput,
  BrandHeader,
  ChipRow,
  Screen,
  StateView,
} from '../../components/ui/DesignSystem';

import EventCard from '../../components/events/EventCard';
import PopulerEventCard from '../../components/events/PopulerEventCard';

import {ICONS} from '../../constants/assets';
import {SearchIcon} from '../../components/ui/SearchIcon';
import {ROUTES} from '../../constants/routes';

import {useEvents} from '../../context/EventContext';
import {useAuth} from '../../context/AuthContext';
import {useTheme} from '../../context/ThemeContext';

const CATEGORY_MAP = {
  Tümü: null,
  Konser: 'Konser',
  Seminer: 'Seminer',
  Spor: 'Spor',
  Atölye: 'Atolye',
};

const COMMUNITY_GRADIENTS = [
  ['#8B5CF6', '#7C3AED'],
  ['#2563EB', '#1D4ED8'],
  ['#EC4899', '#DB2777'],
  ['#0EA5E9', '#0284C7'],
];

function convertToDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getEventDate(event) {
  return convertToDate(
    event.startDate ||
      event.startAt ||
      event.startTime ||
      event.eventDate ||
      event.date,
  );
}

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

function SectionTitle({title, actionText, onActionPress, theme}) {
  return (
    <View style={styles.sectionHeader}>
      <Text
        style={[
          styles.sectionTitle,
          {color: theme.colors.text},
        ]}>
        {title}
      </Text>

      {actionText ? (
        <Pressable hitSlop={10} onPress={onActionPress}>
          <Text
            style={[
              styles.sectionAction,
              {
                color: theme.colors.primary || '#2563EB',
              },
            ]}>
            {actionText}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function PopularCommunityCard({community, index, width, onPress}) {
  const gradient =
    COMMUNITY_GRADIENTS[index % COMMUNITY_GRADIENTS.length];

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        {
          width,
          opacity: pressed ? 0.9 : 1,
          transform: [
            {
              scale: pressed ? 0.98 : 1,
            },
          ],
        },
      ]}>
      <LinearGradient
        colors={gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.communityCard}>
        <View style={styles.communityLogoContainer}>
          {community.logoURL ? (
            <Image
              source={{uri: community.logoURL}}
              resizeMode="cover"
              style={styles.communityLogo}
            />
          ) : (
            <Text style={styles.communityLogoFallback}>
              {community.name?.charAt(0)?.toUpperCase() || 'T'}
            </Text>
          )}
        </View>

        <Text numberOfLines={2} style={styles.communityName}>
          {community.name}
        </Text>

        <Text numberOfLines={1} style={styles.communityInfo}>
          {community.memberCount
            ? `${community.memberCount} üye`
            : `${community.eventCount} etkinlik`}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

export function DiscoverScreen({navigation}) {
  const [activeCategory, setActiveCategory] = useState('Tümü');

  const {width: screenWidth} = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();

  const {theme} = useTheme();
  const {profile} = useAuth();

  const {
    events = [],
    error,
    loading,
    selectEvent,
    startEventsListener,
  } = useEvents();

  useEffect(() => {
    const unsubscribe = startEventsListener();
    return typeof unsubscribe === 'function' ? unsubscribe : undefined;
  }, [startEventsListener]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (activeCategory === 'Tümü') {
      return events;
    }

    const databaseCategory = CATEGORY_MAP[activeCategory];

    return events.filter(event => event.category === databaseCategory);
  }, [events, activeCategory]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((firstEvent, secondEvent) => {
      const firstDate = getEventDate(firstEvent);
      const secondDate = getEventDate(secondEvent);

      if (!firstDate && !secondDate) return 0;
      if (!firstDate) return 1;
      if (!secondDate) return -1;

      return firstDate.getTime() - secondDate.getTime();
    });
  }, [filteredEvents]);

  const featuredEvent = useMemo(() => {
    return (
      sortedEvents.find(
        event => event.isFeatured === true || event.featured === true,
      ) || sortedEvents[0]
    );
  }, [sortedEvents]);

  const upcomingEvents = useMemo(() => {
    return sortedEvents
      .filter(event => event.id !== featuredEvent?.id)
      .slice(0, 8);
  }, [sortedEvents, featuredEvent]);

  const popularCommunities = useMemo(() => {
    const communityMap = new Map();

    (events || []).forEach(event => {
      const community = event.community || event.organizer || {};

      const communityId =
        event.communityId ||
        community.id ||
        event.organizerId ||
        event.communityName ||
        event.organizerName;

      const communityName =
        event.communityName || community.name || event.organizerName;

      if (!communityId || !communityName) {
        return;
      }

      const existingCommunity = communityMap.get(communityId);

      if (existingCommunity) {
        existingCommunity.eventCount += 1;

        if (
          !existingCommunity.memberCount &&
          (event.communityMemberCount || community.memberCount)
        ) {
          existingCommunity.memberCount =
            event.communityMemberCount || community.memberCount;
        }

        return;
      }

      communityMap.set(communityId, {
        id: communityId,
        name: communityName,

        logoURL:
          event.communityLogoURL ||
          community.logoURL ||
          community.logoUrl ||
          event.organizerLogoURL ||
          null,

        memberCount: event.communityMemberCount || community.memberCount || null,
        eventCount: 1,
      });
    });

    return [...communityMap.values()]
      .sort((first, second) => {
        const firstScore = first.memberCount || first.eventCount;
        const secondScore = second.memberCount || second.eventCount;

        return secondScore - firstScore;
      })
      .slice(0, 4);
  }, [events]);

  const eventCardWidth = Math.min(250, Math.max(210, screenWidth * 0.68));
  const communityCardWidth = (screenWidth - 44) / 2;

  function openEvent(event) {
    selectEvent(event);
    navigation.navigate(ROUTES.EVENT_DETAIL, {
      eventId: event.id,
    });
  }

  function openCommunity(community) {
    if (!ROUTES.COMMUNITY_DETAIL) return;
    navigation.navigate(ROUTES.COMMUNITY_DETAIL, {
      communityId: community.id,
    });
  }

  const hasEvents = filteredEvents.length > 0;

  return (
    <>
      <BrandHeader
        action={
          <IconButton
            accessibilityLabel="Bildirimler"
            icon={ICONS.bell}
            size={22}
            onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
          />
        }
      />

      <Screen padded={false}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: tabBarHeight + 20,
              backgroundColor: theme.colors.background || '#F8FAFC',
            },
          ]}>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greetingTitle, {color: theme.colors.text}]}>
              {getGreeting()}, {profile?.displayName || 'Campus'}
            </Text>

            <Text
              style={[
                styles.greetingSubtitle,
                {
                  color: theme.colors.mutedText,
                },
              ]}>
              Bugün kampüste neler oluyor keşfet.
            </Text>
          </View>

          <AppInput
            editable={false}
            pointerEvents="none"
            leftIcon={<SearchIcon size={20} color={theme.colors.subtleText} />}
            placeholder="Etkinlik, topluluk veya mekan ara..."
            style={styles.searchInput}
          />

          <ChipRow
            activeItem={activeCategory}
            items={Object.keys(CATEGORY_MAP)}
            onItemPress={setActiveCategory}
          />

          <StateView
            error={error}
            loading={loading && (!events || events.length === 0)}
            title="Etkinlikler yükleniyor..."
          />

          {!loading && !error && !hasEvents ? (
            <StateView empty title="Bu kategoride aktif etkinlik bulunamadı." />
          ) : null}

          {!loading && !error && hasEvents ? (
            <>
              <View style={styles.section}>
                <SectionTitle
                  title="Öne Çıkan Etkinlik"
                  actionText="Tümünü Gör"
                  onActionPress={() => setActiveCategory('Tümü')}
                  theme={theme}
                />

                <PopulerEventCard
                  event={featuredEvent}
                  theme={theme}
                  onPress={() => openEvent(featuredEvent)}
                />
              </View>

              {upcomingEvents.length > 0 ? (
                <View style={styles.section}>
                  <SectionTitle title="Yaklaşan Etkinlikler" theme={theme} />

                  <FlatList
                    horizontal
                    data={upcomingEvents}
                    keyExtractor={item => String(item.id)}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={({item}) => (
                      <EventCard
                        event={item}
                        width={eventCardWidth}
                        theme={theme}
                        onPress={() => openEvent(item)}
                      />
                    )}
                  />
                </View>
              ) : null}

              {popularCommunities.length > 0 ? (
                <View style={styles.section}>
                  <SectionTitle title="Popüler Topluluklar" theme={theme} />

                  <View style={styles.communityGrid}>
                    {popularCommunities.map((community, index) => (
                      <PopularCommunityCard
                        key={String(community.id)}
                        community={community}
                        index={index}
                        width={communityCardWidth}
                        onPress={() => openCommunity(community)}
                      />
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.fabContainer,
            {
              bottom: tabBarHeight + 14,
            },
          ]}>
          <Pressable
            onPress={() => navigation.navigate(ROUTES.CREATE_EVENT)}
            style={styles.fabPressable}
            android_ripple={{
              color: 'rgba(255,255,255,0.25)',
            }}>
            {({pressed}) => (
              <LinearGradient
                colors={['#7C3AED', '#2563EB']}
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0.5}}
                style={[styles.fabGradient, pressed && styles.fabPressed]}>
                <Text style={styles.fabIcon}>＋</Text>

                <Text style={styles.fabText}>Etkinlik Oluştur</Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },

  greetingContainer: {
    marginBottom: 14,
  },

  greetingTitle: {
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 25,
  },

  greetingSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
  },

  searchInput: {
    marginBottom: 16,
  },

  section: {
    marginTop: 22,
  },

  sectionHeader: {
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },

  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
  },

  horizontalList: {
    paddingRight: 16,
    gap: 12,
  },

  communityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  communityCard: {
    height: 112,
    padding: 12,
    borderRadius: 15,

    shadowColor: '#4338CA',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,

    elevation: 4,
  },

  communityLogoContainer: {
    width: 30,
    height: 30,
    marginBottom: 9,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  communityLogo: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },

  communityLogoFallback: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  communityName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },

  communityInfo: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.76)',
    fontSize: 9,
    fontWeight: '600',
  },

  fabContainer: {
    position: 'absolute',
    right: 18,

    borderRadius: 17,

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.32,
    shadowRadius: 10,

    elevation: 10,
  },

  fabPressable: {
    overflow: 'hidden',
    borderRadius: 17,
  },

  fabGradient: {
    height: 52,
    paddingHorizontal: 17,

    borderRadius: 17,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 7,
  },

  fabPressed: {
    opacity: 0.88,
    transform: [{scale: 0.97}],
  },

  fabIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 24,
  },

  fabText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
