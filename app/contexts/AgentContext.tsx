"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '@/amplify/data/resource';

type AgentData = {
  id: string;
  email: string;
  name: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  maxConcurrentTickets: number;
  assignedCategories: string[];
  supervisorId?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type AgentContextType = {
  isInitialized: boolean;
  currentAgent: AgentData | null;
  initializeAgent: (email: string, name: string) => Promise<void>;
};

const AgentContext = createContext<AgentContextType | undefined>(undefined);

let initializationPromise: Promise<void> | null = null;

export function AgentProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentData | null>(null);
  const client = generateClient<Schema>();

  const initializeAgent = useCallback(async (email: string, name: string) => {
    if (initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = (async () => {
      try {
        console.log('User attributes:', email, name);
        
        // Query existing agents
        const existingAgentsResponse = await client.models.Agent.list({
          filter: {
            email: { eq: email }
          }
        });
        console.log('Existing agents query result:', existingAgentsResponse.data);

        // If agent exists, use it
        if (existingAgentsResponse.data && existingAgentsResponse.data.length > 0) {
          const agent = existingAgentsResponse.data[0];
          setCurrentAgent(agent as unknown as AgentData);
          setIsInitialized(true);
          return;
        }

        // If no agent exists, create one
        const newAgentData = {
          email,
          name,
          status: 'AVAILABLE' as const,
          maxConcurrentTickets: 5,
          assignedCategories: []
        };
        console.log('No existing agent found, attempting to create new agent with data:', newAgentData);

        const createResponse = await client.models.Agent.create(newAgentData);
        console.log('Create agent API response:', createResponse);

        if (createResponse.data) {
          console.log('Created new agent:', createResponse.data);
          setCurrentAgent(createResponse.data as unknown as AgentData);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing agent:', error);
        setIsInitialized(true);
      }
    })();

    try {
      await initializationPromise;
    } finally {
      initializationPromise = null;
    }
  }, [client]);

  return (
    <AgentContext.Provider value={{ isInitialized, currentAgent, initializeAgent }}>
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