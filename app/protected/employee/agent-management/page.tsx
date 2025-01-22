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
    checkUserPermissions();
  }, []);

  useEffect(() => {
    if (currentAgentId) {
      console.log("Current agent ID set:", currentAgentId);
      fetchAgents();
    }
  }, [currentAgentId]);

  async function checkUserPermissions() {
    try {
      const session = await fetchAuthSession();
      console.log("Full session data:", JSON.stringify(session.tokens?.accessToken?.payload, null, 2));
      
      const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
      setCurrentUserGroups(groups);
      
      // Get user's actual email and sub (ID)
      const userId = session.tokens?.accessToken?.payload['sub'] as string;
      const userEmail = session.tokens?.accessToken?.payload['email'] as string;
      const userName = session.tokens?.accessToken?.payload['name'] as string;
      
      console.log("User authenticated:", {
        sub: userId,
        email: userEmail,
        name: userName,
        groups: groups
      });

      // If email is undefined, we should use the sub as a fallback
      const agentEmail = userEmail || userId;
      console.log("Using email/identifier for agent:", agentEmail);

      setCurrentUserId(agentEmail);

      console.log("Checking for existing agent with email:", agentEmail);
      
      // Try to find existing agent
      const { data: existingAgents } = await client.models.Agent.list({
        filter: {
          email: {
            eq: agentEmail
          }
        }
      });

      console.log("Existing agents query result:", existingAgents);

      if (existingAgents && existingAgents.length > 0) {
        const agent = existingAgents[0];
        console.log("Found existing agent:", agent);
        if (agent.id) {
          setCurrentAgentId(agent.id);
        }
      } else {
        console.log("No existing agent found, attempting to create new agent with data:", {
          email: agentEmail,
          name: userName || agentEmail,
          status: "AVAILABLE",
          maxConcurrentTickets: 5,
          assignedCategories: [],
        });

        try {
          // Create new agent
          const createResult = await client.models.Agent.create({
            email: agentEmail,
            name: userName || agentEmail,
            status: "AVAILABLE",
            maxConcurrentTickets: 5,
            assignedCategories: [],
          });
          
          console.log("Create agent API response:", createResult);
          
          if (createResult.errors) {
            console.error("GraphQL errors during agent creation:", createResult.errors);
            throw new Error(`Failed to create agent: ${createResult.errors.map(e => e.message).join(', ')}`);
          }

          if (!createResult.data) {
            console.error("No data returned from create agent call");
            throw new Error("Failed to create agent - no data returned");
          }

          const newAgent = createResult.data;
          console.log("Created new agent:", newAgent);
          
          if (newAgent?.id) {
            console.log("Setting current agent ID to:", newAgent.id);
            setCurrentAgentId(newAgent.id);
          } else {
            console.error("Created agent has no ID:", newAgent);
            throw new Error("Created agent has no ID");
          }
        } catch (createErr) {
          console.error("Error creating new agent:", createErr);
          if (createErr instanceof Error) {
            console.error("Error details:", {
              message: createErr.message,
              stack: createErr.stack,
              // Add any additional error properties that might be present
              ...(createErr as any)
            });
          }
          throw createErr; // Re-throw to be caught by outer catch block
        }
      }
    } catch (err) {
      console.error("Error in checkUserPermissions:", err);
      if (err instanceof Error) {
        console.error("Error details:", {
          message: err.message,
          stack: err.stack
        });
      }
      setError("Error setting up agent profile");
    }
  }

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
