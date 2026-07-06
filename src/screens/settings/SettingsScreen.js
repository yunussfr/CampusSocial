import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  Screen,
  SectionHeader,
} from '../../components/ui/DesignSystem';
import { ICONS } from '../../constants/assets';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function SettingsScreen() {
  const { enableNotifications, logout, updateFcmToken } = useAuth();
  const { mode, theme, toggleTheme } = useTheme();
  const [message, setMessage] = useState(null);

  async function handleEnableNotifications() {
    await enableNotifications();
    setMessage('Bildirim tokeni profile kaydedildi.');
  }

  async function handleDisableNotifications() {
    await updateFcmToken(null);
    setMessage('Bildirim tokeni temizlendi.');
  }

  return (
    <Screen scroll style={styles.container}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Ayarlar</Text>
        <Text style={[styles.pageSubtitle, { color: theme.colors.mutedText }]}>
          Gorunum, bildirim ve hesap tercihleri.
        </Text>
      </View>

      {message ? (
        <View style={[styles.messageBanner, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
          <Text style={{ color: '#15803D', fontSize: 14, fontWeight: '600' }}>✓ {message}</Text>
        </View>
      ) : null}

      <SectionHeader title="Gorunum" />
      <Card style={styles.card}>
        <SettingRow
          iconEmoji="🎨"
          iconColor="#8B5CF6"
          label="Tema"
          description={mode === 'dark' ? 'Koyu mod aktif' : 'Acik mod aktif'}
          onPress={toggleTheme}
          value={mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
        />
      </Card>

      <SectionHeader title="Bildirimler" />
      <Card style={styles.card}>
        <SettingRow
          iconEmoji="🔔"
          iconColor="#F59E0B"
          label="FCM Bildirimleri"
          description="Push bildirimleri etkinlestir"
          onPress={handleEnableNotifications}
          value="Ac"
          valueColor="#16A34A"
        />
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <SettingRow
          iconEmoji="🔕"
          iconColor="#64748B"
          label="Bildirim Tokeni"
          description="Bildirimleri devre disi birak"
          onPress={handleDisableNotifications}
          value="Kapat"
          valueColor="#DC2626"
        />
      </Card>

      <SectionHeader title="Hesap" />
      <Pressable onPress={logout} style={styles.logoutButton}>
        <Image source={ICONS.logout} style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Cikis Yap</Text>
      </Pressable>
    </Screen>
  );
}

function SettingRow({ iconEmoji, iconColor, label, description, value, onPress, valueColor }) {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: iconColor + '22' }]}>
        <Text style={styles.iconEmoji}>{iconEmoji}</Text>
      </View>
      <View style={styles.rowLabelWrap}>
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
        {description ? (
          <Text style={[styles.rowDesc, { color: theme.colors.subtleText }]}>{description}</Text>
        ) : null}
      </View>
      <View style={[styles.toggle, { backgroundColor: (valueColor || theme.colors.primary) + '18' }]}>
        <Text style={[styles.toggleText, { color: valueColor || theme.colors.primary }]}>{value}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  pageHeader: {
    gap: 4,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  messageBanner: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  card: {
    paddingHorizontal: 16,
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: 20,
  },
  rowLabelWrap: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowDesc: {
    fontSize: 12,
    fontWeight: '500',
  },
  toggle: {
    minWidth: 74,
    minHeight: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginLeft: 54,
  },
  logoutButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoutIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
