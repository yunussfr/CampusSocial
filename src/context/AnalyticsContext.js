import React, {createContext, useCallback, useContext, useMemo} from 'react';
import {
  logAnalyticsEvent,
  logScreenView,
} from '../services/analyticsService';

const AnalyticsContext = createContext(null);

export function AnalyticsProvider({children}) {
  const logEvent = useCallback((name, params) => {
    return logAnalyticsEvent(name, params);
  }, []);

  const logScreen = useCallback(screenName => {
    return logScreenView(screenName);
  }, []);

  const value = useMemo(
    () => ({
      logEvent,
      logScreen,
    }),
    [logEvent, logScreen],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics must be used inside AnalyticsProvider');
  }

  return context;
}
