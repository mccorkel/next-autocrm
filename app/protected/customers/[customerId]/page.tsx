"use client";

import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import {
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
  Divider,
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";

const client = generateClient<Schema>();

type BadgeVariation = "info" | "warning" | "error" | "success";

export default function CustomerDetails({ params }: { params: { customerId: string } }) {
  const { tokens } = useTheme();
  const router = useRouter();
  const [customer, setCustomer] = useState<Schema["Customer"]["type"] | null>(null);
  const [tickets, setTickets] = useState<Array<Schema["Ticket"]["type"]>>([]);

  useEffect(() => {
    fetchCustomerDetails();
    fetchCustomerTickets();
  }, []);

  async function fetchCustomerDetails() {
    try {
      const { data } = await client.models.Customer.get({ id: params.customerId });
      if (data) {
        setCustomer(data);
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  }

  async function fetchCustomerTickets() {
    try {
      const { data } = await client.models.Ticket.list({
        filter: {
          customerId: { eq: params.customerId }
        }
      });
      
      // Sort tickets by creation date
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

  if (!customer) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100%">
        <Text>Loading customer details...</Text>
      </Flex>
    );
  }

  return (
    <Flex 
      direction="column" 
      gap={tokens.space.large}
      padding={tokens.space.large}
      width="100%"
    >
      <Heading level={1}>Customer Details</Heading>
      
      <Card
        padding={tokens.space.medium}
        borderRadius="medium"
        variation="outlined"
      >
        <Flex direction="column" gap={tokens.space.small}>
          <Heading level={3}>Profile Information</Heading>
          <Flex direction="column" gap={tokens.space.xsmall}>
            <Text>
              <strong>ID:</strong> {customer.id}
            </Text>
            <Text>
              <strong>Name:</strong> {customer.name}
            </Text>
            <Text>
              <strong>Email:</strong> {customer.email}
            </Text>
            <Text>
              <strong>Created:</strong> {new Date(customer.createdAt || "").toLocaleDateString()}
            </Text>
          </Flex>
        </Flex>
      </Card>

      <Divider />

      <Card
        padding={tokens.space.medium}
        borderRadius="medium"
        variation="outlined"
      >
        <Flex direction="column" gap={tokens.space.medium}>
          <Heading level={3}>Support Tickets</Heading>
          
          <View
            width="100%"
            style={{
              overflowX: 'auto'
            }}
          >
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
                  <TableCell as="th">Category</TableCell>
                  <TableCell as="th">Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <a 
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/protected/tickets/${ticket.id}`);
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
                    <TableCell>{ticket.category}</TableCell>
                    <TableCell>
                      {new Date(ticket.createdAt || "").toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </View>
        </Flex>
      </Card>
    </Flex>
  );
} 