"use client";

import { Amplify } from "aws-amplify";
import { ThemeProvider, View, useTheme } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { theme } from './theme';
import outputs from "@/amplify_outputs.json";
import './globals.css';

Amplify.configure(outputs);

function AppContent({ children }: { children: React.ReactNode }) {
  const { tokens } = useTheme();
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
          <AppContent>{children}</AppContent>
        </ThemeProvider>
      </body>
    </html>
  );
}
