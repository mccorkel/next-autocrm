import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { type AuthUser } from '@aws-amplify/auth';

const client = generateClient<Schema>();

// Global initialization tracking
let hasInitialized = false;

export async function checkAndCreateAgent() {
  if (hasInitialized) {
    return null;
  }

  try {
    const session = await fetchAuthSession();
    const currentUser = await getCurrentUser();
    const userAttributes = (await (currentUser as AuthUser).signInDetails?.loginId) || '';
    
    console.log('User attributes:', userAttributes);
    
    const groups = (session.tokens?.accessToken?.payload['cognito:groups'] as string[]) || [];
    const userEmail = userAttributes;
    const userName = userEmail?.split('@')[0] || 'Unknown User';
    
    if (!userEmail) {
      console.error('No email found in user attributes');
      return null;
    }

    // Check for existing agent
    const existingAgentsResponse = await client.models.Agent.list({
      filter: { email: { eq: userEmail } }
    });
    console.log('Existing agents query result:', existingAgentsResponse.data);

    if (existingAgentsResponse.data && existingAgentsResponse.data.length > 0) {
      const existingAgent = existingAgentsResponse.data[0];
      console.log('Found existing agent:', existingAgent);
      hasInitialized = true;
      return existingAgent.id;
    } else {
      // Create new agent
      const newAgentData = {
        email: userEmail,
        name: userName,
        status: 'AVAILABLE' as const,
        maxConcurrentTickets: 5,
        assignedCategories: []
      };
      
      console.log('No existing agent found, attempting to create new agent with data:', newAgentData);
      
      const createResponse = await client.models.Agent.create(newAgentData);
      console.log('Create agent API response:', createResponse);
      
      if (createResponse.data) {
        console.log('Created new agent:', createResponse.data);
        hasInitialized = true;
        return createResponse.data.id;
      }
    }
    
    hasInitialized = true;
    return null;
  } catch (error) {
    console.error('Error in checkAndCreateAgent:', error);
    return null;
  }
} 