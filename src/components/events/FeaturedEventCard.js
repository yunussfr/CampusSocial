import React, {memo, useState} from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import {
  mdiAccountGroupOutline,
  mdiMapMarkerOutline,
} from '@mdi/js';

import {MdiIcon} from '../ui/MdiIcon';

function FeaturedEventCard({
  item,
  width,
  theme,
  onPress,
}) {
  const [imageFailed, setImageFailed] =
    useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title} etkinliğini aç`}
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        {
          width,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      <ImageBackground
        source={
          imageFailed
            ? item.fallbackImageSource
            : item.imageSource
        }
        resizeMode="cover"
        onError={() => setImageFailed(true)}
        imageStyle={styles.imageRadius}
        style={styles.image}>
        <LinearGradient
          colors={[
            'rgba(2,6,23,0.04)',
            'rgba(2,6,23,0.22)',
            'rgba(2,6,23,0.96)',
          ]}
          locations={[0, 0.48, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.topRow}>
          <View style={styles.categoryBadge}>
            <Text
              numberOfLines={1}
              style={styles.categoryText}>
              {item.categoryLabel}
            </Text>
          </View>

          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>
              {item.day}
            </Text>

            <Text style={styles.dateMonth}>
              {item.month}
            </Text>
          </View>
        </View>

        <View>
          <Text
            numberOfLines={2}
            style={styles.title}>
            {item.title}
          </Text>

          {item.description ? (
            <Text
              numberOfLines={1}
              style={styles.description}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MdiIcon
                path={mdiMapMarkerOutline}
                size={16}
                color="#CBD5E1"
              />

              <Text
                numberOfLines={1}
                style={styles.metaText}>
                {item.location}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <MdiIcon
                path={mdiAccountGroupOutline}
                size={16}
                color="#CBD5E1"
              />

              <Text style={styles.metaText}>
                {item.participantCount} katılımcı
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 270,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 22,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 16,

    elevation: 7,
  },

  image: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },

  imageRadius: {
    borderRadius: 21,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  categoryBadge: {
    maxWidth: '65%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: '#2563EB',
  },

  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  dateBadge: {
    width: 54,
    overflow: 'hidden',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.84)',
  },

  dateDay: {
    paddingTop: 7,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },

  dateMonth: {
    width: '100%',
    marginTop: 3,
    paddingVertical: 5,
    textAlign: 'center',
    color: '#FFFFFF',
    backgroundColor: '#2563EB',
    fontSize: 9,
    fontWeight: '900',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
  },

  description: {
    marginTop: 5,
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
  },

  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  metaItem: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  metaText: {
    maxWidth: 155,
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default memo(FeaturedEventCard);
