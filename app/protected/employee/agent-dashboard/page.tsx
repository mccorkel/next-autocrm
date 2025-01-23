"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import {
  Button,
  Card,
  Collection,
  Flex,
  Heading,
  SelectField,
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  Badge,
  View,
  useTheme,
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { type AuthUser } from '@aws-amplify/auth';
import { checkAndCreateAgent } from "@/app/utils/agent";
import { Amplify } from "aws-amplify";
import { useAgent } from "@/app/contexts/AgentContext";

const client = generateClient<Schema>();

type BadgeVariation = "info" | "warning" | "error" | "success";

export default function AgentDashboard() {
  const router = useRouter();
  const { tokens } = useTheme();
  const { currentAgentId, isInitialized: isAgentInitialized, isLoading } = useAgent();
  const [tickets, setTickets] = useState<Array<Schema["Ticket"]["type"]>>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [agents, setAgents] = useState<Array<Schema["Agent"]["type"]>>([]);
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [isAmplifyConfigured, setIsAmplifyConfigured] = useState(false);

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

  // Get user groups when Amplify is configured
  useEffect(() => {
    if (!isAmplifyConfigured) return;

    async function getUserGroups() {
      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
        setUserGroups(groups);
      } catch (error) {
        console.error('Error getting user groups:', error);
      }
    }
    
    getUserGroups();
  }, [isAmplifyConfigured]);

  // Fetch data when agent is initialized
  useEffect(() => {
    if (!isAmplifyConfigured || !isAgentInitialized || !currentAgentId) {
      console.log('Waiting for initialization:', {
        isAmplifyConfigured,
        isAgentInitialized,
        currentAgentId
      });
      return;
    }
    
    console.log('Fetching data with agent ID:', currentAgentId);
    fetchTickets();
    fetchAgents();
  }, [statusFilter, isAmplifyConfigured, isAgentInitialized, currentAgentId]);

  async function fetchAgents() {
    if (!isAgentInitialized || !currentAgentId) return;
    try {
      const { data } = await client.models.Agent.list();
      setAgents(data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  }

  async function fetchTickets() {
    if (!isAgentInitialized || !currentAgentId) return;
    try {
      const filter = statusFilter !== "all" 
        ? { status: { eq: statusFilter } }
        : undefined;

      const { data } = await client.models.Ticket.list({
        filter,
      });
      
      // Sort tickets in memory since DataStore doesn't support sorting
      const sortedTickets = [...data].sort((a, b) => {
        const dateA = new Date(a.createdAt || "").getTime();
        const dateB = new Date(b.createdAt || "").getTime();
        return dateB - dateA;
      });
      
      setTickets(sortedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  }

  function getPriorityColor(priority: string | null | undefined): BadgeVariation {
    switch (priority) {
      case "URGENT":
        return "error";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      default:
        return "info";
    }
  }

  function getStatusColor(status: string | null | undefined): BadgeVariation {
    switch (status) {
      case "OPEN":
        return "warning";
      case "IN_PROGRESS":
        return "info";
      case "RESOLVED":
        return "success";
      case "CLOSED":
        return "info";
      default:
        return "info";
    }
  }

  return (
    <Flex 
      direction="column" 
      gap={tokens.space.large}
      width="100%"
      flex="1"
      style={{
        minHeight: 0,
        display: 'flex'
      }}
    >
      <Flex justifyContent="space-between" alignItems="center" width="100%">
        <Heading level={1}>Agent Dashboard</Heading>
        <SelectField
          label="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Tickets</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </SelectField>
      </Flex>

      <Card
        padding={tokens.space.medium}
        borderRadius="medium"
        backgroundColor={tokens.colors.background.secondary}
        variation="outlined"
        width="100%"
        flex="1"
        style={{
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <View
          width="100%"
          flex="1"
          style={{
            overflowX: 'auto',
            overflowY: 'auto',
            minHeight: 0
          }}
        >
          <Table
            caption="Support Tickets"
            highlightOnHover={true}
            variation="striped"
            size="small"
          >
            <TableHead>
              <TableRow>
                <TableCell as="th">ID</TableCell>
                <TableCell as="th">Title</TableCell>
                <TableCell as="th">Status</TableCell>
                <TableCell as="th">Priority</TableCell>
                <TableCell as="th">Category</TableCell>
                <TableCell as="th">Customer ID</TableCell>
                <TableCell as="th">Assigned To</TableCell>
                <TableCell as="th">Created</TableCell>
                <TableCell as="th">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => {
                const assignedAgent = agents.find(agent => agent.id === ticket.assignedAgentId);
                const ticketUrl = `/protected/tickets/${ticket.id}`;
                return (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <a 
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(ticketUrl);
                        }}
                        href="#"
                        style={{
                          color: '#007EB9',
                          textDecoration: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {ticket.id?.slice(0, 8)}
                      </a>
                    </TableCell>
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell>
                      <Badge variation={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variation={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.category}</TableCell>
                    <TableCell>
                      {ticket.customerId ? (
                        <a 
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/protected/customers/${ticket.customerId}`);
                          }}
                          href="#"
                          style={{
                            color: '#007EB9',
                            textDecoration: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {ticket.customerId.slice(0, 8)}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {assignedAgent ? (
                        <a 
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/protected/agents/${assignedAgent.id}`);
                          }}
                          href="#"
                          style={{
                            color: '#007EB9',
                            textDecoration: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {assignedAgent.email}
                        </a>
                      ) : (
                        <Badge variation="warning">
                          Unassigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(ticket.createdAt || "").toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {ticket.assignedAgentId && ticket.assignedAgentId === currentAgentId ? (
                        <Button
                          size="small"
                          onClick={async () => {
                            if (!isAgentInitialized) return;
                            try {
                              await client.models.Ticket.update({
                                id: ticket.id,
                                assignedAgentId: null
                              });
                              fetchTickets();
                            } catch (error) {
                              console.error('Error unassigning ticket:', error);
                            }
                          }}
                        >
                          Unassign
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          onClick={async () => {
                            if (!isAgentInitialized || !currentAgentId) return;
                            try {
                              await client.models.Ticket.update({
                                id: ticket.id,
                                assignedAgentId: currentAgentId
                              });
                              fetchTickets();
                            } catch (error) {
                              console.error('Error assigning ticket:', error);
                            }
                          }}
                          isDisabled={Boolean(
                            !isAgentInitialized ||
                            (ticket.assignedAgentId && 
                            !userGroups.some(group => ['ADMIN', 'SUPER'].includes(group)))
                          )}
                        >
                          {!ticket.assignedAgentId ? 'Assign To Me' : 'Take Over'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </View>
      </Card>
    </Flex>
  );
}