import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useCommunities } from '../../context/CommunityContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../constants/routes';

export function MyCommunitiesScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { communities } = useCommunities();

  const myCommunities = useMemo(() => {
    if (!user) return [];
    return communities.filter(c => c.memberIds?.includes(user.uid));
  }, [communities, user]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={myCommunities}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}>
              Henuz hicbir topluluga katilmadiniz.
            </Text>
            <Pressable
              style={[styles.discoverBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('CommunitiesTab')}
            >
              <Text style={styles.discoverBtnText}>Topluluk Kesfet</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('CommunitiesTab', { screen: ROUTES.COMMUNITY_DETAIL, params: { communityId: item.id } })}
          >
            <Text style={[styles.title, { color: theme.colors.text }]}>{item.name}</Text>
            <Text style={[styles.category, { color: theme.colors.primary }]}>{item.category}</Text>
            <Text style={[styles.meta, { color: theme.colors.mutedText }]}>
              {item.memberCount} uye
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
