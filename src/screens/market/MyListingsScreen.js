import React, { useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ListingCard } from '../../components/market/ListingCard';
import { PageIntro, Screen, StateView } from '../../components/ui/DesignSystem';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';

export function MyListingsScreen({ navigation }) {
  const { user } = useAuth();
  const { error, listings, selectListing, startMyListingsListener } = useMarket();

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    return startMyListingsListener(user.uid);
  }, [startMyListingsListener, user]);

  return (
    <Screen padded={false}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={listings}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <PageIntro title="Ilanlarim" subtitle="Kendi market ilanlarini yonet." />
            <StateView error={error} />
          </>
        }
        ListEmptyComponent={
          !error ? <StateView empty title="Henuz ilan olusturmadin." /> : null
        }
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            onPress={() => {
              selectListing(item);
              navigation.navigate(ROUTES.LISTING_DETAIL, {
                listingId: item.id,
              });
            }}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 112,
    paddingTop: 24,
  },
});
