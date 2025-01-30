import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const client = generateClient<Schema>();

// Validation schema for feedback request body
const feedbackSchema = z.object({
  categorizationId: z.string(),
  isCategoryCorrect: z.boolean(),
  isLanguageCorrect: z.boolean(),
  correctCategory: z.enum(['ACCOUNT', 'BILLING', 'SUPPORT', 'SALES', 'OTHER']).optional(),
  correctLanguage: z.enum(['EN', 'DE', 'ES', 'FR', 'JA']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const feedback = feedbackSchema.parse(body);

    // Get the existing categorization
    const response = await client.models.EmailCategorization.get({
      id: feedback.categorizationId,
    });

    if (!response.data) {
      return NextResponse.json({
        success: false,
        error: "Categorization not found",
      }, { status: 404 });
    }

    // Update the categorization with feedback
    const updateResponse = await client.models.EmailCategorization.update({
      id: feedback.categorizationId,
      isCategoryCorrect: feedback.isCategoryCorrect,
      isLanguageCorrect: feedback.isLanguageCorrect,
      feedbackSentToLLM: false,
      ...(feedback.correctCategory && { category: feedback.correctCategory }),
      ...(feedback.correctLanguage && { language: feedback.correctLanguage }),
    });

    if (!updateResponse.data) {
      throw new Error('Failed to update categorization');
    }

    return NextResponse.json({
      success: true,
      data: updateResponse.data,
    });

  } catch (error) {
    console.error('Error in Email Feedback API:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Invalid request body",
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