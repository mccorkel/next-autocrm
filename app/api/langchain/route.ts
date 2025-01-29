import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from '@langchain/openai';

export const maxDuration = 300; // Set max duration to 5 minutes
export const dynamic = 'force-dynamic'; // Disable static optimization

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json({
        success: false,
        error: "Missing or invalid 'prompt' in request body",
      }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "OpenAI API key not configured",
      }, { status: 500 });
    }

    // Create an instance of ChatOpenAI
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.3,  // Lower temperature for faster, more focused responses
      modelName: 'gpt-3.5-turbo',  // Much faster than GPT-4
      maxTokens: 2048,
      timeout: 10000,  // 10 second timeout
    });

    // Execute the chat call
    const response = await model.invoke(body.prompt);

    // Ensure we have a complete response
    if (!response) {
      throw new Error('Empty response from OpenAI');
    }

    return NextResponse.json({
      success: true,
      data: response.content,
      complete: true,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error in LangChain API:', error);
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