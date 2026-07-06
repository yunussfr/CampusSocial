import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../constants/routes';

export function MyEventsScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { events } = useEvents();

  const myEvents = useMemo(() => {
    if (!user) return [];
    return events.filter(e => e.attendeeIds?.includes(user.uid));
  }, [events, user]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={myEvents}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}>
              Henuz hicbir etkinlige katilmadiniz.
            </Text>
            <Pressable
              style={[styles.discoverBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('EventsTab')}
            >
              <Text style={styles.discoverBtnText}>Etkinlik Kesfet</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('EventsTab', { screen: ROUTES.EVENT_DETAIL, params: { eventId: item.id } })}
          >
            <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
            <Text style={[styles.category, { color: theme.colors.primary }]}>{item.category}</Text>
            <Text style={[styles.meta, { color: theme.colors.mutedText }]}>
              {new Date(item.startDate?.toDate ? item.startDate.toDate() : item.startDate).toLocaleDateString()}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  discoverBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  discoverBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    marginTop: 4,
  },
});
