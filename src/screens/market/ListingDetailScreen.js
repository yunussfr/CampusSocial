import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  mdiArrowLeft,
  mdiDotsVertical,
  mdiHeart,
  mdiHeartOutline,
} from '@mdi/js';

import {ListingBottomActionBar} from '../../components/market/listing/ListingBottomActionBar';
import {ListingDetailGrid} from '../../components/market/listing/ListingDetailGrid';
import {ListingDetailSection} from '../../components/market/listing/ListingDetailSection';
import {ListingEmptyState} from '../../components/market/listing/ListingEmptyState';
import {ListingImageGallery} from '../../components/market/listing/ListingImageGallery';
import {ListingSafetyTips} from '../../components/market/listing/ListingSafetyTips';
import {ListingSellerCard} from '../../components/market/listing/ListingSellerCard';
import {ListingSummaryCard} from '../../components/market/listing/ListingSummaryCard';
import {MdiIcon} from '../../components/ui/MdiIcon';
import {LISTING_DETAIL_FIELDS} from '../../constants/listingOptions';
import {ROUTES} from '../../constants/routes';
import {useAuth} from '../../context/AuthContext';
import {useChats} from '../../context/ChatContext';
import {useMarket} from '../../context/MarketContext';
import {useSaved} from '../../context/SavedContext';
import {
  formatPaymentMethods,
  getBooleanOptionLabel,
  getListingLocationText,
  getListingShortId,
  getSellerTypeLabel,
  getShippingPayerLabel,
} from '../../utils/listingFormatters';

export function ListingDetailScreen({navigation}) {
  const {profile, user} = useAuth();
  const {startDirectChat} = useChats();
  const {selectedListing} = useMarket();
  const {
    getListingSaveId,
    removeSave,
    saveListing,
    savedListingIds = [],
    startSavesListener,
  } = useSaved();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const listing = selectedListing;

  const isOwnListing = Boolean(user?.uid && listing?.sellerId === user.uid);
  const isSaved = Boolean(listing?.id && savedListingIds.includes(listing.id));

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    return startSavesListener(user.uid);
  }, [startSavesListener, user?.uid]);

  const detailItems = useMemo(() => {
    if (!listing) {
      return [];
    }

    const source = {
      ...listing,
      warrantyLabel: listing.warrantyLabel || getBooleanOptionLabel(listing.warranty),
      invoiceLabel: listing.invoiceLabel || getBooleanOptionLabel(listing.invoice),
      originalBoxLabel:
        listing.originalBoxLabel || getBooleanOptionLabel(listing.originalBox),
    };

    return LISTING_DETAIL_FIELDS.map(field => ({
      label: field.label,
      value: source[field.key],
    }));
  }, [listing]);

  if (!listing) {
    return (
      <View style={styles.emptyRoot}>
        <ListingEmptyState
          title="Ilan bulunamadi."
          description="Ilan verisi secilmemis veya artik mevcut degil."
        />
      </View>
    );
  }

  async function handleSave() {
    if (!user?.uid || !listing?.id || saving) {
      return;
    }

    setSaving(true);

    try {
      if (isSaved) {
        await removeSave(user.uid, getListingSaveId(listing.id));
      } else {
        await saveListing(user.uid, listing);
      }
    } catch (error) {
      Alert.alert('Kaydetme basarisiz', error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleMessageSeller() {
    if (isOwnListing || !user?.uid || !listing?.seller || startingChat) {
      return;
    }

    setStartingChat(true);

    try {
      const chatId = await startDirectChat({
        currentUser: {
          uid: user.uid,
          displayName: profile?.displayName || user.displayName || '',
          photoURL: profile?.photoURL || user.photoURL || '',
        },
        otherUser: listing.seller,
        relatedListingId: listing.id,
      });

      navigation.navigate(ROUTES.CHAT_DETAIL, {chatId});
    } catch (error) {
      Alert.alert('Mesaj acilamadi', error.message);
    } finally {
      setStartingChat(false);
    }
  }

  const locationText = getListingLocationText(listing);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <ListingImageGallery
            listing={listing}
            selectedIndex={selectedImageIndex}
            onSelectIndex={setSelectedImageIndex}
          />
          <View style={styles.topActions}>
            <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
              <MdiIcon path={mdiArrowLeft} size={24} color="#0F172A" />
            </Pressable>
            <View style={styles.rightActions}>
              <Pressable onPress={handleSave} style={styles.iconButton}>
                <MdiIcon
                  path={isSaved ? mdiHeart : mdiHeartOutline}
                  size={23}
                  color={isSaved ? '#DC2626' : '#0F172A'}
                />
              </Pressable>
              <Pressable style={styles.iconButton}>
                <MdiIcon path={mdiDotsVertical} size={23} color="#0F172A" />
              </Pressable>
            </View>
          </View>
        </View>

        <ListingSummaryCard listing={listing} />

        <View style={styles.body}>
          <ListingSellerCard
            disabled={startingChat}
            isOwnListing={isOwnListing}
            listing={listing}
            onMessage={handleMessageSeller}
          />

          <ListingDetailSection title="Ilan Detaylari">
            <Text style={styles.description}>
              {listing.description || 'Aciklama bulunmuyor.'}
            </Text>
          </ListingDetailSection>

          <ListingDetailSection title="Urun Detaylari">
            <ListingDetailGrid items={detailItems} />
          </ListingDetailSection>

          <ListingDetailSection title="Teslimat ve Odeme">
            <ListingDetailGrid
              items={[
                {
                  label: 'Teslimat',
                  value: listing.deliveryPreferenceLabel || listing.deliveryPreference,
                },
                {
                  label: 'Kargo',
                  value: listing.shippingPayerLabel || getShippingPayerLabel(listing.shippingPayer),
                },
                {
                  label: 'Odeme',
                  value:
                    listing.paymentMethodLabels?.join(', ') ||
                    formatPaymentMethods(listing.paymentMethods),
                },
                {
                  label: 'Kimden',
                  value: listing.sellerTypeLabel || getSellerTypeLabel(listing.sellerType),
                },
              ]}
            />
          </ListingDetailSection>

          <ListingDetailSection title="Konum">
            <Text style={styles.locationText}>
              {locationText || 'Konum bilgisi belirtilmedi.'}
            </Text>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapText}>Harita onizlemesi</Text>
            </View>
          </ListingDetailSection>

          <ListingDetailSection title="Ilan Bilgileri">
            <ListingDetailGrid
              items={[
                {label: 'Ilan No', value: getListingShortId(listing)},
                {label: 'Goruntulenme', value: String(listing.viewCount || 0)},
                {label: 'Kayit', value: String(listing.savedCount || 0)},
                {label: 'Pazarlik', value: listing.negotiable ? 'Acik' : 'Kapali'},
              ]}
            />
          </ListingDetailSection>

          <ListingSafetyTips />
        </View>
      </ScrollView>

      <ListingBottomActionBar
        isOwnListing={isOwnListing}
        saving={saving}
        startingChat={startingChat}
        onMessage={handleMessageSeller}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#F8FAFC'},
  emptyRoot: {flex: 1, backgroundColor: '#F8FAFC'},
  content: {paddingBottom: 104},
  heroWrap: {backgroundColor: '#E2E8F0'},
  topActions: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightActions: {flexDirection: 'row', gap: 10},
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  body: {gap: 14, padding: 16},
  description: {color: '#334155', fontSize: 14, lineHeight: 22, fontWeight: '600'},
  locationText: {color: '#0F172A', fontSize: 14, fontWeight: '800'},
  mapPlaceholder: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  mapText: {color: '#64748B', fontSize: 13, fontWeight: '800'},
});

export default ListingDetailScreen;
