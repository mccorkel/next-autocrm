"use client";

import React, { useState, useEffect } from "react";
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
  Text,
} from "@aws-amplify/ui-react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAgent } from "@/app/contexts/AgentContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Suspense } from "react";
import DashboardTabs from '@/app/components/DashboardTabs';

const client = generateClient<Schema>();

type BadgeVariation = "info" | "warning" | "error" | "success";

function AgentDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'all';
  const { tokens } = useTheme();
  const { currentAgentId, isInitialized } = useAgent();
  const { translations } = useLanguage();
  const [tickets, setTickets] = useState<Array<Schema["Ticket"]["type"]>>([]);
  const [allOpenTickets, setAllOpenTickets] = useState<Array<Schema["Ticket"]["type"]>>([]);
  const [assignedOpenTickets, setAssignedOpenTickets] = useState<Array<Schema["Ticket"]["type"]>>([]);
  const [assignedBlockedTickets, setAssignedBlockedTickets] = useState<Array<Schema["Ticket"]["type"]>>([]);
  const [assignedClosedTickets, setAssignedClosedTickets] = useState<Array<Schema["Ticket"]["type"]>>([]);
  const [agents, setAgents] = useState<Array<Schema["Agent"]["type"]>>([]);
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Log view changes
  useEffect(() => {
    console.log('View changed:', {
      currentView,
      currentAgentId,
      isInitialized
    });
  }, [currentView, currentAgentId, isInitialized]);

  // Get user groups
  useEffect(() => {
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
  }, []);

  // Fetch agents
  useEffect(() => {
    async function fetchAgents() {
      try {
        const agentsResponse = await client.models.Agent.list();
        if (agentsResponse.data) {
          setAgents(agentsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    }

    if (isInitialized) {
      fetchAgents();
    }
  }, [isInitialized]);

  // Fetch tickets
  const fetchTickets = async () => {
    if (!isInitialized || !currentAgentId) {
      console.log('Not ready to fetch:', { isInitialized, currentAgentId });
      return;
    }

    setLoading(true);
    try {
      // Fetch all open tickets
      const allOpenTicketsResponse = await client.models.Ticket.list({
        filter: {
          status: {
            ne: 'CLOSED' as const
          }
        }
      });
      const allOpenTicketsData = allOpenTicketsResponse.data || [];
      setAllOpenTickets(allOpenTicketsData);

      // Fetch assigned open tickets
      const assignedOpenTicketsResponse = await client.models.Ticket.list({
        filter: {
          and: [
            { assignedAgentId: { eq: currentAgentId } },
            { status: { eq: 'OPEN' } }
          ]
        }
      });
      const assignedOpenTicketsData = assignedOpenTicketsResponse.data || [];
      setAssignedOpenTickets(assignedOpenTicketsData);

      // Fetch assigned blocked tickets
      const assignedBlockedTicketsResponse = await client.models.Ticket.list({
        filter: {
          and: [
            { assignedAgentId: { eq: currentAgentId } },
            { status: { eq: 'BLOCKED' as const } }
          ]
        }
      });
      const assignedBlockedTicketsData = assignedBlockedTicketsResponse.data || [];
      setAssignedBlockedTickets(assignedBlockedTicketsData);

      // Fetch assigned closed tickets
      const assignedClosedTicketsResponse = await client.models.Ticket.list({
        filter: {
          and: [
            { assignedAgentId: { eq: currentAgentId } },
            { status: { eq: 'CLOSED' as const } }
          ]
        }
      });
      const assignedClosedTicketsData = assignedClosedTicketsResponse.data || [];
      setAssignedClosedTickets(assignedClosedTicketsData);

      // Set current view tickets
      let currentTickets;
      switch (currentView) {
        case 'blocked':
          currentTickets = assignedBlockedTicketsData;
          break;
        case 'closed':
          currentTickets = assignedClosedTicketsData;
          break;
        case 'assigned':
          currentTickets = assignedOpenTicketsData;
          break;
        default:
          currentTickets = allOpenTicketsData;
      }

      const sortedTickets = [...currentTickets].sort((a, b) => {
        const dateA = new Date(a.createdAt || "").getTime();
        const dateB = new Date(b.createdAt || "").getTime();
        return dateB - dateA;
      });
      setTickets(sortedTickets);

      // Log the results for debugging
      console.log('Fetched tickets:', {
        allOpenTickets: allOpenTicketsData.length,
        assignedOpenTickets: assignedOpenTicketsData.length,
        assignedBlockedTickets: assignedBlockedTicketsData.length,
        assignedClosedTickets: assignedClosedTicketsData.length,
        currentView,
        displayedTickets: sortedTickets.length
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentAgentId, isInitialized, currentView]);

  // Helper functions for badge colors
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

  // Render loading state
  if (loading) {
    return (
      <View padding={tokens.space.large}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Render main content
  return (
    <Flex direction="column" gap={tokens.space.large}>
      <Card>
        <Flex direction="column" gap={tokens.space.medium}>
          <Flex justifyContent="space-between" alignItems="center">
            <Heading level={2}>Tickets</Heading>
            <Button
              variation="primary"
              onClick={() => router.push('/protected/tickets/new')}
            >
              Create Ticket
            </Button>
          </Flex>
          
          <DashboardTabs 
            totalOpenTickets={allOpenTickets.length} 
            assignedOpenTickets={assignedOpenTickets.length}
            assignedBlockedTickets={assignedBlockedTickets.length}
            assignedClosedTickets={assignedClosedTickets.length}
          />

          <Table
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
                            if (!isInitialized) return;
                            try {
                              await client.models.Ticket.update({
                                id: ticket.id,
                                assignedAgentId: null
                              });
                              // Refresh all ticket data
                              await fetchTickets();
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
                            if (!isInitialized || !currentAgentId) return;
                            try {
                              await client.models.Ticket.update({
                                id: ticket.id,
                                assignedAgentId: currentAgentId
                              });
                              // Refresh all ticket data
                              await fetchTickets();
                            } catch (error) {
                              console.error('Error assigning ticket:', error);
                            }
                          }}
                          isDisabled={Boolean(
                            !isInitialized ||
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
        </Flex>
      </Card>
    </Flex>
  );
}

export default function AgentDashboard() {
  return (
    <Suspense>
      <AgentDashboardContent />
    </Suspense>
  );
}