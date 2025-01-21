"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
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
  Text
} from "@aws-amplify/ui-react";

Amplify.configure(outputs);

export default function CRMDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Array<Schema['Ticket']['type']>>([]);
  const client = generateClient<Schema>();

  useEffect(() => {
    async function fetchTickets() {
      try {
        const { data: fetchedTickets } = await client.models.Ticket.list();
        setTickets(fetchedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    }

    fetchTickets();
  }, [client]);

  async function createTicket() {
    const title = window.prompt("Ticket title");
    if (!title) return;
    
    const description = window.prompt("Ticket description");
    if (!description) return;

    await client.models.Ticket.create({
      title,
      description,
      status: "OPEN",
      priority: "MEDIUM",
      customerId: "temp-customer", // In a real app, this would come from selection
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <Flex direction="column" padding="1rem">
      <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
        <Heading level={1}>Ticket Dashboard</Heading>
        <Button variation="primary" onClick={createTicket}>
          Create New Ticket
        </Button>
      </Flex>
      <Collection
        type="list"
        items={tickets}
        gap="1rem"
      >
        {(ticket) => (
          <Card key={ticket.id}>
            <Flex direction="column" gap="0.5rem">
              <Heading level={2}>{ticket.title}</Heading>
              <Text>{ticket.description}</Text>
              <Flex gap="0.5rem">
                <Badge variation="info">{ticket.status}</Badge>
                <Badge variation="warning">{ticket.priority}</Badge>
              </Flex>
            </Flex>
          </Card>
        )}
      </Collection>
    </Flex>
  );
}
