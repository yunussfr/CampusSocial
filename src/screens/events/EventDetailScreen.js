import React, { useContext, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

import { AppButton, Card, StateView } from '../../components/ui/DesignSystem';
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

  const tabBarHeightFromContext = useContext(BottomTabBarHeightContext);
  const tabBarHeight = tabBarHeightFromContext || 90;

  const event = useMemo(
    () => selectedEvent || events.find(item => item.id === eventId),
    [eventId, events, selectedEvent],
  );

  if (!event) {
    return (
      <View
        style={[
          styles.emptyScreen,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <StateView empty title="Etkinlik bulunamadı." />
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
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={[
          styles.scroll,
          {
            marginBottom: tabBarHeight,
          },
        ]}
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        scrollEnabled={true}
      >
        <View
          style={[
            styles.hero,
            { backgroundColor: theme.colors.primarySoft },
          ]}
        >
          <Image
            source={
              event.coverURL
                ? { uri: event.coverURL }
                : IMAGES.coverPlaceholder
            }
            style={styles.heroImage}
          />

          <View style={styles.heroOverlay}>
            <Text style={styles.heroBadge}>{String(event.category || '')}</Text>

            <Text style={styles.heroTitle}>{String(event.title || '')}</Text>

            <View style={styles.heroMetaRow}>
              <Image source={ICONS.location} style={styles.heroMetaIcon} />

              <Text style={styles.heroMeta}>{String(event.location || '')}</Text>
            </View>
          </View>
        </View>

        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Detay
          </Text>

          <Text style={[styles.description, { color: theme.colors.mutedText }]}>
            {String(event.description || '')}
          </Text>

          <Text style={[styles.meta, { color: theme.colors.subtleText }]}>
            Katılımcı: {String(event.attendeeCount || 0)}/{String(event.capacity || 0)}
          </Text>
        </Card>

        <View style={styles.actions}>
          <AppButton
            disabled={submitting}
            onPress={handleJoin}
            style={styles.action}
          >
            Katıl
          </AppButton>

          <AppButton
            disabled={submitting}
            onPress={handleLeave}
            style={styles.action}
            variant="secondary"
          >
            Ayrıl
          </AppButton>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  emptyScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    paddingTop: 24,
    paddingHorizontal: 20,
    flexGrow: 1,
  },

  hero: {
    height: 460,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 16,
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

  heroMeta: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 15,
    lineHeight: 22,
  },

  card: {
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 24,
  },

  action: {
    flex: 1,
  },
});