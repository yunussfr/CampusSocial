import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ShimmerPlaceholder} from '../ui/ShimmerPlaceholder';

export function CommunitySkeleton({theme}) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.loadingText, {color: theme.colors.mutedText}]}>
        Topluluklar yukleniyor...
      </Text>
      <View style={styles.recommendationRow}>
        {[0, 1].map(item => (
          <View
            key={item}
            style={[
              styles.recommendationCard,
              {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
            ]}>
            <ShimmerPlaceholder height={110} style={styles.cover} />
            <ShimmerPlaceholder height={15} style={styles.lineLarge} />
            <ShimmerPlaceholder height={12} style={styles.lineMedium} width="68%" />
            <ShimmerPlaceholder height={10} style={styles.lineSmall} width="45%" />
          </View>
        ))}
      </View>
      {[0, 1, 2, 3].map(item => (
        <View
          key={item}
          style={[
            styles.listCard,
            {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
          ]}>
          <ShimmerPlaceholder borderRadius={18} height={64} width={64} />
          <View style={styles.listLines}>
            <ShimmerPlaceholder height={15} style={styles.lineLarge} />
            <ShimmerPlaceholder height={12} style={styles.lineMedium} width="68%" />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    paddingBottom: 24,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  recommendationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recommendationCard: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 20,
  },
  cover: {
    borderRadius: 0,
  },
  lineLarge: {
    marginTop: 12,
    marginHorizontal: 12,
  },
  lineMedium: {
    marginTop: 8,
    marginHorizontal: 12,
  },
  lineSmall: {
    marginTop: 8,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  listCard: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 18,
  },
  listLines: {
    flex: 1,
  },
});
