import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export function ListingDetailSection({title, children}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {gap: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, backgroundColor: '#FFFFFF'},
  title: {color: '#0F172A', fontSize: 17, fontWeight: '900'},
});
