import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {mdiCheckBoxOutline, mdiCheckboxBlankOutline} from '@mdi/js';
import {MdiIcon} from '../../ui/MdiIcon';
import {LISTING_PAYMENT_OPTIONS} from '../../../constants/listingOptions';

export function ListingPaymentSelector({value, onChange, errorText}) {
  function toggle(key) {
    onChange(value.includes(key) ? value.filter(item => item !== key) : [...value, key]);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Odeme Yontemleri *</Text>
      <View style={styles.row}>
        {LISTING_PAYMENT_OPTIONS.map(option => {
          const selected = value.includes(option.key);
          return (
            <Pressable key={option.key} onPress={() => toggle(option.key)} style={styles.item}>
              <MdiIcon
                path={selected ? mdiCheckBoxOutline : mdiCheckboxBlankOutline}
                size={20}
                color={selected ? '#4F46E5' : '#94A3B8'}
              />
              <Text style={styles.text}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: 8},
  label: {color: '#64748B', fontSize: 12, fontWeight: '800'},
  row: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  item: {flexDirection: 'row', alignItems: 'center', gap: 7},
  text: {color: '#0F172A', fontSize: 13, fontWeight: '700'},
  error: {color: '#DC2626', fontSize: 12, fontWeight: '700'},
});
