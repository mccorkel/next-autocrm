"use client";

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { View, useTheme } from '@aws-amplify/ui-react';
import { useTabContext } from '@/app/contexts/TabContext';
import { useAgent } from '@/app/contexts/AgentContext';
import { Tabs, Tab, Box, SvgIcon } from '@mui/material';
import { Close as CloseIconMui } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface Tab {
  label: string;
  value: string;
}

interface Props {
  userGroups: string[];
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: '#E91E63',
    height: 3,
  },
  '& .MuiTabs-scrollButtons': {
    '&.Mui-disabled': {
      opacity: 0.3,
    },
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  padding: '12px 16px',
  color: 'rgba(0, 0, 0, 0.7)',
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
      updateTabData(pathname, { label: `Ticket #${ticketMatch[1]}` });
    } else if (pathname === '/protected/tickets/new') {
      updateTabData(pathname, { label: 'New Ticket' });
    } else if (customerMatch) {
      updateTabData(pathname, { label: `Customer #${customerMatch[1]}` });
    } else if (agentMatch) {
      const agentId = agentMatch[1];
      const label = currentAgentId === agentId ? 'My Profile' : `Agent #${agentId}`;
      updateTabData(pathname, { label });
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