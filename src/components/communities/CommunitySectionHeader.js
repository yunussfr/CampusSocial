import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {MdiIcon} from '../ui/MdiIcon';

export function CommunitySectionHeader({
  title,
  icon,
  actionLabel,
  onAction,
  theme,
}) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {icon ? <MdiIcon path={icon} size={26} color={theme.colors.primary} /> : null}
        <Text style={[styles.title, {color: theme.colors.text}]}>{title}</Text>
      </View>

      {actionLabel ? (
        <Pressable hitSlop={8} onPress={onAction}>
          <Text style={[styles.action, {color: theme.colors.primary}]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 20,
  },
  left: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flexShrink: 1,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
  action: {
    fontSize: 13,
    fontWeight: '800',
  },
});
