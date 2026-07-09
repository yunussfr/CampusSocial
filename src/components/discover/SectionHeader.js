import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

export function SectionHeader({actionText, marker, onActionPress, theme, title}) {
  return (
    <View style={styles.root}>
      <View style={styles.titleRow}>
        {marker ? <Text style={styles.marker}>{marker}</Text> : null}
        <Text style={[styles.title, {color: theme.colors.text}]}>{title}</Text>
      </View>

      {actionText ? (
        <Pressable hitSlop={10} onPress={onActionPress} style={styles.action}>
          <Text style={[styles.actionText, {color: theme.colors.primary}]}>
            {actionText}
          </Text>
          <Text style={[styles.actionArrow, {color: theme.colors.primary}]}>›</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 32,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleRow: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  marker: {
    fontSize: 18,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '900',
  },
  actionArrow: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '700',
  },
});
