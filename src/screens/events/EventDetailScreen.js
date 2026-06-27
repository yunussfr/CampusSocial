import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';

export function EventDetailScreen({ route }) {
  const { user } = useAuth();
  const { events, joinSelectedEvent, leaveSelectedEvent, selectedEvent } =
    useEvents();
  const [submitting, setSubmitting] = useState(false);
  const eventId = route.params?.eventId;

  const event = useMemo(
    () => selectedEvent || events.find(item => item.id === eventId),
    [eventId, events, selectedEvent],
  );

  if (!event) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.title}>Etkinlik bulunamadi</Text>
      </View>
    );
  }

  async function handleJoin() {
    setSubmitting(true);

    try {
      await joinSelectedEvent(event.id, user.uid);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLeave() {
    setSubmitting(true);

    try {
      await leaveSelectedEvent(event.id, user.uid);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.meta}>{event.category}</Text>
      <Text style={styles.description}>{event.description}</Text>
      <Text style={styles.meta}>Konum: {event.location}</Text>
      <Text style={styles.meta}>
        Katilimci: {event.attendeeCount}/{event.capacity}
      </Text>
      <View style={styles.actions}>
        <Pressable
          disabled={submitting}
          onPress={handleJoin}
          style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Katil</Text>
        </Pressable>
        <Pressable
          disabled={submitting}
          onPress={handleLeave}
          style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Ayril</Text>
        </Pressable>
      </View>
      <Text style={styles.note}>
        Katilim sayaci Cloud Functions fazinda otomatik guncellenecek.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  title: {
    color: '#0B1C30',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
    marginVertical: 18,
  },
  meta: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#004AC6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#0B1C30',
    fontSize: 15,
    fontWeight: '700',
  },
  note: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 16,
  },
});
