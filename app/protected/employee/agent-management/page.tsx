"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { fetchAuthSession } from 'aws-amplify/auth';
import type { Schema } from "@/amplify/data/resource";
import {
  Button,
  Card,
  Flex,
  Heading,
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  Badge,
  View,
  useTheme,
  Alert,
  Text,
} from "@aws-amplify/ui-react";
import { checkAndCreateAgent } from "@/app/utils/agent";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useAgent } from "../../../contexts/AgentContext";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

const client = generateClient<Schema>();

type AgentType = Schema["Agent"]["type"];

function AgentManagementContent() {
  const router = useRouter();
  const { tokens } = useTheme();
  const { translations } = useLanguage();
  const { currentAgentId, setCurrentAgentId } = useAgent();
  const [assignedAgents, setAssignedAgents] = useState<AgentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  useEffect(() => {
    async function initialize() {
      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
        
        // Only create agent and redirect if we don't have a currentAgentId
        if (!currentAgentId) {
          const agentId = await checkAndCreateAgent();
          if (agentId) {
            setCurrentAgentId(agentId);
            router.push('/protected/employee/agent-dashboard');
          }
        }
      } catch (err) {
        console.error("Error in initialization:", err);
        setError("Error setting up agent profile");
      }
    }
    
    initialize();
  }, [router, currentAgentId]);

  useEffect(() => {
    if (currentAgentId) {
      console.log("Current agent ID set:", currentAgentId);
      fetchAgents();
    }
  }, [currentAgentId]);

  async function fetchAgents() {
    if (!currentAgentId) return;

    try {
      setLoading(true);
      const agentsResponse = await client.models.Agent.list({
        filter: {
          supervisorId: {
            eq: currentAgentId
          }
        }
      });

      if (agentsResponse.data) {
        setAssignedAgents(agentsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to load agents. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  async function assignAgentToMe(agentId: string | null | undefined) {
    if (!agentId || !currentAgentId) {
      setError("Invalid agent ID");
      return;
    }

    try {
      await client.models.Agent.update({
        id: agentId,
        supervisorId: currentAgentId, // Use currentAgentId instead of email
      });
      setSuccess("Agent assigned successfully");
      fetchAgents(); // Refresh the lists
    } catch (err) {
      setError("Failed to assign agent");
      console.error("Error assigning agent:", err);
    }
  }

  if (loading) {
    return (
      <View 
        padding={tokens.space.large}
        backgroundColor={tokens.colors.background.primary}
        minHeight="100vh"
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View backgroundColor={tokens.colors.background.primary} minHeight="100vh">
      <Flex direction="column" gap={tokens.space.large} padding={tokens.space.large}>
        <Heading level={1} color={tokens.colors.font.primary}>Agent Management</Heading>

        {error && <Alert variation="error">{error}</Alert>}
        {success && <Alert variation="success">{success}</Alert>}

        {/* My Agents Section */}
        <Card>
          <Heading level={2} color={tokens.colors.font.primary}>My Agents</Heading>
          <Table highlightOnHover={true}>
            <TableHead>
              <TableRow>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Email</TableCell>
                <TableCell as="th">Status</TableCell>
                <TableCell as="th">Max Tickets</TableCell>
                <TableCell as="th">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignedAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>{agent.name}</TableCell>
                  <TableCell>{agent.email}</TableCell>
                  <TableCell>
                    <Badge
                      variation={
                        agent.status === "AVAILABLE" ? "success" :
                        agent.status === "BUSY" ? "warning" : "error"
                      }
                    >
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{agent.maxConcurrentTickets}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => {/* TODO: Add edit functionality */}}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Flex>
    </View>
  );
}

export default function AgentManagementPage() {
  return (
    <Suspense>
      <AgentManagementContent />
    </Suspense>
  );
}
