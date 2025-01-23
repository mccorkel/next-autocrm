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
import { Suspense } from "react";

const client = generateClient<Schema>();

type TicketCategory = "ACCOUNT" | "BILLING" | "SUPPORT" | "SALES" | "OTHER";

function ContactContent() {
  const router = useRouter();
  const { tokens } = useTheme();
  const { translations } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    category: "SUPPORT" as TicketCategory,
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await client.models.Ticket.create({
        ...formData,
        status: "OPEN",
      });

      router.push("/contact/success");
    } catch (error) {
      console.error("Error creating ticket:", error);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <View 
      padding={tokens.space.large}
      backgroundColor={tokens.colors.background.primary}
      minHeight="100vh"
    >
      <Card width="100%" maxWidth="800px" margin="0 auto">
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap={tokens.space.medium}>
            <Heading level={1}>{translations.contact.title}</Heading>
            <Text>{translations.contact.form.description}</Text>

            <Heading level={3}>{translations.contact.form.customerInfo}</Heading>
            <TextField
              label={translations.contact.form.name}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              label={translations.contact.form.email}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              label={translations.contact.form.company}
              name="company"
              value={formData.company}
              onChange={handleChange}
            />
            <TextField
              label={translations.contact.form.phone}
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />

            <Heading level={3}>{translations.contact.form.issueDetails}</Heading>
            <SelectField
              label={translations.contact.form.category}
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="SUPPORT">{translations.contact.form.categories.support}</option>
              <option value="BILLING">{translations.contact.form.categories.billing}</option>
              <option value="SALES">{translations.contact.form.categories.sales}</option>
              <option value="ACCOUNT">{translations.contact.form.categories.account}</option>
              <option value="OTHER">{translations.contact.form.categories.other}</option>
            </SelectField>
            <TextField
              label={translations.contact.form.subject}
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
            <TextAreaField
              label={translations.contact.form.message}
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
            />

            <Button type="submit" variation="primary" isLoading={isSubmitting}>
              {isSubmitting ? translations.contact.form.submitting : translations.contact.form.submit}
            </Button>
          </Flex>
        </form>
      </Card>
    </View>
  );
}

export default function ContactPage() {
  return (
    <Suspense>
      <ContactContent />
    </Suspense>
  );
} 