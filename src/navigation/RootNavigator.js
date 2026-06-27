import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';
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
import { MarketHomeScreen } from '../screens/market/MarketHomeScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

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
  return (
    <EventsStack.Navigator>
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
    </EventsStack.Navigator>
  );
}

function CommunitiesNavigator() {
  return (
    <CommunitiesStack.Navigator>
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
    </CommunitiesStack.Navigator>
  );
}

function MarketNavigator() {
  return (
    <MarketStack.Navigator>
      <MarketStack.Screen
        name={ROUTES.MARKET_HOME}
        component={MarketHomeScreen}
        options={{ title: 'Market' }}
      />
      <MarketStack.Screen
        name={ROUTES.CREATE_LISTING}
        component={CreateListingScreen}
      />
    </MarketStack.Navigator>
  );
}

function ChatNavigator() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen
        name={ROUTES.CHAT_LIST}
        component={ChatListScreen}
        options={{ title: 'Mesajlar' }}
      />
    </ChatStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator>
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
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="EventsTab"
        component={EventsNavigator}
        options={{ title: 'Discover' }}
      />
      <Tab.Screen
        name="CommunitiesTab"
        component={CommunitiesNavigator}
        options={{ title: 'Topluluk' }}
      />
      <Tab.Screen
        name="MarketTab"
        component={MarketNavigator}
        options={{ title: 'Market' }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatNavigator}
        options={{ title: 'Mesajlar' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
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
});
