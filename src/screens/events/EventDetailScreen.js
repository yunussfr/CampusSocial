import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AppButton, Card, Screen, StateView } from '../../components/ui/DesignSystem';
import { ICONS, IMAGES } from '../../constants/assets';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { useTheme } from '../../context/ThemeContext';

export function EventDetailScreen({ route }) {
  const { user } = useAuth();
  const { theme } = useTheme();
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
      <Screen>
        <StateView empty title="Etkinlik bulunamadi." />
      </Screen>
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
    <Screen scroll style={styles.container}>
      <View style={[styles.hero, { backgroundColor: theme.colors.primarySoft }]}>
        <Image
          source={event.coverURL ? { uri: event.coverURL } : IMAGES.coverPlaceholder}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroBadge}>{event.category}</Text>
          <Text style={styles.heroTitle}>{event.title}</Text>
          <View style={styles.heroMetaRow}>
            <Image source={ICONS.location} style={styles.heroMetaIcon} />
            <Text style={styles.heroMeta}>{event.location}</Text>
          </View>
        </View>
      </View>
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Detay</Text>
        <Text style={[styles.description, { color: theme.colors.mutedText }]}>
          {event.description}
        </Text>
        <Text style={[styles.meta, { color: theme.colors.subtleText }]}>
          Katilimci: {event.attendeeCount}/{event.capacity}
        </Text>
      </Card>
      <View style={styles.actions}>
        <AppButton disabled={submitting} onPress={handleJoin} style={styles.action}>
          Katil
        </AppButton>
        <AppButton
          disabled={submitting}
          onPress={handleLeave}
          style={styles.action}
          variant="secondary">
          Ayril
        </AppButton>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  hero: {
    minHeight: 260,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    gap: 6,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,74,198,0.9)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '900',
  },
  heroMeta: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 15,
    lineHeight: 22,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroMetaIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: 'rgba(255,255,255,0.84)',
  },
  card: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  action: {
    flex: 1,
  },
});
