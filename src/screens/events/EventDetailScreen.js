import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Animated, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import MapView, { Marker } from 'react-native-maps';

import { AppButton, Card, StateView } from '../../components/ui/DesignSystem';
import { ICONS, IMAGES } from '../../constants/assets';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { useTheme } from '../../context/ThemeContext';
import { ANALYTICS_EVENTS } from '../../services/analyticsService';

export function EventDetailScreen({ route }) {
  const heroMotion = useMemo(() => new Animated.Value(0), []);
  const { logEvent } = useAnalytics();
  const { user } = useAuth();
  const { theme } = useTheme();

  const { events, joinSelectedEvent, leaveSelectedEvent, selectedEvent } =
    useEvents();

  const [submitting, setSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const eventId = route.params?.eventId;

  const tabBarHeightFromContext = useContext(BottomTabBarHeightContext);
  const tabBarHeight = tabBarHeightFromContext || 90;

  const event = useMemo(
    () => selectedEvent || events.find(item => item.id === eventId),
    [eventId, events, selectedEvent],
  );

  useEffect(() => {
    heroMotion.setValue(0);
    Animated.timing(heroMotion, {
      toValue: 1,
      duration: 360,
      useNativeDriver: true,
    }).start();
  }, [heroMotion, eventId]);

  useEffect(() => {
    if (!actionFeedback) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setActionFeedback(null);
    }, 1800);

    return () => clearTimeout(timeoutId);
  }, [actionFeedback]);

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
    setActionFeedback(null);

    try {
      await joinSelectedEvent(event.id, user.uid);
      logEvent(ANALYTICS_EVENTS.EVENT_JOIN, {
        event_id: event.id,
        category: event.category || '',
      });
      setActionFeedback('joined');
    } catch (error) {
      Alert.alert('Etkinliğe katılınamadı', error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLeave() {
    setSubmitting(true);
    setActionFeedback(null);

    try {
      await leaveSelectedEvent(event.id, user.uid);
      logEvent(ANALYTICS_EVENTS.EVENT_LEAVE, {
        event_id: event.id,
        category: event.category || '',
      });
      setActionFeedback('left');
    } catch (error) {
      Alert.alert('Etkinlikten ayrılınamadı', error.message);
    } finally {
      setSubmitting(false);
    }
  }

  const hasJoinedFeedback = actionFeedback === 'joined';
  const hasLeftFeedback = actionFeedback === 'left';

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
        <Animated.View
          style={[
            styles.hero,
            { backgroundColor: theme.colors.primarySoft },
            {
              opacity: heroMotion,
              transform: [
                {
                  translateY: heroMotion.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            },
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

              <Text style={styles.heroMeta}>{getEventLocationLabel(event)}</Text>
            </View>
          </View>
        </Animated.View>

        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Tarih ve Saat
          </Text>

          <View style={styles.dateGrid}>
            <View style={styles.dateCell}>
              <Text style={[styles.dateLabel, { color: theme.colors.subtleText }]}>
                Baslangic
              </Text>
              <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                {formatDateTime(event.startDate)}
              </Text>
            </View>

            <View style={styles.dateCell}>
              <Text style={[styles.dateLabel, { color: theme.colors.subtleText }]}>
                Bitis
              </Text>
              <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                {formatDateTime(event.endDate)}
              </Text>
            </View>
          </View>
        </Card>

        {getEventCoordinate(event) ? (
          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Konum
            </Text>

            <Text style={[styles.meta, { color: theme.colors.subtleText }]}>
              {getEventLocationLabel(event)}
            </Text>

            <MapView
              pointerEvents="none"
              initialRegion={{
                ...getEventCoordinate(event),
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
              style={styles.map}>
              <Marker coordinate={getEventCoordinate(event)} />
            </MapView>
          </Card>
        ) : null}

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
            style={[
              styles.action,
              hasJoinedFeedback && styles.joinedAction,
            ]}
          >
            {hasJoinedFeedback ? "Hub'a eklendi" : 'Katıl'}
          </AppButton>

          <AppButton
            disabled={submitting}
            onPress={handleLeave}
            style={[
              styles.action,
              hasLeftFeedback && styles.leftAction,
            ]}
            variant={hasLeftFeedback ? 'primary' : 'secondary'}
          >
            {hasLeftFeedback ? "Hub'dan çıkarıldı" : 'Ayrıl'}
          </AppButton>
        </View>
      </ScrollView>
    </View>
  );
}

function formatDateTime(value) {
  const date = convertToDate(value);

  if (!date) {
    return 'Belirtilmedi';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function convertToDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getEventCoordinate(event) {
  if (
    !event.location ||
    typeof event.location !== 'object'
  ) {
    return null;
  }

  const latitude = Number(event.location.latitude);
  const longitude = Number(event.location.longitude);

  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

function getEventLocationLabel(event) {
  if (event.locationLabel) {
    return String(event.locationLabel);
  }

  const coordinate = getEventCoordinate(event);

  if (coordinate) {
    return `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`;
  }

  return String(event.location || '');
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

  dateGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  dateCell: {
    flex: 1,
    minHeight: 70,
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },

  dateLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },

  dateValue: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },

  map: {
    width: '100%',
    height: 190,
    marginTop: 12,
    borderRadius: 12,
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

  joinedAction: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },

  leftAction: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
});
