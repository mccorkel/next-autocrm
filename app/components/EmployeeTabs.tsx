"use client";

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { View, useTheme } from '@aws-amplify/ui-react';
import { useTabContext } from '@/app/contexts/TabContext';
import { useAgent } from '@/app/contexts/AgentContext';
import { Tabs, Tab, Box, SvgIcon } from '@mui/material';
import { Close as CloseIconMui } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface Tab {
  label: string;
  value: string;
}

interface Props {
  userGroups: string[];
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: 1,
  borderColor: 'divider',
  position: 'sticky',
  top: 0,
  backgroundColor: 'white',
  zIndex: 2,
  minHeight: '32px',
  '& .MuiTabs-indicator': {
    backgroundColor: '#E91E63',
    height: 2,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '& .MuiTabs-flexContainer': {
    position: 'relative',
    minHeight: '32px',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  minHeight: '32px',
  padding: '4px 12px',
  fontSize: '0.875rem',
  color: 'rgba(0, 0, 0, 0.7)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&.Mui-selected': {
    color: '#E91E63',
    fontWeight: 'bold',
  },
  '&:hover': {
    color: '#E91E63',
    opacity: 1,
  },
}));

const TabCloseButton = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  marginLeft: '8px',
  borderRadius: '50%',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  '& svg': {
    width: '1rem',
    height: '1rem',
  },
}));

export default function EmployeeTabs({ userGroups }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { tokens } = useTheme();
  const { currentAgentId, isInitialized, isLoading } = useAgent();
  const { state: tabState, updateTabData, removeTab, cacheComponent, getCachedComponent } = useTabContext();

  // Static tabs based on user groups
  const staticTabs = [
    { label: 'Dashboard', value: '/protected/employee/agent-dashboard' },
    ...(userGroups.some(group => ['ADMIN', 'SUPER'].includes(group)) ? [
      { label: 'Agent Management', value: '/protected/employee/agent-management' }
    ] : []),
    ...(userGroups.includes('ADMIN') ? [
      { label: 'User Management', value: '/protected/employee/user-management' }
    ] : []),
    ...(userGroups.some(group => ['ADMIN', 'SUPER', 'AGENT'].includes(group)) ? [
      { label: 'Customers', value: '/protected/customers' }
    ] : [])
  ];

  // Dynamic tabs from context
  const dynamicTabs = Object.entries(tabState)
    .filter(([_, { data }]) => data && data.label)
    .map(([path, { data }]) => ({
      label: data.label,
      value: path
    }));

  const allTabs = [...staticTabs, ...dynamicTabs];

  // Find the closest matching tab for the current pathname
  const getActiveTab = (currentPath: string) => {
    // If the path is exactly matched, return it
    if (allTabs.some(tab => tab.value === currentPath)) {
      return currentPath;
    }

    // If we're on the new ticket page, return the dashboard
    if (currentPath === '/protected/tickets/new') {
      return '/protected/employee/agent-dashboard';
    }

    // For other paths, return the dashboard as default
    return '/protected/employee/agent-dashboard';
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    router.push(newValue);
  };

  const handleCloseTab = (e: React.MouseEvent, tab: Tab) => {
    e.stopPropagation();
    removeTab(tab.value);
    
    // If we're closing the current tab, navigate to the previous tab or dashboard
    if (pathname === tab.value) {
      const currentIndex = allTabs.findIndex(t => t.value === tab.value);
      const newTab = allTabs[currentIndex - 1] || allTabs[0];
      router.push(newTab.value);
    }
  };

  // Effect to update tab data when route changes
  useEffect(() => {
    const ticketMatch = pathname.match(/^\/protected\/tickets\/(.+)$/);
    const customerMatch = pathname.match(/^\/protected\/customers\/(.+)$/);
    const agentMatch = pathname.match(/^\/protected\/agents\/(.+)$/);

    if (ticketMatch && ticketMatch[1] !== 'new') {
      // For ticket details, fetch the ticket to get its title
      const fetchTicket = async () => {
        try {
          const response = await client.models.Ticket.get({ id: ticketMatch[1] });
          if (response.data) {
            const title = response.data.title || '';
            updateTabData(pathname, { 
              label: `Ticket "${title.length > 30 ? title.slice(0, 27) + '...' : title}"` 
            });
          }
        } catch (error) {
          console.error('Error fetching ticket:', error);
        }
      };
      fetchTicket();
    } else if (pathname === '/protected/tickets/new') {
      updateTabData(pathname, { label: 'New Ticket' });
    } else if (customerMatch && customerMatch[1] !== 'new') {
      // For customer details, fetch the customer to get their name
      const fetchCustomer = async () => {
        try {
          const response = await client.models.Customer.get({ id: customerMatch[1] });
          if (response.data) {
            const displayName = response.data.name || response.data.email || '';
            updateTabData(pathname, { 
              label: `Customer "${displayName.length > 30 ? displayName.slice(0, 27) + '...' : displayName}"` 
            });
          }
        } catch (error) {
          console.error('Error fetching customer:', error);
        }
      };
      fetchCustomer();
    } else if (pathname === '/protected/customers/new') {
      updateTabData(pathname, { label: 'New Customer' });
    } else if (agentMatch) {
      // For agent details, fetch the agent to get their name
      const fetchAgent = async () => {
        try {
          const response = await client.models.Agent.get({ id: agentMatch[1] });
          if (response.data) {
            const displayName = response.data.name || response.data.email || '';
            updateTabData(pathname, { 
              label: currentAgentId === agentMatch[1] ? 
                'My Profile' : 
                `Agent "${displayName.length > 30 ? displayName.slice(0, 27) + '...' : displayName}"` 
            });
          }
        } catch (error) {
          console.error('Error fetching agent:', error);
        }
      };
      fetchAgent();
    }
  }, [pathname, updateTabData, currentAgentId]);

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <StyledTabs
        value={getActiveTab(pathname)}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="navigation tabs"
      >
        {allTabs.map((tab) => (
          <StyledTab
            key={tab.value}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {tab.label}
                {!staticTabs.some(staticTab => staticTab.value === tab.value) && (
                  <TabCloseButton
                    onClick={(e) => handleCloseTab(e, tab)}
                    role="button"
                    aria-label="close tab"
                  >
                    <SvgIcon component={CloseIconMui} />
                  </TabCloseButton>
                )}
              </Box>
            }
            value={tab.value}
          />
        ))}
      </StyledTabs>
    </Box>
  );
} 