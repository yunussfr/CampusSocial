import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {IMAGES} from '../../../constants/assets';
import {
  getSellerDisplayName,
  getSellerPhotoURL,
} from '../../../utils/listingFormatters';

export function ListingSellerCard({listing, isOwnListing, onMessage, disabled}) {
  const photoURL = getSellerPhotoURL(listing);

  return (
    <View style={styles.card}>
      <Image
        source={photoURL ? {uri: photoURL} : IMAGES.profileManPlaceholder}
        style={styles.avatar}
      />
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.name}>{getSellerDisplayName(listing)}</Text>
        <Text numberOfLines={1} style={styles.meta}>
          {listing?.seller?.department || listing?.seller?.campusName || 'CampusConnect saticisi'}
        </Text>
        {isOwnListing ? <Text style={styles.ownBadge}>Senin ilanin</Text> : null}
      </View>
      {!isOwnListing ? (
        <Pressable disabled={disabled} onPress={onMessage} style={styles.button}>
          <Text style={styles.buttonText}>{disabled ? 'Acilıyor...' : 'Mesaj At'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  avatar: {width: 54, height: 54, borderRadius: 27, backgroundColor: '#E2E8F0'},
  content: {minWidth: 0, flex: 1},
  name: {color: '#0F172A', fontSize: 15, fontWeight: '900'},
  meta: {marginTop: 3, color: '#64748B', fontSize: 12, fontWeight: '700'},
  ownBadge: {marginTop: 5, color: '#4F46E5', fontSize: 11, fontWeight: '900'},
  button: {paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12, backgroundColor: '#4F46E5'},
  buttonText: {color: '#FFFFFF', fontSize: 12, fontWeight: '900'},
});
