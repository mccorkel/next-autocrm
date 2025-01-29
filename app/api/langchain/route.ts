"use server";

import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from '@langchain/openai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    // Create an instance of the OpenAI model
    const model = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY || "",
      temperature: 0.7,
    });

    // Execute the LLM call
    const response = await model.call(prompt);

    return NextResponse.json({
      success: true,
      data: response,
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