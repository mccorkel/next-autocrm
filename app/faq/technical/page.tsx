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
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";

const technicalFaqs = [
  {
    question: "How do I reset my password?",
    answer: "To reset your password, click on the 'Forgot Password' link on the login page. Enter your email address, and we'll send you instructions to create a new password.",
  },
  {
    question: "What browsers are supported?",
    answer: "Our platform supports the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend keeping your browser up to date.",
  },
  {
    question: "How can I update my account settings?",
    answer: "Log in to your account, click on your profile icon in the top right corner, and select 'Settings'. Here you can update your personal information, notification preferences, and security settings.",
  },
  {
    question: "What should I do if I encounter an error?",
    answer: "First, try refreshing your browser. If the error persists, clear your browser cache and cookies. If you're still experiencing issues, please contact our support team with details about the error and steps to reproduce it.",
  },
  {
    question: "How do I enable two-factor authentication?",
    answer: "Go to your account settings, select the 'Security' tab, and click 'Enable 2FA'. Follow the prompts to set up authentication using either an authenticator app or SMS verification.",
  },
];

export default function TechnicalFAQPage() {
  const router = useRouter();
  const { tokens } = useTheme();

  return (
    <View padding={tokens.space.large}>
      <Flex direction="column" gap={tokens.space.large}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={1}>Technical Support FAQ</Heading>
          <Button onClick={() => router.push("/")} variation="link">
            Back to Home
          </Button>
        </Flex>

        <Card>
          <Accordion>
            {technicalFaqs.map((faq, index) => (
              <Accordion.Item
                key={index}
                value={`faq-${index}`}
                title={faq.question}
              >
                <Text>{faq.answer}</Text>
              </Accordion.Item>
            ))}
          </Accordion>
        </Card>

        <Card>
          <Flex direction="column" alignItems="center" gap={tokens.space.medium}>
            <Heading level={3}>Still need help?</Heading>
            <Text textAlign="center">
              If you couldn't find the answer you're looking for, our support team is here to help.
            </Text>
            <Button
              variation="primary"
              onClick={() => router.push("/contact")}
            >
              Contact Support
            </Button>
          </Flex>
        </Card>
      </Flex>
    </View>
  );
} 