import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./app.css";
import AuthWrapper from "./components/AuthWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoCRM",
  description: "Customer Relationship Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  );
}
