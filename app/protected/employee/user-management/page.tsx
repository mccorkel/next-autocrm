"use client";

import React from 'react';
import { useState, useEffect } from "react";
import { fetchAuthSession, signUp } from 'aws-amplify/auth';
import { 
  CognitoIdentityProviderClient, 
  ListUsersCommand, 
  AdminListGroupsForUserCommand,
  AdminAddUserToGroupCommand
} from "@aws-sdk/client-cognito-identity-provider";
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
  Alert,
  Text,
  View,
  useAuthenticator,
  useTheme,
  Badge,
  SelectField,
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
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

  // Check user permissions and redirect if necessary
  useEffect(() => {
    async function checkPermissions() {
      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
        
        if (!groups.includes('ADMIN')) {
          router.push('/protected/employee/agent-dashboard');
        }
      } catch (err) {
        console.error("Error checking permissions:", err);
        router.push('/protected/employee/agent-dashboard');
      }
    }
    
    checkPermissions();
  }, [router]);

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

      const userPoolId = outputs.auth.user_pool_id;
      if (!userPoolId) {
        setError("System configuration error: User Pool ID is not configured. Please contact your administrator.");
        return;
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
        UserPoolId: userPoolId
      });

      const response = await client.send(command);
      const cognitoUsers = response.Users || [];

      // Fetch groups for each user
      const formattedUsers = await Promise.all(cognitoUsers.map(async user => {
        const attributes = user.Attributes || [];
        const email = attributes.find(attr => attr.Name === 'email')?.Value || '';
        const name = attributes.find(attr => attr.Name === 'name')?.Value || '';

        // Get user's groups
        const listGroupsCommand = new AdminListGroupsForUserCommand({
          UserPoolId: outputs.auth.user_pool_id,
          Username: user.Username || '',
        });
        
        try {
          const groupsResponse = await client.send(listGroupsCommand);
          const groups = groupsResponse.Groups?.map(group => group.GroupName) || [];

          return {
            username: user.Username,
            email: email,
            name: name,
            enabled: user.Enabled,
            status: user.UserStatus,
            groups: groups
          };
        } catch (err) {
          console.error("Error fetching groups for user:", err);
          return {
            username: user.Username,
            email: email,
            name: name,
            enabled: user.Enabled,
            status: user.UserStatus,
            groups: []
          };
        }
      }));

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

      // Create the user
      const signUpResult = await signUp({
        username: newUser.email,
        password: newUser.password,
        options: {
          userAttributes: {
            name: newUser.name,
            email: newUser.email
          }
        }
      });

      if (!signUpResult.userId) {
        throw new Error("Failed to create user - no user ID returned");
      }

      // Add user to their group
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

      const addToGroupCommand = new AdminAddUserToGroupCommand({
        UserPoolId: outputs.auth.user_pool_id,
        Username: newUser.email,
        GroupName: newUser.group
      });

      await client.send(addToGroupCommand);

      setSuccess("User created successfully and added to group: " + newUser.group);
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
                <SelectField
                  label="Group"
                  value={newUser.group}
                  onChange={e => setNewUser({ ...newUser, group: e.target.value })}
                >
                  <option value="AGENT">Agent</option>
                  <option value="SUPER">Supervisor</option>
                  <option value="ADMIN">Admin</option>
                </SelectField>
                <Button type="submit" variation="primary">Create User</Button>
              </Flex>
            </form>
          </Card>
        )}

        <Card>
          <Table highlightOnHover={true}>
            <TableHead>
              <TableRow>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Email</TableCell>
                <TableCell as="th">Status</TableCell>
                <TableCell as="th">Groups</TableCell>
                <TableCell as="th">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.username}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variation={user.enabled ? "success" : "error"}
                    >
                      {user.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Flex gap={tokens.space.xs}>
                      {user.groups.map((group: string, index: number) => (
                        <Badge
                          key={index}
                          variation={
                            group === "ADMIN" ? "error" :
                            group === "SUPER" ? "warning" : "info"
                          }
                        >
                          {group}
                        </Badge>
                      ))}
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => {/* TODO: Add edit functionality */}}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Flex>
    </View>
  );
} 