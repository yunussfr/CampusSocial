import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function ListingCard({ listing, onPress, saved }) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}>
      <View style={[styles.imageWrap, { backgroundColor: theme.colors.primarySoft }]}>
        {listing.imageURLs?.[0] ? (
          <Image source={{ uri: listing.imageURLs[0] }} style={styles.image} />
        ) : null}
        <View style={[styles.saveButton, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.saveIcon, { color: theme.colors.primary }]}>
            {saved ? 'Saved' : 'Save'}
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>
            {listing.title}
          </Text>
        </View>
        <Text style={[styles.price, { color: theme.colors.primary }]}>
          {listing.price} {listing.currency || 'TRY'}
        </Text>
        <Text numberOfLines={2} style={styles.description}>
          {listing.description}
        </Text>
        <Text style={[styles.meta, { color: theme.colors.mutedText }]}>
          {listing.category} - {listing.condition || 'used'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 12,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
  },
  imageWrap: {
    height: 169,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    gap: 6,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
  },
  description: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
  },
  saveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    minHeight: 32,
    minWidth: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveIcon: {
    fontSize: 11,
    fontWeight: '800',
  },
});
