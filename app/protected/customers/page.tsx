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
  tokens,
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Array<Schema["Customer"]["type"]>>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
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
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  }

  return (
    <Flex 
      direction="column" 
      padding="1rem" 
      gap="2rem"
      backgroundColor={tokens.colors.background.primary}
      minHeight="100vh"
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Heading level={1}>Customer Management</Heading>
        <Button onClick={() => router.push("/protected/employee/agent-dashboard")}>Back to Dashboard</Button>
      </Flex>

      <Card>
        <form onSubmit={createCustomer}>
          <Flex direction="column" gap="1rem">
            <Heading level={3}>Add New Customer</Heading>
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

      <Card>
        <Heading level={2}>Customers</Heading>
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
    </Flex>
  );
}