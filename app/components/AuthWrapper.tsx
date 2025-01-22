"use client";

import { Amplify } from "aws-amplify";
import { Authenticator, Flex } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { PropsWithChildren } from "react";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

export default function AuthWrapper({ children }: PropsWithChildren) {
  return (
    <>
      <Authenticator hideSignUp>
        {() => (
          <Flex direction="column">
            {children}
          </Flex>
        )}
      </Authenticator>
    </>
  );
}