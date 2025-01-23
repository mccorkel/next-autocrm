"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import {
  Button,
  Card,
  Flex,
  Heading,
  SelectField,
  Text,
  TextField,
  TextAreaField,
  View,
  useTheme,
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";

const client = generateClient<Schema>();

type TicketCategory = "ACCOUNT" | "BILLING" | "SUPPORT" | "SALES" | "OTHER";

export default function ContactPage() {
  const router = useRouter();
  const { tokens } = useTheme();
  const { translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  // Ticket fields
  const [category, setCategory] = useState<TicketCategory>("SUPPORT");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First create the customer
      const customerResult = await client.models.Customer.create({
        name,
        email,
        company,
        phone,
      });

      if (customerResult.data) {
        // Then create the ticket associated with the customer
        await client.models.Ticket.create({
          title: subject,
          description,
          status: "OPEN",
          priority: "MEDIUM",
          category,
          customerId: customerResult.data.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Redirect to a success page
        router.push("/contact/success");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Here you would typically show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View 
      padding={tokens.space.large}
      backgroundColor={tokens.colors.background.primary}
      minHeight="100vh"
    >
      <Flex direction="column" alignItems="center" gap={tokens.space.large}>
        <Card width="100%" maxWidth="800px">
          <Flex direction="column" gap={tokens.space.medium}>
            <Heading level={1}>{translations.contact.title}</Heading>
            <Text>
              {translations.contact.form.description}
            </Text>

            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap={tokens.space.medium}>
                {/* Customer Information Section */}
                <Heading level={2}>{translations.contact.form.customerInfo}</Heading>
                <TextField
                  label={translations.contact.form.name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <TextField
                  label={translations.contact.form.email}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <TextField
                  label={translations.contact.form.company}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
                <TextField
                  label={translations.contact.form.phone}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                {/* Ticket Information Section */}
                <Heading level={2}>{translations.contact.form.issueDetails}</Heading>
                <SelectField
                  label={translations.contact.form.category}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                >
                  <option value="SUPPORT">{translations.contact.form.categories.support}</option>
                  <option value="BILLING">{translations.contact.form.categories.billing}</option>
                  <option value="SALES">{translations.contact.form.categories.sales}</option>
                  <option value="ACCOUNT">{translations.contact.form.categories.account}</option>
                  <option value="OTHER">{translations.contact.form.categories.other}</option>
                </SelectField>
                <TextField
                  label={translations.contact.form.subject}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                <TextAreaField
                  label={translations.contact.form.message}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                <Flex gap={tokens.space.medium}>
                  <Button
                    onClick={() => router.back()}
                    variation="link"
                    isDisabled={isSubmitting}
                  >
                    {translations.common.back}
                  </Button>
                  <Button
                    type="submit"
                    variation="primary"
                    isLoading={isSubmitting}
                    loadingText={translations.contact.form.submitting}
                  >
                    {translations.contact.form.submit}
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Flex>
        </Card>
      </Flex>
    </View>
  );
} 