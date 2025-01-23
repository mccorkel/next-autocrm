"use client";

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Flex, Text, View, useTheme } from '@aws-amplify/ui-react';
import { useTabContext } from '@/app/contexts/TabContext';
import styles from './EmployeeTabs.module.css';

interface Tab {
  label: string;
  value: string;
}

interface Props {
  userGroups: string[];
}

export default function EmployeeTabs({ userGroups }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { tokens } = useTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const { state: tabState, updateTabData, removeTab, cacheComponent, getCachedComponent } = useTabContext();

  // Effect to update tab data when route changes
  useEffect(() => {
    const ticketMatch = pathname.match(/^\/protected\/tickets\/(.+)$/);
    const customerMatch = pathname.match(/^\/protected\/customers\/(.+)$/);
    const agentMatch = pathname.match(/^\/protected\/agents\/(.+)$/);

    if (ticketMatch) {
      updateTabData(pathname, { label: `Ticket #${ticketMatch[1]}` });
    } else if (customerMatch) {
      updateTabData(pathname, { label: `Customer #${customerMatch[1]}` });
    } else if (agentMatch) {
      updateTabData(pathname, { label: `Agent #${agentMatch[1]}` });
    }
  }, [pathname, updateTabData]);

  // Static tabs based on user groups
  const staticTabs = [
    { label: 'Dashboard', value: '/protected/employee/agent-dashboard' },
    ...(userGroups.includes('ADMIN') ? [
      { label: 'Agent Management', value: '/protected/employee/agent-management' },
      { label: 'User Management', value: '/protected/employee/user-management' }
    ] : []),
    ...(userGroups.some(group => ['ADMIN', 'SUPER', 'AGENT'].includes(group)) ? [
      { label: 'Customers', value: '/protected/customers' }
    ] : [])
  ];

  // Dynamic tabs from context
  const dynamicTabs = Object.entries(tabState).map(([path, { data }]) => ({
    label: data.label,
    value: path
  }));

  const allTabs = [...staticTabs, ...dynamicTabs];

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 200;
    const container = scrollContainerRef.current;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleTabClick = (tab: Tab) => {
    router.push(tab.value);
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

  return (
    <View width="100%" position="relative">
      {showLeftArrow && (
        <Button
          onClick={() => scroll('left')}
          className={styles.scrollButton}
          style={{ left: 0 }}
        >
          ←
        </Button>
      )}
      
      <Flex
        ref={scrollContainerRef}
        className={styles.tabsContainer}
        onScroll={checkScrollButtons}
      >
        {allTabs.map((tab) => (
          <View
            key={tab.value}
            onClick={() => handleTabClick(tab)}
            className={`${styles.tabContainer} ${pathname === tab.value ? styles.activeTab : ''}`}
          >
            <Text>{tab.label}</Text>
            {!staticTabs.some(staticTab => staticTab.value === tab.value) && (
              <View
                onClick={(e) => handleCloseTab(e, tab)}
                className={styles.closeButton}
              >
                ×
              </View>
            )}
          </View>
        ))}
      </Flex>

      {showRightArrow && (
        <Button
          onClick={() => scroll('right')}
          className={styles.scrollButton}
          style={{ right: 0 }}
        >
          →
        </Button>
      )}
    </View>
  );
} 