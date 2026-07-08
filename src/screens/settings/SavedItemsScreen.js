import React, { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  mdiBookmarkOffOutline,
  mdiBookmarkRemoveOutline,
  mdiForumOutline,
  mdiShoppingOutline,
} from '@mdi/js';
import { Card, PageIntro, Screen, StateView } from '../../components/ui/DesignSystem';
import { MdiIcon } from '../../components/ui/MdiIcon';
import { useAuth } from '../../context/AuthContext';
import { useSaved } from '../../context/SavedContext';
import { formatListingPrice } from '../../utils/marketFormatters';

export function SavedItemsScreen() {
  const { user } = useAuth();
  const {
    error,
    loading,
    removeSave,
    saves,
    startSavesListener,
  } = useSaved();

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    return startSavesListener(user.uid);
  }, [startSavesListener, user?.uid]);

  async function handleRemove(saveId) {
    if (!user?.uid || !saveId) {
      return;
    }

    await removeSave(user.uid, saveId);
  }

  function renderSavedItem({ item }) {
    const isListing = item.type === 'listing';

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.typeIcon}>
            <MdiIcon
              path={isListing ? mdiShoppingOutline : mdiForumOutline}
              size={22}
              color="#2563EB"
            />
          </View>
          <View style={styles.cardText}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {item.title || (isListing ? 'Kaydedilen ilan' : 'Kaydedilen post')}
            </Text>
            <Text numberOfLines={2} style={styles.cardDescription}>
              {item.description || 'Aciklama yok.'}
            </Text>
            {isListing ? (
              <Text style={styles.price}>
                {formatListingPrice(item)}
              </Text>
            ) : null}
          </View>
          <Pressable
            hitSlop={8}
            onPress={() => handleRemove(item.id)}
            style={styles.removeButton}>
            <MdiIcon path={mdiBookmarkRemoveOutline} size={22} color="#DC2626" />
          </Pressable>
        </View>
      </Card>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={saves}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <PageIntro
              title="Kaydedilenler"
              subtitle="Kaydettigin market urunleri ve topluluk postlari."
            />
            <StateView error={error} loading={loading && saves.length === 0} />
          </>
        }
        ListEmptyComponent={
          !error && !loading ? (
            <View style={styles.emptyCard}>
              <MdiIcon path={mdiBookmarkOffOutline} size={30} color="#64748B" />
              <Text style={styles.emptyTitle}>Henuz kayit yok</Text>
              <Text style={styles.emptyText}>
                Market urunlerinde veya postlarda kaydet butonuna bastiginda burada gorunur.
              </Text>
            </View>
          ) : null
        }
        renderItem={renderSavedItem}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 112,
    paddingTop: 24,
  },
  card: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
  },
  cardText: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  cardDescription: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  price: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '900',
  },
  removeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
  },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
