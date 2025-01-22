"use client";

import { Flex, Button, useTheme } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';

interface NavigationProps {
  userGroups: string[];
}

export default function Navigation({ userGroups }: NavigationProps) {
  const router = useRouter();
  const { tokens } = useTheme();

  return (
    <Flex
      as="nav"
      padding={tokens.space.medium}
      backgroundColor={tokens.colors.background.secondary}
      gap={tokens.space.small}
    >
      <Button
        onClick={() => router.push('/protected/employee/agent-dashboard')}
        variation="link"
      >
        Dashboard
      </Button>
      {(userGroups.includes('ADMIN') || userGroups.includes('SUPER')) && (
        <Button
          onClick={() => router.push('/protected/employee/agent-management')}
          variation="link"
        >
          Agent Management
        </Button>
      )}
      {userGroups.includes('ADMIN') && (
        <Button
          onClick={() => router.push('/protected/employee/user-management')}
          variation="link"
        >
          User Management
        </Button>
      )}
      <Button
        onClick={() => router.push('/protected/customers')}
        variation="link"
      >
        Customers
      </Button>
    </Flex>
  );
} 