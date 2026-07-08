import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export function ListingEmptyState({title = 'Ilan bulunamadi.', description}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24},
  title: {color: '#0F172A', textAlign: 'center', fontSize: 18, fontWeight: '900'},
  description: {color: '#64748B', textAlign: 'center', fontSize: 13, lineHeight: 19, fontWeight: '600'},
});
