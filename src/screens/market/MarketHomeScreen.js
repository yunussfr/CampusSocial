import React, { useEffect, useState, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
} from 'react-native';
import { ListingCard } from '../../components/market/ListingCard';
import {
  AppButton,
  AppInput,
  ChipRow,
  Screen,
  SectionHeader,
  StateView,
} from '../../components/ui/DesignSystem';
import { ICONS, IMAGES } from '../../constants/assets';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';

export function MarketHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('Tumu');
  const [searchQuery, setSearchQuery] = useState('');
  const {
    error,
    listings,
    loading,
    savedListingIds,
    selectListing,
    startListingsListener,
    startSavedListingsListener,
  } = useMarket();

  useEffect(() => {
    const unsubscribeListings = startListingsListener();
    const unsubscribeSaved = user
      ? startSavedListingsListener(user.uid)
      : undefined;

    return () => {
      unsubscribeListings?.();
      unsubscribeSaved?.();
    };
  }, [startListingsListener, startSavedListingsListener, user]);

  const filteredListings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return listings.filter(listing => {
      const matchesCategory =
        activeCategory === 'Tumu' || listing.category === activeCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        listing.title,
        listing.description,
        listing.category,
        listing.seller?.displayName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [listings, activeCategory, searchQuery]);

  return (
    <Screen padded={false}>
      <FlatList
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.gridRow}
        data={filteredListings}
        numColumns={2}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.headerSection}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.title}>Market</Text>
                <Text style={styles.mutedText}>Kampus ikinci el ilanlari</Text>
              </View>
              <Pressable onPress={() => navigation.navigate('EventsTab', { screen: ROUTES.DISCOVER })}>
                <Image 
                  source={IMAGES.brandLogo} 
                  style={styles.brandLogo} 
                  resizeMode="contain" 
                />
              </Pressable>
            </View>
            <AppInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={ICONS.search}
              placeholder="Ilan, kategori veya satici ara..."
              style={{ marginBottom: 16 }}
            />
            <ChipRow
              activeItem={activeCategory}
              items={['Tumu', 'Kitap', 'Elektronik', 'Giyim', 'Diger']}
              onItemPress={setActiveCategory}
            />
            <View style={styles.actionRow}>
              <AppButton
                onPress={() => navigation.navigate(ROUTES.CREATE_LISTING)}
                style={styles.actionButton}>
                Ilan Olustur
              </AppButton>
              <AppButton
                onPress={() => navigation.navigate(ROUTES.MY_LISTINGS)}
                style={styles.actionButton}
                variant="secondary">
                Ilanlarim
              </AppButton>
            </View>
            <SectionHeader title="Yeni Ilanlar" />
            <StateView
              error={error}
              loading={loading && listings.length === 0}
              title="Ilanlar yukleniyor..."
            />
          </>
        }
        ListEmptyComponent={
          !loading && !error ? <StateView empty title="Henuz ilan yok." /> : null
        }
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <ListingCard
              listing={item}
              saved={savedListingIds.includes(item.id)}
              onPress={() => {
                selectListing(item);
                navigation.navigate(ROUTES.LISTING_DETAIL, {
                  listingId: item.id,
                });
              }}
            />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTextWrap: {
    flex: 1,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    color: '#0B1C30',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  mutedText: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 4,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionButton: { flex: 1 },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 112,
    paddingTop: 24,
  },
  gridRow: {
    gap: 16,
  },
  gridItem: {
    flex: 1,
    marginBottom: 16,
  },
});
