"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
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
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function CustomerManagement() {
  const { tokens } = useTheme();
  const [customers, setCustomers] = useState<Array<Schema["Customer"]["type"]>>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    listCustomers();
  }, []);

  function listCustomers() {
    client.models.Customer.observeQuery().subscribe({
      next: (data) => setCustomers([...data.items]),
    });
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
      setShowAddForm(false);
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  }

  return (
    <View 
      padding={tokens.space.large}
      backgroundColor={tokens.colors.background.primary}
      minHeight="100vh"
    >
      <Flex direction="column" gap={tokens.space.large}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={1}>Customer Management</Heading>
        </Flex>

        <Card>
          <Table highlightOnHover={true}>
            <TableHead>
              <TableRow>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Email</TableCell>
                <TableCell as="th">Company</TableCell>
                <TableCell as="th">Phone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.company}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Flex justifyContent="center">
          <Button
            variation="primary"
            size="large"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel" : "Add New Customer"}
          </Button>
        </Flex>

        {showAddForm && (
          <Card>
            <Heading level={2} paddingBottom={tokens.space.medium}>Add New Customer</Heading>
            <form onSubmit={createCustomer}>
              <Flex direction="column" gap={tokens.space.medium}>
                <TextField
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <TextField
                  label="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
                <TextField
                  label="Phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button type="submit" variation="primary">
                  Add Customer
                </Button>
              </Flex>
            </form>
          </Card>
        )}
      </Flex>
    </View>
  );
}