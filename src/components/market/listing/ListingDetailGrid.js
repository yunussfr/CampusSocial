import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export function ListingDetailGrid({items}) {
  const visibleItems = items.filter(item => item?.value);

  if (visibleItems.length === 0) {
    return <Text style={styles.empty}>Belirtilmedi.</Text>;
  }

  return (
    <View style={styles.grid}>
      {visibleItems.map(item => (
        <View key={item.label} style={styles.item}>
          <Text style={styles.label}>{item.label}</Text>
          <Text numberOfLines={2} style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderLeftWidth: 1, borderColor: '#E2E8F0'},
  item: {width: '50%', minHeight: 66, gap: 4, padding: 12, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#E2E8F0'},
  label: {color: '#64748B', fontSize: 11, fontWeight: '800'},
  value: {color: '#0F172A', fontSize: 13, lineHeight: 18, fontWeight: '800'},
  empty: {color: '#64748B', fontSize: 13, fontWeight: '700'},
});
