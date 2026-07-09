import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  getEventCategory,
  getEventImageSource,
  getEventLocation,
  getEventTitle,
  getParticipantCount,
} from '../../utils/eventFormatters';

export function LiveEventCard({event, onPress, theme}) {
  if (!event) {
    return null;
  }

  const participantCount = getParticipantCount(event);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.root,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <View style={styles.imageWrap}>
        <Image source={getEventImageSource(event)} style={styles.image} />
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>CANLI</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.category}>
          {getEventCategory(event)}
        </Text>

        <Text numberOfLines={1} style={[styles.title, {color: theme.colors.text}]}>
          {getEventTitle(event)}
        </Text>

        <Text numberOfLines={1} style={[styles.meta, {color: theme.colors.mutedText}]}>
          Şu an aktif • {getEventLocation(event)}
        </Text>

        <Text numberOfLines={1} style={[styles.watchers, {color: theme.colors.mutedText}]}>
          {participantCount > 0 ? `${participantCount} katılımcı` : 'Katılım açık'}
        </Text>
      </View>

      <View style={styles.actionButton}>
        <Text style={styles.actionText}>İzle</Text>
        <Text style={styles.actionArrow}>→</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 110,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 18,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  imageWrap: {
    width: 92,
    height: 82,
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: '#0F172A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: '#EF4444',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  content: {
    minWidth: 0,
    flex: 1,
  },
  category: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    color: '#047857',
    backgroundColor: '#D1FAE5',
    fontSize: 10,
    fontWeight: '900',
  },
  title: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  meta: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  watchers: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '700',
  },
  actionButton: {
    minWidth: 74,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
  },
  actionText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '900',
  },
  actionArrow: {
    color: '#1D4ED8',
    fontSize: 18,
    fontWeight: '900',
  },
});
