"use client";

import React from 'react';
import { useState, useEffect } from "react";
import { fetchAuthSession, signUp } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";
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
  Alert,
  Text,
  View,
  useAuthenticator,
  useTheme,
} from "@aws-amplify/ui-react";

export default function Page() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { tokens } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    group: "AGENT"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const session = await fetchAuthSession();
      const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
      
      if (!groups.includes('ADMIN')) {
        setError("You do not have permission to view users");
        return;
      }

      const credentials = session.credentials;
      if (!credentials) {
        throw new Error("No credentials available");
      }

      const client = new CognitoIdentityProviderClient({
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken
        },
        region: 'us-west-2'
      });

      const command = new ListUsersCommand({
        UserPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID
      });

      const response = await client.send(command);
      const cognitoUsers = response.Users || [];

      const formattedUsers = cognitoUsers.map(user => {
        const attributes = user.Attributes || [];
        const email = attributes.find(attr => attr.Name === 'email')?.Value || '';
        const name = attributes.find(attr => attr.Name === 'name')?.Value || '';

        return {
          username: user.Username,
          email: email,
          name: name,
          enabled: user.Enabled,
          status: user.UserStatus,
          groups: [] // We'll need a separate call to get groups
        };
      });

      setUsers(formattedUsers);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please ensure you have the necessary permissions.");
    } finally {
      setLoading(false);
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const session = await fetchAuthSession();
      const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
      
      if (!groups.includes('ADMIN')) {
        setError("You do not have permission to create users");
        return;
      }

      await signUp({
        username: newUser.email,
        password: newUser.password,
        options: {
          userAttributes: {
            name: newUser.name,
            email: newUser.email
          }
        }
      });

      setSuccess("User created successfully");
      setShowAddUser(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        group: "AGENT"
      });
      fetchUsers();
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  }

  if (loading) {
    return (
      <View 
        padding={tokens.space.large}
        backgroundColor={tokens.colors.background.primary}
        height="100%"
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View 
      padding={tokens.space.large}
      backgroundColor={tokens.colors.background.primary}
      height="100%"
    >
      <Flex direction="column" gap={tokens.space.medium}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={2} color={tokens.colors.font.primary}>User Management</Heading>
          <Button onClick={() => setShowAddUser(!showAddUser)}>
            {showAddUser ? "Cancel" : "Add User"}
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

        {showAddUser && (
          <Card 
            backgroundColor={tokens.colors.background.secondary}
            borderRadius="medium"
            padding={tokens.space.large}
          >
            <form onSubmit={createUser}>
              <Flex direction="column" gap={tokens.space.medium}>
                <TextField
                  label="Name"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
                <Button type="submit" variation="primary">Create User</Button>
              </Flex>
            </form>
          </Card>
        )}

        <Card 
          backgroundColor={tokens.colors.background.secondary}
          borderRadius="medium"
          padding={tokens.space.large}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell as="th">Username</TableCell>
                <TableCell as="th">Email</TableCell>
                <TableCell as="th">Status</TableCell>
                <TableCell as="th">Groups</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.enabled ? "Active" : "Disabled"}</TableCell>
                  <TableCell>{user.groups?.join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Flex>
    </View>
  );
} 