import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export function CommunityCard({ community, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      {community.coverURL ? (
        <Image source={{ uri: community.coverURL }} style={styles.cover} />
      ) : null}
      <View style={styles.content}>
        <Text style={styles.title}>{community.name}</Text>
        <Text numberOfLines={2} style={styles.description}>
          {community.description}
        </Text>
        <Text style={styles.meta}>
          {community.category} - {community.memberCount} uye
        </Text>
        {community.isPrivate ? <Text style={styles.badge}>Private</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
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
    color: '#0B1C30',
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
