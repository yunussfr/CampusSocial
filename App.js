import {useRef} from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from './src/context/AppProviders';
import { RootNavigator } from './src/navigation/RootNavigator';
import {logScreenView} from './src/services/analyticsService';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const navigationRef = useRef(null);
  const routeNameRef = useRef(null);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppProviders>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
            logScreenView(routeNameRef.current);
          }}
          onStateChange={() => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName =
              navigationRef.current?.getCurrentRoute()?.name;

            if (currentRouteName && previousRouteName !== currentRouteName) {
              routeNameRef.current = currentRouteName;
              logScreenView(currentRouteName);
            }
          }}>
          <AppContent />
        </NavigationContainer>
      </AppProviders>
    </SafeAreaProvider>
  );
}

function AppContent() {
  return (
    <View style={styles.container}>
      <RootNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
