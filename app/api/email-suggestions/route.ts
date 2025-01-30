import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const client = generateClient<Schema>();

// Validation schema for query parameters
const querySchema = z.object({
  categorizationId: z.string().optional(),
  hasLLMSuggestion: z.boolean().optional(),
  category: z.enum(['ACCOUNT', 'BILLING', 'SUPPORT', 'SALES', 'OTHER']).optional(),
  language: z.enum(['EN', 'DE', 'ES', 'FR', 'JA']).optional(),
  limit: z.number().min(1).max(50).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = querySchema.parse({
      ...searchParams,
      hasLLMSuggestion: searchParams.hasLLMSuggestion === 'true',
      limit: searchParams.limit ? parseInt(searchParams.limit) : undefined,
    });
    
    // Build filter based on query parameters
    const filter: any = {
      and: []
    };

    if (query.categorizationId) {
      filter.and.push({ id: { eq: query.categorizationId } });
    }

    if (query.hasLLMSuggestion) {
      filter.and.push({ llmSuggestion: { ne: null } });
    }

    if (query.category) {
      filter.and.push({ category: { eq: query.category } });
    }

    if (query.language) {
      filter.and.push({ language: { eq: query.language } });
    }

    // Get categorizations
    const response = await client.models.EmailCategorization.list({
      filter: filter.and.length > 0 ? filter : undefined,
      limit: query.limit || 10,
    });

    if (!response.data) {
      throw new Error('Failed to fetch categorizations');
    }

    // Parse and validate LLM suggestions
    const suggestions = await Promise.all(response.data.map(async (categorization) => {
      let parsedSuggestion = null;
      if (categorization.llmSuggestion) {
        try {
          parsedSuggestion = JSON.parse(categorization.llmSuggestion);
        } catch (e) {
          console.error('Failed to parse LLM suggestion:', e);
        }
      }

      // Get associated email if available
      let email = null;
      if (categorization.incomingEmailId) {
        const emailResponse = await client.models.IncomingEmail.get({
          id: categorization.incomingEmailId,
        });
        email = emailResponse.data;
      }

      return {
        id: categorization.id,
        originalCategory: categorization.category,
        originalLanguage: categorization.language,
        isCategoryCorrect: categorization.isCategoryCorrect,
        isLanguageCorrect: categorization.isLanguageCorrect,
        suggestedCategory: categorization.llmSuggestionCategory,
        suggestedLanguage: categorization.llmSuggestionLanguage,
        analysis: parsedSuggestion?.analysis,
        explanation: parsedSuggestion?.explanation,
        email,
        createdAt: categorization.createdAt,
        feedbackSentAt: categorization.feedbackSentAt,
      };
    }));

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Error in Email Suggestions API:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Invalid query parameters",
        details: error.errors,
      }, { status: 400 });
    }
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