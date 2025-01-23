"use client";

import { Amplify } from "aws-amplify";
import { ThemeProvider, View, useTheme } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { theme } from './theme';
import outputs from "@/amplify_outputs.json";
import './globals.css';
import { AgentProvider } from '@/app/contexts/AgentContext';
import { useEffect } from 'react';

function AppContent({ children }: { children: React.ReactNode }) {
  const { tokens } = useTheme();

  useEffect(() => {
    console.log("Configuring Amplify with outputs:", outputs);
    Amplify.configure(outputs);
  }, []);

  return (
    <View
      backgroundColor={tokens.colors.background.primary}
      minHeight="100vh"
      width="100%"
    >
      {children}
    </View>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <AgentProvider>
            <AppContent>{children}</AppContent>
          </AgentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
