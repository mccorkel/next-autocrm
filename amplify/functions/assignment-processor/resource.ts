import { EventBridgeEvent } from 'aws-lambda';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { SageMakerRuntimeClient, InvokeEndpointCommand } from '@aws-sdk/client-sagemaker-runtime';
import { defineFunction } from '@aws-amplify/backend';

export const assignmentProcessor = defineFunction();

const dynamoDB = new DynamoDBClient({});
const sagemakerClient = new SageMakerRuntimeClient({});
const TICKETS_TABLE_NAME = process.env.TICKETS_TABLE_NAME!;
const SAGEMAKER_ENDPOINT = process.env.SAGEMAKER_ENDPOINT!;

export const handler = async (event: EventBridgeEvent<'ticket_created', { ticketId: string; email: string; subject: string }>) => {
  const { ticketId, email, subject } = event.detail;

  try {
    const inputPayload = JSON.stringify({ email, subject });
    const sagemakerResponse = await sagemakerClient.send(new InvokeEndpointCommand({
      EndpointName: SAGEMAKER_ENDPOINT,
      ContentType: 'application/json',
      Body: Buffer.from(inputPayload),
    }));

    const recommendedAgent = JSON.parse(new TextDecoder().decode(sagemakerResponse.Body)).agentId;

    await dynamoDB.send(new UpdateItemCommand({
      TableName: TICKETS_TABLE_NAME,
      Key: { id: { S: ticketId } },
      UpdateExpression: 'SET assignedAgentId = :agentId',
      ExpressionAttributeValues: { ':agentId': { S: recommendedAgent } },
    }));

    console.log(`Ticket ${ticketId} assigned to agent ${recommendedAgent}`);
  } catch (error) {
    console.error('Error in assignment processor:', error);
    if (error instanceof Error) {
      console.error(`Error processing ticket assignment: ${error.message}`);
    } else {
      console.error('An unknown error occurred while processing ticket assignment');
    }
  }
}; 