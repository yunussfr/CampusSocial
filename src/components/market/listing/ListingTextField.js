import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';

export function ListingTextField({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  maxLength,
  errorText,
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        autoCorrect={false}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        spellCheck={false}
        style={[styles.input, multiline && styles.multiline]}
        value={value}
      />
      {maxLength ? (
        <Text style={styles.counter}>{String(value || '').length}/{maxLength}</Text>
      ) : null}
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
  },
  required: {
    color: '#DC2626',
  },
  input: {
    minHeight: 56,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 13,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  multiline: {
    minHeight: 112,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  counter: {
    alignSelf: 'flex-end',
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  error: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
});
