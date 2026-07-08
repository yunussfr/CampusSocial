import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {mdiViewGridOutline} from '@mdi/js';
import {MdiIcon} from '../ui/MdiIcon';
import {
  QUICK_COMMUNITY_CATEGORY_KEYS,
  getCommunityCategoryByKey,
} from '../../utils/communityCategories';

export function CommunityCategoryRow({
  categories,
  activeCategoryKey,
  onCategoryPress,
  theme,
}) {
  const categoryMap = new Map(categories.map(category => [category.key, category]));
  const items = QUICK_COMMUNITY_CATEGORY_KEYS.map(key => {
    if (key === 'all') {
      return {
        key: 'all',
        shortLabel: 'Tumu',
        label: 'Tumu',
        icon: mdiViewGridOutline,
        color: theme.colors.primary,
      };
    }

    return categoryMap.get(key) || getCommunityCategoryByKey(key);
  }).filter(Boolean);

  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.content}
      showsHorizontalScrollIndicator={false}>
      {items.map(category => {
        const selected = activeCategoryKey === category.key;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{selected}}
            key={category.key}
            onPress={() => onCategoryPress(category.key)}
            style={({pressed}) => [
              styles.chip,
              {
                backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                shadowColor: theme.colors.shadow,
                opacity: pressed ? 0.78 : 1,
              },
            ]}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: selected
                    ? 'rgba(255,255,255,0.16)'
                    : `${category.color}18`,
                },
              ]}>
              <MdiIcon
                path={category.icon}
                size={21}
                color={selected ? '#FFFFFF' : category.color}
              />
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                {color: selected ? '#FFFFFF' : theme.colors.text},
              ]}>
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
    paddingVertical: 2,
    paddingRight: 16,
  },
  chip: {
    minHeight: 47,
    maxWidth: 210,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderRadius: 18,
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrap: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  label: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '800',
  },
});
