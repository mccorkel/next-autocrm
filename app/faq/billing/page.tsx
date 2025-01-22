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

const billingFaqs = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual subscriptions.",
  },
  {
    question: "How often will I be billed?",
    answer: "We offer both monthly and annual billing cycles. Monthly subscriptions are billed on the same day each month, while annual subscriptions are billed once per year with a 20% discount.",
  },
  {
    question: "Can I change my subscription plan?",
    answer: "Yes, you can upgrade or downgrade your subscription at any time. Changes to a higher tier take effect immediately, while downgrades take effect at the start of your next billing cycle.",
  },
  {
    question: "How do refunds work?",
    answer: "We offer prorated refunds for annual subscriptions if cancelled within 30 days. Monthly subscriptions can be cancelled anytime but are not eligible for refunds for the current billing period.",
  },
  {
    question: "Do you offer enterprise pricing?",
    answer: "Yes, we offer custom enterprise pricing with additional features and dedicated support. Please contact our sales team for more information.",
  },
];

export default function BillingFAQPage() {
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
          <Heading level={1}>Billing FAQ</Heading>
          <Button onClick={() => router.push("/")} variation="link">
            Back to Home
          </Button>
        </Flex>

        <Flex direction="column" gap={tokens.space.medium}>
          {billingFaqs.map((faq, index) => (
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
            <Heading level={3}>Have a billing question?</Heading>
            <Text textAlign="center">
              Our billing support team is available to help with any payment or subscription questions.
            </Text>
            <Button
              variation="primary"
              onClick={() => router.push("/contact")}
            >
              Contact Billing Support
            </Button>
          </Flex>
        </Card>
      </Flex>
    </View>
  );
} 