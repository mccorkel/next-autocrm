"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import "./app.css";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import { Providers } from "@/app/contexts/Providers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <Providers>
            {children}
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
