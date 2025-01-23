import React, { useState, useEffect } from 'react';
import { Tabs, useTheme, Flex, Button, Text, View } from '@aws-amplify/ui-react';
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

const STORAGE_KEY = 'autocrm_open_ticket_tabs';

export default function EmployeeTabs({ userGroups }: EmployeeTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { tokens } = useTheme();
  const [dynamicTabs, setDynamicTabs] = useState<TabConfig[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved tabs and handle initial route
  useEffect(() => {
    const savedTabs = localStorage.getItem(STORAGE_KEY);
    let initialTabs: TabConfig[] = [];
    
    if (savedTabs) {
      try {
        initialTabs = JSON.parse(savedTabs) as TabConfig[];
        setDynamicTabs(initialTabs);
      } catch (error) {
        console.error('Error loading saved tabs:', error);
      }
    }

    // Handle initial route if it's a ticket page
    const ticketMatch = pathname.match(/^\/protected\/tickets\/(.+)$/);
    if (ticketMatch) {
      const ticketId = ticketMatch[1];
      const existingTab = initialTabs.find(tab => {
        const tabTicketMatch = tab.value.match(/^\/protected\/tickets\/(.+)$/);
        return tabTicketMatch && tabTicketMatch[1] === ticketId;
      });

      if (!existingTab) {
        const newTab: TabConfig = {
          label: `Ticket #${ticketId}`,
          value: pathname,
          access: ['ADMIN', 'SUPER', 'AGENT'],
          isDynamic: true,
          onClose: () => {
            setDynamicTabs(prev => prev.filter(t => t.value !== pathname));
            router.push('/protected/employee/agent-dashboard');
          }
        };
        setDynamicTabs([...initialTabs, newTab]);
      }
    }
    
    setIsInitialized(true);
  }, []); // Run only once on mount

  // Save tabs whenever they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamicTabs));
    }
  }, [dynamicTabs, isInitialized]);

  // Handle route changes after initial load
  useEffect(() => {
    if (!isInitialized) return;

    const ticketMatch = pathname.match(/^\/protected\/tickets\/(.+)$/);
    if (ticketMatch) {
      const ticketId = ticketMatch[1];
      const existingTab = dynamicTabs.find(tab => {
        const tabTicketMatch = tab.value.match(/^\/protected\/tickets\/(.+)$/);
        return tabTicketMatch && tabTicketMatch[1] === ticketId;
      });

      if (!existingTab) {
        const newTab: TabConfig = {
          label: `Ticket #${ticketId}`,
          value: pathname,
          access: ['ADMIN', 'SUPER', 'AGENT'],
          isDynamic: true,
          onClose: () => {
            setDynamicTabs(prev => prev.filter(t => t.value !== pathname));
            router.push('/protected/employee/agent-dashboard');
          }
        };
        setDynamicTabs(prev => [...prev, newTab]);
      }
    }
  }, [pathname, isInitialized]);

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

  // Function to handle tab navigation
  const handleTabClick = (tabValue: string) => {
    router.push(tabValue);
  };

  // Function to handle closing a tab
  const handleCloseTab = (tab: TabConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    setDynamicTabs(prev => prev.filter(t => t.value !== tab.value));
    
    // Only navigate if we're closing the current tab
    if (pathname === tab.value) {
      router.push('/protected/employee/agent-dashboard');
    }
  };

  // Combine static and dynamic tabs
  const allTabs = [
    ...staticTabs.filter(tab => tab.access.some(role => userGroups.includes(role))),
    ...dynamicTabs
  ];

  return (
    <Flex 
      gap={tokens.space.medium} 
      width="100%"
    >
      {allTabs.map((tab) => (
        <Flex 
          key={tab.value} 
          alignItems="center"
          style={{
            maxWidth: 'calc(15vw - 16px)',
            minWidth: '120px',
            position: 'relative'
          }}
        >
          <Button
            onClick={() => handleTabClick(tab.value)}
            variation={pathname === tab.value ? "primary" : "link"}
            style={{
              maxWidth: '100%',
              minHeight: '48px',
              whiteSpace: 'normal',
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              lineHeight: '1.2',
              padding: '8px 32px 8px 12px',
              flex: 1
            }}
          >
            <Text
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}
            >
              {tab.label}
            </Text>
          </Button>
          {tab.isDynamic && (
            <View
              className={`${styles.closeButton} ${pathname === tab.value ? styles.activeTab : ''}`}
              onClick={(e) => handleCloseTab(tab, e)}
            >
              <Text
                as="span"
                color={tokens.colors.font.secondary}
                fontSize="14px"
                fontWeight={tokens.fontWeights.bold}
              >
                ×
              </Text>
            </View>
          )}
        </Flex>
      ))}
    </Flex>
  );
} 