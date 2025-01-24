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
import { CognitoIdentityProviderClient, AdminListGroupsForUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import outputs from "@/amplify_outputs.json";

const client = generateClient<Schema>();

type AgentType = Schema["Agent"]["type"];

interface AgentWithGroups extends AgentType {
  groups: string[];
}

function AgentManagementContent() {
  const router = useRouter();
  const { tokens } = useTheme();
  const { translations } = useLanguage();
  const { currentAgentId, setCurrentAgentId } = useAgent();
  const [assignedAgents, setAssignedAgents] = useState<AgentWithGroups[]>([]);
  const [allAgents, setAllAgents] = useState<AgentWithGroups[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [userGroups, setUserGroups] = useState<string[]>([]);

  useEffect(() => {
    async function initialize() {
      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
        setUserGroups(groups);
        
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

  async function fetchUserGroups(email: string, credentials: any) {
    try {
      const cognitoClient = new CognitoIdentityProviderClient({
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken
        },
        region: 'us-west-2'
      });

      const command = new AdminListGroupsForUserCommand({
        UserPoolId: outputs.auth.user_pool_id,
        Username: email || ''
      });

      const response = await cognitoClient.send(command);
      return response.Groups?.map(group => group.GroupName || '').filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return [];
    }
  }

  async function fetchAgents() {
    if (!currentAgentId) return;

    try {
      setLoading(true);
      const session = await fetchAuthSession();
      const credentials = session.credentials;

      // Fetch assigned agents
      const assignedResponse = await client.models.Agent.list({
        filter: {
          supervisorId: {
            eq: currentAgentId
          }
        }
      });

      // Fetch all agents
      const allResponse = await client.models.Agent.list();

      if (assignedResponse.data && credentials) {
        const assignedWithGroups = await Promise.all(
          assignedResponse.data.map(async agent => ({
            ...agent,
            groups: await fetchUserGroups(agent.email || '', credentials)
          }))
        );
        setAssignedAgents(assignedWithGroups as AgentWithGroups[]);
      }

      if (allResponse.data && credentials) {
        const allWithGroups = await Promise.all(
          allResponse.data.map(async agent => ({
            ...agent,
            groups: await fetchUserGroups(agent.email || '', credentials)
          }))
        );
        setAllAgents(allWithGroups as AgentWithGroups[]);
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
        supervisorId: currentAgentId,
      });
      setSuccess("Agent assigned successfully");
      fetchAgents();
    } catch (err) {
      setError("Failed to assign agent");
      console.error("Error assigning agent:", err);
    }
  }

  async function unassignAgent(agentId: string | null | undefined) {
    if (!agentId) {
      setError("Invalid agent ID");
      return;
    }

    try {
      await client.models.Agent.update({
        id: agentId,
        supervisorId: null,
      });
      setSuccess("Agent unassigned successfully");
      fetchAgents();
    } catch (err) {
      setError("Failed to unassign agent");
      console.error("Error unassigning agent:", err);
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

        <Flex direction="row" gap={tokens.space.large}>
          {/* My Agents Section */}
          <Card style={{ flex: 1 }}>
            <Heading level={2} color={tokens.colors.font.primary}>My Agents</Heading>
            <Table highlightOnHover={true}>
              <TableHead>
                <TableRow>
                  <TableCell as="th">Email</TableCell>
                  <TableCell as="th">Name</TableCell>
                  <TableCell as="th">Group</TableCell>
                  <TableCell as="th">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignedAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <a 
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/protected/agents/${agent.id}`);
                        }}
                        href="#"
                        style={{
                          color: '#007EB9',
                          textDecoration: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {agent.email}
                      </a>
                    </TableCell>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>
                      <Flex gap={tokens.space.xs}>
                        {agent.groups.map((group, index) => (
                          <Badge
                            key={index}
                            variation={
                              group === "ADMIN" ? "error" :
                              group === "SUPER" ? "warning" : "info"
                            }
                          >
                            {group}
                          </Badge>
                        ))}
                      </Flex>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => unassignAgent(agent.id)}
                      >
                        Unassign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {assignedAgents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Text textAlign="center">No agents assigned</Text>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          {/* All Agents Section */}
          <Card style={{ flex: 1 }}>
            <Heading level={2} color={tokens.colors.font.primary}>All Agents</Heading>
            <Table highlightOnHover={true}>
              <TableHead>
                <TableRow>
                  <TableCell as="th">Email</TableCell>
                  <TableCell as="th">Name</TableCell>
                  <TableCell as="th">Group</TableCell>
                  <TableCell as="th">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <a 
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/protected/agents/${agent.id}`);
                        }}
                        href="#"
                        style={{
                          color: '#007EB9',
                          textDecoration: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {agent.email}
                      </a>
                    </TableCell>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>
                      <Flex gap={tokens.space.xs}>
                        {agent.groups.map((group, index) => (
                          <Badge
                            key={index}
                            variation={
                              group === "ADMIN" ? "error" :
                              group === "SUPER" ? "warning" : "info"
                            }
                          >
                            {group}
                          </Badge>
                        ))}
                      </Flex>
                    </TableCell>
                    <TableCell>
                      {agent.supervisorId === currentAgentId ? (
                        <Button
                          size="small"
                          onClick={() => unassignAgent(agent.id)}
                        >
                          Unassign
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          onClick={() => assignAgentToMe(agent.id)}
                          isDisabled={Boolean(agent.supervisorId && !userGroups.includes('ADMIN'))}
                        >
                          {!agent.supervisorId ? 'Assign to Me' : 'Take Over'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {allAgents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Text textAlign="center">No agents found</Text>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </Flex>
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
