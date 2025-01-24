"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from 'aws-amplify/auth';
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import outputs from "@/amplify_outputs.json";
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
  TextField,
  useTheme,
  View,
  Alert,
  Text,
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAgent } from "../../contexts/AgentContext";
import { Suspense } from "react";

Amplify.configure(outputs);
const client = generateClient<Schema>();

type CustomerType = Schema["Customer"]["type"];

function CustomerManagementContent() {
  const { tokens } = useTheme();
  const { translations } = useLanguage();
  const { currentAgentId } = useAgent();
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const customersResponse = await client.models.Customer.list();
        if (customersResponse.data) {
          setCustomers(customersResponse.data);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        setError('Failed to load customers. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  async function sendTestEmail(customerEmail: string | null | undefined) {
    if (!customerEmail) {
      setEmailStatus({ type: 'error', message: 'Invalid email address' });
      return;
    }

    try {
      setEmailStatus(null);
      const session = await fetchAuthSession();
      const credentials = session.credentials;
      
      if (!credentials) {
        throw new Error("No credentials available");
      }

      const sesClient = new SESClient({
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken
        },
        region: 'us-west-2' // Update this to your SES region
      });

      const command = new SendEmailCommand({
        Source: "support@tigerpanda.tv", // Update this to your verified SES sender
        Destination: {
          ToAddresses: [customerEmail],
        },
        Message: {
          Subject: {
            Data: "Test Email from AutoCRM",
          },
          Body: {
            Text: {
              Data: "This is a test email from your AutoCRM system. If you received this, the email functionality is working correctly.",
            },
          },
        },
      });

      await sesClient.send(command);
      setEmailStatus({ type: 'success', message: 'Test email sent successfully!' });
    } catch (error) {
      console.error("Error sending test email:", error);
      setEmailStatus({ type: 'error', message: 'Failed to send test email. Please check your SES configuration.' });
    }
  }

  async function createCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;

    try {
      await client.models.Customer.create({
        name,
        email,
        company,
        phone,
      });
      setName("");
      setEmail("");
      setCompany("");
      setPhone("");
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  }

  if (loading) {
    return (
      <View 
        padding={tokens.space.large}
        backgroundColor={tokens.colors.background.primary}
        minHeight="100vh"
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View 
      padding={tokens.space.large}
      backgroundColor={tokens.colors.background.primary}
      minHeight="100vh"
    >
      <Flex direction="column" gap={tokens.space.medium}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={2} color={tokens.colors.font.primary}>Customer Management</Heading>
          <Button
            variation="primary"
            onClick={() => router.push('/protected/customers/new')}
          >
            Add New Customer
          </Button>
        </Flex>

        {error && (
          <Alert variation="error">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variation="success">
            {success}
          </Alert>
        )}

        <Card>
          <Table highlightOnHover={true}>
            <TableHead>
              <TableRow>
                <TableCell as="th">Email</TableCell>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Company</TableCell>
                <TableCell as="th">Phone</TableCell>
                <TableCell as="th">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
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
                      {customer.email}
                    </a>
                  </TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.company}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => {
                        router.push(`/protected/tickets/new?customerId=${customer.id}`);
                      }}
                    >
                      Create New Customer Ticket
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Text textAlign="center">No customers found</Text>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </Flex>
    </View>
  );
}

export default function CustomerManagementPage() {
  return (
    <Suspense>
      <CustomerManagementContent />
    </Suspense>
  );
}