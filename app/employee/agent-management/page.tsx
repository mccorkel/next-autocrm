"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";
import {
  Button,
  Card,
  Collection,
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
} from "@aws-amplify/ui-react";

const client = generateClient<Schema>();

type AgentRole = "ADMIN" | "AGENT" | "SUPERVISOR";
type AgentStatus = "AVAILABLE" | "BUSY" | "OFFLINE";

export default function AgentManagement() {
  const { tokens } = useTheme();
  const [agents, setAgents] = useState<Array<Schema["Agent"]["type"]>>([]);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    role: "AGENT" as AgentRole,
    status: "AVAILABLE" as AgentStatus,
    maxConcurrentTickets: 5,
    assignedCategories: [] as string[],
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      const { data } = await client.models.Agent.list();
      setAgents(data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  }

  async function createAgent(e: React.FormEvent) {
    e.preventDefault();
    try {
      await client.models.Agent.create({
        name: newAgent.name,
        email: newAgent.email,
        role: newAgent.role as AgentRole,
        status: newAgent.status as AgentStatus,
        maxConcurrentTickets: newAgent.maxConcurrentTickets,
        assignedCategories: newAgent.assignedCategories,
      });
      setShowAddAgent(false);
      setNewAgent({
        name: "",
        email: "",
        role: "AGENT" as AgentRole,
        status: "AVAILABLE" as AgentStatus,
        maxConcurrentTickets: 5,
        assignedCategories: [],
      });
      fetchAgents();
    } catch (error) {
      console.error("Error creating agent:", error);
    }
  }

  return (
    <View padding={tokens.space.large}>
      <Flex direction="column" gap={tokens.space.large}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={1}>Agent Management</Heading>
          <Button
            variation="primary"
            onClick={() => setShowAddAgent(!showAddAgent)}
          >
            {showAddAgent ? "Cancel" : "Add New Agent"}
          </Button>
        </Flex>

        {showAddAgent && (
          <Card>
            <form onSubmit={createAgent}>
              <Flex direction="column" gap={tokens.space.medium}>
                <Heading level={3}>Add New Agent</Heading>
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
                  label="Role"
                  value={newAgent.role}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, role: e.target.value as AgentRole })
                  }
                >
                  <option value="AGENT">Agent</option>
                  <option value="SUPERVISOR">Supervisor</option>
                </SelectField>
                <SelectField
                  label="Initial Status"
                  value={newAgent.status}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, status: e.target.value as AgentStatus })
                  }
                >
                  <option value="AVAILABLE">Available</option>
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
                <Button type="submit" variation="primary">
                  Create Agent
                </Button>
              </Flex>
            </form>
          </Card>
        )}

        <Card>
          <Table
            caption="Agents"
            highlightOnHover={true}
          >
            <TableHead>
              <TableRow>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Email</TableCell>
                <TableCell as="th">Role</TableCell>
                <TableCell as="th">Status</TableCell>
                <TableCell as="th">Max Tickets</TableCell>
                <TableCell as="th">Categories</TableCell>
                <TableCell as="th">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>{agent.name}</TableCell>
                  <TableCell>{agent.email}</TableCell>
                  <TableCell>{agent.role}</TableCell>
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
                    <Button
                      size="small"
                      onClick={() => {/* TODO: Edit agent */}}
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