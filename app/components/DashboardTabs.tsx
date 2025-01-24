import { Box, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: 1,
  borderColor: 'divider',
  position: 'sticky',
  top: 0,
  backgroundColor: 'white',
  zIndex: 2,
  minHeight: '36px',
  '& .MuiTabs-indicator': {
    backgroundColor: '#E91E63',
    height: 2,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '& .MuiTabs-flexContainer': {
    position: 'relative',
    minHeight: '36px',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  minHeight: '36px',
  padding: '6px 16px',
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

const TabPanel = styled(motion.div)({
  width: '100%',
  height: '100%',
  position: 'relative',
  display: 'block',
  paddingTop: '2px',
});

interface DashboardTabsProps {
  totalOpenTickets: number;
  assignedOpenTickets: number;
  assignedBlockedTickets: number;
  assignedClosedTickets: number;
  children: React.ReactNode;
  onViewChange?: (view: string) => void;
}

export default function DashboardTabs({ 
  totalOpenTickets, 
  assignedOpenTickets,
  assignedBlockedTickets,
  assignedClosedTickets,
  children,
  onViewChange
}: DashboardTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlView = searchParams.get('view') || 'all';
  const [currentView, setCurrentView] = useState(urlView);

  // Sync URL with local state
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('view', currentView);
    router.replace(`?${newParams.toString()}`, { scroll: false });
    onViewChange?.(currentView);
  }, [currentView, router, searchParams, onViewChange]);

  // Sync local state with URL
  useEffect(() => {
    setCurrentView(urlView);
  }, [urlView]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentView(newValue);
  };

  return (
    <Box sx={{ 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      flex: 1,
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        position: 'sticky', 
        top: 0, 
        backgroundColor: 'white', 
        zIndex: 2,
        marginBottom: '2px'
      }}>
        <StyledTabs value={currentView} onChange={handleChange}>
          <StyledTab label={`All Open Tickets (${totalOpenTickets})`} value="all" />
          <StyledTab label={`My Open Tickets (${assignedOpenTickets})`} value="assigned" />
          <StyledTab label={`My Blocked Tickets (${assignedBlockedTickets})`} value="blocked" />
          <StyledTab label={`My Closed Tickets (${assignedClosedTickets})`} value="closed" />
        </StyledTabs>
      </Box>
      <Box sx={{ 
        position: 'relative', 
        flex: 1,
        overflow: 'hidden',
        height: '100%'
      }}>
        <AnimatePresence initial={false}>
          <TabPanel
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ 
              duration: 0.2,
              ease: "easeInOut"
            }}
          >
            {children}
          </TabPanel>
        </AnimatePresence>
      </Box>
    </Box>
  );
} 