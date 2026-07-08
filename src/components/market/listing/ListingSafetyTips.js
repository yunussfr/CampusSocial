import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {mdiShieldCheckOutline} from '@mdi/js';
import {MdiIcon} from '../../ui/MdiIcon';

export function ListingSafetyTips() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MdiIcon path={mdiShieldCheckOutline} size={22} color="#4F46E5" />
        <Text style={styles.title}>Guvenli alisveris ipuclari</Text>
      </View>
      <Text style={styles.tip}>Urunu gormeden odeme yapma.</Text>
      <Text style={styles.tip}>Kampus ici guvenli ve kalabalik noktalarda bulus.</Text>
      <Text style={styles.tip}>Satici bilgilerini ve urun detaylarini kontrol et.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {gap: 8, padding: 16, borderRadius: 18, backgroundColor: '#EEF2FF'},
  header: {flexDirection: 'row', alignItems: 'center', gap: 8},
  title: {color: '#312E81', fontSize: 15, fontWeight: '900'},
  tip: {color: '#4338CA', fontSize: 12, lineHeight: 18, fontWeight: '700'},
});
