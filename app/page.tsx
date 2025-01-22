"use client";

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

export default function LandingPage() {
  const router = useRouter();
  const { tokens } = useTheme();

  return (
    <View 
      padding={tokens.space.large}
      backgroundColor={tokens.colors.background.primary}
    >
      <Flex direction="column" alignItems="center" gap={tokens.space.large}>
        <Flex direction="column" alignItems="center" gap={tokens.space.small}>
          <Heading 
            level={1} 
            textAlign="center"
            color={tokens.colors.font.primary}
          >
            How can we help you today?
          </Heading>
          <Text 
            textAlign="center" 
            color={tokens.colors.font.secondary}
          >
            Choose a category below to find answers to your questions
          </Text>
        </Flex>

        <Grid
          templateColumns={{ base: "1fr", medium: "1fr 1fr 1fr" }}
          gap={tokens.space.large}
          width="100%"
          maxWidth="1200px"
        >
          {/* Technical Support Section */}
          <Card 
            variation="elevated"
            backgroundColor={tokens.colors.background.secondary}
            borderRadius="medium"
            padding={tokens.space.large}
          >
            <Flex direction="column" gap={tokens.space.medium} height="100%">
              <Heading level={2} color={tokens.colors.font.primary}>Technical Support</Heading>
              <Text color={tokens.colors.font.secondary}>
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
          <Card 
            variation="elevated"
            backgroundColor={tokens.colors.background.secondary}
            borderRadius="medium"
            padding={tokens.space.large}
          >
            <Flex direction="column" gap={tokens.space.medium} height="100%">
              <Heading level={2} color={tokens.colors.font.primary}>Billing</Heading>
              <Text color={tokens.colors.font.secondary}>
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
          <Card 
            variation="elevated"
            backgroundColor={tokens.colors.background.secondary}
            borderRadius="medium"
            padding={tokens.space.large}
          >
            <Flex direction="column" gap={tokens.space.medium} height="100%">
              <Heading level={2} color={tokens.colors.font.primary}>Product Questions</Heading>
              <Text color={tokens.colors.font.secondary}>
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

        <Divider orientation="horizontal" borderColor={tokens.colors.border.primary} />

        <Card 
          width="100%" 
          maxWidth="1200px"
          backgroundColor={tokens.colors.background.secondary}
          borderRadius="medium"
          padding={tokens.space.large}
        >
          <Flex direction="column" alignItems="center" gap={tokens.space.medium}>
            <Heading level={2} color={tokens.colors.font.primary}>Still need help?</Heading>
            <Text textAlign="center" color={tokens.colors.font.secondary}>
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
        <Card 
          width="100%" 
          maxWidth="1200px" 
          variation="outlined"
          backgroundColor={tokens.colors.background.secondary}
          borderRadius="medium"
          padding={tokens.space.medium}
        >
          <Flex justifyContent="center" padding={tokens.space.small}>
            <Button
              variation="primary"
              size="large"
              onClick={() => router.push('/protected/employee')}
            >
              Employee Access
            </Button>
          </Flex>
        </Card>
      </Flex>
    </View>
  );
}
