"use client";

import React, { ReactNode, useEffect } from 'react';
import { ThemeProvider, View, useTheme } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from "aws-amplify";
import { theme } from '../theme';
import { AgentProvider } from './AgentContext';
import outputs from "@/amplify_outputs.json";

function AppContent({ children }: { children: ReactNode }) {
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

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <AgentProvider>
        <AppContent>{children}</AppContent>
      </AgentProvider>
    </ThemeProvider>
  );
} 