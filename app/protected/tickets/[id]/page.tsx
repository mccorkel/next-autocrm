"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import {
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  View,
  useTheme,
} from "@aws-amplify/ui-react";
import { useParams, useRouter } from "next/navigation";
import { useAgent } from "@/app/contexts/AgentContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { Suspense } from "react";

const client = generateClient<Schema>();

type BadgeVariation = "info" | "warning" | "error" | "success";

function TicketDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const { tokens } = useTheme();
  const { currentAgentId, isInitialized } = useAgent();
  const { translations } = useLanguage();
  const [ticket, setTicket] = useState<Schema["Ticket"]["type"] | null>(null);
  const [customer, setCustomer] = useState<Schema["Customer"]["type"] | null>(null);
  const [assignedAgent, setAssignedAgent] = useState<Schema["Agent"]["type"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTicketDetails() {
      if (!params.id) return;

      try {
        setLoading(true);
        // Fetch ticket
        const ticketResponse = await client.models.Ticket.get({ id: params.id as string });
        if (ticketResponse.data) {
          setTicket(ticketResponse.data);

          // Fetch customer if available
          if (ticketResponse.data.customerId) {
            const customerResponse = await client.models.Customer.get({ 
              id: ticketResponse.data.customerId 
            });
            setCustomer(customerResponse.data);
          }

          // Fetch assigned agent if available
          if (ticketResponse.data.assignedAgentId) {
            const agentResponse = await client.models.Agent.get({ 
              id: ticketResponse.data.assignedAgentId 
            });
            setAssignedAgent(agentResponse.data);
          }
        }
      } catch (error) {
        console.error("Error fetching ticket details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTicketDetails();
  }, [params.id]);

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

  if (loading) {
    return (
      <View padding={tokens.space.large}>
        <Text>Loading ticket details...</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View padding={tokens.space.large}>
        <Text>Ticket not found</Text>
      </View>
    );
  }

  return (
    <View padding={tokens.space.large}>
      <Card>
        <Flex direction="column" gap={tokens.space.medium}>
          <Flex justifyContent="space-between" alignItems="center">
            <Heading level={2}>{ticket.title}</Heading>
            <Flex gap={tokens.space.small}>
              <Badge variation={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
              <Badge variation={getStatusColor(ticket.status)}>
                {ticket.status}
              </Badge>
            </Flex>
          </Flex>

          <Text>{ticket.description}</Text>

          <Flex direction="column" gap={tokens.space.small}>
            <Text>
              <strong>Category:</strong> {ticket.category}
            </Text>
            <Text>
              <strong>Created:</strong> {new Date(ticket.createdAt || "").toLocaleString()}
            </Text>
            <Text>
              <strong>Last Updated:</strong> {new Date(ticket.updatedAt || "").toLocaleString()}
            </Text>
            {customer && (
              <Text>
                <strong>Customer:</strong>{" "}
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/protected/customers/${customer.id}`);
                  }}
                  href="#"
                  style={{
                    color: '#007EB9',
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {customer.name} ({customer.email})
                </a>
              </Text>
            )}
            {assignedAgent && (
              <Text>
                <strong>Assigned To:</strong>{" "}
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
              </Text>
            )}
          </Flex>

          <Flex gap={tokens.space.medium} justifyContent="flex-end">
            <Button
              onClick={() => router.push('/protected/employee/agent-dashboard')}
              variation="link"
            >
              Back to Dashboard
            </Button>
            {ticket.status !== 'CLOSED' && (
              <Button
                variation="primary"
                onClick={async () => {
                  if (!isInitialized) return;
                  try {
                    await client.models.Ticket.update({
                      id: ticket.id,
                      status: 'CLOSED' as const
                    });
                    router.push('/protected/employee/agent-dashboard');
                  } catch (error) {
                    console.error('Error closing ticket:', error);
                  }
                }}
              >
                Close Ticket
              </Button>
            )}
          </Flex>
        </Flex>
      </Card>
    </View>
  );
}

export default function TicketDetailsPage() {
  return (
    <Suspense>
      <TicketDetailsContent />
    </Suspense>
  );
}