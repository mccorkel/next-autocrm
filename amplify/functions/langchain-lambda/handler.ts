import { APIGatewayEvent, Context } from 'aws-lambda';
import { OpenAI } from '@langchain/openai';

// Handler that demonstrates a simple call to OpenAI via LangChain
export const handler = async (event: APIGatewayEvent, context: Context) => {
  try {
    // Read your OpenAI key from environment variables
    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      console.error('OPENAI_API_KEY not found in environment variables.');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing OPENAI_API_KEY' }),
      };
    }

    // Instantiate the LLM with your key
    const model = new OpenAI({
      openAIApiKey: openAiKey,
      temperature: 0.7,
    });

    // Simple demonstration prompt
    const prompt = "Explain the benefits of using a Next.js + Amplify stack";

    // Send prompt to OpenAI via LangChain
    const response = await model.call(prompt);

    // Return the response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Response from LangChain/OpenAI',
        data: response,
      }),
    };

  } catch (error: any) {
    console.error('Error in LangChain Lambda:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'LangChain Lambda failed',
        details: error.message
      })
    };
  }
};