"use client";

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

interface TabState {
  [key: string]: {
    data: any;
    lastUpdated: number;
    Component?: React.ReactNode;
  };
}

type TabAction = 
  | { type: 'UPDATE_TAB_DATA'; path: string; data: any }
  | { type: 'CACHE_COMPONENT'; path: string; Component: React.ReactNode }
  | { type: 'REMOVE_TAB'; path: string };

const TabContext = createContext<{
  state: TabState;
  updateTabData: (path: string, data: any) => void;
  cacheComponent: (path: string, Component: React.ReactNode) => void;
  removeTab: (path: string) => void;
  getCachedComponent: (path: string) => React.ReactNode | undefined;
} | null>(null);

function tabReducer(state: TabState, action: TabAction): TabState {
  switch (action.type) {
    case 'UPDATE_TAB_DATA':
      return {
        ...state,
        [action.path]: {
          ...state[action.path],
          data: action.data,
          lastUpdated: Date.now()
        }
      };
    case 'CACHE_COMPONENT':
      return {
        ...state,
        [action.path]: {
          ...state[action.path],
          Component: action.Component,
          lastUpdated: Date.now()
        }
      };
    case 'REMOVE_TAB':
      const newState = { ...state };
      delete newState[action.path];
      return newState;
    default:
      return state;
  }
}

export function TabProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tabReducer, {});

  const updateTabData = useCallback((path: string, data: any) => {
    dispatch({ type: 'UPDATE_TAB_DATA', path, data });
  }, []);

  const cacheComponent = useCallback((path: string, Component: React.ReactNode) => {
    dispatch({ type: 'CACHE_COMPONENT', path, Component });
  }, []);

  const removeTab = useCallback((path: string) => {
    dispatch({ type: 'REMOVE_TAB', path });
  }, []);

  const getCachedComponent = useCallback((path: string) => {
    return state[path]?.Component;
  }, [state]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    updateTabData,
    cacheComponent,
    removeTab,
    getCachedComponent
  }), [state, updateTabData, cacheComponent, removeTab, getCachedComponent]);

  return (
    <TabContext.Provider value={contextValue}>
      {children}
    </TabContext.Provider>
  );
}

export function useTabContext() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabContext must be used within a TabProvider');
  }
  return context;
} 