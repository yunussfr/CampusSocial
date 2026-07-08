import React from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';

export function ListingSwitchRow({title, description, value, onValueChange}) {
  return (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch onValueChange={onValueChange} value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textWrap: {flex: 1},
  title: {color: '#0F172A', fontSize: 14, fontWeight: '800'},
  description: {marginTop: 3, color: '#64748B', fontSize: 12, fontWeight: '600'},
});
