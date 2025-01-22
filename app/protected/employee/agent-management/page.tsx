"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
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
  SelectField,
  TextField,
  Alert,
  Text,
} from "@aws-amplify/ui-react";

const client = generateClient<Schema>();

export default function Page() {
  const { tokens } = useTheme();
  type AgentStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  
  type AgentType = Schema['Agent']['type'];

  const [agents, setAgents] = useState<AgentType[]>([]);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    status: "AVAILABLE" as AgentStatus,
    maxConcurrentTickets: 5,
    assignedCategories: [] as string[],
    supervisorId: "",
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      const { data } = await client.models.Agent.list();
      setAgents(data);
    } catch (err) {
      setError("Failed to fetch agents");
      console.error("Error fetching agents:", err);
    }
  }

  async function createAgent(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await client.models.Agent.create({
        name: newAgent.name,
        email: newAgent.email,
        status: newAgent.status,
        maxConcurrentTickets: newAgent.maxConcurrentTickets,
        assignedCategories: newAgent.assignedCategories,
        supervisorId: newAgent.supervisorId || '',
      });
      setSuccess("Agent created successfully");
      setShowAddAgent(false);
      setNewAgent({
        name: "",
        email: "",
        status: "AVAILABLE" as AgentStatus,
        maxConcurrentTickets: 5,
        assignedCategories: [],
        supervisorId: "",
      });
      fetchAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create agent");
    }
  }

  async function updateAgentStatus(agentId: string, newStatus: AgentStatus) {
    try {
      await client.models.Agent.update({
        id: agentId,
        status: newStatus,
      });
      fetchAgents();
    } catch (err) {
      setError("Failed to update agent status");
    }
  }

  return (
    <View 
      padding={tokens.space.large}
      backgroundColor={tokens.colors.background.primary}
      height="100%"
    >
      <Flex direction="column" gap={tokens.space.large}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={1} color={tokens.colors.font.primary}>Agent Management</Heading>
          <Button
            variation="primary"
            onClick={() => setShowAddAgent(!showAddAgent)}
          >
            {showAddAgent ? "Cancel" : "Add New Agent"}
          </Button>
        </Flex>

        {error && <Alert variation="error">{error}</Alert>}
        {success && <Alert variation="success">{success}</Alert>}

        {showAddAgent && (
          <Card 
            backgroundColor={tokens.colors.background.secondary}
            borderRadius="medium"
            padding={tokens.space.large}
          >
            <form onSubmit={createAgent}>
              <Flex direction="column" gap={tokens.space.medium}>
                <Heading level={3} color={tokens.colors.font.primary}>Add New Agent</Heading>
                <TextField
                  label="Name"
                  value={newAgent.name}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, name: e.target.value })
                  }
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={newAgent.email}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, email: e.target.value })
                  }
                  required
                />
                <SelectField
                  label="Status"
                  value={newAgent.status}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, status: e.target.value as AgentStatus })
                  }
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="OFFLINE">Offline</option>
                </SelectField>
                <TextField
                  label="Max Concurrent Tickets"
                  type="number"
                  value={newAgent.maxConcurrentTickets.toString()}
                  onChange={(e) =>
                    setNewAgent({
                      ...newAgent,
                      maxConcurrentTickets: parseInt(e.target.value),
                    })
                  }
                />
                <SelectField
                  label="Supervisor"
                  value={newAgent.supervisorId}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, supervisorId: e.target.value })
                  }
                >
                  <option value="">No Supervisor</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id ?? ''}>
                      {agent.name}
                    </option>
                  ))}
                </SelectField>
                <Button type="submit" variation="primary">
                  Create Agent
                </Button>
              </Flex>
            </form>
          </Card>
        )}

        <Card 
          backgroundColor={tokens.colors.background.secondary}
          borderRadius="medium"
          padding={tokens.space.large}
        >
          <Table
            caption="Agents"
            highlightOnHover={true}
          >
            <TableHead>
              <TableRow>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Email</TableCell>
                <TableCell as="th">Status</TableCell>
                <TableCell as="th">Max Tickets</TableCell>
                <TableCell as="th">Categories</TableCell>
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
                        agent.status === "AVAILABLE"
                          ? "success"
                          : agent.status === "BUSY"
                          ? "warning"
                          : "error"
                      }
                    >
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{agent.maxConcurrentTickets}</TableCell>
                  <TableCell>
                    {agent.assignedCategories?.join(", ") || "None"}
                  </TableCell>
                  <TableCell>
                    {agents.find(a => a.id === agent.supervisorId)?.name || "None"}
                  </TableCell>
                  <TableCell>
                    <SelectField
                      label="Change Status"
                      defaultValue={agent.status!}
                      onChange={(e) => updateAgentStatus(agent.id!, e.target.value as AgentStatus)}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="BUSY">Busy</option>
                      <option value="OFFLINE">Offline</option>
                    </SelectField>
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
