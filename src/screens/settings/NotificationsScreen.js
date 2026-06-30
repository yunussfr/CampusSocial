import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useChats } from '../../context/ChatContext';

export function NotificationsScreen() {
  const { user } = useAuth();
  const { error, notifications, startNotificationsListener } = useChats();

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    return startNotificationsListener(user.uid);
  }, [startNotificationsListener, user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bildirimler</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={notifications}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henuz bildirim yok.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title || 'Bildirim'}</Text>
            <Text style={styles.message}>{item.message || item.body}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: '#F8FAFC',
  },
  title: {
    color: '#0B1C30',
    fontSize: 28,
    fontWeight: '800',
  },
  listContent: {
    gap: 12,
    paddingVertical: 20,
  },
  card: {
    gap: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    color: '#0B1C30',
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 24,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 12,
  },
});
