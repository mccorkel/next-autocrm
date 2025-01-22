"use client";

import { useState, useEffect } from "react";
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

const client = generateClient<Schema>();

export default function Page() {
  const { tokens } = useTheme();
  type AgentStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  type AgentType = Schema['Agent']['type'];

  const [agents, setAgents] = useState<AgentType[]>([]);
  const [assignedAgents, setAssignedAgents] = useState<AgentType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUserGroups, setCurrentUserGroups] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentAgentId, setCurrentAgentId] = useState<string>("");

  useEffect(() => {
    async function initialize() {
      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
        setCurrentUserGroups(groups);
        
        const agentId = await checkAndCreateAgent();
        if (agentId) {
          setCurrentAgentId(agentId);
        }
      } catch (err) {
        console.error("Error in initialization:", err);
        setError("Error setting up agent profile");
      }
    }
    
    initialize();
  }, []);

  useEffect(() => {
    if (currentAgentId) {
      console.log("Current agent ID set:", currentAgentId);
      fetchAgents();
    }
  }, [currentAgentId]);

  async function fetchAgents() {
    try {
      setLoading(true);
      const { data } = await client.models.Agent.list();
      
      // Filter assigned agents using currentAgentId instead of email
      const assigned = data.filter(agent => agent.supervisorId === currentAgentId);
      setAssignedAgents(assigned);
      
      // Set all agents
      setAgents(data);
    } catch (err) {
      setError("Failed to fetch agents");
      console.error("Error fetching agents:", err);
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

        {/* All Agents Section */}
        <Card>
          <Heading level={2} color={tokens.colors.font.primary}>All Agents</Heading>
          <Table highlightOnHover={true}>
            <TableHead>
              <TableRow>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Email</TableCell>
                <TableCell as="th">Status</TableCell>
                <TableCell as="th">Supervisor</TableCell>
                <TableCell as="th">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.map((agent) => (
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
                  <TableCell>{agent.supervisorId || 'Unassigned'}</TableCell>
                  <TableCell>
                    {!agent.supervisorId && agent.id && (
                      <Button
                        size="small"
                        onClick={() => assignAgentToMe(agent.id)}
                      >
                        Assign to Me
                      </Button>
                    )}
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
