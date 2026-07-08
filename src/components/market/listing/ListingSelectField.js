import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

export function ListingSelectField({
  label,
  required,
  options,
  value,
  onSelect,
  placeholder,
  open,
  onToggle,
  errorText,
}) {
  const selected = options.find(item => item.key === value || item.firestoreValue === value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <Pressable onPress={onToggle} style={styles.input}>
        <Text numberOfLines={1} style={[styles.value, !selected && styles.placeholder]}>
          {selected?.label || placeholder}
        </Text>
        <Text style={styles.arrow}>{open ? 'Yukari' : 'Asagi'}</Text>
      </Pressable>
      {open ? (
        <View style={styles.dropdown}>
          {options.map(option => (
            <Pressable
              key={option.key || option.firestoreValue}
              onPress={() => onSelect(option)}
              style={[
                styles.option,
                (option.key === value || option.firestoreValue === value) && styles.optionActive,
              ]}>
              <Text style={styles.optionText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: 6},
  label: {color: '#64748B', fontSize: 12, fontWeight: '800'},
  required: {color: '#DC2626'},
  input: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  value: {flex: 1, color: '#0F172A', fontSize: 15, fontWeight: '700'},
  placeholder: {color: '#94A3B8'},
  arrow: {color: '#64748B', fontSize: 11, fontWeight: '700'},
  dropdown: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  option: {paddingHorizontal: 14, paddingVertical: 12},
  optionActive: {backgroundColor: '#EEF4FF'},
  optionText: {color: '#0F172A', fontSize: 14, fontWeight: '700'},
  error: {color: '#DC2626', fontSize: 12, fontWeight: '700'},
});
