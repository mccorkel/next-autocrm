"use client";

import { useState } from 'react';
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
  SelectField,
  View,
  useTheme,
  Alert,
} from '@aws-amplify/ui-react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { signUp } from 'aws-amplify/auth';

export default function UserManagement() {
  const { tokens } = useTheme();
  const { user } = useAuthenticator((context) => [context.user]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const userGroups = user?.signInDetails?.loginId?.split(',') || [];
  const isAdmin = userGroups.includes('ADMIN');
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    group: 'AGENT'
  });

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await signUp({
        username: newUser.email,
        password: newUser.password,
        options: {
          userAttributes: {
            email: newUser.email,
            name: newUser.name,
          },
          autoSignIn: false
        }
      });

      // TODO: Add user to group using Admin API
      
      setSuccess('User created successfully!');
      setShowAddUser(false);
      setNewUser({
        email: '',
        password: '',
        name: '',
        group: 'AGENT'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  return (
    <View padding={tokens.space.large}>
      <Flex direction="column" gap={tokens.space.large}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={1}>User Management</Heading>
          <Button
            variation="primary"
            onClick={() => setShowAddUser(!showAddUser)}
          >
            {showAddUser ? 'Cancel' : 'Add New User'}
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
          <Card>
            <form onSubmit={createUser}>
              <Flex direction="column" gap={tokens.space.medium}>
                <Heading level={3}>Add New User</Heading>
                <TextField
                  label="Name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  required
                />
                <SelectField
                  label="Group"
                  value={newUser.group}
                  onChange={(e) =>
                    setNewUser({ ...newUser, group: e.target.value })
                  }
                >
                  <option value="AGENT">Agent</option>
                  {isAdmin && (
                    <>
                      <option value="SUPER">Supervisor</option>
                      <option value="ADMIN">Admin</option>
                    </>
                  )}
                </SelectField>
                <Button type="submit" variation="primary">
                  Create User
                </Button>
              </Flex>
            </form>
          </Card>
        )}

        <Card>
          <Table
            caption="Users"
            highlightOnHover={true}
          >
            <TableHead>
              <TableRow>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Email</TableCell>
                <TableCell as="th">Group</TableCell>
                <TableCell as="th">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* TODO: List users and their groups */}
            </TableBody>
          </Table>
        </Card>
      </Flex>
    </View>
  );
} 