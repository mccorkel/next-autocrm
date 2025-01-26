"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import {
  Alert,
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
  const [error, setError] = useState<string | null>(null);
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
    setError(null);

    try {
      // First, create or find the customer
      const formattedEmail = formData.email.trim().toLowerCase();
      const customerResponse = await client.models.Customer.list({
        filter: { email: { eq: formattedEmail } }
      });

      let customer;
      if (customerResponse.data && customerResponse.data.length > 0) {
        customer = customerResponse.data[0];
      } else {
        const createResponse = await client.models.Customer.create({
          email: formattedEmail,
          name: formData.name,
          company: formData.company || undefined,
          phone: formData.phone || undefined
        });
        if (!createResponse.data) {
          throw new Error('Failed to create customer account');
        }
        customer = createResponse.data;
      }

      // Then create the ticket
      const ticketResponse = await client.models.Ticket.create({
        customerId: customer.id,
        title: formData.subject,
        description: formData.message,
        status: 'OPEN',
        priority: 'MEDIUM',
        category: formData.category,
        createdAt: new Date().toISOString()
      });

      if (!ticketResponse.data) {
        throw new Error('Failed to create support ticket');
      }

      // Add initial activity
      await client.models.TicketActivity.create({
        ticketId: ticketResponse.data.id,
        type: 'STATUS_CHANGE',
        content: 'Ticket created via contact form',
        agentId: 'SYSTEM',
        createdAt: new Date().toISOString(),
        oldValue: 'Created',
        newValue: 'OPEN'
      });

      router.push("/contact/success");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
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

            {error && (
              <Alert
                variation="error"
                isDismissible={true}
                hasIcon={true}
                heading="Error"
                onDismiss={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <Heading level={3}>{translations.contact.form.customerInfo}</Heading>
            <TextField
              label={translations.contact.form.name}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              isDisabled={isSubmitting}
              placeholder="Enter your full name"
            />
            <TextField
              label={translations.contact.form.email}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              isDisabled={isSubmitting}
              placeholder="Enter your email address"
            />
            <TextField
              label={translations.contact.form.company}
              name="company"
              value={formData.company}
              onChange={handleChange}
              isDisabled={isSubmitting}
              placeholder="Enter your company name (optional)"
            />
            <TextField
              label={translations.contact.form.phone}
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              isDisabled={isSubmitting}
              placeholder="Enter your phone number (optional)"
            />

            <Heading level={3}>{translations.contact.form.issueDetails}</Heading>
            <SelectField
              label={translations.contact.form.category}
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              isDisabled={isSubmitting}
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
              isDisabled={isSubmitting}
              placeholder="Enter the subject of your message"
            />
            <TextAreaField
              label={translations.contact.form.message}
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              isDisabled={isSubmitting}
              rows={5}
              placeholder="Enter your message"
            />

            <Button 
              type="submit" 
              variation="primary" 
              isLoading={isSubmitting}
              loadingText={translations.contact.form.submitting}
              isDisabled={isSubmitting}
            >
              {translations.contact.form.submit}
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