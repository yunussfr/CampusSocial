import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { IMAGES } from '../../constants/assets';
import { useTheme } from '../../context/ThemeContext';

export function CommunityCard({ community, onPress }) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}>
      <Image
        source={
          community.coverURL
            ? { uri: community.coverURL }
            : IMAGES.coverPlaceholder
        }
        style={styles.cover}
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{community.name}</Text>
        <Text numberOfLines={2} style={styles.description}>
          {community.description}
        </Text>
        <Text style={[styles.meta, { color: theme.colors.mutedText }]}>
          {community.category} - {community.memberCount} uye
        </Text>
        {community.isPrivate ? (
          <Text
            style={[
              styles.badge,
              { color: theme.colors.accent, backgroundColor: theme.colors.primarySoft },
            ]}>
            Private
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 12,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
  },
  cover: {
    width: '100%',
    height: 120,
    backgroundColor: '#E2E8F0',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  meta: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    fontSize: 12,
    fontWeight: '700',
  },
});
