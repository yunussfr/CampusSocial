import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AppButton,
  Card,
  PageIntro,
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
      <PageIntro title="Ayarlar" subtitle="Gorunum, bildirim ve hesap tercihleri." />
      {message ? <Text style={[styles.message, { color: theme.colors.success }]}>{message}</Text> : null}

      <SectionHeader title="Gorunum" />
      <Card style={styles.card}>
        <SettingRow
          icon={ICONS.calendar}
          label="Tema"
          onPress={toggleTheme}
          value={mode === 'dark' ? 'Dark' : 'Light'}
        />
      </Card>

      <SectionHeader title="Bildirimler" />
      <Card style={styles.card}>
        <SettingRow
          icon={ICONS.bell}
          label="FCM bildirimleri"
          onPress={handleEnableNotifications}
          value="Ac"
        />
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <SettingRow
          icon={ICONS.location}
          label="Bildirim tokeni"
          onPress={handleDisableNotifications}
          value="Kapat"
        />
      </Card>

      <SectionHeader title="Hesap" />
      <AppButton onPress={logout} style={styles.logoutButton} variant="danger">
        <Image source={ICONS.logout} style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Cikis Yap</Text>
      </AppButton>
    </Screen>
  );
}

function SettingRow({ icon, label, value, onPress }) {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowLabelWrap}>
        {icon ? (
          <Image
            source={icon}
            style={[styles.rowIcon, { tintColor: theme.colors.primary }]}
          />
        ) : null}
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
      </View>
      <View style={[styles.toggle, { backgroundColor: theme.colors.primarySoft }]}>
        <Text style={[styles.toggleText, { color: theme.colors.primary }]}>{value}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    paddingHorizontal: 16,
  },
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabelWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 12,
  },
  rowIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  rowLabel: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
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
    lineHeight: 18,
    fontWeight: '800',
  },
  divider: {
    height: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    gap: 8,
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
    lineHeight: 24,
    fontWeight: '800',
  },
});
