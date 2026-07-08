import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

export function ListingBottomActionBar({
  isOwnListing,
  saving,
  startingChat,
  onSave,
  onMessage,
}) {
  return (
    <View style={styles.bar}>
      <Pressable disabled={saving} onPress={onSave} style={styles.secondary}>
        <Text style={styles.secondaryText}>{saving ? 'Kaydediliyor...' : 'Teklifi Gorus'}</Text>
      </Pressable>
      {!isOwnListing ? (
        <Pressable disabled={startingChat} onPress={onMessage} style={styles.primary}>
          <Text style={styles.primaryText}>
            {startingChat ? 'Acilıyor...' : 'Saticiya Mesaj At'}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.primary}>
          <Text style={styles.primaryText}>Senin Ilanin</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  secondary: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#4F46E5',
    borderRadius: 13,
  },
  secondaryText: {color: '#4F46E5', fontSize: 14, fontWeight: '900'},
  primary: {flex: 1.35, minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#4F46E5'},
  primaryText: {color: '#FFFFFF', fontSize: 14, fontWeight: '900'},
});
