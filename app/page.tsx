"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import {
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
  View,
  useTheme,
  Divider,
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";

Amplify.configure(outputs);

export default function LandingPage() {
  const router = useRouter();
  const { tokens } = useTheme();

  return (
    <View padding={tokens.space.large}>
      <Flex direction="column" alignItems="center" gap={tokens.space.large}>
        <Heading level={1} textAlign="center">
          How can we help you today?
        </Heading>
        <Text textAlign="center" variation="secondary">
          Choose a category below to find answers to your questions
        </Text>

        <Grid
          templateColumns={{ base: "1fr", medium: "1fr 1fr 1fr" }}
          gap={tokens.space.large}
          width="100%"
          maxWidth="1200px"
        >
          {/* Technical Support Section */}
          <Card variation="elevated">
            <Flex direction="column" gap={tokens.space.medium} height="100%">
              <Heading level={2}>Technical Support</Heading>
              <Text>
                Get help with technical issues, troubleshooting, and setup guides.
              </Text>
              <Flex justifyContent="flex-end" marginTop="auto">
                <Button
                  variation="primary"
                  onClick={() => router.push("/faq/technical")}
                >
                  View Technical FAQs
                </Button>
              </Flex>
            </Flex>
          </Card>

          {/* Billing Section */}
          <Card variation="elevated">
            <Flex direction="column" gap={tokens.space.medium} height="100%">
              <Heading level={2}>Billing</Heading>
              <Text>
                Find answers about billing, subscriptions, and payment methods.
              </Text>
              <Flex justifyContent="flex-end" marginTop="auto">
                <Button
                  variation="primary"
                  onClick={() => router.push("/faq/billing")}
                >
                  View Billing FAQs
                </Button>
              </Flex>
            </Flex>
          </Card>

          {/* Product Questions Section */}
          <Card variation="elevated">
            <Flex direction="column" gap={tokens.space.medium} height="100%">
              <Heading level={2}>Product Questions</Heading>
              <Text>
                Learn more about our products, features, and sales inquiries.
              </Text>
              <Flex justifyContent="flex-end" marginTop="auto">
                <Button
                  variation="primary"
                  onClick={() => router.push("/faq/product")}
                >
                  View Product FAQs
                </Button>
              </Flex>
            </Flex>
          </Card>
        </Grid>

        <Divider orientation="horizontal" />

        <Card width="100%" maxWidth="1200px">
          <Flex direction="column" alignItems="center" gap={tokens.space.medium}>
            <Heading level={2}>Still need help?</Heading>
            <Text textAlign="center">
              Our support team is here to assist you if you couldn't find what you're looking for.
            </Text>
            <Button
              variation="primary"
              size="large"
              onClick={() => router.push("/contact")}
            >
              Contact Support
            </Button>
          </Flex>
        </Card>

        {/* Employee Access - Smaller and Less Prominent */}
        <Card width="100%" maxWidth="1200px" variation="outlined">
          <Flex justifyContent="center" padding={tokens.space.small}>
            <Button
              variation="link"
              onClick={() => router.push("/agent-dashboard")}
            >
              Employee Access
            </Button>
          </Flex>
        </Card>
      </Flex>
    </View>
  );
}
