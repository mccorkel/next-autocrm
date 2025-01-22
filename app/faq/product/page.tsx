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

const productFaqs = [
  {
    question: "What features are included in each plan?",
    answer: "Our plans include varying levels of features such as ticket management, knowledge base access, AI-powered responses, and analytics. Visit our pricing page for a detailed comparison of features across different plans.",
  },
  {
    question: "Can I integrate with other tools?",
    answer: "Yes, we offer integrations with popular tools including Slack, Microsoft Teams, Jira, and major email providers. Custom integrations are available for enterprise customers.",
  },
  {
    question: "Is there a limit on the number of tickets?",
    answer: "Each plan has different ticket volume limits. Basic plans include up to 1,000 tickets per month, while higher tiers offer unlimited tickets. Enterprise plans can be customized based on your needs.",
  },
  {
    question: "What kind of support do you provide?",
    answer: "We offer email support for all plans, with additional phone and priority support for higher tiers. Enterprise customers receive dedicated account management and 24/7 support.",
  },
  {
    question: "Do you offer a trial period?",
    answer: "Yes, we offer a 14-day free trial of our Professional plan with full access to all features. No credit card is required to start your trial.",
  },
];

export default function ProductFAQPage() {
  const router = useRouter();
  const { tokens } = useTheme();

  return (
    <View 
      padding={tokens.space.large}
      backgroundColor={tokens.colors.background.primary}
      minHeight="100vh"
    >
      <Flex direction="column" gap={tokens.space.large}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={1}>Product FAQ</Heading>
          <Button onClick={() => router.push("/")} variation="link">
            Back to Home
          </Button>
        </Flex>

        <Flex direction="column" gap={tokens.space.medium}>
          {productFaqs.map((faq, index) => (
            <Card key={index} variation="outlined">
              <Flex direction="column" gap={tokens.space.small}>
                <Heading level={3}>{faq.question}</Heading>
                <Text>{faq.answer}</Text>
              </Flex>
            </Card>
          ))}
        </Flex>

        <Card>
          <Flex direction="column" alignItems="center" gap={tokens.space.medium}>
            <Heading level={3}>Have more questions?</Heading>
            <Text textAlign="center">
              Our product specialists are ready to help you find the right solution for your needs.
            </Text>
            <Button
              variation="primary"
              onClick={() => router.push("/contact")}
            >
              Contact Sales
            </Button>
          </Flex>
        </Card>
      </Flex>
    </View>
  );
} 