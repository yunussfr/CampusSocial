import React, {memo} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {mdiEyeOutline, mdiHeart, mdiHeartOutline, mdiStar} from '@mdi/js';
import {MdiIcon} from '../ui/MdiIcon';
import {
  formatListingPrice,
  getListingCategory,
  getListingImageSource,
  getListingStatusLabel,
  getSellerAvatarSource,
  getSellerName,
} from '../../utils/marketFormatters';

function SellerAvatar({listing}) {
  const source = getSellerAvatarSource(listing);
  const name = getSellerName(listing);
  const initial = name.charAt(0).toLocaleUpperCase('tr-TR') || 'C';

  if (source) {
    return <Image source={source} style={styles.avatar} />;
  }

  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarText}>{initial}</Text>
    </View>
  );
}

function MarketRecommendationCard({listing, saved, onPress, onSave, width}) {
  const category = getListingCategory(listing);
  const statusLabel = getListingStatusLabel(listing);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        {width},
        pressed && styles.cardPressed,
      ]}>
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
            size={22}
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

        <View style={styles.categoryBadge}>
          <Text numberOfLines={1} style={styles.categoryText}>
            {category?.label || listing?.category || 'Diğer'}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>
          {listing?.title || 'İlan'}
        </Text>
        <Text style={styles.price}>{formatListingPrice(listing)}</Text>

        <View style={styles.footer}>
          <SellerAvatar listing={listing} />
          <Text numberOfLines={1} style={styles.seller}>
            {getSellerName(listing)}
          </Text>

          <View style={styles.metric}>
            <MdiIcon
              path={Number(listing?.savedCount || 0) > 0 ? mdiStar : mdiEyeOutline}
              size={15}
              color="#F59E0B"
            />
            <Text style={styles.metricText}>
              {Number(listing?.savedCount || listing?.viewCount || 0)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 7},
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{scale: 0.99}],
  },
  imageWrap: {
    height: 158,
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
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
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
    fontSize: 9,
    fontWeight: '900',
  },
  categoryBadge: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    maxWidth: '72%',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  categoryText: {
    color: '#7C3AED',
    fontSize: 10,
    fontWeight: '900',
  },
  body: {
    padding: 14,
  },
  title: {
    minHeight: 42,
    color: '#0F172A',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  price: {
    marginTop: 5,
    color: '#2563EB',
    fontSize: 17,
    fontWeight: '900',
  },
  footer: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
  },
  avatarFallback: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#DBEAFE',
  },
  avatarText: {
    color: '#1D4ED8',
    fontSize: 10,
    fontWeight: '900',
  },
  seller: {
    flex: 1,
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metricText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
  },
});

export default memo(MarketRecommendationCard);
