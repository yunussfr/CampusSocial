import React, { useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { ListingCard } from '../../components/market/ListingCard';
import {
  AppButton,
  AppInput,
  ChipRow,
  PageIntro,
  Screen,
  SectionHeader,
  StateView,
} from '../../components/ui/DesignSystem';
import { ICONS } from '../../constants/assets';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';

export function MarketHomeScreen({ navigation }) {
  const { user } = useAuth();
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

  return (
    <Screen padded={false}>
      <FlatList
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.gridRow}
        data={listings}
        numColumns={2}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <PageIntro title="Market" subtitle="Kampus ikinci el ilanlari" />
            <AppInput
              editable={false}
              leftIcon={ICONS.search}
              placeholder="Ilan, kategori veya satici ara..."
            />
            <ChipRow
              activeItem="Tumu"
              items={['Tumu', 'Kitap', 'Elektronik', 'Giyim', 'Diger']}
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
