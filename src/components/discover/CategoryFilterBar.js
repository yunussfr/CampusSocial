import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {DISCOVER_CATEGORIES} from '../../constants/discoverCategories';

export function CategoryFilterBar({activeCategoryId, onChangeCategory, theme}) {
  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.content}
      showsHorizontalScrollIndicator={false}>
      {DISCOVER_CATEGORIES.map(category => {
        const active = category.id === activeCategoryId;

        return (
          <Pressable
            accessibilityRole="button"
            key={category.id}
            onPress={() => onChangeCategory(category.id)}
            style={({pressed}) => [
              styles.chipPressable,
              pressed && styles.pressed,
            ]}>
            {active ? (
              <LinearGradient
                colors={[theme.colors.primary, '#1D4ED8']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.activeChip}>
                <Text style={styles.activeIcon}>{category.icon}</Text>
                <Text style={styles.activeLabel}>{category.label}</Text>
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.inactiveChip,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <Text style={[styles.inactiveIcon, {color: category.color}]}>
                  {category.icon}
                </Text>
                <Text style={[styles.inactiveLabel, {color: theme.colors.text}]}>
                  {category.label}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 9,
    paddingRight: 16,
  },
  chipPressable: {
    borderRadius: 22,
  },
  pressed: {
    opacity: 0.82,
  },
  activeChip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 18,
    borderRadius: 22,
  },
  inactiveChip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 22,
  },
  activeIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  inactiveIcon: {
    fontSize: 16,
    fontWeight: '900',
  },
  activeLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  inactiveLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
});
