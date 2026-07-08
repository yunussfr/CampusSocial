import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  mdiBellOutline,
  mdiBookmarkMultipleOutline,
  mdiDeleteOutline,
  mdiLogout,
  mdiThemeLightDark,
} from '@mdi/js';
import {
  Card,
  Screen,
  SectionHeader,
} from '../../components/ui/DesignSystem';
import { MdiIcon } from '../../components/ui/MdiIcon';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function SettingsScreen({ navigation }) {
  const {
    deleteAccount,
    enableNotifications,
    logout,
    profile,
    updateFcmToken,
  } = useAuth();
  const { mode, theme, toggleTheme } = useTheme();
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const [busyAction, setBusyAction] = useState(null);
  const notificationsEnabled = Boolean(profile?.fcmToken);

  function showMessage(nextMessage, type = 'success') {
    setMessage(nextMessage);
    setMessageType(type);
  }

  async function handleToggleNotifications() {
    setBusyAction('notifications');

    try {
      if (notificationsEnabled) {
        await updateFcmToken(null);
        showMessage('Bildirimler kapatildi.');
        return;
      }

      await enableNotifications();
      showMessage('Bildirimler acildi.');
    } catch (notificationError) {
      showMessage(
        notificationError.message || 'Bildirim ayari guncellenemedi.',
        'error',
      );
    } finally {
      setBusyAction(null);
    }
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Hesabi sil',
      'Hesabin silinecek ve oturumun kapanacak. Bu islem icin yakin zamanda giris yapmis olman gerekebilir.',
      [
        {
          text: 'Vazgec',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ],
    );
  }

  async function confirmDeleteAccount() {
    setBusyAction('deleteAccount');

    try {
      await deleteAccount();
    } catch (deleteError) {
      showMessage(deleteError.message || 'Hesap silinemedi.', 'error');
      setBusyAction(null);
    }
  }

  return (
    <Screen scroll style={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>
          Ayarlar
        </Text>
        <Text style={[styles.pageSubtitle, { color: theme.colors.mutedText }]}>
          Gorunum, bildirim ve hesap tercihleri.
        </Text>
      </View>

      {message ? (
        <View
          style={[
            styles.messageBanner,
            messageType === 'error' ? styles.errorBanner : styles.successBanner,
          ]}>
          <Text
            style={[
              styles.messageText,
              messageType === 'error' ? styles.errorText : styles.successText,
            ]}>
            {message}
          </Text>
        </View>
      ) : null}

      <SectionHeader title="Gorunum" />
      <Card style={styles.card}>
        <SettingRow
          icon={mdiThemeLightDark}
          iconColor="#8B5CF6"
          label="Tema"
          description={mode === 'dark' ? 'Koyu mod aktif' : 'Acik mod aktif'}
          onPress={toggleTheme}
          value={mode === 'dark' ? 'Dark' : 'Light'}
        />
      </Card>

      <SectionHeader title="Bildirimler" />
      <Card style={styles.card}>
        <SettingRow
          icon={mdiBellOutline}
          iconColor="#F59E0B"
          label="Push Bildirimleri"
          description={
            notificationsEnabled
              ? 'Bu cihaz bildirim alabilir'
              : 'Bu cihaz icin bildirimler kapali'
          }
          disabled={busyAction === 'notifications'}
          onPress={handleToggleNotifications}
          value={
            busyAction === 'notifications'
              ? '...'
              : notificationsEnabled
                ? 'Acik'
                : 'Kapali'
          }
          valueColor={notificationsEnabled ? '#16A34A' : '#64748B'}
        />
      </Card>

      <SectionHeader title="Hesap" />
      <Card style={styles.card}>
        <SettingRow
          icon={mdiBookmarkMultipleOutline}
          iconColor="#16A34A"
          label="Kaydedilenler"
          description="Kaydettigin urun ve postlari gor"
          onPress={() => navigation.navigate(ROUTES.SAVED_ITEMS)}
          value="Ac"
          valueColor="#16A34A"
        />
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <SettingRow
          icon={mdiLogout}
          iconColor="#2563EB"
          label="Cikis Yap"
          description="Bu cihazdaki oturumu kapat"
          onPress={logout}
          value="Cik"
          valueColor="#2563EB"
        />
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <SettingRow
          icon={mdiDeleteOutline}
          iconColor="#DC2626"
          label="Hesabi Sil"
          description="Hesabini kalici olarak kapat"
          disabled={busyAction === 'deleteAccount'}
          onPress={handleDeleteAccount}
          value={busyAction === 'deleteAccount' ? '...' : 'Sil'}
          valueColor="#DC2626"
        />
      </Card>
    </Screen>
  );
}

function SettingRow({
  disabled,
  icon,
  iconColor,
  label,
  description,
  value,
  onPress,
  valueColor,
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.row, disabled && styles.disabledRow]}>
      <View style={[styles.iconBox, { backgroundColor: iconColor + '22' }]}>
        <MdiIcon path={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.rowLabelWrap}>
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
        {description ? (
          <Text style={[styles.rowDesc, { color: theme.colors.subtleText }]}>
            {description}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          styles.toggle,
          { backgroundColor: (valueColor || theme.colors.primary) + '18' },
        ]}>
        <Text style={[styles.toggleText, { color: valueColor || theme.colors.primary }]}>
          {value}
        </Text>
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
  successBanner: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  messageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  successText: {
    color: '#15803D',
  },
  errorText: {
    color: '#B91C1C',
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
  disabledRow: {
    opacity: 0.6,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
});
