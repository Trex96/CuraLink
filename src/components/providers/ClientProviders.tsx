'use client';

import { SessionProvider } from 'next-auth/react';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/components/providers/SocketProvider';
import { UnreadMessagesProvider } from '@/context/UnreadMessagesContext';

export default function ClientProvidersWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NavigationProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SocketProvider>
              <UnreadMessagesProvider>
                {children}
              </UnreadMessagesProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </NavigationProvider>
    </SessionProvider>
  );
}