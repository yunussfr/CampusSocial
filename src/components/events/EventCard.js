import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export function EventCard({ event, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      {event.coverURL ? (
        <Image source={{ uri: event.coverURL }} style={styles.cover} />
      ) : null}
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <Text numberOfLines={2} style={styles.description}>
          {event.description}
        </Text>
        <Text style={styles.meta}>
          {event.category} - {event.location}
        </Text>
        <Text style={styles.meta}>
          Katilimci: {event.attendeeCount}/{event.capacity}
        </Text>
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
    height: 140,
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
});
