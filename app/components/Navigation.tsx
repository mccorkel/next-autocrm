"use client";

import { Flex, Button } from '@aws-amplify/ui-react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navigation({ userGroups }: { userGroups: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const isAdmin = userGroups.includes('ADMIN');
  const isSuper = userGroups.includes('SUPER');

  return (
    <Flex direction="row" gap="1rem" padding="1rem" backgroundColor="white">
      <Button
        variation={pathname === '/employee/agent-dashboard' ? 'primary' : 'link'}
        onClick={() => router.push('/employee/agent-dashboard')}
      >
        Ticket Dashboard
      </Button>
      
      {(isAdmin || isSuper) && (
        <>
          <Button
            variation={pathname === '/employee/agent-management' ? 'primary' : 'link'}
            onClick={() => router.push('/employee/agent-management')}
          >
            Agent Management
          </Button>
          <Button
            variation={pathname === '/employee/user-management' ? 'primary' : 'link'}
            onClick={() => router.push('/employee/user-management')}
          >
            User Management
          </Button>
        </>
      )}
    </Flex>
  );
} 