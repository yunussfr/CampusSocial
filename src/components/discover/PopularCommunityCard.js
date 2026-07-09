import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const GRADIENTS = [
  ['#7C3AED', '#2563EB'],
  ['#22C55E', '#15803D'],
  ['#F97316', '#EA580C'],
  ['#EC4899', '#BE185D'],
  ['#0EA5E9', '#0369A1'],
  ['#9333EA', '#6D28D9'],
];

export function PopularCommunityCard({community, index, onPress, theme, width}) {
  if (!community) {
    return null;
  }

  const gradient = GRADIENTS[index % GRADIENTS.length];
  const initial = community.name?.charAt(0)?.toLocaleUpperCase('tr-TR') || 'T';
  const countLabel = community.memberCount
    ? `${community.memberCount} üye`
    : `${community.eventCount || 1} etkinlik`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.root,
        {
          width,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <Text style={styles.rank}>{community.rank || index + 1}</Text>

      <LinearGradient colors={gradient} style={styles.logoWrap}>
        {community.logoURL ? (
          <Image source={{uri: community.logoURL}} style={styles.logo} />
        ) : (
          <Text style={styles.logoText}>{initial}</Text>
        )}
      </LinearGradient>

      <Text numberOfLines={2} style={[styles.name, {color: theme.colors.text}]}>
        {community.name}
      </Text>

      <Text numberOfLines={1} style={[styles.count, {color: theme.colors.mutedText}]}>
        {countLabel}
      </Text>

      <View style={styles.statusRow}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>
          {(community.eventCount || 0) > 1 ? 'Çok Aktif' : 'Aktif'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 168,
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 18,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  rank: {
    position: 'absolute',
    top: 12,
    left: 12,
    minWidth: 24,
    minHeight: 24,
    overflow: 'hidden',
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#0F172A',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    fontSize: 12,
    lineHeight: 24,
    fontWeight: '900',
  },
  logoWrap: {
    width: 58,
    height: 58,
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
  },
  name: {
    minHeight: 38,
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  count: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  statusRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  statusText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
  },
});
