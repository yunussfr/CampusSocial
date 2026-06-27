import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { darkTheme, lightTheme } from '../constants/theme';

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = 'campusconnect.theme.mode';

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(storedMode => {
      if (storedMode === 'light' || storedMode === 'dark') {
        setMode(storedMode);
      }
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(current => {
      const nextMode = current === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
      return nextMode;
    });
  }, []);

  const value = useMemo(
    () => ({
      mode,
      theme,
      toggleTheme,
    }),
    [mode, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
