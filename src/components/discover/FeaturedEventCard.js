import React from 'react';
import {ImageBackground, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  formatEventDateTime,
  getEventCategory,
  getEventImageSource,
  getEventLocation,
  getEventTitle,
  getParticipantCount,
} from '../../utils/eventFormatters';

export function FeaturedEventCard({event, onPress, theme, width}) {
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
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      <ImageBackground
        imageStyle={styles.imageRadius}
        resizeMode="cover"
        source={getEventImageSource(event)}
        style={styles.image}>
        <LinearGradient
          colors={[
            'rgba(2,6,23,0.03)',
            'rgba(2,6,23,0.35)',
            'rgba(2,6,23,0.94)',
          ]}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.topRow}>
          <View style={styles.categoryBadge}>
            <Text numberOfLines={1} style={styles.categoryText}>
              {getEventCategory(event).toLocaleUpperCase('tr-TR')}
            </Text>
          </View>

          <View style={styles.bookmarkButton}>
            <Text style={styles.bookmarkText}>□</Text>
          </View>
        </View>

        <View style={styles.bottomContent}>
          <Text numberOfLines={2} style={styles.title}>
            {getEventTitle(event)}
          </Text>

          <Text numberOfLines={1} style={styles.metaText}>
            ◷ {formatEventDateTime(event)}
          </Text>

          <Text numberOfLines={1} style={styles.metaText}>
            ◉ {getEventLocation(event)}
          </Text>

          <View style={styles.footerRow}>
            <Text numberOfLines={1} style={styles.participantText}>
              {participantCount > 0
                ? `+${participantCount} kişi katılıyor`
                : 'Katılım açık'}
            </Text>

            <View style={styles.detailButton}>
              <Text style={styles.detailText}>Detayı Gör</Text>
              <Text style={styles.detailArrow}>→</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 244,
    overflow: 'hidden',
    borderRadius: 24,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 7,
  },
  image: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#0F172A',
  },
  imageRadius: {
    borderRadius: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    maxWidth: '62%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  bookmarkButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  bookmarkText: {
    color: '#1E293B',
    fontSize: 20,
    fontWeight: '900',
  },
  bottomContent: {
    gap: 6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
  },
  metaText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  footerRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 6,
  },
  participantText: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  detailButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  detailText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '900',
  },
  detailArrow: {
    color: '#1D4ED8',
    fontSize: 18,
    fontWeight: '900',
  },
});
