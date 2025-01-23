"use client";

import React, { useEffect, useState } from 'react';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import {
  Card,
  Flex,
  Heading,
  View,
  useTheme,
  Text,
  Badge,
  Loader,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@aws-amplify/ui-react";
import { useParams } from 'next/navigation';
import { useAgent } from '@/app/contexts/AgentContext';

const client = generateClient<Schema>();

export default function AgentDetailsPage() {
  const { tokens } = useTheme();
  const params = useParams();
  const { currentAgentId } = useAgent();
  const [agent, setAgent] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch agent details
        const agentResponse = await client.models.Agent.get({
          id: params.id as string
        });
        setAgent(agentResponse.data);

        // Fetch tickets assigned to this agent
        const ticketsResponse = await client.models.Ticket.list({
          filter: {
            assignedAgentId: {
              eq: params.id as string
            }
          }
        });
        setTickets(ticketsResponse.data);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching agent details:', err);
        setError('Failed to load agent details. Please try again later.');
        setLoading(false);
      }
    }

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <Flex direction="column" alignItems="center" padding={tokens.space.large}>
        <Loader size="large" />
        <Text>Loading agent details...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert variation="error">
        {error}
      </Alert>
    );
  }

  if (!agent) {
    return (
      <Alert variation="warning">
        Agent not found
      </Alert>
    );
  }

  return (
    <Flex direction="column" gap={tokens.space.large}>
      <Card>
        <Flex direction="column" gap={tokens.space.medium}>
          <Heading level={2}>
            {currentAgentId === params.id ? 'My Profile' : 'Agent Profile'}
          </Heading>
          
          <Flex direction="column" gap={tokens.space.small}>
            <Text>
              <strong>Name:</strong> {agent.name}
            </Text>
            <Text>
              <strong>Email:</strong> {agent.email}
            </Text>
            <Text>
              <strong>Status:</strong>{' '}
              <Badge
                variation={
                  agent.status === "AVAILABLE" ? "success" :
                  agent.status === "BUSY" ? "warning" : "error"
                }
              >
                {agent.status}
              </Badge>
            </Text>
            <Text>
              <strong>Max Concurrent Tickets:</strong> {agent.maxConcurrentTickets}
            </Text>
            {agent.supervisorId && (
              <Text>
                <strong>Supervisor ID:</strong> {agent.supervisorId}
              </Text>
            )}
          </Flex>
        </Flex>
      </Card>

      <Card>
        <Flex direction="column" gap={tokens.space.medium}>
          <Heading level={3}>Assigned Tickets</Heading>
          
          <Table highlightOnHover={true} variation="striped">
            <TableHead>
              <TableRow>
                <TableCell as="th">ID</TableCell>
                <TableCell as="th">Title</TableCell>
                <TableCell as="th">Status</TableCell>
                <TableCell as="th">Priority</TableCell>
                <TableCell as="th">Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id.slice(0, 8)}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>
                    <Badge
                      variation={
                        ticket.status === "OPEN" ? "warning" :
                        ticket.status === "IN_PROGRESS" ? "info" :
                        ticket.status === "RESOLVED" ? "success" : "info"
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variation={
                        ticket.priority === "URGENT" ? "error" :
                        ticket.priority === "HIGH" ? "warning" : "info"
                      }
                    >
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Text textAlign="center">No tickets assigned</Text>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Flex>
      </Card>
    </Flex>
  );
} 