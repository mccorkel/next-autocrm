"use client";

import AuthWrapper from "@/app/components/AuthWrapper";
import { Button, Flex } from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthWrapper>
      <Flex direction="column">
        <Flex
          as="nav"
          padding="1rem"
          backgroundColor="white"
          justifyContent="space-between"
          alignItems="center"
        >
          <Button onClick={() => router.push("/")}>Home</Button>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </Flex>
        <main style={{ padding: "1rem" }}>{children}</main>
      </Flex>
    </AuthWrapper>
  );
} 