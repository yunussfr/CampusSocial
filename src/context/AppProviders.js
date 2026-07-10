import React from 'react';
import { AnalyticsProvider } from './AnalyticsContext';
import { AuthProvider } from './AuthContext';
import { ChatProvider } from './ChatContext';
import { CommunityProvider } from './CommunityContext';
import { EventProvider } from './EventContext';
import { MarketProvider } from './MarketContext';
import { SavedProvider } from './SavedContext';
import { ThemeProvider } from './ThemeContext';

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnalyticsProvider>
          <EventProvider>
            <CommunityProvider>
              <MarketProvider>
                <SavedProvider>
                  <ChatProvider>{children}</ChatProvider>
                </SavedProvider>
              </MarketProvider>
            </CommunityProvider>
          </EventProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
