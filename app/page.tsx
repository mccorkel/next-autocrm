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
import { useLanguage } from "./contexts/LanguageContext";
import { LanguagePicker } from "./components/LanguagePicker";
import { Suspense } from "react";

function LandingContent() {
  const router = useRouter();
  const { tokens } = useTheme();
  const { translations } = useLanguage();

  return (
    <View 
      padding={tokens.space.large}
      backgroundColor={tokens.colors.background.primary}
    >
      <Flex direction="row" justifyContent="flex-end" padding={tokens.space.small}>
        <LanguagePicker />
      </Flex>

      <Flex direction="column" alignItems="center" gap={tokens.space.large}>
        <Flex direction="column" alignItems="center" gap={tokens.space.small}>
          <Heading 
            level={1} 
            textAlign="center"
            color={tokens.colors.font.primary}
          >
            {translations.landing.hero.title}
          </Heading>
          <Text 
            textAlign="center" 
            color={tokens.colors.font.secondary}
          >
            {translations.landing.hero.subtitle}
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
              <Heading level={2} color={tokens.colors.font.primary}>
                {translations.faq.technical.title}
              </Heading>
              <Text color={tokens.colors.font.secondary}>
                {translations.faq.technical.description}
              </Text>
              <Flex justifyContent="flex-end" marginTop="auto">
                <Button
                  variation="primary"
                  onClick={() => router.push("/faq/technical")}
                >
                  {translations.landing.hero.learnMore}
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
              <Heading level={2} color={tokens.colors.font.primary}>
                {translations.contact.form.categories.billing}
              </Heading>
              <Text color={tokens.colors.font.secondary}>
                {translations.landing.features.ticketing.description}
              </Text>
              <Flex justifyContent="flex-end" marginTop="auto">
                <Button
                  variation="primary"
                  onClick={() => router.push("/faq/billing")}
                >
                  {translations.landing.hero.learnMore}
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
              <Heading level={2} color={tokens.colors.font.primary}>
                {translations.contact.form.categories.sales}
              </Heading>
              <Text color={tokens.colors.font.secondary}>
                {translations.landing.features.analytics.description}
              </Text>
              <Flex justifyContent="flex-end" marginTop="auto">
                <Button
                  variation="primary"
                  onClick={() => router.push("/faq/product")}
                >
                  {translations.landing.hero.learnMore}
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
            <Heading level={2} color={tokens.colors.font.primary}>
              {translations.landing.cta.title}
            </Heading>
            <Text textAlign="center" color={tokens.colors.font.secondary}>
              {translations.landing.cta.subtitle}
            </Text>
            <Button
              variation="primary"
              size="large"
              onClick={() => router.push("/contact")}
            >
              {translations.contact.form.submit}
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
              onClick={() => router.push('/protected/employee/agent-dashboard')}
              size="large"
            >
              {translations.landing.hero.getStarted}
            </Button>
          </Flex>
        </Card>
      </Flex>
    </View>
  );
}

export default function LandingPage() {
  return (
    <Suspense>
      <LandingContent />
    </Suspense>
  );
}
