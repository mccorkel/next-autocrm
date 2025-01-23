"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { checkAndCreateAgent } from "@/app/utils/agent";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from 'aws-amplify/auth';

const client = generateClient<Schema>();

type AgentContextType = {
  currentAgentId: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
};

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAmplifyConfigured, setIsAmplifyConfigured] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Wait for Amplify configuration
  useEffect(() => {
    const checkAmplifyConfig = () => {
      try {
        const config = Amplify.getConfig();
        if (config) {
          setIsAmplifyConfigured(true);
        }
      } catch (error) {
        setTimeout(checkAmplifyConfig, 100);
      }
    };
    checkAmplifyConfig();
  }, []);

  // Check authentication status
  useEffect(() => {
    if (!isAmplifyConfigured) return;

    async function checkAuth() {
      try {
        const session = await fetchAuthSession();
        setIsAuthenticated(!!session.tokens?.accessToken);
      } catch (error) {
        setIsAuthenticated(false);
      }
    }

    checkAuth();
  }, [isAmplifyConfigured]);

  useEffect(() => {
    if (!isAmplifyConfigured || !isAuthenticated) return;

    async function initializeAgent() {
      try {
        setIsLoading(true);
        const agentId = await checkAndCreateAgent();
        if (!agentId) {
          setError('Failed to get agent ID');
          setCurrentAgentId(null);
          return;
        }
        
        setCurrentAgentId(agentId);
        setIsInitialized(true);
        setError(null);
      } catch (error) {
        console.error('Error initializing agent:', error);
        setError('Error initializing agent');
        setCurrentAgentId(null);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAgent();
  }, [isAmplifyConfigured, isAuthenticated]);

  return (
    <AgentContext.Provider 
      value={{ 
        currentAgentId,
        isInitialized,
        isLoading,
        error
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