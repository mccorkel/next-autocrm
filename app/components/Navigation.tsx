"use client";

import { Flex, Button } from '@aws-amplify/ui-react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navigation({ userGroups }: { userGroups: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const isAdmin = userGroups.includes('ADMIN');
  const isSuper = userGroups.includes('SUPER');

  return (
    <Flex 
      direction="row" 
      gap="1rem" 
      padding="1rem" 
      backgroundColor="white"
      style={{
        borderBottom: '1px solid black',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <Button
        variation={pathname === '/protected/employee/agent-dashboard' ? 'primary' : 'link'}
        onClick={() => router.push('/protected/employee/agent-dashboard')}
      >
        Ticket Dashboard
      </Button>
      
      {(isAdmin || isSuper) && (
        <>
          <Button
            variation={pathname === '/protected/employee/agent-management' ? 'primary' : 'link'}
            onClick={() => router.push('/protected/employee/agent-management')}
          >
            Agent Management
          </Button>
          <Button
            variation={pathname === '/protected/employee/user-management' ? 'primary' : 'link'}
            onClick={() => router.push('/protected/employee/user-management')}
          >
            User Management
          </Button>
        </>
      )}
    </Flex>
  );
} 