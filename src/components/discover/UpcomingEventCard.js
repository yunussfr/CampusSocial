import React from 'react';
import {ImageBackground, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  formatEventTime,
  getDayNumber,
  getEventCategory,
  getEventImageSource,
  getEventLocation,
  getEventTitle,
  getMonthName,
  getParticipantCount,
} from '../../utils/eventFormatters';

export function UpcomingEventCard({event, onPress, theme, width}) {
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
          width,
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.shadow,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <ImageBackground
        imageStyle={styles.imageRadius}
        resizeMode="cover"
        source={getEventImageSource(event)}
        style={styles.image}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>{getDayNumber(event)}</Text>
          <Text style={styles.dateMonth}>{getMonthName(event)}</Text>
        </View>

        <View style={styles.bookmarkButton}>
          <Text style={styles.bookmarkText}>□</Text>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.categoryText}>
          {getEventCategory(event).toLocaleUpperCase('tr-TR')}
        </Text>

        <Text numberOfLines={2} style={[styles.title, {color: theme.colors.text}]}>
          {getEventTitle(event)}
        </Text>

        <Text numberOfLines={1} style={[styles.meta, {color: theme.colors.mutedText}]}>
          {formatEventTime(event)} • {getEventLocation(event)}
        </Text>

        <Text numberOfLines={1} style={styles.participants}>
          {participantCount > 0 ? `+${participantCount}` : 'Yeni'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    borderRadius: 18,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  image: {
    height: 124,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#0F172A',
  },
  imageRadius: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  dateBadge: {
    width: 42,
    overflow: 'hidden',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  dateDay: {
    paddingTop: 5,
    color: '#1E293B',
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '900',
  },
  dateMonth: {
    width: '100%',
    marginTop: 3,
    paddingVertical: 4,
    textAlign: 'center',
    color: '#FFFFFF',
    backgroundColor: '#2563EB',
    fontSize: 9,
    fontWeight: '900',
  },
  bookmarkButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.86)',
  },
  bookmarkText: {
    color: '#475569',
    fontSize: 17,
    fontWeight: '900',
  },
  content: {
    minHeight: 102,
    padding: 12,
  },
  categoryText: {
    color: '#2563EB',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '900',
  },
  title: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
  },
  meta: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  participants: {
    marginTop: 7,
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '900',
  },
});
