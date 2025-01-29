import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from '@langchain/openai';
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// Define the output schema
const outputSchema = z.object({
  category: z.enum(['ACCOUNT', 'BILLING', 'SUPPORT', 'SALES', 'OTHER']),
  language: z.enum(['EN', 'DE', 'ES', 'FR', 'JA']),
  confidence: z.number().min(0).max(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.subject || !body.content || typeof body.subject !== 'string' || typeof body.content !== 'string') {
      return NextResponse.json({
        success: false,
        error: "Missing or invalid 'subject' or 'content' in request body",
      }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "OpenAI API key not configured",
      }, { status: 500 });
    }

    const parser = StructuredOutputParser.fromZodSchema(outputSchema);
    const format_instructions = parser.getFormatInstructions();

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.1,  // Low temperature for consistent categorization
      modelName: 'gpt-3.5-turbo',
      maxTokens: 500,
      timeout: 10000,
    });

    const prompt = `Analyze the following email and categorize it based on its content and subject. Also determine the primary language of the email.

Subject: ${body.subject}
Content: ${body.content}

Categories:
- ACCOUNT: Account-related inquiries (login, registration, profile, settings)
- BILLING: Payment, subscription, invoices, refunds
- SUPPORT: Technical issues, product help, bug reports
- SALES: Sales inquiries, pricing questions, product information
- OTHER: Anything that doesn't fit the above categories

Languages:
- EN: English
- DE: German
- ES: Spanish
- FR: French
- JA: Japanese

Provide your response in the following format:
${format_instructions}

Include a confidence score between 0 and 1 indicating how certain you are of the categorization.`;

    const response = await model.invoke(prompt);
    const parsed = await parser.parse(response.content.toString());

    return NextResponse.json({
      success: true,
      data: parsed,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error in Email Categorization API:', error);
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred.",
    }, { status: 500 });
  }
} 
