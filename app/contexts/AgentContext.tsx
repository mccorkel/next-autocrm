"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { checkAndCreateAgent } from "@/app/utils/agent";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from 'aws-amplify/auth';
import { Hub as AuthHub } from '@aws-amplify/core';

const client = generateClient<Schema>();

type AgentContextType = {
  currentAgentId: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
};

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAmplifyConfigured, setIsAmplifyConfigured] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initializationAttempts = useRef(0);
  const maxAttempts = 3;

  const reset = useCallback(() => {
    console.log('Resetting AgentContext state');
    setCurrentAgentId(null);
    setIsInitialized(false);
    setIsLoading(true);
    setError(null);
    setIsAmplifyConfigured(false);
    setIsAuthenticated(false);
    initializationAttempts.current = 0;
  }, []);

  // Authentication and configuration check
  useEffect(() => {
    async function checkAuthAndConfig() {
      try {
        console.log('Checking authentication and Amplify configuration');
        const session = await fetchAuthSession();
        const isAuth = !!session.tokens?.accessToken;
        
        if (!isAuth) {
          console.log('No valid auth session found, resetting state');
          reset();
          return;
        }

        try {
          const config = Amplify.getConfig();
          if (config) {
            console.log('Auth session and Amplify configuration verified');
            setIsAuthenticated(true);
            setIsAmplifyConfigured(true);
          }
        } catch (error) {
          console.error('Amplify configuration error:', error);
          reset();
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        reset();
      }
    }

    // Set up auth state change listener
    const unsubscribe = AuthHub.listen('auth', ({ payload }: { payload: { event: string } }) => {
      console.log('Auth event:', payload.event);
      switch (payload.event) {
        case 'signedIn':
          checkAuthAndConfig();
          break;
        case 'signedOut':
          reset();
          break;
        case 'tokenRefresh':
        case 'tokenRefresh_failure':
          checkAuthAndConfig();
          break;
      }
    });

    // Initial check
    checkAuthAndConfig();

    return () => {
      unsubscribe();
    };
  }, []); // Run once on mount

  // Initialize agent with retries
  useEffect(() => {
    if (!isAmplifyConfigured || !isAuthenticated) {
      console.log('Waiting for auth and config:', { isAmplifyConfigured, isAuthenticated });
      return;
    }

    async function initializeAgent() {
      try {
        console.log(`Starting agent initialization (attempt ${initializationAttempts.current + 1}/${maxAttempts})`);
        setIsLoading(true);
        const agentId = await checkAndCreateAgent();
        console.log('Agent initialization result:', { agentId });
        
        if (!agentId) {
          console.error('Failed to get agent ID');
          if (initializationAttempts.current < maxAttempts) {
            initializationAttempts.current++;
            setTimeout(initializeAgent, 1000);
            return;
          }
          setError(`Failed to get agent ID after ${maxAttempts} attempts`);
          setCurrentAgentId(null);
          return;
        }
        
        console.log('Setting current agent ID in context:', agentId);
        setCurrentAgentId(agentId);
        setIsInitialized(true);
        setError(null);
        setIsLoading(false);
        initializationAttempts.current = 0;
      } catch (error) {
        console.error('Error initializing agent:', error);
        if (initializationAttempts.current < maxAttempts) {
          initializationAttempts.current++;
          setTimeout(initializeAgent, 1000);
          return;
        }
        setError(`Error initializing agent after ${maxAttempts} attempts`);
        setCurrentAgentId(null);
        setIsLoading(false);
      }
    }

    initializeAgent();
  }, [isAmplifyConfigured, isAuthenticated]);

  // Log context value changes
  useEffect(() => {
    console.log('AgentContext state updated:', {
      currentAgentId,
      isInitialized,
      isLoading,
      error,
      isAuthenticated,
      isAmplifyConfigured,
      initializationAttempts: initializationAttempts.current
    });
  }, [currentAgentId, isInitialized, isLoading, error, isAuthenticated, isAmplifyConfigured]);

  return (
    <AgentContext.Provider 
      value={{ 
        currentAgentId,
        isInitialized,
        isLoading,
        error,
        reset
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
} 