import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export function DiscoverStatsStrip({
  nearbyEventCount,
  theme,
  todayEventCount,
  topCategory,
}) {
  const items = [
    {
      label: 'Bugün Etkinlik',
      value: todayEventCount,
      icon: '□',
      iconColor: '#2563EB',
      bg: '#EEF4FF',
    },
    {
      label: 'En Popüler',
      value: topCategory,
      icon: '♪',
      iconColor: '#F97316',
      bg: '#FFF1E8',
    },
    {
      label: 'Yakındaki Etkinlikler',
      value: nearbyEventCount,
      icon: '⌖',
      iconColor: '#16A34A',
      bg: '#DCFCE7',
    },
  ];

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}>
      {items.map(item => (
        <View key={item.label} style={styles.item}>
          <View>
            <Text
              numberOfLines={1}
              style={[styles.label, {color: theme.colors.mutedText}]}>
              {item.label}
            </Text>
            <Text numberOfLines={1} style={[styles.value, {color: theme.colors.primary}]}>
              {item.value}
            </Text>
          </View>

          <View style={[styles.iconWrap, {backgroundColor: item.bg}]}>
            <Text style={[styles.icon, {color: item.iconColor}]}>{item.icon}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 18,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  item: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
  },
  value: {
    marginTop: 5,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
  iconWrap: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  icon: {
    fontSize: 18,
    fontWeight: '900',
  },
});
