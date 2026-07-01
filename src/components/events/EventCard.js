import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ICONS, IMAGES } from '../../constants/assets';
import { useTheme } from '../../context/ThemeContext';

export function EventCard({ event, onPress }) {
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
      <View style={[styles.coverWrap, { backgroundColor: theme.colors.primarySoft }]}>
        <Image
          source={event.coverURL ? { uri: event.coverURL } : IMAGES.coverPlaceholder}
          style={styles.cover}
        />
        <View style={[styles.dateBadge, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.dateBadgeText, { color: theme.colors.primary }]}>
            {event.category || 'Etkinlik'}
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{event.title}</Text>
        <Text numberOfLines={2} style={styles.description}>
          {event.description}
        </Text>
        <View style={styles.metaRow}>
          <Image
            source={ICONS.location}
            style={[styles.metaIcon, { tintColor: theme.colors.mutedText }]}
          />
          <Text style={[styles.meta, { color: theme.colors.mutedText }]}>
            {event.category} - {event.location}
          </Text>
        </View>
        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.meta, { color: theme.colors.subtleText }]}>
          Katilimci: {event.attendeeCount}/{event.capacity}
          </Text>
          <Text style={[styles.action, { color: theme.colors.primary }]}>Katıl</Text>
        </View>
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
  coverWrap: {
    height: 160,
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  dateBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '600',
    marginBottom: 6,
  },
  description: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  footer: {
    marginTop: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  action: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
});
