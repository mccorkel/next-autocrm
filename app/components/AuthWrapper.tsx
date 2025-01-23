"use client";

import { Amplify } from "aws-amplify";
import { Authenticator, Flex, Alert, View, Text } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { ReactNode } from "react";
import outputs from "@/amplify_outputs.json";
import { AuthUser } from '@aws-amplify/auth';

interface AuthWrapperProps {
  children: ((props: { user?: AuthUser; signOut?: () => void }) => ReactNode) | ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <Flex direction="column" minHeight="100vh">
      <Alert variation="info" isDismissible={true} hasIcon={true}>
        <Flex direction="column" gap="8px">
          <Text fontWeight={600}>Login Information:</Text>
          <Text>Admin: admin@example.com / Admin12345!</Text>
          <Text>Supervisor: super@example.com / Super12345!</Text>
          <Text>Agent: agent@example.com / Agent12345!</Text>
        </Flex>
      </Alert>
      <Flex flex="1" justifyContent="center" alignItems="center">
        <Authenticator hideSignUp>
          {({ signOut, user }) => (
            <View width="100%">
              {typeof children === 'function' ? children({ signOut, user }) : children}
            </View>
          )}
        </Authenticator>
      </Flex>
    </Flex>
  );
}