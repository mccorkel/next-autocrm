import React, { useState, useEffect, useRef } from 'react';
import { Tabs, useTheme, Flex, Button, Text, View } from '@aws-amplify/ui-react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './EmployeeTabs.module.css';

interface EmployeeTabsProps {
  userGroups: string[];
  agents: any[];
  user: any;
}

interface TabConfig {
  label: string;
  value: string;
  access: string[];
  isDynamic?: boolean;
  onClose?: () => void;
}

const STORAGE_KEY = 'autocrm_open_ticket_tabs';

export default function EmployeeTabs({ userGroups, agents, user }: EmployeeTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { tokens } = useTheme();
  const [dynamicTabs, setDynamicTabs] = useState<TabConfig[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    const customerMatch = pathname.match(/^\/protected\/customers\/(.+)$/);
    const agentMatch = pathname.match(/^\/protected\/agents\/(.+)$/);

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
    } else if (customerMatch) {
      const customerId = customerMatch[1];
      const existingTab = dynamicTabs.find(tab => {
        const tabCustomerMatch = tab.value.match(/^\/protected\/customers\/(.+)$/);
        return tabCustomerMatch && tabCustomerMatch[1] === customerId;
      });

      if (!existingTab) {
        const newTab: TabConfig = {
          label: `Customer #${customerId}`,
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
    } else if (agentMatch) {
      const agentId = agentMatch[1];
      const existingTab = dynamicTabs.find(tab => {
        const tabAgentMatch = tab.value.match(/^\/protected\/agents\/(.+)$/);
        return tabAgentMatch && tabAgentMatch[1] === agentId;
      });

      if (!existingTab) {
        // Find the agent details to get their email
        const agent = agents.find(agent => agent.id === agentId);
        const isCurrentUserProfile = agent?.email === user?.signInDetails?.loginId;
        
        const newTab: TabConfig = {
          label: isCurrentUserProfile ? 'My Profile' : 
            `Agent ${agent?.email ? agent.email : 'Unknown'}`,
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
  }, [pathname, dynamicTabs, isInitialized, router, agents, user?.signInDetails?.loginId]);

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

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [dynamicTabs]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Flex 
      width="100%"
      position="relative"
      alignItems="center"
    >
      {showLeftArrow && (
        <View
          className={styles.scrollButton}
          onClick={() => scroll('left')}
          style={{ left: 0 }}
        >
          <Text fontSize="1.2rem">‹</Text>
        </View>
      )}
      
      <Flex 
        ref={scrollContainerRef}
        gap={tokens.space.medium} 
        padding={tokens.space.small}
        className={styles.tabsContainer}
        style={{
          overflowX: 'auto',
          position: 'relative',
          width: '100%'
        }}
        onScroll={checkScrollButtons}
      >
        {allTabs.map((tab) => (
          <Flex 
            key={tab.value} 
            alignItems="center"
            className={styles.tabContainer}
            style={{
              maxWidth: 'calc(15vw - 16px)',
              minWidth: '140px',
              position: 'relative',
              flex: '0 0 auto'
            }}
          >
            <Button
              onClick={() => handleTabClick(tab.value)}
              variation="link"
              className={pathname === tab.value ? styles.activeTab : ''}
              style={{
                maxWidth: '100%',
                minHeight: '48px',
                whiteSpace: 'normal',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                lineHeight: '1.2',
                padding: '12px 36px 12px 16px',
                flex: 1,
                borderRadius: '8px',
                fontWeight: 500,
                width: '100%'
              }}
            >
              <Text
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  color: pathname === tab.value ? '#FFFFFF' : '#333333',
                  fontSize: '14px',
                  minHeight: '1.2em',
                  lineHeight: '1.2'
                }}
                dangerouslySetInnerHTML={{ __html: tab.label }}
              />
            </Button>
            {tab.isDynamic && (
              <View
                className={`${styles.closeButton} ${pathname === tab.value ? styles.activeTab : ''}`}
                onClick={(e) => handleCloseTab(tab, e)}
              >
                <Text
                  as="span"
                  style={{
                    color: pathname === tab.value ? '#FFFFFF' : '#666666'
                  }}
                >
                  ×
                </Text>
              </View>
            )}
          </Flex>
        ))}
      </Flex>

      {showRightArrow && (
        <View
          className={styles.scrollButton}
          onClick={() => scroll('right')}
          style={{ right: 0 }}
        >
          <Text fontSize="1.2rem">›</Text>
        </View>
      )}
    </Flex>
  );
} 