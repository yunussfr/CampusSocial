import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {mdiClockOutline, mdiEyeOutline, mdiMapMarkerOutline} from '@mdi/js';
import {MdiIcon} from '../../ui/MdiIcon';
import {ListingBadge} from './ListingBadge';
import {
  formatListingPrice,
  formatRelativeListingTime,
  getListingCategoryLabel,
  getListingConditionLabel,
  getListingLocationText,
  getListingStatusLabel,
} from '../../../utils/listingFormatters';

export function ListingSummaryCard({listing}) {
  const location = getListingLocationText(listing);

  return (
    <View style={styles.card}>
      <View style={styles.badges}>
        <ListingBadge label={getListingCategoryLabel(listing)} tone="primary" />
        <ListingBadge label={getListingConditionLabel(listing)} tone="success" />
        <ListingBadge label={getListingStatusLabel(listing)} tone="neutral" />
        {listing?.negotiable ? <ListingBadge label="Pazarlik" tone="warning" /> : null}
      </View>
      <Text style={styles.title}>{listing?.title || 'Ilan'}</Text>
      <Text style={styles.price}>{formatListingPrice(listing)}</Text>
      <View style={styles.metaRow}>
        {location ? (
          <View style={styles.metaItem}>
            <MdiIcon path={mdiMapMarkerOutline} size={16} color="#64748B" />
            <Text numberOfLines={1} style={styles.metaText}>{location}</Text>
          </View>
        ) : null}
        <View style={styles.metaItem}>
          <MdiIcon path={mdiClockOutline} size={16} color="#64748B" />
          <Text style={styles.metaText}>{formatRelativeListingTime(listing)}</Text>
        </View>
        <View style={styles.metaItem}>
          <MdiIcon path={mdiEyeOutline} size={16} color="#64748B" />
          <Text style={styles.metaText}>{Number(listing?.viewCount || 0)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {gap: 10, padding: 18, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: '#FFFFFF'},
  badges: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  title: {color: '#0F172A', fontSize: 25, lineHeight: 31, fontWeight: '900'},
  price: {color: '#4F46E5', fontSize: 25, lineHeight: 31, fontWeight: '900'},
  metaRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  metaItem: {maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 5},
  metaText: {color: '#64748B', fontSize: 12, fontWeight: '700'},
});
