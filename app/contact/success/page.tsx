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
import { useLanguage } from "../../contexts/LanguageContext";
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();
  const { tokens } = useTheme();
  const { translations } = useLanguage();

  return (
    <View
      padding={tokens.space.large}
      backgroundColor={tokens.colors.background.primary}
      minHeight="100vh"
    >
      <Card width="100%" maxWidth="800px" margin="0 auto">
        <Flex direction="column" gap={tokens.space.medium} alignItems="center" textAlign="center">
          <CheckCircle size={64} color={tokens.colors.green[60].toString()} />
          
          <Heading level={1}>{translations.contact.success}</Heading>
          
          <Text>
            We have received your message and will get back to you as soon as possible.
          </Text>

          <Button
            onClick={() => router.push("/")}
            variation="primary"
          >
            Return to Home
          </Button>
        </Flex>
      </Card>
    </View>
  );
} 