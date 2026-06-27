import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EventCard } from '../../components/events/EventCard';
import { ROUTES } from '../../constants/routes';
import { useEvents } from '../../context/EventContext';

export function DiscoverScreen({ navigation }) {
  const {
    events,
    error,
    loading,
    selectEvent,
    startEventsListener,
  } = useEvents();

  useEffect(() => {
    const unsubscribe = startEventsListener();

    return unsubscribe;
  }, [startEventsListener]);

  if (loading && events.length === 0) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator />
        <Text style={styles.mutedText}>Etkinlikler yukleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.mutedText}>Firestore etkinlikleri</Text>
      <Pressable
        onPress={() => navigation.navigate(ROUTES.CREATE_EVENT)}
        style={styles.createButton}>
        <Text style={styles.createButtonText}>Etkinlik Olustur</Text>
      </Pressable>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={events}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henuz aktif etkinlik yok.</Text>
        }
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => {
              selectEvent(item);
              navigation.navigate(ROUTES.EVENT_DETAIL, { eventId: item.id });
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
    backgroundColor: '#F8FAFC',
  },
  title: {
    color: '#0B1C30',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  mutedText: {
    color: '#64748B',
    fontSize: 15,
  },
  createButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: '#004AC6',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 15,
    textAlign: 'center',
  },
  listContent: {
    gap: 12,
    paddingVertical: 20,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 24,
  },
});
