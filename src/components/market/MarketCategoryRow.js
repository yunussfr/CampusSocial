import React, {memo} from 'react';
import {ScrollView, Pressable, StyleSheet, Text} from 'react-native';
import {mdiViewGridOutline} from '@mdi/js';
import {MdiIcon} from '../ui/MdiIcon';
import {
  QUICK_MARKET_CATEGORY_KEYS,
  getMarketCategoryByKey,
} from '../../utils/marketCategories';

function MarketCategoryRow({
  categories,
  activeCategoryKey,
  onCategoryPress,
}) {
  const categoryMap = new Map(categories.map(category => [category.key, category]));
  const categoryItems = QUICK_MARKET_CATEGORY_KEYS.map(key => {
    if (key === 'all') {
      return {
        key: 'all',
        shortLabel: 'Tümü',
        icon: mdiViewGridOutline,
      };
    }

    return categoryMap.get(key) || getMarketCategoryByKey(key);
  }).filter(Boolean);

  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.content}
      showsHorizontalScrollIndicator={false}>
      {categoryItems.map(category => {
        const selected = activeCategoryKey === category.key;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{selected}}
            key={category.key}
            onPress={() => onCategoryPress(category.key)}
            style={({pressed}) => [
              styles.card,
              selected && styles.cardSelected,
              pressed && styles.pressed,
            ]}>
            <MdiIcon
              path={category.icon}
              size={21}
              color={selected ? '#FFFFFF' : '#2563EB'}
            />
            <Text
              numberOfLines={2}
              style={[styles.label, selected && styles.labelSelected]}>
              {category.shortLabel || category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingTop: 16,
    paddingBottom: 17,
    paddingRight: 8,
  },
  card: {
    minWidth: 88,
    minHeight: 68,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 9,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOpacity: 0.24,
  },
  pressed: {
    opacity: 0.78,
  },
  label: {
    maxWidth: 105,
    color: '#334155',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});

export default memo(MarketCategoryRow);
