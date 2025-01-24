"use client";

import React, { useState } from 'react';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import {
  Button,
  Card,
  Flex,
  Heading,
  TextField,
  Alert,
  View,
  useTheme,
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

const client = generateClient<Schema>();

function NewCustomerContent() {
  const router = useRouter();
  const { tokens } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await client.models.Customer.create({
        name,
        email,
        company,
        phone
      });

      if (response.data) {
        // Navigate to the customer details page
        router.push(`/protected/customers/${response.data.id}`);
      }
    } catch (err) {
      console.error("Error creating customer:", err);
      setError("Failed to create customer. Please try again.");
    }
  };

  return (
    <View 
      padding={tokens.space.large}
      backgroundColor={tokens.colors.background.primary}
      minHeight="100vh"
    >
      <Card>
        <Flex direction="column" gap={tokens.space.medium}>
          <Heading level={2} color={tokens.colors.font.primary}>Add New Customer</Heading>

          {error && (
            <Alert variation="error">
              {error}
            </Alert>
          )}

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
              <Flex gap={tokens.space.medium}>
                <Button type="submit" variation="primary">
                  Create Customer
                </Button>
                <Button
                  onClick={() => router.push('/protected/customers')}
                  variation="link"
                >
                  Cancel
                </Button>
              </Flex>
            </Flex>
          </form>
        </Flex>
      </Card>
    </View>
  );
}

export default function NewCustomerPage() {
  return (
    <Suspense>
      <NewCustomerContent />
    </Suspense>
  );
} 