import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { CommunityCard } from '../../components/communities/CommunityCard';
import { AppInput } from '../../components/ui/DesignSystem';
import { SearchIcon } from '../../components/ui/SearchIcon';
import { ROUTES } from '../../constants/routes';
import { useCommunities } from '../../context/CommunityContext';
import { useTheme } from '../../context/ThemeContext';
import { IMAGES } from '../../constants/assets';

export function CommunityListScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
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

  const filteredCommunities = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return communities;
    }

    return communities.filter(community => {
      const searchableText = [
        community.name,
        community.description,
        community.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [communities, searchQuery]);

  if (loading && communities.length === 0) {
    return (
      <View style={[styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
        <Text style={[styles.mutedText, { color: theme.colors.mutedText }]}>Topluluklar yukleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerSection}>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Topluluklar</Text>
          <Text style={[styles.mutedText, { color: theme.colors.mutedText }]}>Kampus topluluklarini kesfet.</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('EventsTab', { screen: ROUTES.DISCOVER })}>
          <Image
            source={IMAGES.brandLogo}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <Pressable
        onPress={() => navigation.navigate(ROUTES.CREATE_COMMUNITY)}
        style={styles.createButton}>
        <Text style={styles.createButtonText}>+ Yeni Topluluk</Text>
      </Pressable>

      <AppInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon={<SearchIcon size={20} color={theme.colors.subtleText} />}
        placeholder="Topluluk veya ilgi alani ara..."
        style={styles.searchInput}
      />

      {error ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text> : null}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={filteredCommunities}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}>Henuz topluluk yok.</Text>
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
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTextWrap: {
    flex: 1,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    color: '#0B1C30',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  mutedText: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 4,
    fontWeight: '500',
  },
  createButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#431359',
    shadowColor: '#431359',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  searchInput: {
    marginBottom: 12,
  },
  listContent: {
    gap: 12,
    paddingBottom: 112,
    paddingTop: 8,
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
