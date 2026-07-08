import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

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
            <View style={styles.cover} />
            <View style={styles.lineLarge} />
            <View style={styles.lineMedium} />
            <View style={styles.lineSmall} />
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
          <View style={styles.avatar} />
          <View style={styles.listLines}>
            <View style={styles.lineLarge} />
            <View style={styles.lineMedium} />
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
    height: 110,
    backgroundColor: '#E2E8F0',
  },
  lineLarge: {
    height: 15,
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  lineMedium: {
    width: '68%',
    height: 12,
    marginTop: 8,
    marginHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  lineSmall: {
    width: '45%',
    height: 10,
    marginTop: 8,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
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
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  listLines: {
    flex: 1,
  },
});
