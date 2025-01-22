"use client";

import { Amplify } from "aws-amplify";
import { Authenticator, Flex, Alert } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { PropsWithChildren } from "react";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

export default function AuthWrapper({ children }: PropsWithChildren) {
  return (
    <Flex direction="column" minHeight="100vh">
      <Alert variation="info" isDismissible={false} hasIcon={true}>
        Login Information:
        <br />
        Admin: admin@example.com / Admin12345!
        <br />
        Supervisor: super@example.com / Super12345!
        <br />
        Agent: agent@example.com / Agent12345!
      </Alert>
      <Flex flex="1" justifyContent="center" alignItems="center">
        <Authenticator hideSignUp>
          {() => (
            <Flex direction="column">
              {children}
            </Flex>
          )}
        </Authenticator>
      </Flex>
    </Flex>
  );
}