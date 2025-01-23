"use client";

import {
  Button,
  Card,
  Accordion,
  Flex,
  Heading,
  Text,
  View,
  Link,
  useTheme,
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import { Suspense } from "react";

function BillingFAQContent() {
  const router = useRouter();
  const { tokens } = useTheme();
  const { translations } = useLanguage();

  return (
    <View 
      padding={tokens.space.large}
      backgroundColor={tokens.colors.background.primary}
      minHeight="100vh"
    >
      <Flex direction="column" gap={tokens.space.large}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={1}>{translations.faq.billing.title}</Heading>
          <Button onClick={() => router.push("/")} variation="link">
            {translations.common.back}
          </Button>
        </Flex>

        <Card>
          <Flex direction="column" gap={tokens.space.medium}>
            <Text>{translations.faq.billing.description}</Text>
            <Accordion.Container>
              {translations.faq.billing.items.map((faq, index) => (
                <Accordion.Item key={index} value={`item-${index}`}>
                  <Accordion.Trigger>
                    <Text fontWeight={tokens.fontWeights.semibold}>
                      {faq.question}
                    </Text>
                  </Accordion.Trigger>
                  <Accordion.Content>
                    <Text padding={tokens.space.small}>
                      {faq.answer}
                    </Text>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Container>
          </Flex>
        </Card>

        <Card>
          <Flex direction="column" alignItems="center" gap={tokens.space.medium}>
            <Heading level={3}>{translations.faq.billing.needHelp.title}</Heading>
            <Text textAlign="center">
              {translations.faq.billing.needHelp.description}
            </Text>
            <Flex direction="row" gap={tokens.space.medium}>
              <Button
                variation="primary"
                onClick={() => router.push("/contact")}
              >
                {translations.faq.billing.needHelp.contactButton}
              </Button>
              <Link
                href="mailto:billing@tigerpanda.tv"
                isExternal
                color={tokens.colors.blue[60]}
              >
                billing@tigerpanda.tv
              </Link>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </View>
  );
}

export default function BillingFAQPage() {
  return (
    <Suspense>
      <BillingFAQContent />
    </Suspense>
  );
} 