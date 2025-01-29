## AWS Amplify Next.js (App Router) Starter Template

This repository provides a starter template for creating applications using Next.js (App Router) and AWS Amplify, emphasizing easy setup for authentication, API, and database capabilities.

## Using LangChain

This project already includes **LangChain** as a dependency in **package.json**. To utilize LangChain for AI-driven features (LLMs, chatbots, semantic search, etc.):

1. **Set up or reuse an LLM**:
   - For example, OpenAI or Amazon Bedrock. Store your API keys as environment variables (e.g., `OPENAI_API_KEY`) in your `.env.local`.
2. **Create a Route**:
   - As in `app/api/langchain/route.ts` (shown in this repo), import LangChain, reference your OpenAI key, and return model completions.
3. **Install Additional Providers if needed**:
   - For advanced usage or other LLMs (Anthropic, Cohere, Amazon Bedrock, etc.), add their respective dependencies or config.
4. **Create your chain or agent**:
   - You can import from `langchain` (e.g., `import { OpenAI, ConversationChain } from 'langchain';`) in your route or a server file, then instantiate your chain objects as needed.
5. **Deploy**:
   - Ensure your environment variables (`OPENAI_API_KEY`, etc.) are properly configured in your Amplify environment or hosting settings.

Below is a minimal example snippet for a Next.js API route (`app/api/langchain/route.ts`) that uses an OpenAI model:

```ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "langchain/llms/openai";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    const model = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY || "",
      temperature: 0.7,
    });

    const response = await model.call(prompt);

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

## Overview

This template equips you with a foundational Next.js application integrated with AWS Amplify, streamlined for scalability and performance. It is ideal for developers looking to jumpstart their project with pre-configured AWS services like Cognito, AppSync, and DynamoDB.

## Features

- **Authentication**: Setup with Amazon Cognito for secure user authentication.
- **API**: Ready-to-use GraphQL endpoint with AWS AppSync.
- **Database**: Real-time database powered by Amazon DynamoDB.

## Deploying to AWS

For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/#deploy-a-fullstack-app-to-aws) of our documentation.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.