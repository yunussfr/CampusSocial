import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export function ListingBadge({label, tone = 'primary'}) {
  if (!label) {
    return null;
  }

  return (
    <View style={[styles.badge, styles[tone] || styles.primary]}>
      <Text numberOfLines={1} style={[styles.text, styles[`${tone}Text`] || styles.primaryText]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    maxWidth: 180,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  text: {
    fontSize: 11,
    fontWeight: '900',
  },
  primary: {
    backgroundColor: '#EDE9FE',
  },
  primaryText: {
    color: '#5B21B6',
  },
  success: {
    backgroundColor: '#DCFCE7',
  },
  successText: {
    color: '#15803D',
  },
  warning: {
    backgroundColor: '#FEF3C7',
  },
  warningText: {
    color: '#B45309',
  },
  neutral: {
    backgroundColor: '#F1F5F9',
  },
  neutralText: {
    color: '#475569',
  },
});
