"use client";

import AuthWrapper from "@/app/components/AuthWrapper";
import { Button, Flex, View, useTheme, Loader, Text } from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { useEffect, useState, useCallback } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import EmployeeTabs from '@/app/components/EmployeeTabs';
import { Amplify } from 'aws-amplify';
import outputs from "@/amplify_outputs.json";
import { AuthUser } from '@aws-amplify/auth';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

// Configure Amplify
console.log("Configuring Amplify with outputs:", outputs);
Amplify.configure(outputs);

const client = generateClient<Schema>();

// Loading screen component
function LoadingScreen() {
  const { tokens } = useTheme();
  return (
    <View width="100vw" height="100vh">
      <Flex direction="column" alignItems="center" justifyContent="center" height="100%">
        <Loader size="large" />
        <Text variation="primary" marginTop={tokens.space.medium}>
          Initializing application...
        </Text>
      </Flex>
    </View>
  );
}

// Separate component for the protected content
function ProtectedContent({
  user,
  signOut: authSignOut,
  userGroups,
  isLoading,
  children
}: {
  user: AuthUser | undefined;
  signOut: (() => void) | undefined;
  userGroups: string[];
  isLoading: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { tokens } = useTheme();
  const [agentId, setAgentId] = useState<string | null>(null);

  // Fetch agent ID when user email is available
  useEffect(() => {
    async function fetchAgentId() {
      if (user?.signInDetails?.loginId) {
        try {
          const agentsResponse = await client.models.Agent.list({
            filter: {
              email: {
                eq: user.signInDetails.loginId
              }
            }
          });
          
          if (agentsResponse.data && agentsResponse.data.length > 0) {
            setAgentId(agentsResponse.data[0].id);
          }
        } catch (error) {
          console.error('Error fetching agent ID:', error);
        }
      }
    }
    
    fetchAgentId();
  }, [user?.signInDetails?.loginId]);

  const handleSignOut = () => {
    if (authSignOut) {
      authSignOut();
    }
  };

  const handleEmailClick = () => {
    if (agentId) {
      router.push(`/protected/agents/${agentId}`);
    }
  };

  if (isLoading) {
    return (
      <View width="100vw" height="100vh">
        <Flex direction="column" alignItems="center" justifyContent="center" height="100%">
          <Loader size="large" />
          <Text variation="primary" marginTop={tokens.space.medium}>
            Loading...
          </Text>
        </Flex>
      </View>
    );
  }

  return (
    <View 
      width="100vw"
      height="100vh"
      backgroundColor={tokens.colors.background.primary}
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {user && userGroups.length > 0 && (
        <View
          width="100%"
          backgroundColor={tokens.colors.background.secondary}
          style={{ 
            borderBottom: `1px solid ${tokens.colors.border.primary}`,
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          {/* Top Row - Navigation Buttons */}
          <Flex 
            width="100%" 
            padding={`${tokens.space.small} ${tokens.space.medium}`}
            justifyContent="space-between"
            alignItems="center"
            maxWidth="1400px"
            margin="0 auto"
            style={{
              borderBottom: `1px solid ${tokens.colors.border.secondary}`
            }}
          >
            <View
              as="a"
              onClick={() => router.push("/")}
              style={{
                cursor: 'pointer',
                height: '48px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <img 
                src="/assets/logo.png" 
                alt="AutoCRM Logo" 
                style={{
                  height: '100%',
                  width: 'auto'
                }}
              />
            </View>
            <Flex gap={tokens.space.medium} alignItems="center">
              <Button
                onClick={handleEmailClick}
                variation="link"
                size="small"
                isDisabled={!agentId}
              >
                {user?.signInDetails?.loginId}
              </Button>
              <Button onClick={handleSignOut} variation="primary">
                Sign Out
              </Button>
            </Flex>
          </Flex>

          {/* Bottom Row - Tabs */}
          <Flex 
            width="100%" 
            padding={tokens.space.medium}
            maxWidth="1400px"
            margin="0 auto"
          >
            <EmployeeTabs userGroups={userGroups} />
          </Flex>
        </View>
      )}
      <View 
        flex="1"
        width="100%"
        style={{
          overflowY: 'auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <View
          width="100%"
          maxWidth="1400px"
          margin="0 auto"
          padding={tokens.space.medium}
          flex="1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

// Component to handle auth state and session checking
function AuthContent({
  user,
  signOut,
  children
}: {
  user: AuthUser | undefined;
  signOut: (() => void) | undefined;
  children: React.ReactNode;
}) {
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!user) {
        setUserGroups([]);
        setIsLoading(false);
        return;
      }

      const session = await fetchAuthSession();
      if (!session.tokens?.accessToken) {
        setIsLoading(false);
        return;
      }
      
      const groups = (session.tokens.accessToken.payload['cognito:groups'] as string[]) || [];
      setUserGroups(groups);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking session:', error);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <ProtectedContent
      user={user}
      signOut={signOut}
      userGroups={userGroups}
      isLoading={isLoading}
      children={children}
    />
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Amplify
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized) {
    return (
      <AuthWrapper>
        {() => <LoadingScreen />}
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      {({ user, signOut: authSignOut }) => (
        <AuthContent
          user={user}
          signOut={authSignOut}
          children={children}
        />
      )}
    </AuthWrapper>
  );
} 