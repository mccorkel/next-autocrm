import { NextRequest, NextResponse } from 'next/server';
import { Amplify } from 'aws-amplify';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { simpleParser } from 'mailparser';
import { logEmailAPI } from '@/app/utils/logger';
import outputs from '@/amplify_outputs.json';

// Configure Amplify with API key
const config = {
  ...outputs,
  API: {
    GraphQL: {
      endpoint: outputs.data.url,
      defaultAuthMode: 'apiKey',
      apiKey: process.env.EMAIL_PROCESSING_API_KEY
    }
  }
};
Amplify.configure(config);

// Create client with API key auth
const client = generateClient<Schema>({
  authMode: "apiKey"
});
const s3Client = new S3Client({ region: 'us-west-2' });

async function getEmailFromS3(messageId: string) {
  try {
    logEmailAPI('INFO', `Starting S3 retrieval`, { messageId, bucket: 'tigerpandatv-mail' });
    
    const command = new GetObjectCommand({
      Bucket: 'tigerpandatv-mail',
      Key: messageId
    });
    
    logEmailAPI('INFO', `Sending S3 request`, { messageId });
    const response = await s3Client.send(command);
    logEmailAPI('INFO', `Received S3 response`, { messageId, statusCode: response.$metadata.httpStatusCode });
    
    const emailContent = await response.Body?.transformToString();
    if (!emailContent) {
      logEmailAPI('ERROR', 'No email content in S3 response', { messageId });
      throw new Error('No email content found');
    }
    logEmailAPI('INFO', `Retrieved raw email content`, { messageId, contentLength: emailContent.length });
    
    logEmailAPI('INFO', `Starting email parsing`, { messageId });
    const parsedEmail = await simpleParser(emailContent);
    logEmailAPI('INFO', `Successfully parsed email`, { 
      messageId,
      hasText: !!parsedEmail.text,
      hasHtml: !!parsedEmail.html,
      attachments: parsedEmail.attachments.length
    });
    
    return parsedEmail.text || parsedEmail.html || '';
  } catch (error: any) {
    logEmailAPI('ERROR', 'Error retrieving email from S3', { 
      messageId, 
      errorName: error?.name || 'Unknown',
      errorMessage: error?.message || 'Unknown error',
      stack: error?.stack || ''
    });
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.EMAIL_PROCESSING_API_KEY) {
      logEmailAPI('ERROR', 'Invalid or missing API key');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    logEmailAPI('INFO', 'Received email processing request', { body });
    
    // Extract email data from Lambda's format
    const { messageId, timestamp, source, subject } = body;
    logEmailAPI('INFO', 'Extracted email metadata', { messageId, timestamp, source, subject });
    
    // Get email content from S3
    logEmailAPI('INFO', 'Starting email content retrieval', { messageId });
    const content = await getEmailFromS3(messageId);
    logEmailAPI('INFO', 'Retrieved email content', { messageId, contentLength: content.length });

    // Find or create customer
    logEmailAPI('INFO', 'Starting customer lookup', { source });
    let customer = null;
    const customerResponse = await client.models.Customer.list({
      filter: { email: { eq: source } }
    });
    logEmailAPI('INFO', 'Customer lookup response', { 
      source, 
      found: customerResponse.data?.length > 0,
      count: customerResponse.data?.length 
    });

    if (customerResponse.data && customerResponse.data.length > 0) {
      customer = customerResponse.data[0];
      logEmailAPI('INFO', 'Found existing customer', { 
        customerId: customer?.id,
        customerName: customer?.name,
        customerEmail: customer?.email
      });
    } else {
      logEmailAPI('INFO', 'Creating new customer', { source });
      const createResponse = await client.models.Customer.create({
        email: source,
        name: source.split('@')[0] // Use email prefix as name
      });
      customer = createResponse.data;
      logEmailAPI('INFO', 'Created new customer', { 
        customerId: customer?.id,
        customerName: customer?.name,
        customerEmail: customer?.email
      });
    }

    if (!customer || !customer.id) {
      const error = 'Failed to find or create customer';
      logEmailAPI('ERROR', error, { 
        source,
        customerResponse: customerResponse.data,
        customer
      });
      throw new Error(error);
    }

    // Find existing open support ticket or create new one
    logEmailAPI('INFO', 'Starting ticket lookup', { customerId: customer.id });
    let ticket = null;
    const ticketsResponse = await client.models.Ticket.list({
      filter: {
        and: [
          { customerId: { eq: customer.id } },
          { category: { eq: 'SUPPORT' } },
          { status: { ne: 'CLOSED' } }
        ]
      }
    });
    logEmailAPI('INFO', 'Ticket lookup response', {
      customerId: customer.id,
      found: ticketsResponse.data?.length > 0,
      count: ticketsResponse.data?.length
    });

    if (ticketsResponse.data && ticketsResponse.data.length > 0) {
      // Sort by lastEmailReceivedAt to get the most recent
      const sortedTickets = ticketsResponse.data.sort((a, b) => {
        const dateA = new Date(a.lastEmailReceivedAt || a.createdAt || '').getTime();
        const dateB = new Date(b.lastEmailReceivedAt || b.createdAt || '').getTime();
        return dateB - dateA;
      });
      ticket = sortedTickets[0];
      logEmailAPI('INFO', 'Found existing ticket', { 
        ticketId: ticket?.id,
        status: ticket?.status,
        lastEmailReceivedAt: ticket?.lastEmailReceivedAt
      });
    } else {
      logEmailAPI('INFO', 'Creating new ticket', { 
        customerId: customer.id,
        subject,
        messageId
      });
      const createResponse = await client.models.Ticket.create({
        customerId: customer.id,
        title: subject || 'Email from customer',
        description: content,
        status: 'OPEN',
        priority: 'MEDIUM',
        category: 'SUPPORT',
        createdAt: new Date().toISOString(),
        emailThreadId: messageId,
        lastEmailReceivedAt: new Date().toISOString()
      });
      ticket = createResponse.data;
      logEmailAPI('INFO', 'Created new ticket', { 
        ticketId: ticket?.id,
        status: ticket?.status,
        emailThreadId: ticket?.emailThreadId
      });
    }

    if (!ticket || !ticket.id) {
      const error = 'Failed to find or create ticket';
      logEmailAPI('ERROR', error, { 
        customerId: customer.id,
        ticketsResponse: ticketsResponse.data,
        ticket
      });
      throw new Error(error);
    }

    // Add email activity to ticket
    logEmailAPI('INFO', 'Creating email activity', { 
      ticketId: ticket.id,
      contentLength: content.length
    });
    const activityResponse = await client.models.TicketActivity.create({
      ticketId: ticket.id,
      type: 'EMAIL_RECEIVED',
      content: content,
      agentId: 'SYSTEM',
      createdAt: new Date().toISOString()
    });
    logEmailAPI('INFO', 'Created email activity', { 
      ticketId: ticket.id,
      activityId: activityResponse.data?.id
    });

    // Update ticket's lastEmailReceivedAt
    logEmailAPI('INFO', 'Updating ticket timestamp', { ticketId: ticket.id });
    const updateResponse = await client.models.Ticket.update({
      id: ticket.id,
      lastEmailReceivedAt: new Date().toISOString()
    });
    logEmailAPI('INFO', 'Updated ticket timestamp', { 
      ticketId: ticket.id,
      lastEmailReceivedAt: updateResponse.data?.lastEmailReceivedAt
    });

    logEmailAPI('INFO', 'Email processing completed successfully', {
      messageId,
      customerId: customer.id,
      ticketId: ticket.id
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logEmailAPI('ERROR', 'Error processing email', { 
      error: {
        name: error?.name || 'Unknown',
        message: error?.message || 'Unknown error',
        stack: error?.stack || '',
        details: error?.response?.errors || error?.errors || []
      }
    });
    return NextResponse.json(
      { 
        error: 'Failed to process email',
        details: error?.message,
        name: error?.name
      }, 
      { status: 500 }
    );
  }
} 