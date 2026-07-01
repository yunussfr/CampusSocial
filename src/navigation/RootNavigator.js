import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ChatListScreen } from '../screens/chat/ChatListScreen';
import { CommunityDetailScreen } from '../screens/communities/CommunityDetailScreen';
import { CommunityListScreen } from '../screens/communities/CommunityListScreen';
import { CreateCommunityScreen } from '../screens/communities/CreateCommunityScreen';
import { PostDetailScreen } from '../screens/communities/PostDetailScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ProfileCompletionScreen } from '../screens/auth/ProfileCompletionScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { CreateEventScreen } from '../screens/events/CreateEventScreen';
import { DiscoverScreen } from '../screens/events/DiscoverScreen';
import { EventDetailScreen } from '../screens/events/EventDetailScreen';
import { CreateListingScreen } from '../screens/market/CreateListingScreen';
import { ListingDetailScreen } from '../screens/market/ListingDetailScreen';
import { MarketHomeScreen } from '../screens/market/MarketHomeScreen';
import { MyListingsScreen } from '../screens/market/MyListingsScreen';
import { ChatDetailScreen } from '../screens/chat/ChatDetailScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { UserProfileScreen } from '../screens/profile/UserProfileScreen';
import { NotificationsScreen } from '../screens/settings/NotificationsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { ICONS } from '../constants/assets';
import { IconButton } from '../components/ui/IconButton';

const AuthStack = createNativeStackNavigator();
const EventsStack = createNativeStackNavigator();
const CommunitiesStack = createNativeStackNavigator();
const MarketStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export function RootNavigator() {
  const { initializing, isProfileComplete, profileLoading, user } = useAuth();

  if (initializing || profileLoading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Oturum kontrol ediliyor...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthNavigator />;
  }

  if (!isProfileComplete) {
    return <ProfileCompletionScreen />;
  }

  return <MainTabs />;
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <AuthStack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
      <AuthStack.Screen
        name={ROUTES.FORGOT_PASSWORD}
        component={ForgotPasswordScreen}
      />
    </AuthStack.Navigator>
  );
}

function EventsNavigator() {
  const screenOptions = useStackOptions();

  return (
    <EventsStack.Navigator screenOptions={screenOptions}>
      <EventsStack.Screen
        name={ROUTES.DISCOVER}
        component={DiscoverScreen}
        options={{ headerShown: false }}
      />
      <EventsStack.Screen
        name={ROUTES.EVENT_DETAIL}
        component={EventDetailScreen}
        options={{ title: 'Etkinlik Detayi' }}
      />
      <EventsStack.Screen
        name={ROUTES.CREATE_EVENT}
        component={CreateEventScreen}
        options={{ title: 'Etkinlik Olustur' }}
      />
      <EventsStack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{ title: 'Bildirimler' }}
      />
    </EventsStack.Navigator>
  );
}

function CommunitiesNavigator() {
  const screenOptions = useStackOptions();

  return (
    <CommunitiesStack.Navigator screenOptions={screenOptions}>
      <CommunitiesStack.Screen
        name={ROUTES.COMMUNITY_LIST}
        component={CommunityListScreen}
        options={{ title: 'Topluluklar' }}
      />
      <CommunitiesStack.Screen
        name={ROUTES.COMMUNITY_DETAIL}
        component={CommunityDetailScreen}
      />
      <CommunitiesStack.Screen
        name={ROUTES.CREATE_COMMUNITY}
        component={CreateCommunityScreen}
      />
      <CommunitiesStack.Screen
        name={ROUTES.POST_DETAIL}
        component={PostDetailScreen}
      />
      <CommunitiesStack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{ title: 'Bildirimler' }}
      />
    </CommunitiesStack.Navigator>
  );
}

function MarketNavigator() {
  const screenOptions = useStackOptions();

  return (
    <MarketStack.Navigator screenOptions={screenOptions}>
      <MarketStack.Screen
        name={ROUTES.MARKET_HOME}
        component={MarketHomeScreen}
        options={{ title: 'Market' }}
      />
      <MarketStack.Screen
        name={ROUTES.CREATE_LISTING}
        component={CreateListingScreen}
        options={{ title: 'Ilan Olustur' }}
      />
      <MarketStack.Screen
        name={ROUTES.LISTING_DETAIL}
        component={ListingDetailScreen}
        options={{ title: 'Ilan Detayi' }}
      />
      <MarketStack.Screen
        name={ROUTES.MY_LISTINGS}
        component={MyListingsScreen}
        options={{ title: 'Ilanlarim' }}
      />
      <MarketStack.Screen
        name={ROUTES.CHAT_DETAIL}
        component={ChatDetailScreen}
        options={{ title: 'Chat' }}
      />
      <MarketStack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{ title: 'Bildirimler' }}
      />
    </MarketStack.Navigator>
  );
}

function ChatNavigator() {
  const screenOptions = useStackOptions();

  return (
    <ChatStack.Navigator screenOptions={screenOptions}>
      <ChatStack.Screen
        name={ROUTES.CHAT_LIST}
        component={ChatListScreen}
        options={{ title: 'Mesajlar' }}
      />
      <ChatStack.Screen
        name={ROUTES.CHAT_DETAIL}
        component={ChatDetailScreen}
        options={{ title: 'Chat' }}
      />
      <ChatStack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{ title: 'Bildirimler' }}
      />
    </ChatStack.Navigator>
  );
}

function ProfileNavigator() {
  const screenOptions = useStackOptions();

  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
      <ProfileStack.Screen
        name={ROUTES.SETTINGS}
        component={SettingsScreen}
        options={{ title: 'Ayarlar' }}
      />
      <ProfileStack.Screen
        name={ROUTES.EDIT_PROFILE}
        component={EditProfileScreen}
        options={{ title: 'Profili Duzenle' }}
      />
      <ProfileStack.Screen
        name={ROUTES.USER_PROFILE}
        component={UserProfileScreen}
        options={{ title: 'Kullanici Profili' }}
      />
      <ProfileStack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{ title: 'Bildirimler' }}
      />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedText,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor:
              theme.mode === 'dark'
                ? 'rgba(15,27,45,0.94)'
                : 'rgba(248,249,255,0.94)',
            borderTopColor: theme.colors.border,
          },
        ],
      }}>
      <Tab.Screen
        name="EventsTab"
        component={EventsNavigator}
        options={{
          title: 'Discover',
          tabBarIcon: DiscoverTabIcon,
        }}
      />
      <Tab.Screen
        name="CommunitiesTab"
        component={CommunitiesNavigator}
        options={{
          title: 'Community',
          tabBarIcon: CommunityTabIcon,
        }}
      />
      <Tab.Screen
        name="MarketTab"
        component={MarketNavigator}
        options={{
          title: 'Market',
          tabBarIcon: MarketTabIcon,
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatNavigator}
        options={{
          title: 'Messages',
          tabBarIcon: MessagesTabIcon,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          title: 'Profile',
          tabBarIcon: ProfileTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}

function useStackOptions() {
  const { theme } = useTheme();

  return ({ navigation, route }) => ({
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerShadowVisible: false,
    headerTintColor: theme.colors.text,
    headerTitleStyle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: '800',
    },
    contentStyle: {
      backgroundColor: theme.colors.background,
    },
    headerRight:
      route.name === ROUTES.NOTIFICATIONS
        ? undefined
        : () => (
            <IconButton
              accessibilityLabel="Bildirimler"
              icon={ICONS.bell}
              onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
              size={22}
              style={styles.headerBell}
              tintColor={theme.colors.primary}
            />
          ),
  });
}

function DiscoverTabIcon(props) {
  return <TabAssetIcon {...props} icon={ICONS.tabDiscover} />;
}

function CommunityTabIcon(props) {
  return <TabAssetIcon {...props} icon={ICONS.tabCommunity} />;
}

function MarketTabIcon(props) {
  return <TabAssetIcon {...props} icon={ICONS.tabMarket} />;
}

function MessagesTabIcon(props) {
  return <TabAssetIcon {...props} icon={ICONS.tabMessages} />;
}

function ProfileTabIcon(props) {
  return <TabAssetIcon {...props} icon={ICONS.tabProfile} />;
}

function TabAssetIcon({ color, focused, icon }) {
  return (
    <Image
      source={icon}
      style={[
        styles.tabIcon,
        focused ? styles.tabIconFocused : styles.tabIconDimmed,
        { tintColor: color },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 15,
  },
  tabBar: {
    height: 64,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: 'absolute',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 20,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  headerBell: {
    marginRight: 4,
  },
  tabIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabIconDimmed: {
    opacity: 0.58,
  },
});
