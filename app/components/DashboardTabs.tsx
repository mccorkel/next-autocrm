import { Box, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: 1,
  borderColor: 'divider',
  '& .MuiTabs-indicator': {
    backgroundColor: '#E91E63',
    height: 3,
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

interface DashboardTabsProps {
  totalOpenTickets: number;
  assignedOpenTickets: number;
  assignedBlockedTickets: number;
  assignedClosedTickets: number;
}

export default function DashboardTabs({ 
  totalOpenTickets, 
  assignedOpenTickets,
  assignedBlockedTickets,
  assignedClosedTickets 
}: DashboardTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'all';

  // Log current view on mount and changes
  useEffect(() => {
    console.log('DashboardTabs view:', {
      currentView,
      searchParams: Object.fromEntries(searchParams.entries()),
      totalOpenTickets,
      assignedOpenTickets,
      assignedBlockedTickets,
      assignedClosedTickets
    });
  }, [currentView, searchParams, totalOpenTickets, assignedOpenTickets, assignedBlockedTickets, assignedClosedTickets]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    console.log('Tab change:', { from: currentView, to: newValue });
    router.push(`/protected/employee/agent-dashboard?view=${newValue}`);
  };

  return (
    <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <StyledTabs value={currentView} onChange={handleChange}>
        <StyledTab label={`All Open Tickets (${totalOpenTickets})`} value="all" />
        <StyledTab label={`My Open Tickets (${assignedOpenTickets})`} value="assigned" />
        <StyledTab label={`My Blocked Tickets (${assignedBlockedTickets})`} value="blocked" />
        <StyledTab label={`My Closed Tickets (${assignedClosedTickets})`} value="closed" />
      </StyledTabs>
    </Box>
  );
} 