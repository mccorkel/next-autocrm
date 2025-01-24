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
  Button,
  TextField,
  SelectField,
  CheckboxField,
} from "@aws-amplify/ui-react";
import { useParams } from 'next/navigation';
import { useAgent } from '@/app/contexts/AgentContext';
import { fetchAuthSession } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } from "@aws-sdk/client-cognito-identity-provider";
import outputs from "@/amplify_outputs.json";

const client = generateClient<Schema>();

type AgentStatus = "AVAILABLE" | "BUSY" | "OFFLINE";
type TicketCategory = "ACCOUNT" | "BILLING" | "SUPPORT" | "SALES" | "OTHER";
type TicketStatus = "OPEN" | "IN_PROGRESS" | "BLOCKED" | "CLOSED";
const TICKET_CATEGORIES: TicketCategory[] = ["ACCOUNT", "BILLING", "SUPPORT", "SALES", "OTHER"];

export default function AgentDetailsPage() {
  const { tokens } = useTheme();
  const params = useParams();
  const { currentAgentId } = useAgent();
  const [agent, setAgent] = useState<Schema["Agent"]["type"] | null>(null);
  const [tickets, setTickets] = useState<Schema["Ticket"]["type"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [editForm, setEditForm] = useState({
    name: '',
    status: 'AVAILABLE' as AgentStatus,
    maxConcurrentTickets: 0,
    assignedCategories: [] as TicketCategory[],
  });

  // Check if user has permission to edit
  const canEdit = userGroups.some(group => ['ADMIN', 'SUPER'].includes(group)) || 
                 (agent?.supervisorId === currentAgentId);

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
        
        // Initialize edit form with current values
        if (agentResponse.data) {
          setEditForm({
            name: agentResponse.data.name || '',
            status: (agentResponse.data.status as AgentStatus) || 'AVAILABLE',
            maxConcurrentTickets: agentResponse.data.maxConcurrentTickets || 5,
            assignedCategories: (agentResponse.data.assignedCategories?.filter(Boolean) as TicketCategory[]) || [],
          });
        }

        // Fetch tickets assigned to this agent
        const ticketsResponse = await client.models.Ticket.list({
          filter: {
            assignedAgentId: {
              eq: params.id as string
            }
          }
        });
        setTickets(ticketsResponse.data || []);

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

  const handleSave = async () => {
    try {
      if (!agent?.id || !agent.email) return;

      // Update agent in database
      await client.models.Agent.update({
        id: agent.id,
        name: editForm.name,
        status: editForm.status as AgentStatus,
        maxConcurrentTickets: editForm.maxConcurrentTickets,
        assignedCategories: editForm.assignedCategories,
      });

      // Update Cognito user attributes
      const session = await fetchAuthSession();
      const credentials = session.credentials;

      if (credentials) {
        const cognitoClient = new CognitoIdentityProviderClient({
          credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken
          },
          region: 'us-west-2'
        });

        const updateAttributesCommand = new AdminUpdateUserAttributesCommand({
          UserPoolId: outputs.auth.user_pool_id,
          Username: agent.email,
          UserAttributes: [
            {
              Name: 'name',
              Value: editForm.name
            }
          ]
        });

        await cognitoClient.send(updateAttributesCommand);
      }

      // Refresh agent data
      const response = await client.models.Agent.get({ id: agent.id });
      if (response.data) {
        setAgent(response.data);
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Error updating agent:', err);
      setError('Failed to update agent details. Please try again later.');
    }
  };

  const toggleCategory = (category: TicketCategory) => {
    setEditForm(prev => ({
      ...prev,
      assignedCategories: prev.assignedCategories.includes(category)
        ? prev.assignedCategories.filter(c => c !== category)
        : [...prev.assignedCategories, category]
    }));
  };

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
          <Flex justifyContent="space-between" alignItems="center">
            <Heading level={2}>
              {currentAgentId === params.id ? 'My Profile' : 'Agent Profile'}
            </Heading>
            {canEdit && (
              <Button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            )}
          </Flex>
          
          <Flex direction="column" gap={tokens.space.small}>
            {isEditing ? (
              <>
                <TextField
                  label="Name"
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
                <SelectField
                  label="Status"
                  value={editForm.status}
                  onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value as AgentStatus }))}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="OFFLINE">Offline</option>
                </SelectField>
                <TextField
                  label="Max Concurrent Tickets"
                  type="number"
                  value={editForm.maxConcurrentTickets.toString()}
                  onChange={e => setEditForm(prev => ({ ...prev, maxConcurrentTickets: parseInt(e.target.value) || 0 }))}
                />
                <Text><strong>Assigned Categories:</strong></Text>
                <Flex gap={tokens.space.small} wrap="wrap">
                  {TICKET_CATEGORIES.map(category => (
                    <CheckboxField
                      key={category}
                      label={category}
                      name="categories"
                      value={category}
                      checked={editForm.assignedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                  ))}
                </Flex>
              </>
            ) : (
              <>
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
                <Text>
                  <strong>Assigned Categories:</strong>
                </Text>
                <Flex gap={tokens.space.xs} wrap="wrap">
                  {agent.assignedCategories?.map((category, index) => (
                    <Badge key={index} variation="info">
                      {category}
                    </Badge>
                  ))}
                  {(!agent.assignedCategories || agent.assignedCategories.length === 0) && (
                    <Text color="gray">No categories assigned</Text>
                  )}
                </Flex>
                {agent.supervisorId && (
                  <Text>
                    <strong>Supervisor ID:</strong> {agent.supervisorId}
                  </Text>
                )}
              </>
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
                  <TableCell>{ticket.id?.slice(0, 8)}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>
                    <Badge
                      variation={
                        ticket.status === "OPEN" ? "warning" :
                        ticket.status === "IN_PROGRESS" ? "info" :
                        ticket.status === "BLOCKED" ? "error" : "info"
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
                    {new Date(ticket.createdAt || "").toLocaleDateString()}
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