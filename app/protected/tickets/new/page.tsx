"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import {
  Button,
  Card,
  Flex,
  Heading,
  SelectField,
  TextField,
  TextAreaField,
  View,
  useTheme,
} from "@aws-amplify/ui-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAgent } from "@/app/contexts/AgentContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { Suspense } from "react";
import { useTabContext } from "@/app/contexts/TabContext";

const client = generateClient<Schema>();

type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type TicketCategory = "ACCOUNT" | "BILLING" | "SUPPORT" | "SALES" | "OTHER";
type TicketStatus = "OPEN" | "IN_PROGRESS" | "BLOCKED" | "CLOSED";

function CreateTicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tokens } = useTheme();
  const { currentAgentId, isInitialized } = useAgent();
  const { translations } = useLanguage();
  const { removeTab } = useTabContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customer, setCustomer] = useState<Schema["Customer"]["type"] | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as TicketPriority,
    category: "SUPPORT" as TicketCategory,
    customerId: "",
  });

  // Fetch customer details if customerId is provided in URL
  useEffect(() => {
    async function fetchCustomer() {
      const customerId = searchParams.get('customerId');
      if (customerId) {
        try {
          const response = await client.models.Customer.get({ id: customerId });
          if (response.data) {
            setCustomer(response.data);
            setFormData(prev => ({
              ...prev,
              customerId
            }));
          }
        } catch (error) {
          console.error('Error fetching customer:', error);
        }
      }
    }

    fetchCustomer();
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInitialized || !currentAgentId) return;

    setIsSubmitting(true);
    try {
      // Create the ticket first
      const ticketResponse = await client.models.Ticket.create({
        ...formData,
        status: "OPEN" as TicketStatus,
        assignedAgentId: currentAgentId,
        createdAt: new Date().toISOString(),
      });

      if (ticketResponse.data) {
        // Create a status change activity for the new ticket
        await client.models.TicketActivity.create({
          ticketId: ticketResponse.data.id,
          type: "STATUS_CHANGE",
          content: "Ticket created with status: OPEN",
          agentId: "System",
          createdAt: new Date().toISOString(),
          oldValue: "Created",
          newValue: "OPEN"
        });

        // Close the New Ticket tab
        removeTab('/protected/tickets/new');
        // Navigate to the ticket details page
        router.push(`/protected/tickets/${ticketResponse.data.id}`);
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View 
      padding={tokens.space.large}
      backgroundColor={tokens.colors.background.primary}
    >
      <Card width="100%" maxWidth="800px" margin="0 auto">
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap={tokens.space.medium}>
            <Heading level={2}>Create New Ticket</Heading>

            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter ticket title"
            />

            <TextAreaField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Enter ticket description"
            />

            <SelectField
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </SelectField>

            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="SUPPORT">Support</option>
              <option value="BILLING">Billing</option>
              <option value="SALES">Sales</option>
              <option value="ACCOUNT">Account</option>
              <option value="OTHER">Other</option>
            </SelectField>

            <TextField
              label="Customer"
              name="customerId"
              value={customer ? `${customer.name} (${customer.email})` : formData.customerId}
              onChange={handleChange}
              placeholder="Enter customer ID (optional)"
              isReadOnly={Boolean(customer)}
              descriptiveText={customer ? "Customer pre-selected from previous page" : undefined}
            />

            <Flex gap={tokens.space.medium} justifyContent="flex-end">
              <Button
                onClick={() => router.back()}
                variation="link"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variation="primary"
                isLoading={isSubmitting}
                loadingText="Creating..."
              >
                Create Ticket
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
    </View>
  );
}

export default function CreateTicketPage() {
  return (
    <Suspense>
      <CreateTicketContent />
    </Suspense>
  );
} 