import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

export function ListingSegmentedControl({options, value, onChange}) {
  return (
    <View style={styles.row}>
      {options.map(option => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[styles.item, selected && styles.itemActive]}>
            <Text style={[styles.text, selected && styles.textActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', flexWrap: 'wrap', gap: 9},
  item: {
    minHeight: 44,
    flex: 1,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  itemActive: {borderColor: '#4F46E5', backgroundColor: '#EEF2FF'},
  text: {color: '#475569', fontSize: 13, fontWeight: '800'},
  textActive: {color: '#4338CA', fontWeight: '900'},
});
