import React, {memo} from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import {IMAGES} from '../../constants/assets';

function convertToDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getEventDate(event) {
  return convertToDate(
    event?.startDate ||
      event?.startAt ||
      event?.startTime ||
      event?.eventDate ||
      event?.date,
  );
}

function getImageSource(event) {
  const imageURL =
    event?.coverURL ||
    event?.imageURL ||
    event?.imageUrl ||
    event?.bannerURL ||
    event?.photoURL;

  return imageURL
    ? {uri: imageURL}
    : IMAGES.coverPlaceholder;
}

function getTitle(event) {
  return event?.title || event?.name || 'Etkinlik';
}

function getLocation(event) {
  return (
    event?.locationName ||
    event?.location ||
    event?.venue ||
    event?.place ||
    'Kampüs'
  );
}

function formatEventDate(event) {
  const date = getEventDate(event);

  if (!date) {
    return event?.dateText || 'Tarih belirtilmedi';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function PopulerEventCart({
  event,
  onPress,
  theme,
}) {
  if (!event) {
    return null;
  }

  const shadowColor =
    theme?.colors?.shadow || '#0F172A';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${getTitle(event)} etkinliğini aç`}
      onPress={onPress}
      style={({pressed}) => [
        styles.wrapper,
        {
          shadowColor,
          opacity: pressed ? 0.92 : 1,
          transform: [
            {
              scale: pressed ? 0.99 : 1,
            },
          ],
        },
      ]}>
      <View style={styles.card}>
        <ImageBackground
          source={getImageSource(event)}
          resizeMode="cover"
          style={styles.image}>
          <LinearGradient
            pointerEvents="none"
            colors={[
              'rgba(15,23,42,0.02)',
              'rgba(15,23,42,0.16)',
              'rgba(15,23,42,0.94)',
            ]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.topRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {event.isActive
                  ? 'AKTİF'
                  : event.category || 'ETKİNLİK'}
              </Text>
            </View>

            <View style={styles.dateBadge}>
              <Text
                numberOfLines={1}
                style={styles.dateText}>
                {formatEventDate(event)}
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text
              numberOfLines={2}
              style={styles.title}>
              {getTitle(event)}
            </Text>

            <Text
              numberOfLines={1}
              style={styles.location}>
              ◉ {getLocation(event)}
            </Text>
          </View>
        </ImageBackground>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 190,
    borderRadius: 18,

    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.16,
    shadowRadius: 10,

    elevation: 5,
  },

  card: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },

  image: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },

  statusBadge: {
    maxWidth: '38%',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#2563EB',
  },

  statusText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  dateBadge: {
    maxWidth: '62%',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: 'rgba(15,23,42,0.76)',
  },

  dateText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },

  content: {
    paddingRight: 14,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 26,
  },

  location: {
    marginTop: 5,
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default memo(PopulerEventCart);