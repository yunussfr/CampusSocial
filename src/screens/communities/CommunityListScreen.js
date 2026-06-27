import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CommunityCard } from '../../components/communities/CommunityCard';
import { ROUTES } from '../../constants/routes';
import { useCommunities } from '../../context/CommunityContext';

export function CommunityListScreen({ navigation }) {
  const {
    communities,
    error,
    loading,
    selectCommunity,
    startCommunitiesListener,
  } = useCommunities();

  useEffect(() => {
    const unsubscribe = startCommunitiesListener();

    return unsubscribe;
  }, [startCommunitiesListener]);

  if (loading && communities.length === 0) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator />
        <Text style={styles.mutedText}>Topluluklar yukleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Topluluklar</Text>
      <Text style={styles.mutedText}>Kampus topluluklarini kesfet.</Text>
      <Pressable
        onPress={() => navigation.navigate(ROUTES.CREATE_COMMUNITY)}
        style={styles.createButton}>
        <Text style={styles.createButtonText}>Topluluk Olustur</Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={communities}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henuz topluluk yok.</Text>
        }
        renderItem={({ item }) => (
          <CommunityCard
            community={item}
            onPress={() => {
              selectCommunity(item);
              navigation.navigate(ROUTES.COMMUNITY_DETAIL, {
                communityId: item.id,
              });
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
    paddingTop: 24,
    backgroundColor: '#F8FAFC',
  },
  title: {
    color: '#0B1C30',
    fontSize: 28,
    fontWeight: '800',
  },
  mutedText: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 4,
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
  listContent: {
    gap: 12,
    paddingVertical: 20,
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
