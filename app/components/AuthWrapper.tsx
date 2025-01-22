"use client";

import { Amplify } from "aws-amplify";
import { Authenticator, Flex, Button, Alert } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { PropsWithChildren } from "react";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

export default function AuthWrapper({ children }: PropsWithChildren) {
  return (
    <>
      <Alert variation="info" isDismissible={false} hasIcon={true}>
        Login Information:
        <br />
        Admin: admin@example.com / Admin12345!
        <br />
        Supervisor: super@example.com / Super12345!
        <br />
        Agent: agent@example.com / Agent12345!
      </Alert>
      <Authenticator hideSignUp>
        {({ signOut }) => (
          <Flex direction="column">
            <Flex
              as="nav"
              padding="1rem"
              backgroundColor="white"
              justifyContent="flex-end"
            >
              <Button onClick={signOut}>Sign Out</Button>
            </Flex>
            <main style={{ padding: "1rem" }}>{children}</main>
          </Flex>
        )}
      </Authenticator>
    </>
  );
}