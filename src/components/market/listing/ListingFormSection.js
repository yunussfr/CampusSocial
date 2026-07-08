import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export function ListingFormSection({title, subtitle, children}) {
  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 3,
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
});
