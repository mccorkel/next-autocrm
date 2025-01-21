"use client";

import {
  Button,
  Card,
  Flex,
  Heading,
  Text,
  View,
  useTheme,
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();
  const { tokens } = useTheme();

  return (
    <View padding={tokens.space.large}>
      <Flex direction="column" alignItems="center" gap={tokens.space.large}>
        <Card width="100%" maxWidth="800px">
          <Flex direction="column" gap={tokens.space.medium} alignItems="center">
            <Heading level={1}>Thank You!</Heading>
            <Text textAlign="center">
              Your support request has been submitted successfully. Our team will review it and get back to you as soon as possible.
            </Text>
            <Text variation="secondary" textAlign="center">
              You will receive a confirmation email with your ticket details.
            </Text>
            <Button
              variation="primary"
              onClick={() => router.push("/")}
            >
              Return to Home
            </Button>
          </Flex>
        </Card>
      </Flex>
    </View>
  );
} 