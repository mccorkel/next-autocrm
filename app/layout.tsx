"use client";

import { Amplify } from "aws-amplify";
import { ThemeProvider, View } from '@aws-amplify/ui-react';
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import "./globals.css";
import { theme } from './theme';

Amplify.configure(outputs);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <View
            width="100%"
            height="100vh"
            backgroundColor="#F0F8FF"
          >
            {children}
          </View>
        </ThemeProvider>
      </body>
    </html>
  );
}
