"use client";

import {
  Button,
  Card,
  Accordion,
  Flex,
  Heading,
  Text,
  View,
  useTheme,
  Link,
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";

export default function ProductFAQPage() {
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
          <Heading level={1}>{translations.faq.product.title}</Heading>
          <Button onClick={() => router.push("/")} variation="link">
            {translations.common.back}
          </Button>
        </Flex>

        <Card>
          <Flex direction="column" gap={tokens.space.medium}>
            <Text>{translations.faq.product.description}</Text>
            <Accordion.Container>
              {translations.faq.product.items.map((faq, index) => (
                <Accordion.Item key={index} value={`item-${index}`}>
                  <Accordion.Trigger>
                    <Text fontWeight="bold">{faq.question}</Text>
                  </Accordion.Trigger>
                  <Accordion.Content>
                    <Text padding="10px">{faq.answer}</Text>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Container>
          </Flex>
        </Card>

        <Card>
          <Flex direction="column" alignItems="center" textAlign="center" gap={tokens.space.medium}>
            <Heading level={3}>{translations.faq.product.needHelp?.title}</Heading>
            <Text>
              {translations.faq.product.needHelp?.description}
            </Text>
            <Flex gap={tokens.space.medium}>
              <Button onClick={() => router.push('/contact')}>
                {translations.faq.product.needHelp?.contactButton}
              </Button>
              <Link href="mailto:sales@tigerpanda.tv">sales@tigerpanda.tv</Link>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </View>
  );
} 