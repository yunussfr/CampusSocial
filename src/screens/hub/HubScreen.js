import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

import Svg, {Path} from 'react-native-svg';

import {
  mdiAccountGroupOutline,
  mdiAccountSearchOutline,
  mdiCalendarCheckOutline,
  mdiChevronRight,
} from '@mdi/js';
import {SearchIcon} from '../../components/ui/SearchIcon';

import {useAuth} from '../../context/AuthContext';
import {useCommunities} from '../../context/CommunityContext';
import {useEvents} from '../../context/EventContext';
import {useTheme} from '../../context/ThemeContext';

import {getProfilePlaceholder} from '../../constants/assets';
import {ROUTES} from '../../constants/routes';

const INITIAL_VISIBLE_USER_COUNT = 5;
const LOAD_MORE_STEP = 5;
const FIRESTORE_USER_LIMIT = 30;

export function HubScreen({navigation}) {
  const {theme} = useTheme();
  const {user} = useAuth();

  const {
    communities = [],
    startCommunitiesListener,
  } = useCommunities();

  const {
    events = [],
    startEventsListener,
  } = useEvents();

  const tabBarHeight = useBottomTabBarHeight();

  const [searchQuery, setSearchQuery] = useState('');

  const [people, setPeople] = useState([]);
  const [peopleLoading, setPeopleLoading] =
    useState(true);
  const [peopleError, setPeopleError] =
    useState('');

  const [
    visiblePeopleCount,
    setVisiblePeopleCount,
  ] = useState(INITIAL_VISIBLE_USER_COUNT);

  /*
   * Etkinlik ve topluluk context listener'larını başlatır.
   *
   * Bu listener'lar Hub ekranındaki:
   * - Katıldığım Etkinlikler
   * - Topluluklarım
   *
   * kartlarının sayılarını üretmek için kullanılır.
   */
  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    const unsubscribeCommunities =
      startCommunitiesListener?.();

    const unsubscribeEvents =
      startEventsListener?.();

    return () => {
      if (
        typeof unsubscribeCommunities === 'function'
      ) {
        unsubscribeCommunities();
      }

      if (
        typeof unsubscribeEvents === 'function'
      ) {
        unsubscribeEvents();
      }
    };
  }, [
    user?.uid,
    startCommunitiesListener,
    startEventsListener,
  ]);

  /*
   * Firestore users koleksiyonunu gerçek zamanlı dinler.
   *
   * Mevcut kullanıcı sonuçlardan çıkarılır.
   * En fazla 30 kullanıcı alınır.
   *
   * Burada henüz kişiselleştirilmiş bir öneri
   * algoritması kullanılmıyor. "Önerilen kişiler",
   * mevcut kullanıcı dışındaki kullanıcılardır.
   */
  useEffect(() => {
    if (!user?.uid) {
      setPeople([]);
      setPeopleLoading(false);

      return undefined;
    }

    setPeopleLoading(true);
    setPeopleError('');

    const unsubscribe = firestore()
      .collection('users')
      .limit(FIRESTORE_USER_LIMIT)
      .onSnapshot(
        snapshot => {
          const nextPeople = snapshot.docs
            .map(document => {
              const data = document.data();

              return {
                ...data,

                // Firestore document kimliği
                id: document.id,

                /*
                 * Bazı projelerde UID belge kimliğidir,
                 * bazı projelerde ayrıca uid alanı vardır.
                 * İki yapıyı da destekliyoruz.
                 */
                uid: data.uid || document.id,
              };
            })
            .filter(person => {
              return person.uid !== user.uid;
            })
            .sort(sortPeople);

          setPeople(nextPeople);
          setPeopleLoading(false);
          setPeopleError('');
        },
        error => {
          console.error(
            'Hub kullanıcıları alınamadı:',
            error,
          );

          setPeople([]);
          setPeopleLoading(false);
          setPeopleError(
            'Kişiler şu anda yüklenemedi.',
          );
        },
      );

    return unsubscribe;
  }, [user?.uid]);

  /*
   * Kullanıcının üye olduğu toplulukları bulur.
   *
   * Bu kod, community belgelerinde memberIds
   * isimli bir array bulunduğunu varsayar.
   */
  const myCommunities = useMemo(() => {
    if (!user?.uid) {
      return [];
    }

    return communities.filter(community => {
      return community.memberIds?.includes(user.uid);
    });
  }, [communities, user?.uid]);

  /*
   * Kullanıcının katıldığı etkinlikleri bulur.
   *
   * Bu kod, event belgelerinde attendeeIds
   * isimli bir array bulunduğunu varsayar.
   */
  const myEvents = useMemo(() => {
    if (!user?.uid) {
      return [];
    }

    return events.filter(event => {
      return event.attendeeIds?.includes(user.uid);
    });
  }, [events, user?.uid]);

  /*
   * Kullanıcı aramasını yalnızca görünür profil
   * alanları üzerinden yapar.
   *
   * interests kullanılmaz.
   * email ve fcmToken gibi özel alanlar aranmaz
   * veya gösterilmez.
   */
  const filteredPeople = useMemo(() => {
    const normalizedQuery =
      normalizeSearchText(searchQuery);

    if (!normalizedQuery) {
      return people;
    }

    return people.filter(person => {
      const searchableValues = [
        person.displayName,
        person.username,
        person.department,
      ];

      return searchableValues.some(value => {
        return normalizeSearchText(value).includes(
          normalizedQuery,
        );
      });
    });
  }, [people, searchQuery]);

  /*
   * Ekranda ilk etapta 5 kullanıcı gösterilir.
   * "Daha fazla gör" ile 5'er kullanıcı eklenir.
   */
  const visiblePeople = useMemo(() => {
    return filteredPeople.slice(
      0,
      visiblePeopleCount,
    );
  }, [filteredPeople, visiblePeopleCount]);

  const hasMorePeople =
    filteredPeople.length > visiblePeopleCount;

  /*
   * Yeni bir arama başladığında sonuç sayısını
   * tekrar başlangıç değerine getirir.
   */
  useEffect(() => {
    setVisiblePeopleCount(
      INITIAL_VISIBLE_USER_COUNT,
    );
  }, [searchQuery]);

  const colors = {
    background: theme.colors.background,
    surface: theme.colors.surface,
    text: theme.colors.text,
    muted: theme.colors.mutedText,
    subtle:
      theme.colors.subtleText ||
      theme.colors.mutedText,
    primary: theme.colors.primary,
    border: theme.colors.border,
  };

  function openUserProfile(person) {
    /*
     * UserProfileScreen, ProfileTab içerisindeki
     * ProfileStack'e kayıtlı olduğu için iç içe
     * navigation kullanıyoruz.
     *
     * Hem userId hem uid gönderilmesinin nedeni,
     * UserProfileScreen'in hangi parametreyi
     * beklediğini burada kesin olarak bilmememizdir.
     */
    navigation.navigate('ProfileTab', {
      screen: ROUTES.USER_PROFILE,
      params: {
        userId: person.uid,
        userProfile: person,
      },
    });
  }

  function showMorePeople() {
    setVisiblePeopleCount(currentCount => {
      return currentCount + LOAD_MORE_STEP;
    });
  }

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
        },
      ]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            /*
             * Bottom Tab absolute olduğu için
             * son kullanıcı kartının tab bar altında
             * kalmasını engeller.
             */
            paddingBottom: tabBarHeight + 48,
          },
        ]}>
        {/* Sayfa başlığı */}
        <View style={styles.header}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.text,
              },
            ]}>
            Hub
          </Text>

          <Text
            style={[
              styles.headerSubtitle,
              {
                color: colors.muted,
              },
            ]}>
            Etkinliklerini, topluluklarını ve
            kampüsteki kişileri keşfet.
          </Text>
        </View>

        {/* Yalnızca kişi araması */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <SearchIcon size={22} color={colors.muted} />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Kişi adı, kullanıcı adı veya bölüm ara..."
            placeholderTextColor={colors.subtle}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={[
              styles.searchInput,
              {
                color: colors.text,
              },
            ]}
          />
        </View>

        {/* Etkinlik ve topluluk kartları */}
        <View style={styles.summaryGrid}>
          <SummaryCard
            title="Katıldığım Etkinlikler"
            subtitle="Etkinliklerini görüntüle"
            countLabel={
              myEvents.length > 0
                ? `${myEvents.length} etkinlik`
                : 'Etkinlik yok'
            }
            iconPath={mdiCalendarCheckOutline}
            iconColor="#7C3AED"
            iconBackground="#F3EEFF"
            theme={theme}
            onPress={() =>
              navigation.navigate(ROUTES.MY_EVENTS)
            }
          />

          <SummaryCard
            title="Topluluklarım"
            subtitle="Üyesi olduğun gruplar"
            countLabel={
              myCommunities.length > 0
                ? `${myCommunities.length} aktif grup`
                : 'Topluluk yok'
            }
            iconPath={mdiAccountGroupOutline}
            iconColor="#EA580C"
            iconBackground="#FFF7ED"
            theme={theme}
            onPress={() =>
              navigation.navigate(
                ROUTES.MY_COMMUNITIES,
              )
            }
          />
        </View>

        {/* Kullanıcı keşif bölümü */}
        <View style={styles.peopleSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}>
                Önerilen Kişiler
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color: colors.muted,
                  },
                ]}>
                CampusMerge kullanıcılarını keşfet.
              </Text>
            </View>
          </View>

          {peopleLoading ? (
            <View
              style={[
                styles.stateCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}>
              <ActivityIndicator
                color={colors.primary}
              />

              <Text
                style={[
                  styles.stateTitle,
                  {
                    color: colors.text,
                  },
                ]}>
                Kişiler yükleniyor
              </Text>
            </View>
          ) : peopleError ? (
            <View
              style={[
                styles.stateCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}>
              <MdiIcon
                path={mdiAccountSearchOutline}
                size={38}
                color={colors.muted}
              />

              <Text
                style={[
                  styles.stateTitle,
                  {
                    color: colors.text,
                  },
                ]}>
                Kişiler yüklenemedi
              </Text>

              <Text
                style={[
                  styles.stateDescription,
                  {
                    color: colors.muted,
                  },
                ]}>
                {peopleError}
              </Text>
            </View>
          ) : filteredPeople.length === 0 ? (
            /*
             * Firebase isteği başarılı oldu fakat
             * gösterilebilecek kullanıcı bulunamadı.
             */
            <View
              style={[
                styles.stateCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}>
              <MdiIcon
                path={mdiAccountSearchOutline}
                size={42}
                color={colors.muted}
              />

              <Text
                style={[
                  styles.stateTitle,
                  {
                    color: colors.text,
                  },
                ]}>
                Hiç kimse bulunamadı
              </Text>

              <Text
                style={[
                  styles.stateDescription,
                  {
                    color: colors.muted,
                  },
                ]}>
                {searchQuery.trim()
                  ? 'Aramana uygun bir kullanıcı bulunamadı.'
                  : 'Şu anda gösterilebilecek başka bir kullanıcı yok.'}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.peopleList}>
                {visiblePeople.map(person => (
                  <PersonCard
                    key={person.uid || person.id}
                    person={person}
                    theme={theme}
                    onPress={() =>
                      openUserProfile(person)
                    }
                  />
                ))}
              </View>

              {hasMorePeople ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={showMorePeople}
                  style={({pressed}) => [
                    styles.moreButton,
                    {
                      borderColor: colors.border,
                      backgroundColor:
                        colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.moreButtonText,
                      {
                        color: colors.primary,
                      },
                    ]}>
                    Daha fazla gör
                  </Text>

                  <MdiIcon
                    path={mdiChevronRight}
                    size={20}
                    color={colors.primary}
                  />
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/*
 * Etkinlik ve topluluk özet kartlarının
 * ortak componenti.
 */
function SummaryCard({
  title,
  subtitle,
  countLabel,
  iconPath,
  iconColor,
  iconBackground,
  onPress,
  theme,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.summaryCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <View
        style={[
          styles.summaryIconContainer,
          {
            backgroundColor: iconBackground,
          },
        ]}>
        <MdiIcon
          path={iconPath}
          size={27}
          color={iconColor}
        />
      </View>

      <Text
        numberOfLines={2}
        style={[
          styles.summaryTitle,
          {
            color: theme.colors.text,
          },
        ]}>
        {title}
      </Text>

      <Text
        numberOfLines={2}
        style={[
          styles.summarySubtitle,
          {
            color: theme.colors.mutedText,
          },
        ]}>
        {subtitle}
      </Text>

      <View
        style={[
          styles.summaryBadge,
          {
            backgroundColor: iconBackground,
          },
        ]}>
        <Text
          style={[
            styles.summaryBadgeText,
            {
              color: iconColor,
            },
          ]}>
          {countLabel}
        </Text>
      </View>
    </Pressable>
  );
}

/*
 * Tek kullanıcı kartı.
 *
 * İlgi alanı gösterilmez.
 * E-posta ve FCM token gibi özel alanlar
 * hiçbir şekilde UI'a aktarılmaz.
 */
const PersonCard = React.memo(function PersonCard({
  person,
  onPress,
  theme,
}) {
  const [imageFailed, setImageFailed] =
    useState(false);

  const hasRemotePhoto =
    Boolean(person.photoURL) && !imageFailed;

  const imageSource = hasRemotePhoto
    ? {
        uri: person.photoURL,
      }
    : getProfilePlaceholder(person);

  const displayName =
    person.displayName ||
    person.username ||
    'İsimsiz kullanıcı';

  const username = person.username
    ? `@${String(person.username).replace(
        /^@/,
        '',
      )}`
    : '';

  const primaryDetail =
    person.department ||
    username ||
    'CampusMerge kullanıcısı';

  const secondaryDetail =
    person.department && username
      ? username
      : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${displayName} profilini aç`}
      onPress={onPress}
      style={({pressed}) => [
        styles.personCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.88 : 1,
        },
      ]}>
      <Image
        source={imageSource}
        resizeMode="cover"
        onError={() => setImageFailed(true)}
        style={styles.personAvatar}
      />

      <View style={styles.personContent}>
        <Text
          numberOfLines={1}
          style={[
            styles.personName,
            {
              color: theme.colors.text,
            },
          ]}>
          {displayName}
        </Text>

        <Text
          numberOfLines={1}
          style={[
            styles.personDepartment,
            {
              color: theme.colors.mutedText,
            },
          ]}>
          {primaryDetail}
        </Text>

        {secondaryDetail ? (
          <Text
            numberOfLines={1}
            style={[
              styles.personUsername,
              {
                color:
                  theme.colors.subtleText ||
                  theme.colors.mutedText,
              },
            ]}>
            {secondaryDetail}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.personArrow,
          {
            borderColor: theme.colors.border,
          },
        ]}>
        <MdiIcon
          path={mdiChevronRight}
          size={22}
          color={theme.colors.primary}
        />
      </View>
    </Pressable>
  );
});

/*
 * Firestore Timestamp değerini sıralanabilir
 * milisaniye değerine dönüştürür.
 */
function getTimestampMilliseconds(value) {
  if (!value) {
    return 0;
  }

  if (typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  if (typeof value.toDate === 'function') {
    return value.toDate().getTime();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 0
    : date.getTime();
}

/*
 * Yeni oluşturulan kullanıcıları üstte gösterir.
 * createdAt bulunmuyorsa ad sırasını kullanır.
 */
function sortPeople(firstPerson, secondPerson) {
  const firstCreatedAt =
    getTimestampMilliseconds(
      firstPerson.createdAt,
    );

  const secondCreatedAt =
    getTimestampMilliseconds(
      secondPerson.createdAt,
    );

  if (firstCreatedAt !== secondCreatedAt) {
    return secondCreatedAt - firstCreatedAt;
  }

  return String(
    firstPerson.displayName || '',
  ).localeCompare(
    String(secondPerson.displayName || ''),
    'tr',
  );
}

/*
 * Türkçe karakterlerin büyük/küçük harf
 * karşılaştırmasını daha düzgün yapar.
 */
function normalizeSearchText(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('tr-TR');
}

function MdiIcon({
  path,
  size = 24,
  color = '#64748B',
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24">
      <Path
        d={path}
        fill={color}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 24,
    gap: 20,
  },

  header: {
    gap: 4,
  },

  headerTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  searchContainer: {
    minHeight: 56,
    paddingHorizontal: 16,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,

    borderWidth: 1,
    borderRadius: 18,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,

    fontSize: 14,
    fontWeight: '600',
  },

  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  summaryCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 210,

    padding: 16,

    borderWidth: 1,
    borderRadius: 20,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,

    elevation: 2,
  },

  summaryIconContainer: {
    width: 48,
    height: 48,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 15,
  },

  summaryTitle: {
    marginTop: 14,

    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },

  summarySubtitle: {
    marginTop: 5,

    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },

  summaryBadge: {
    marginTop: 'auto',
    alignSelf: 'flex-start',

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 999,
  },

  summaryBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },

  peopleSection: {
    gap: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '900',
  },

  sectionSubtitle: {
    marginTop: 3,

    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },

  peopleList: {
    gap: 10,
  },

  personCard: {
    minHeight: 82,
    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,

    borderWidth: 1,
    borderRadius: 18,
  },

  personAvatar: {
    width: 56,
    height: 56,

    borderRadius: 28,
    backgroundColor: '#E2E8F0',
  },

  personContent: {
    flex: 1,
    minWidth: 0,
  },

  personName: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },

  personDepartment: {
    marginTop: 3,

    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  personUsername: {
    marginTop: 2,

    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },

  personArrow: {
    width: 38,
    height: 38,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderRadius: 12,
  },

  moreButton: {
    minHeight: 48,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,

    borderWidth: 1,
    borderRadius: 15,
  },

  moreButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },

  stateCard: {
    minHeight: 180,
    padding: 24,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderRadius: 20,
  },

  stateTitle: {
    marginTop: 12,

    textAlign: 'center',

    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },

  stateDescription: {
    maxWidth: 280,
    marginTop: 6,

    textAlign: 'center',

    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
});
