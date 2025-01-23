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
import { Suspense } from "react";

function ContactSuccessContent() {
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
          <Heading level={1}>{translations.contact.success}</Heading>
          <Text>{translations.contact.form.description}</Text>
          <Button onClick={() => router.push("/")} variation="primary">
            {translations.common.back}
          </Button>
        </Flex>
      </Card>
    </View>
  );
}

export default function ContactSuccessPage() {
  return (
    <Suspense>
      <ContactSuccessContent />
    </Suspense>
  );
} 