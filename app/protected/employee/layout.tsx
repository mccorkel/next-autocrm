"use client";

import React from 'react';
import Navigation from '@/app/components/Navigation';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Flex, View } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthenticator((context) => [context.user]);
  const [userGroups, setUserGroups] = useState<string[]>([]);
  
  useEffect(() => {
    async function checkSession() {
      if (user) {
        const session = await fetchAuthSession();
        const groups = (session.tokens?.accessToken?.payload['cognito:groups'] as string[]) || [];
        console.log('User authenticated:', {
          email: user.username,
          groups: groups
        });
        setUserGroups(groups);
      }
    }
    checkSession();
  }, [user]);

  console.log('Current user groups:', userGroups);
  
  return (
    <Flex direction="column" flex="1">
      <Navigation userGroups={userGroups} />
      <View 
        as="main" 
        className="flex-1 p-4"
        backgroundColor="background.primary"
      >
        {children}
      </View>
    </Flex>
  );
} 