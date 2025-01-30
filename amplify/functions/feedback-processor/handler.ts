import { generateClient } from "aws-amplify/data";
import type { Schema } from '../../data/schema';
import { ChatOpenAI } from '@langchain/openai';

export const handler = async () => {
  const client = generateClient<Schema>();
  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.1,
    modelName: 'gpt-3.5-turbo',
  });

  // Get all categorizations with feedback that hasn't been sent to LLM
  const response = await client.models.EmailCategorization.list({
    filter: {
      and: [
        { feedbackSentToLLM: { eq: false } },
        { or: [
          { isCategoryCorrect: { eq: false } },
          { isLanguageCorrect: { eq: false } }
        ]}
      ]
    },
    limit: 50
  });

  if (!response.data || response.data.length === 0) {
    console.log('No new feedback to process');
    return;
  }

  // Process each categorization
  for (const categorization of response.data) {
    try {
      // Get the associated email
      const emailResponse = await client.models.IncomingEmail.get({ id: categorization.incomingEmailId });
      if (!emailResponse.data) continue;

      const email = emailResponse.data;
      
      // Create feedback prompt
      const prompt = `Here is feedback on a previous email categorization:

Email Subject: ${email.subject}
Email Content: ${email.body}

Previous Categorization:
- Category: ${categorization.category} (Correct: ${categorization.isCategoryCorrect})
- Language: ${categorization.language} (Correct: ${categorization.isLanguageCorrect})
- Confidence: ${categorization.confidence}

Please provide your analysis and suggestions in the following JSON format:
{
  "analysis": "Your detailed analysis of what went wrong",
  "suggestedCategory": "ACCOUNT|BILLING|SUPPORT|SALES|OTHER",
  "suggestedLanguage": "EN|DE|ES|FR|JA",
  "explanation": "Explanation of why these suggestions are more appropriate"
}`;

      // Send to LLM for learning
      const response = await model.invoke(prompt);
      const suggestion = JSON.parse(response.content.toString());

      // Mark feedback as sent and store suggestions
      await client.models.EmailCategorization.update({
        id: categorization.id,
        feedbackSentToLLM: true,
        feedbackSentAt: new Date().toISOString(),
        llmSuggestion: JSON.stringify({
          analysis: suggestion.analysis,
          explanation: suggestion.explanation
        }),
        llmSuggestionCategory: suggestion.suggestedCategory,
        llmSuggestionLanguage: suggestion.suggestedLanguage,
      });

    } catch (error) {
      console.error('Error processing feedback for categorization:', categorization.id, error);
      continue;
    }
  }

  return {
    processedCount: response.data.length,
  };
}; 