import React, { useState, useEffect } from 'react';
import { Tabs, useTheme, Flex, Button } from '@aws-amplify/ui-react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './EmployeeTabs.module.css';

interface EmployeeTabsProps {
  userGroups: string[];
}

interface TabConfig {
  label: string;
  value: string;
  access: string[];
  isDynamic?: boolean;
  onClose?: () => void;
}

export default function EmployeeTabs({ userGroups }: EmployeeTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { tokens } = useTheme();
  const [dynamicTabs, setDynamicTabs] = useState<TabConfig[]>([]);

  // Define static tab routes and their access permissions
  const staticTabs: TabConfig[] = [
    {
      label: 'Dashboard',
      value: '/protected/employee/agent-dashboard',
      access: ['ADMIN', 'SUPER', 'AGENT'],
    },
    {
      label: 'Agent Management',
      value: '/protected/employee/agent-management',
      access: ['ADMIN', 'SUPER'],
    },
    {
      label: 'User Management',
      value: '/protected/employee/user-management',
      access: ['ADMIN'],
    },
    {
      label: 'Customers',
      value: '/protected/customers',
      access: ['ADMIN', 'SUPER', 'AGENT'],
    },
  ];

  // Check if current path is a ticket detail page
  useEffect(() => {
    const ticketMatch = pathname.match(/^\/protected\/tickets\/(.+)$/);
    if (ticketMatch) {
      const ticketId = ticketMatch[1];
      const existingTab = dynamicTabs.find(tab => tab.value.includes(`/protected/tickets/${ticketId}`));
      
      if (existingTab) {
        // If tab already exists, navigate to it
        router.push(existingTab.value);
      } else {
        // Create new tab only if it doesn't exist
        const newTab: TabConfig = {
          label: `Ticket #${ticketId}`,
          value: pathname,
          access: ['ADMIN', 'SUPER', 'AGENT'],
          isDynamic: true,
          onClose: () => {
            setDynamicTabs(prev => prev.filter(t => t.value === pathname ? false : true));
            router.push('/protected/employee/agent-dashboard');
          }
        };
        setDynamicTabs(prev => [...prev, newTab]);
      }
    }
  }, [pathname, dynamicTabs]);

  // Function to handle tab navigation
  const handleTabClick = (tabValue: string) => {
    // If it's a ticket detail tab, check if it already exists
    const ticketMatch = tabValue.match(/^\/protected\/tickets\/(.+)$/);
    if (ticketMatch) {
      const ticketId = ticketMatch[1];
      const existingTab = dynamicTabs.find(tab => tab.value.includes(`/protected/tickets/${ticketId}`));
      
      if (existingTab) {
        router.push(existingTab.value);
        return;
      }
    }
    router.push(tabValue);
  };

  // Function to handle closing a tab
  const handleCloseTab = (tab: TabConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    setDynamicTabs(prev => prev.filter(t => t.value !== tab.value));
    router.push('/protected/employee/agent-dashboard');
  };

  // Combine static and dynamic tabs
  const allTabs = [
    ...staticTabs.filter(tab => tab.access.some(role => userGroups.includes(role))),
    ...dynamicTabs
  ];

  return (
    <Flex gap={tokens.space.medium}>
      {allTabs.map((tab) => (
        <Button
          key={tab.value}
          onClick={() => handleTabClick(tab.value)}
          variation={pathname === tab.value ? "primary" : "link"}
        >
          <Flex alignItems="center" gap={tokens.space.xs}>
            {tab.label}
            {tab.isDynamic && (
              <Button
                size="small"
                variation="link"
                onClick={(e) => handleCloseTab(tab, e)}
              >
                ✕
              </Button>
            )}
          </Flex>
        </Button>
      ))}
    </Flex>
  );
} 