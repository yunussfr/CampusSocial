import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AppButton, Card, Screen, StateView } from '../../components/ui/DesignSystem';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useChats } from '../../context/ChatContext';
import { useMarket } from '../../context/MarketContext';
import { useTheme } from '../../context/ThemeContext';

export function ListingDetailScreen({ navigation }) {
  const { profile, user } = useAuth();
  const { theme } = useTheme();
  const { startDirectChat } = useChats();
  const { saveSelectedListing, selectedListing } = useMarket();
  const [saving, setSaving] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [error, setError] = useState(null);
  const listing = selectedListing;

  if (!listing) {
    return (
      <Screen>
        <StateView empty title="Ilan bulunamadi." />
      </Screen>
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      await saveSelectedListing(user.uid, listing.id);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleMessageSeller() {
    setStartingChat(true);
    setError(null);

    try {
      const chatId = await startDirectChat({
        currentUser: {
          uid: user.uid,
          displayName: profile?.displayName || user.displayName || '',
          photoURL: profile?.photoURL || user.photoURL || '',
        },
        otherUser: listing.seller,
        relatedListingId: listing.id,
      });

      navigation.navigate(ROUTES.CHAT_DETAIL, { chatId });
    } catch (chatError) {
      setError(chatError.message);
    } finally {
      setStartingChat(false);
    }
  }

  return (
    <Screen scroll style={styles.container}>
      <View style={[styles.hero, { backgroundColor: theme.colors.primarySoft }]}>
        {listing.imageURLs?.[0] ? (
          <Image source={{ uri: listing.imageURLs[0] }} style={styles.heroImage} />
        ) : null}
      </View>
      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{listing.title}</Text>
        <Text style={[styles.price, { color: theme.colors.primary }]}>
          {listing.price} {listing.currency || 'TRY'}
        </Text>
        <Text style={[styles.meta, { color: theme.colors.subtleText }]}>
          {listing.category} - {listing.condition || 'used'} - {listing.status || 'active'}
        </Text>
        <Text style={[styles.description, { color: theme.colors.mutedText }]}>
          {listing.description}
        </Text>
      </Card>
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Satici</Text>
        <Text style={[styles.seller, { color: theme.colors.mutedText }]}>
          {listing.seller?.displayName || 'Bilinmeyen kullanici'}
        </Text>
      </Card>
      <StateView error={error} />
      <AppButton disabled={saving} onPress={handleSave} variant="secondary">
        {saving ? 'Kaydediliyor...' : 'Ilani Kaydet'}
      </AppButton>
      {listing.sellerId !== user.uid ? (
        <AppButton disabled={startingChat} onPress={handleMessageSeller}>
          {startingChat ? 'Chat aciliyor...' : 'Saticiya Mesaj At'}
        </AppButton>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  hero: {
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  card: {
    gap: 8,
    padding: 16,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
  },
  price: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  seller: {
    fontSize: 15,
    lineHeight: 22,
  },
});
