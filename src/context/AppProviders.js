import React from 'react';
import { AuthProvider } from './AuthContext';
import { ChatProvider } from './ChatContext';
import { CommunityProvider } from './CommunityContext';
import { EventProvider } from './EventContext';
import { MarketProvider } from './MarketContext';
import { ThemeProvider } from './ThemeContext';

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EventProvider>
          <CommunityProvider>
            <MarketProvider>
              <ChatProvider>{children}</ChatProvider>
            </MarketProvider>
          </CommunityProvider>
        </EventProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
