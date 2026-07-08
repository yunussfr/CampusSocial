import React, {memo, useState} from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  mdiAccountGroupOutline,
  mdiChevronRight,
  mdiClockOutline,
  mdiMapMarkerOutline,
} from '@mdi/js';

import {MdiIcon} from '../ui/MdiIcon';

function UpcomingEventRow({
  item,
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
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <View style={styles.imageContainer}>
        <Image
          source={
            imageFailed
              ? item.fallbackImageSource
              : item.imageSource
          }
          resizeMode="cover"
          onError={() => setImageFailed(true)}
          style={styles.image}
        />

        <View style={styles.categoryBadge}>
          <Text
            numberOfLines={1}
            style={styles.categoryText}>
            {item.categoryLabel}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text
          numberOfLines={2}
          style={[
            styles.title,
            {
              color: theme.colors.text,
            },
          ]}>
          {item.title}
        </Text>

        <View style={styles.metaLine}>
          <MdiIcon
            path={mdiClockOutline}
            size={15}
            color={theme.colors.mutedText}
          />

          <Text
            numberOfLines={1}
            style={[
              styles.metaText,
              {
                color: theme.colors.mutedText,
              },
            ]}>
            {item.dateLabel} · {item.timeLabel}
          </Text>
        </View>

        <View style={styles.metaLine}>
          <MdiIcon
            path={mdiMapMarkerOutline}
            size={15}
            color={theme.colors.mutedText}
          />

          <Text
            numberOfLines={1}
            style={[
              styles.metaText,
              {
                color: theme.colors.mutedText,
              },
            ]}>
            {item.location}
          </Text>
        </View>

        <View style={styles.participantRow}>
          <MdiIcon
            path={mdiAccountGroupOutline}
            size={15}
            color={theme.colors.primary}
          />

          <Text
            style={[
              styles.participantText,
              {
                color: theme.colors.primary,
              },
            ]}>
            {item.participantCount} katılımcı
          </Text>
        </View>
      </View>

      <MdiIcon
        path={mdiChevronRight}
        size={24}
        color={theme.colors.mutedText}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 126,
    padding: 10,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,

    borderWidth: 1,
    borderRadius: 18,
  },

  imageContainer: {
    width: 112,
    height: 104,
    overflow: 'hidden',
    borderRadius: 14,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    maxWidth: 90,

    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 8,
    backgroundColor: 'rgba(37,99,235,0.94)',
  },

  categoryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },

  metaLine: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  metaText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
  },

  participantRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  participantText: {
    fontSize: 11,
    fontWeight: '800',
  },
});

export default memo(UpcomingEventRow);
