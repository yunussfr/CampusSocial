import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
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
  mdiSwapVertical,
} from '@mdi/js';

import MarketCategoryRow from '../../components/market/MarketCategoryRow';
import {MarketEmptyState} from '../../components/market/MarketEmptyState';
import {MarketFilterSheet} from '../../components/market/MarketFilterSheet';
import MarketGridCard from '../../components/market/MarketGridCard';
import {MarketPromoBanner} from '../../components/market/MarketPromoBanner';
import MarketRecommendationCard from '../../components/market/MarketRecommendationCard';
import {Screen} from '../../components/ui/DesignSystem';
import {MdiIcon} from '../../components/ui/MdiIcon';
import {ShimmerPlaceholder} from '../../components/ui/ShimmerPlaceholder';
import {ROUTES} from '../../constants/routes';
import {useAnalytics} from '../../context/AnalyticsContext';
import {useAuth} from '../../context/AuthContext';
import {useChats} from '../../context/ChatContext';
import {useMarket} from '../../context/MarketContext';
import {useSaved} from '../../context/SavedContext';
import {useTheme} from '../../context/ThemeContext';
import {
  DEFAULT_MARKET_FILTERS,
  MARKET_CATEGORIES,
} from '../../utils/marketCategories';
import {
  filterMarketListings,
  getActiveMarketFilterCount,
  getRecommendedListings,
} from '../../utils/marketFilters';
import {ANALYTICS_EVENTS} from '../../services/analyticsService';

function SectionTitle({actionLabel, icon, onAction, title}) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleLeft}>
        <MdiIcon path={icon} size={24} color="#2563EB" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {actionLabel ? (
        <Pressable hitSlop={8} onPress={onAction}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function HeaderIconButton({badge, icon, onPress}) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({pressed}) => [styles.headerIconButton, pressed && styles.pressed]}>
      <MdiIcon path={icon} size={24} color="#0F172A" />
      {badge ? <View style={styles.notificationDot} /> : null}
    </Pressable>
  );
}

function MarketLoadingGrid() {
  return (
    <View style={styles.loadingGrid}>
      {[0, 1, 2, 3].map(item => (
        <View key={item} style={styles.loadingCard}>
          <ShimmerPlaceholder height={140} style={styles.loadingImage} />
          <ShimmerPlaceholder height={14} style={styles.loadingLineLarge} />
          <ShimmerPlaceholder height={12} style={styles.loadingLineMedium} width="62%" />
          <ShimmerPlaceholder height={10} style={styles.loadingLineSmall} width="45%" />
        </View>
      ))}
    </View>
  );
}

export function MarketHomeScreen({navigation}) {
  const {profile, user} = useAuth();
  const {logEvent} = useAnalytics();
  const {notifications, startNotificationsListener} = useChats();
  const {theme} = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const {width} = useWindowDimensions();

  const {
    error,
    listings = [],
    loading,
    selectListing,
    startListingsListener,
  } = useMarket();
  const {
    getListingSaveId,
    removeSave,
    saveListing,
    savedListingIds = [],
    startSavesListener,
  } = useSaved();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryKey, setActiveCategoryKey] = useState('all');
  const [filters, setFilters] = useState(DEFAULT_MARKET_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_MARKET_FILTERS);
  const [sheetMode, setSheetMode] = useState('filter');
  const [filterVisible, setFilterVisible] = useState(false);
  const [savingIds, setSavingIds] = useState([]);
  const hasUnreadNotifications = useMemo(
    () => notifications.some(item => item.read !== true),
    [notifications],
  );

  useEffect(() => {
    logEvent(ANALYTICS_EVENTS.MARKET_VIEW, {
      listing_count: listings.length,
    });
  }, [listings.length, logEvent]);

  useEffect(() => {
    const unsubscribeListings = startListingsListener?.();
    const unsubscribeSaved =
      user?.uid && startSavesListener
        ? startSavesListener(user.uid)
        : undefined;

    return () => {
      if (typeof unsubscribeListings === 'function') {
        unsubscribeListings();
      }

      if (typeof unsubscribeSaved === 'function') {
        unsubscribeSaved();
      }
    };
  }, [startListingsListener, startSavesListener, user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    return startNotificationsListener(user.uid);
  }, [startNotificationsListener, user?.uid]);

  useEffect(() => {
    const normalizedQuery = searchQuery.trim();

    if (!normalizedQuery) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      logEvent(ANALYTICS_EVENTS.MARKET_SEARCH, {
        query_length: normalizedQuery.length,
      });
    }, 650);

    return () => clearTimeout(timeoutId);
  }, [logEvent, searchQuery]);

  const campusFilterSupported = useMemo(() => {
    return listings.some(
      listing =>
        listing?.campusId ||
        listing?.universityId ||
        listing?.campusOnly !== undefined ||
        listing?.isCampusOnly !== undefined ||
        listing?.seller?.campusId,
    );
  }, [listings]);

  const appliedFilters = useMemo(() => {
    return campusFilterSupported
      ? filters
      : {...filters, campusOnly: false};
  }, [campusFilterSupported, filters]);

  const visibleListings = useMemo(() => {
    return filterMarketListings({
      listings,
      searchQuery,
      activeCategoryKey,
      filters: appliedFilters,
      user: profile || user,
    });
  }, [activeCategoryKey, appliedFilters, listings, profile, searchQuery, user]);

  const recommendedListings = useMemo(() => {
    return getRecommendedListings(visibleListings, 6);
  }, [visibleListings]);

  const filterCount = useMemo(() => {
    return getActiveMarketFilterCount(appliedFilters, campusFilterSupported);
  }, [appliedFilters, campusFilterSupported]);

  const recommendationCardWidth = Math.min(280, width * 0.68);

  const openSheet = useCallback((mode) => {
    setSheetMode(mode);
    setDraftFilters(appliedFilters);
    setFilterVisible(true);
  }, [appliedFilters]);

  const applyDraftFilters = useCallback(() => {
    setFilters(
      campusFilterSupported
        ? draftFilters
        : {...draftFilters, campusOnly: false},
    );

    logEvent(
      sheetMode === 'sort'
        ? ANALYTICS_EVENTS.MARKET_SORT_APPLY
        : ANALYTICS_EVENTS.MARKET_FILTER_APPLY,
      {
        filter_count: getActiveMarketFilterCount(draftFilters, campusFilterSupported),
        sort_key: draftFilters.sortKey || '',
      },
    );

    if (draftFilters.categoryKeys.length > 0) {
      setActiveCategoryKey('all');
    }

    setFilterVisible(false);
  }, [campusFilterSupported, draftFilters, logEvent, sheetMode]);

  const clearDraftFilters = useCallback(() => {
    setDraftFilters(DEFAULT_MARKET_FILTERS);
  }, []);

  const openListing = useCallback((listing) => {
    logEvent(ANALYTICS_EVENTS.LISTING_OPEN, {
      listing_id: listing.id,
      category: listing.category || '',
    });
    selectListing(listing);
    navigation.navigate(ROUTES.LISTING_DETAIL, {
      listingId: listing.id,
    });
  }, [logEvent, navigation, selectListing]);

  const toggleSaveListing = useCallback(async (listing) => {
    if (!user?.uid || !listing?.id || savingIds.includes(listing.id)) {
      return;
    }

    setSavingIds(current => [...current, listing.id]);

    try {
      if (savedListingIds.includes(listing.id) && removeSave) {
        await removeSave(user.uid, getListingSaveId(listing.id));
        logEvent(ANALYTICS_EVENTS.LISTING_UNSAVE, {
          listing_id: listing.id,
        });
      } else {
        await saveListing(user.uid, listing);
        logEvent(ANALYTICS_EVENTS.LISTING_SAVE, {
          listing_id: listing.id,
        });
      }
    } finally {
      setSavingIds(current => current.filter(id => id !== listing.id));
    }
  }, [
    getListingSaveId,
    logEvent,
    removeSave,
    saveListing,
    savedListingIds,
    savingIds,
    user?.uid,
  ]);

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

  const keyExtractor = useCallback(item => String(item.id), []);

  const renderListing = useCallback(({item}) => (
    <View style={styles.gridItem}>
      <MarketGridCard
        listing={item}
        saved={savedListingIds.includes(item.id)}
        onPress={() => openListing(item)}
        onSave={() => toggleSaveListing(item)}
      />
    </View>
  ), [openListing, savedListingIds, toggleSaveListing]);

  return (
    <Screen padded={false}>
      <FlatList
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: tabBarHeight + 52,
            backgroundColor: theme.colors.background,
          },
        ]}
        data={loading && listings.length === 0 ? [] : visibleListings}
        initialNumToRender={8}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          loading && listings.length === 0 ? (
            <MarketLoadingGrid />
          ) : (
            <MarketEmptyState
              type={getEmptyType()}
              actionLabel={error ? undefined : 'İlan Oluştur'}
              onAction={() => navigation.navigate(ROUTES.CREATE_LISTING)}
            />
          )
        }
        ListHeaderComponent={
          <View>
            <View style={styles.pageHeader}>
              <View style={styles.pageHeaderText}>
                <Text style={[styles.pageTitle, {color: theme.colors.text}]}>
                  Market
                </Text>
                <Text
                  style={[styles.pageSubtitle, {color: theme.colors.mutedText}]}>
                  Kampüs içi ikinci el ilanları keşfet
                </Text>
              </View>
              <HeaderIconButton
                badge={hasUnreadNotifications}
                icon={mdiBellOutline}
                onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
              />
            </View>

            <View style={styles.searchActionsWrap}>
              <View style={styles.searchBox}>
                <MdiIcon path={mdiMagnify} size={23} color="#64748B" />
                <TextInput
                  autoCorrect={false}
                  onChangeText={setSearchQuery}
                  placeholder="İlan, kategori veya satıcı ara..."
                  placeholderTextColor="#94A3B8"
                  returnKeyType="search"
                  style={styles.searchInput}
                  value={searchQuery}
                />
              </View>

              <View style={styles.searchActionRow}>
                <Pressable
                  onPress={() => openSheet('filter')}
                  style={({pressed}) => [
                    styles.outlineAction,
                    pressed && styles.pressed,
                  ]}>
                  <MdiIcon path={mdiFilterVariant} size={20} color="#2563EB" />
                  <Text style={styles.outlineActionText}>Filtrele</Text>
                  {filterCount > 0 ? (
                    <View style={styles.filterCount}>
                      <Text style={styles.filterCountText}>{filterCount}</Text>
                    </View>
                  ) : null}
                </Pressable>

                <Pressable
                  onPress={() => openSheet('sort')}
                  style={({pressed}) => [
                    styles.outlineAction,
                    pressed && styles.pressed,
                  ]}>
                  <MdiIcon path={mdiSwapVertical} size={20} color="#2563EB" />
                  <Text style={styles.outlineActionText}>Sırala</Text>
                </Pressable>
              </View>
            </View>

            <MarketCategoryRow
              activeCategoryKey={activeCategoryKey}
              categories={MARKET_CATEGORIES}
              onCategoryPress={setActiveCategoryKey}
            />

            <MarketPromoBanner onPress={() => setActiveCategoryKey('all')} />

            <View style={styles.mainActions}>
              <Pressable
                onPress={() => navigation.navigate(ROUTES.CREATE_LISTING)}
                style={styles.createListingButtonWrap}>
                <LinearGradient
                  colors={['#2563EB', '#1D4ED8']}
                  style={styles.createListingButton}>
                  <MdiIcon path={mdiPlus} size={21} color="#FFFFFF" />
                  <Text style={styles.createListingText}>İlan Oluştur</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate(ROUTES.MY_LISTINGS)}
                style={styles.myListingsButton}>
                <Text style={styles.myListingsText}>İlanlarım</Text>
              </Pressable>
            </View>

            {error ? (
              <MarketEmptyState
                type="error"
                title="İlanlar yüklenemedi."
                description="Bağlantı veya yetki sorununu kontrol et."
              />
            ) : null}

            {recommendedListings.length > 0 ? (
              <>
                <SectionTitle
                  actionLabel="Tümünü Gör"
                  icon={mdiStarOutline}
                  title="Sana Özel Öneriler"
                />
                <FlatList
                  horizontal
                  contentContainerStyle={styles.recommendationsContent}
                  data={recommendedListings}
                  keyExtractor={item => String(item.id)}
                  renderItem={({item}) => (
                    <MarketRecommendationCard
                      listing={item}
                      saved={savedListingIds.includes(item.id)}
                      width={recommendationCardWidth}
                      onPress={() => openListing(item)}
                      onSave={() => toggleSaveListing(item)}
                    />
                  )}
                  showsHorizontalScrollIndicator={false}
                />
              </>
            ) : null}

            <SectionTitle icon={mdiFlashOutline} title="Yeni İlanlar" />

            {loading && listings.length > 0 ? (
              <View style={styles.inlineLoading}>
                <ActivityIndicator color="#2563EB" />
                <Text style={styles.inlineLoadingText}>İlanlar güncelleniyor...</Text>
              </View>
            ) : null}
          </View>
        }
        numColumns={2}
        maxToRenderPerBatch={6}
        removeClippedSubviews
        renderItem={renderListing}
        showsVerticalScrollIndicator={false}
        updateCellsBatchingPeriod={48}
        windowSize={7}
      />

      <MarketFilterSheet
        campusFilterSupported={campusFilterSupported}
        categories={MARKET_CATEGORIES}
        draftFilters={draftFilters}
        mode={sheetMode}
        onApply={applyDraftFilters}
        onChange={setDraftFilters}
        onClear={clearDraftFilters}
        onClose={() => setFilterVisible(false)}
        visible={filterVisible}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.78,
  },
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
    flex: 1,
    paddingRight: 12,
  },
  pageTitle: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
  },
  pageSubtitle: {
    marginTop: 3,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  headerIconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 7},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },
  searchActionsWrap: {
    gap: 10,
  },
  searchBox: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.04,
    shadowRadius: 9,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '500',
  },
  searchActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  outlineAction: {
    minHeight: 45,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1.2,
    borderColor: '#BFD0FF',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  outlineActionText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
  },
  filterCount: {
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  filterCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  mainActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  createListingButtonWrap: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 15,
  },
  createListingButton: {
    minHeight: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
  },
  createListingText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  myListingsButton: {
    flex: 1,
    minHeight: 51,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
  },
  myListingsText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '900',
  },
  sectionTitleRow: {
    minHeight: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
    marginTop: 2,
  },
  sectionTitleLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
  sectionAction: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
  },
  recommendationsContent: {
    gap: 12,
    paddingRight: 16,
    paddingBottom: 22,
  },
  inlineLoading: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  inlineLoadingText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  gridRow: {
    gap: 12,
  },
  gridItem: {
    flex: 1,
    minWidth: 0,
    marginBottom: 12,
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 24,
  },
  loadingCard: {
    width: '48%',
    overflow: 'hidden',
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  loadingImage: {
    borderRadius: 0,
  },
  loadingLineLarge: {
    marginTop: 12,
    marginHorizontal: 12,
  },
  loadingLineMedium: {
    marginTop: 8,
    marginHorizontal: 12,
  },
  loadingLineSmall: {
    marginTop: 8,
    marginHorizontal: 12,
  },
});

export default MarketHomeScreen;
