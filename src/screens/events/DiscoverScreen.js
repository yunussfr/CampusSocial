import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

import {
  mdiAccountGroupOutline,
  mdiBasketball,
  mdiBellOutline,
  mdiMagnify,
  mdiMusicNote,
  mdiPaletteOutline,
  mdiPlus,
  mdiSchoolOutline,
  mdiTrophyOutline,
  mdiViewGridOutline,
} from '@mdi/js';

import {
  BrandHeader,
  Screen,
  StateView,
} from '../../components/ui/DesignSystem';

import {MdiIcon} from '../../components/ui/MdiIcon';

import FeaturedEventCard from '../../components/events/FeaturedEventCard';
import ActiveCommunityCard from '../../components/events/ActiveCommunityCard';
import UpcomingEventRow from '../../components/events/UpcomingEventRow';

import {IMAGES} from '../../constants/assets';
import {ROUTES} from '../../constants/routes';

import {useCommunities} from '../../context/CommunityContext';
import {useEvents} from '../../context/EventContext';
import {useTheme} from '../../context/ThemeContext';

const CATEGORY_OPTIONS = [
  {
    key: 'all',
    label: 'Tümü',
    value: null,
    icon: mdiViewGridOutline,
  },
  {
    key: 'academic',
    label: 'Akademik',
    value: 'Akademik',
    icon: mdiSchoolOutline,
  },
  {
    key: 'education',
    label: 'Eğitim ve Atölye',
    value: 'Eğitim ve Atölye',
    icon: mdiSchoolOutline,
  },
  {
    key: 'career',
    label: 'Kariyer',
    value: 'Kariyer',
    icon: mdiTrophyOutline,
  },
  {
    key: 'technology',
    label: 'Teknoloji',
    value: 'Teknoloji',
    icon: mdiViewGridOutline,
  },
  {
    key: 'sports',
    label: 'Spor',
    value: 'Spor',
    icon: mdiBasketball,
  },
  {
    key: 'art',
    label: 'Kültür ve Sanat',
    value: 'Kültür ve Sanat',
    icon: mdiPaletteOutline,
  },
  {
    key: 'music',
    label: 'Müzik',
    value: 'Müzik',
    icon: mdiMusicNote,
  },
];

const FEATURED_LIMIT = 3;
const ACTIVE_COMMUNITY_LIMIT = 5;
const UPCOMING_LIMIT = 8;

export function DiscoverScreen({navigation}) {
  const [activeCategoryKey, setActiveCategoryKey] =
    useState('all');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [featuredIndex, setFeaturedIndex] =
    useState(0);

  const {width: screenWidth} =
    useWindowDimensions();

  const tabBarHeight =
    useBottomTabBarHeight();

  const {theme} = useTheme();

  const {
    events = [],
    error,
    loading,
    selectEvent,
    startEventsListener,
  } = useEvents();

  const {
    communities = [],
    selectCommunity,
    startCommunitiesListener,
  } = useCommunities();

  /*
   * EventContext ve CommunityContext içindeki
   * Firestore listener'larını başlatır.
   *
   * Context provider bu listener'ları zaten
   * merkezi olarak başlatıyorsa, burada ikinci kez
   * listener açılmaması gerekir. Bu nokta proje
   * yapısına göre kontrol edilmelidir.
   */
  useEffect(() => {
    const unsubscribeEvents =
      startEventsListener?.();

    const unsubscribeCommunities =
      startCommunitiesListener?.();

    return () => {
      if (
        typeof unsubscribeEvents === 'function'
      ) {
        unsubscribeEvents();
      }

      if (
        typeof unsubscribeCommunities === 'function'
      ) {
        unsubscribeCommunities();
      }
    };
  }, [
    startEventsListener,
    startCommunitiesListener,
  ]);

  const selectedCategory = useMemo(() => {
    return (
      CATEGORY_OPTIONS.find(
        category =>
          category.key === activeCategoryKey,
      ) || CATEGORY_OPTIONS[0]
    );
  }, [activeCategoryKey]);

  /*
   * Sadece gelecekteki etkinlikleri sıralar.
   *
   * Tarihi olmayan etkinlikler tamamen kaybolmasın
   * diye listenin sonuna bırakılır.
   */
  const sortedFutureEvents = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return [...events]
      .filter(event => {
        const date = getEventDate(event);

        return !date || date >= startOfToday;
      })
      .sort(compareEventsByDate);
  }, [events]);

  /*
   * Kategori ve arama sorgusunu aynı anda uygular.
   *
   * Arama; etkinlik adı, konum ve topluluk adı
   * üzerinden çalışır.
   */
  const visibleEvents = useMemo(() => {
    const normalizedQuery =
      normalizeSearchText(searchQuery);

    return sortedFutureEvents.filter(event => {
      const categoryMatches =
        !selectedCategory.value ||
        getEventCategory(event) ===
          selectedCategory.value;

      if (!categoryMatches) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableValues = [
        getEventTitle(event),
        getEventLocation(event),
        getEventCommunityName(event),
        getEventCategory(event),
      ];

      return searchableValues.some(value =>
        normalizeSearchText(value).includes(
          normalizedQuery,
        ),
      );
    });
  }, [
    sortedFutureEvents,
    selectedCategory,
    searchQuery,
  ]);

  /*
   * Öne çıkan etkinliklerin tümü yatay kaydırılır.
   *
   * Firebase belgesinde isFeatured veya featured
   * alanı bulunmuyorsa ilk etkinlikler öne çıkarılır.
   */
  const featuredEvents = useMemo(() => {
    const explicitlyFeatured =
      visibleEvents.filter(
        event =>
          event.isFeatured === true ||
          event.featured === true,
      );

    const source =
      explicitlyFeatured.length > 0
        ? explicitlyFeatured
        : visibleEvents;

    return source
      .slice(0, FEATURED_LIMIT)
      .map(createEventViewModel);
  }, [visibleEvents]);

  const featuredIds = useMemo(() => {
    return new Set(
      featuredEvents.map(event => event.id),
    );
  }, [featuredEvents]);

  /*
   * Öne çıkan etkinlikleri tekrar göstermeden
   * yaklaşan etkinlikleri dikey listeye dönüştürür.
   */
  const upcomingEvents = useMemo(() => {
    return visibleEvents
      .filter(event => {
        const id = String(
          event.id || event.uid || '',
        );

        return !featuredIds.has(id);
      })
      .slice(0, UPCOMING_LIMIT)
      .map(createEventViewModel);
  }, [visibleEvents, featuredIds]);

  /*
   * Events belgelerinde communityId yazılmadığı için
   * aktif topluluk sıralaması mevcut community.memberCount
   * alanıyla yapılır.
   */
  const activeCommunities = useMemo(() => {
    const normalizedQuery =
      normalizeSearchText(searchQuery);

    return communities
      .map(community => ({
        id: String(community.id),
        raw: community,
        name: community.name || 'Topluluk',
        logoURL: community.iconURL || community.coverURL || null,
        memberCount: getCommunityMemberCount(community),
        activityScore: getCommunityMemberCount(community),
      }))
      .filter(community => {
        if (!normalizedQuery) {
          return true;
        }

        return normalizeSearchText(
          community.name,
        ).includes(normalizedQuery);
      })
      .sort((first, second) => {
        if (
          first.activityScore !==
          second.activityScore
        ) {
          return (
            second.activityScore -
            first.activityScore
          );
        }

        return first.name.localeCompare(
          second.name,
          'tr-TR',
        );
      })
      .slice(0, ACTIVE_COMMUNITY_LIMIT)
      .map((community, index) => ({
        ...community,
        rank: index + 1,
      }));
  }, [communities, searchQuery]);

  const featuredCardWidth = Math.min(
    screenWidth - 48,
    370,
  );

  const activeCommunityCardWidth =
    Math.min(205, screenWidth * 0.53);

  const isInitialLoading =
    loading && events.length === 0;

  const hasAnyContent =
    featuredEvents.length > 0 ||
    upcomingEvents.length > 0 ||
    activeCommunities.length > 0;

  function openEvent(event) {
    const sourceEvent =
      events.find(
        item =>
          String(item.id || item.uid) ===
          String(event.id),
      ) || event.raw;

    if (sourceEvent && selectEvent) {
      selectEvent(sourceEvent);
    }

    navigation.navigate(
      ROUTES.EVENT_DETAIL,
      {
        eventId: event.id,
      },
    );
  }

  function openCommunity(community) {
    if (community.raw && selectCommunity) {
      selectCommunity(community.raw);
    }

    /*
     * DiscoverScreen, EventsTab içinde çalışıyor.
     * CommunityDetailScreen başka bir tab stack'inde
     * olduğu için nested navigation kullanılıyor.
     */
    navigation.navigate(
      'CommunitiesTab',
      {
        screen: ROUTES.COMMUNITY_DETAIL,
        params: {
          communityId: community.id,
        },
      },
    );
  }

  function openCommunityList() {
    navigation.navigate(
      'CommunitiesTab',
      {
        screen: ROUTES.COMMUNITY_LIST,
      },
    );
  }

  function handleFeaturedScroll(event) {
    const offsetX =
      event.nativeEvent.contentOffset.x;

    const nextIndex = Math.round(
      offsetX /
        (featuredCardWidth + 12),
    );

    setFeaturedIndex(nextIndex);
  }

  return (
    <>
      <BrandHeader
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bildirimler"
            hitSlop={10}
            onPress={() =>
              navigation.navigate(
                ROUTES.NOTIFICATIONS,
              )
            }
            style={({pressed}) => [
              styles.headerAction,
              {
                borderColor:
                  theme.colors.border,
                backgroundColor:
                  theme.colors.surface,
                opacity: pressed ? 0.75 : 1,
              },
            ]}>
            <MdiIcon
              path={mdiBellOutline}
              size={23}
              color={theme.colors.primary}
            />
          </Pressable>
        }
      />

      <Screen padded={false}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                tabBarHeight + 92,
              backgroundColor:
                theme.colors.background,
            },
          ]}>
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
            ]}>
            <MdiIcon
              path={mdiMagnify}
              size={24}
              color={theme.colors.mutedText}
            />

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Etkinlik, topluluk veya mekan ara..."
              placeholderTextColor={
                theme.colors.mutedText
              }
              returnKeyType="search"
              autoCorrect={false}
              style={[
                styles.searchInput,
                {
                  color: theme.colors.text,
                },
              ]}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.categoryList
            }>
            {CATEGORY_OPTIONS.map(category => {
              const isActive =
                activeCategoryKey ===
                category.key;

              return (
                <Pressable
                  key={category.key}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: isActive,
                  }}
                  onPress={() =>
                    setActiveCategoryKey(
                      category.key,
                    )
                  }
                  style={({pressed}) => [
                    styles.categoryChip,
                    {
                      borderColor: isActive
                        ? theme.colors.primary
                        : theme.colors.border,

                      backgroundColor: isActive
                        ? theme.colors.primary
                        : theme.colors.surface,

                      opacity: pressed
                        ? 0.78
                        : 1,
                    },
                  ]}>
                  <MdiIcon
                    path={category.icon}
                    size={18}
                    color={
                      isActive
                        ? '#FFFFFF'
                        : theme.colors.mutedText
                    }
                  />

                  <Text
                    style={[
                      styles.categoryLabel,
                      {
                        color: isActive
                          ? '#FFFFFF'
                          : theme.colors.text,
                      },
                    ]}>
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <StateView
            error={error}
            loading={isInitialLoading}
            title="Etkinlikler yükleniyor..."
          />

          {!isInitialLoading &&
          !error &&
          !hasAnyContent ? (
            <StateView
              empty
              title="Aramana uygun etkinlik veya topluluk bulunamadı."
            />
          ) : null}

          {!isInitialLoading &&
          !error &&
          hasAnyContent ? (
            <>
              {featuredEvents.length > 0 ? (
                <View style={styles.section}>
                  <SectionHeader
                    iconPath={mdiViewGridOutline}
                    title="Öne Çıkan Etkinlikler"
                    theme={theme}
                  />

                  <FlatList
                    horizontal
                    data={featuredEvents}
                    keyExtractor={item =>
                      String(item.id)
                    }
                    renderItem={({item}) => (
                      <FeaturedEventCard
                        item={item}
                        width={
                          featuredCardWidth
                        }
                        theme={theme}
                        onPress={() =>
                          openEvent(item)
                        }
                      />
                    )}
                    ItemSeparatorComponent={() => (
                      <View
                        style={
                          styles.featuredSeparator
                        }
                      />
                    )}
                    decelerationRate="fast"
                    snapToInterval={
                      featuredCardWidth + 12
                    }
                    snapToAlignment="start"
                    showsHorizontalScrollIndicator={
                      false
                    }
                    onMomentumScrollEnd={
                      handleFeaturedScroll
                    }
                    contentContainerStyle={
                      styles.featuredList
                    }
                  />

                  {featuredEvents.length > 1 ? (
                    <View
                      style={styles.pagination}>
                      {featuredEvents.map(
                        (_, index) => (
                          <View
                            key={String(index)}
                            style={[
                              styles.paginationDot,
                              {
                                backgroundColor:
                                  index ===
                                  featuredIndex
                                    ? theme.colors
                                        .primary
                                    : theme.colors
                                        .border,
                              },
                              index ===
                                featuredIndex &&
                                styles
                                  .paginationDotActive,
                            ]}
                          />
                        ),
                      )}
                    </View>
                  ) : null}
                </View>
              ) : null}

              {activeCommunities.length > 0 ? (
                <View style={styles.section}>
                  <SectionHeader
                    iconPath={mdiTrophyOutline}
                    title="En Aktif Topluluklar"
                    theme={theme}
                    actionText="Tümünü Gör"
                    onActionPress={
                      openCommunityList
                    }
                  />

                  <FlatList
                    horizontal
                    data={activeCommunities}
                    keyExtractor={item =>
                      String(item.id)
                    }
                    renderItem={({item}) => (
                      <ActiveCommunityCard
                        item={item}
                        width={
                          activeCommunityCardWidth
                        }
                        theme={theme}
                        onPress={() =>
                          openCommunity(item)
                        }
                      />
                    )}
                    ItemSeparatorComponent={() => (
                      <View
                        style={
                          styles.communitySeparator
                        }
                      />
                    )}
                    showsHorizontalScrollIndicator={
                      false
                    }
                    contentContainerStyle={
                      styles.communityList
                    }
                  />
                </View>
              ) : null}

              {upcomingEvents.length > 0 ? (
                <View style={styles.section}>
                  <SectionHeader
                    iconPath={
                      mdiAccountGroupOutline
                    }
                    title="Yaklaşan Etkinlikler"
                    theme={theme}
                  />

                  <View style={styles.upcomingList}>
                    {upcomingEvents.map(event => (
                      <UpcomingEventRow
                        key={String(event.id)}
                        item={event}
                        theme={theme}
                        onPress={() =>
                          openEvent(event)
                        }
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
            accessibilityRole="button"
            accessibilityLabel="Etkinlik oluştur"
            onPress={() =>
              navigation.navigate(
                ROUTES.CREATE_EVENT,
              )
            }
            style={styles.fabPressable}>
            {({pressed}) => (
              <LinearGradient
                colors={[
                  '#7C3AED',
                  '#2563EB',
                ]}
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0.5}}
                style={[
                  styles.fabGradient,
                  pressed && styles.fabPressed,
                ]}>
                <MdiIcon
                  path={mdiPlus}
                  size={26}
                  color="#FFFFFF"
                />

                <Text style={styles.fabText}>
                  Etkinlik Oluştur
                </Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </Screen>
    </>
  );
}

function SectionHeader({
  iconPath,
  title,
  theme,
  actionText,
  onActionPress,
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View
          style={[
            styles.sectionIconContainer,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}>
          <MdiIcon
            path={iconPath}
            size={20}
            color={theme.colors.primary}
          />
        </View>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.text,
            },
          ]}>
          {title}
        </Text>
      </View>

      {actionText ? (
        <Pressable
          hitSlop={10}
          onPress={onActionPress}>
          <Text
            style={[
              styles.sectionAction,
              {
                color: theme.colors.primary,
              },
            ]}>
            {actionText}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createEventViewModel(event) {
  const date = getEventDate(event);

  const imageURL = event.coverURL || null;

  return {
    id: String(event.id),

    raw: event,

    title: getEventTitle(event),

    description: event.description || '',

    categoryLabel:
      getEventCategory(event) ||
      'Etkinlik',

    location: getEventLocation(event),

    participantCount:
      getEventParticipantCount(event),

    dateLabel: date
      ? new Intl.DateTimeFormat('tr-TR', {
          day: 'numeric',
          month: 'long',
          weekday: 'short',
        }).format(date)
      : 'Tarih belirtilmedi',

    timeLabel: date
      ? new Intl.DateTimeFormat('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(date)
      : '--:--',

    day: date
      ? String(date.getDate()).padStart(
          2,
          '0',
        )
      : '--',

    month: date
      ? new Intl.DateTimeFormat('tr-TR', {
          month: 'short',
        })
          .format(date)
          .replace('.', '')
          .toLocaleUpperCase('tr-TR')
      : '',

    imageSource: imageURL
      ? {uri: imageURL}
      : IMAGES.coverPlaceholder,

    fallbackImageSource:
      IMAGES.coverPlaceholder,
  };
}

function getEventDate(event) {
  return convertToDate(event.startDate);
}

function convertToDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function compareEventsByDate(
  firstEvent,
  secondEvent,
) {
  const firstDate =
    getEventDate(firstEvent);

  const secondDate =
    getEventDate(secondEvent);

  if (!firstDate && !secondDate) {
    return 0;
  }

  if (!firstDate) {
    return 1;
  }

  if (!secondDate) {
    return -1;
  }

  return (
    firstDate.getTime() -
    secondDate.getTime()
  );
}

function getEventTitle(event) {
  return event.title || 'Etkinlik';
}

function getEventLocation(event) {
  if (event.locationLabel) {
    return event.locationLabel;
  }

  if (
    event.location &&
    typeof event.location === 'object'
  ) {
    return formatCoordinate(event.location);
  }

  return event.location || 'Kampüs';
}

function getEventCategory(event) {
  return event.category || '';
}

function getEventCommunityName(event) {
  return event.organizer?.displayName || '';
}

function getEventParticipantCount(event) {
  return Number(event.attendeeCount || 0) || 0;
}

function getCommunityMemberCount(community) {
  return Number(community.memberCount || 0) || 0;
}

function normalizeSearchText(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('tr-TR');
}

function formatCoordinate(coordinate) {
  const latitude = Number(coordinate.latitude);
  const longitude = Number(coordinate.longitude);

  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return 'Harita konumu';
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 28,
    paddingHorizontal: 16,
  },

  headerAction: {
    width: 42,
    height: 42,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderRadius: 14,
  },

  searchContainer: {
    minHeight: 58,

    paddingHorizontal: 16,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 11,

    borderWidth: 1,
    borderRadius: 18,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,

    fontSize: 14,
    fontWeight: '600',
  },

  categoryList: {
    paddingTop: 16,
    paddingRight: 16,

    gap: 10,
  },

  categoryChip: {
    minHeight: 46,

    paddingHorizontal: 15,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 7,

    borderWidth: 1,
    borderRadius: 23,
  },

  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
  },

  section: {
    marginTop: 26,
  },

  sectionHeader: {
    marginBottom: 13,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  sectionIconContainer: {
    width: 34,
    height: 34,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderRadius: 11,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  sectionAction: {
    fontSize: 12,
    fontWeight: '800',
  },

  featuredList: {
    paddingRight: 16,
  },

  featuredSeparator: {
    width: 12,
  },

  pagination: {
    marginTop: 13,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 7,
  },

  paginationDot: {
    width: 7,
    height: 7,

    borderRadius: 4,
  },

  paginationDotActive: {
    width: 20,
  },

  communityList: {
    paddingRight: 16,
  },

  communitySeparator: {
    width: 12,
  },

  upcomingList: {
    gap: 11,
  },

  fabContainer: {
    position: 'absolute',
    right: 18,

    borderRadius: 18,

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.34,
    shadowRadius: 12,

    elevation: 12,
  },

  fabPressable: {
    overflow: 'hidden',
    borderRadius: 18,
  },

  fabGradient: {
    height: 56,

    paddingHorizontal: 20,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    borderRadius: 18,
  },

  fabPressed: {
    opacity: 0.86,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
