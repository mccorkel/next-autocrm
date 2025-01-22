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
    answer: "To reset your password, click on the 'Forgot Password' link on the login page. Enter your email address, and we'll send you instructions to create a new password. For security reasons, password reset links expire after 24 hours.",
  },
  {
    question: "What browsers and devices are supported?",
    answer: "Our platform is optimized for the latest versions of Chrome, Firefox, Safari, and Edge browsers. We also support mobile devices running iOS 13+ and Android 8+. For the best experience, we recommend keeping your browser and operating system up to date.",
  },
  {
    question: "How can I manage my notification settings?",
    answer: "Log in to your account and navigate to Settings > Notifications. Here you can customize your preferences for email notifications, in-app alerts, and mobile push notifications. You can set different notification levels for ticket updates, mentions, and system announcements.",
  },
  {
    question: "What should I do if I encounter an error?",
    answer: "If you encounter an error: 1) Take a screenshot of the error message, 2) Note the steps that led to the error, 3) Clear your browser cache and cookies, 4) Try logging out and back in. If the issue persists, contact our support team with these details for faster resolution.",
  },
  {
    question: "How do I enable two-factor authentication (2FA)?",
    answer: "To enable 2FA: 1) Go to Settings > Security, 2) Click 'Enable 2FA', 3) Choose between authenticator app or SMS verification, 4) Follow the setup wizard. We recommend using an authenticator app like Google Authenticator or Authy for enhanced security.",
  },
  {
    question: "Can I access the platform offline?",
    answer: "While most features require an internet connection, our progressive web app (PWA) allows you to view previously loaded tickets and draft responses offline. Your changes will automatically sync once you're back online.",
  },
  {
    question: "How do I export my data?",
    answer: "To export your data: 1) Navigate to Settings > Data Management, 2) Select the type of data you want to export (tickets, contacts, reports), 3) Choose your preferred format (CSV, JSON, PDF), 4) Click 'Generate Export'. Large exports may take several minutes to process.",
  },
  {
    question: "What are the system requirements?",
    answer: "Minimum requirements: 2GB RAM, modern web browser, stable internet connection (1Mbps+). For optimal performance, we recommend: 4GB+ RAM, high-speed internet (5Mbps+), and a screen resolution of 1280x720 or higher.",
  }
];

export default function TechnicalFAQPage() {
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
          <Heading level={1}>Technical Support FAQ</Heading>
          <Button onClick={() => router.push("/")} variation="link">
            Back to Home
          </Button>
        </Flex>

        <Card>
          <Flex direction="column" gap={tokens.space.medium}>
            {technicalFaqs.map((faq, index) => (
              <Card key={index} variation="outlined">
                <Flex direction="column" gap={tokens.space.small}>
                  <Heading level={3}>{faq.question}</Heading>
                  <Text>{faq.answer}</Text>
                </Flex>
              </Card>
            ))}
          </Flex>
        </Card>

        <Card>
          <Flex direction="column" alignItems="center" gap={tokens.space.medium}>
            <Heading level={3}>Still need help?</Heading>
            <Text textAlign="center">
              If you couldn't find the answer you're looking for, our technical support team is available 24/7 to assist you.
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