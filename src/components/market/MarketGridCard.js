import React, {memo} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  mdiBookmarkOutline,
  mdiHeart,
  mdiHeartOutline,
  mdiMapMarkerOutline,
} from '@mdi/js';
import {MdiIcon} from '../ui/MdiIcon';
import {
  formatListingPrice,
  formatRelativeListingTime,
  getListingCategory,
  getListingConditionLabel,
  getListingImageSource,
  getListingStatusLabel,
  getSellerSubtitle,
} from '../../utils/marketFormatters';

function MarketGridCard({listing, saved, onPress, onSave}) {
  const category = getListingCategory(listing);
  const statusLabel = getListingStatusLabel(listing);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        <Image
          source={getListingImageSource(listing)}
          resizeMode="cover"
          style={[styles.image, statusLabel === 'Satıldı' && styles.soldImage]}
        />

        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={event => {
            event.stopPropagation?.();
            onSave?.();
          }}
          style={styles.saveButton}>
          <MdiIcon
            path={saved ? mdiHeart : mdiHeartOutline}
            size={19}
            color={saved ? '#DC2626' : '#475569'}
          />
        </Pressable>

        {statusLabel && statusLabel !== 'Aktif' ? (
          <View
            style={[
              styles.statusBadge,
              statusLabel === 'Satıldı' ? styles.soldBadge : styles.reservedBadge,
            ]}>
            <Text style={styles.statusText}>{statusLabel.toLocaleUpperCase('tr-TR')}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>
          {listing?.title || 'İlan'}
        </Text>
        <Text style={styles.price}>{formatListingPrice(listing)}</Text>

        <View style={styles.metaRow}>
          <MdiIcon path={mdiMapMarkerOutline} size={14} color="#64748B" />
          <Text numberOfLines={1} style={styles.metaText}>
            {getSellerSubtitle(listing)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text numberOfLines={1} style={styles.category}>
            {category?.shortLabel || listing?.category || 'Diğer'}
          </Text>
          <Text numberOfLines={1} style={styles.condition}>
            {getListingConditionLabel(listing)}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <MdiIcon path={mdiBookmarkOutline} size={14} color="#64748B" />
          <Text numberOfLines={1} style={styles.metaText}>
            {formatRelativeListingTime(listing)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  pressed: {
    opacity: 0.9,
    transform: [{scale: 0.99}],
  },
  imageWrap: {
    height: 145,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  soldImage: {
    opacity: 0.52,
  },
  saveButton: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  statusBadge: {
    position: 'absolute',
    top: 9,
    left: 9,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },
  soldBadge: {
    backgroundColor: '#DC2626',
  },
  reservedBadge: {
    backgroundColor: '#D97706',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  body: {
    padding: 12,
  },
  title: {
    minHeight: 38,
    color: '#0F172A',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
  },
  price: {
    marginTop: 5,
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '900',
  },
  metaRow: {
    minWidth: 0,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    flex: 1,
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  category: {
    flex: 1,
    color: '#7C3AED',
    fontSize: 9,
    fontWeight: '900',
  },
  condition: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
  },
});

export default memo(MarketGridCard);
