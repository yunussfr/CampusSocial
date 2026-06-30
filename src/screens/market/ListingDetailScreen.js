import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useChats } from '../../context/ChatContext';
import { useMarket } from '../../context/MarketContext';

export function ListingDetailScreen({ navigation }) {
  const { profile, user } = useAuth();
  const { startDirectChat } = useChats();
  const { saveSelectedListing, selectedListing } = useMarket();
  const [saving, setSaving] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [error, setError] = useState(null);
  const listing = selectedListing;

  if (!listing) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.mutedText}>Ilan bulunamadi.</Text>
      </View>
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
    <ScrollView contentContainerStyle={styles.container}>
      {listing.imageURLs?.[0] ? (
        <Image source={{ uri: listing.imageURLs[0] }} style={styles.heroImage} />
      ) : null}
      <Text style={styles.title}>{listing.title}</Text>
      <Text style={styles.price}>
        {listing.price} {listing.currency || 'TRY'}
      </Text>
      <Text style={styles.meta}>
        {listing.category} - {listing.condition || 'used'}
      </Text>
      <Text style={styles.description}>{listing.description}</Text>
      <Text style={styles.seller}>
        Satici: {listing.seller?.displayName || 'Bilinmeyen kullanici'}
      </Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Pressable onPress={handleSave} disabled={saving} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>
          {saving ? 'Kaydediliyor...' : 'Ilani Kaydet'}
        </Text>
      </Pressable>
      {listing.sellerId !== user.uid ? (
        <Pressable
          onPress={handleMessageSeller}
          disabled={startingChat}
          style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>
            {startingChat ? 'Chat aciliyor...' : 'Saticiya Mesaj At'}
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  container: {
    gap: 12,
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  title: {
    color: '#0B1C30',
    fontSize: 28,
    fontWeight: '800',
  },
  price: {
    color: '#004AC6',
    fontSize: 22,
    fontWeight: '800',
  },
  description: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    color: '#64748B',
    fontSize: 14,
  },
  seller: {
    color: '#0B1C30',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#004AC6',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#004AC6',
    fontSize: 15,
    fontWeight: '700',
  },
  mutedText: {
    color: '#64748B',
    fontSize: 15,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
});
