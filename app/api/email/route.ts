import { NextRequest, NextResponse } from 'next/server';
import { Amplify } from 'aws-amplify';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { simpleParser } from 'mailparser';
import { logEmailAPI } from '@/app/utils/logger';
import outputs from '@/amplify_outputs.json';
import { signIn } from '@aws-amplify/auth';
import { Readable } from 'stream';

interface EmailParams {
  bucketName: string;
  objectKey: string;
}

Amplify.configure(outputs);
const s3Client = new S3Client({ region: 'us-west-2' });

// Initialize client after authentication
let client: ReturnType<typeof generateClient<Schema>> | null = null;

async function getAuthenticatedClient() {
  if (!client) {
    // Authenticate with service account credentials
    await signIn({
      username: process.env.SERVICE_ACCOUNT_EMAIL || '',
      password: process.env.SERVICE_ACCOUNT_PASSWORD || ''
    });
    client = generateClient<Schema>();
  }
  return client;
}

async function getEmailFromS3({ bucketName, objectKey }: EmailParams) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey
  });

  const response = await s3Client.send(command);
  
  if (!response.Body) {
    throw new Error('No content found');
  }

  const streamToString = (stream: Readable): Promise<string> => {
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
  };

  return await streamToString(response.Body as Readable);
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.EMAIL_PROCESSING_API_KEY) {
      logEmailAPI('ERROR', 'Invalid or missing API key');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get authenticated client
    const client = await getAuthenticatedClient();

    const body = await request.json();
    logEmailAPI('INFO', 'Received email processing request', { body });
    
    // Extract email data from Lambda's format
    const { messageId, timestamp, source, subject } = body;
    logEmailAPI('INFO', 'Extracted email metadata', { messageId, timestamp, source, subject });
    
    // Get email content from S3
    logEmailAPI('INFO', 'Starting email content retrieval', { messageId });
    const rawContent = await getEmailFromS3({ bucketName: 'tigerpandatv-mail', objectKey: messageId });
    const parsedEmail = await simpleParser(rawContent);
    logEmailAPI('INFO', 'Retrieved and parsed email content', { 
      messageId, 
      contentLength: rawContent.length,
      subject: parsedEmail.subject,
      from: parsedEmail.from?.text,
      date: parsedEmail.date
    });

    // Find or create customer
    const formattedEmail = source.trim().toLowerCase();
    
    // // First test - fetch all customers
    // logEmailAPI('INFO', 'Fetching all customers to verify data access');
    // const allCustomersResponse = await client.models.Customer.list({});
    // logEmailAPI('INFO', 'All customers response', {
    //   totalCustomers: allCustomersResponse.data?.length || 0,
    //   hasData: !!allCustomersResponse.data,
    //   customers: allCustomersResponse.data
    // });

    // Now try specific email lookup
    logEmailAPI('INFO', 'Starting customer lookup', { 
      source,
      formattedEmail,
      query: { email: { eq: formattedEmail } }
    });
    
    let customer = null;
    const customerResponse = await client.models.Customer.list({
      filter: { email: { eq: formattedEmail } }
    });
    logEmailAPI('INFO', 'Customer lookup response', { 
      source, 
      formattedEmail,
      found: customerResponse.data?.length > 0,
      count: customerResponse.data?.length,
      data: customerResponse.data
    });

    if (customerResponse.data && customerResponse.data.length > 0) {
      customer = customerResponse.data[0];
      logEmailAPI('INFO', 'Found existing customer', { 
        customerId: customer?.id,
        customerName: customer?.name,
        customerEmail: customer?.email
      });
    } else {
      logEmailAPI('INFO', 'Creating new customer', { formattedEmail });
      try {
        const createResponse = await client.models.Customer.create({
          email: formattedEmail,
          name: formattedEmail.split('@')[0] // Use email prefix as name
        });
        
        logEmailAPI('INFO', 'Customer create response', { 
          response: createResponse,
          data: createResponse.data,
          errors: createResponse.errors
        });
        
        if (!createResponse.data) {
          throw new Error('Customer creation returned no data');
        }
        
        customer = createResponse.data;
        logEmailAPI('INFO', 'Created new customer', { 
          customerId: customer?.id,
          customerName: customer?.name,
          customerEmail: customer?.email
        });
      } catch (error: any) {
        logEmailAPI('ERROR', 'Failed to create customer', {
          formattedEmail,
          errorName: error?.name,
          errorMessage: error?.message,
          errorDetails: error?.response?.errors || error?.errors,
          stack: error?.stack
        });
        throw error;
      }
    }

    if (!customer || !customer.id) {
      const error = 'Failed to find or create customer';
      logEmailAPI('ERROR', error, { 
        source,
        formattedEmail,
        customerResponse: customerResponse.data,
        customer,
        createError: customer === null ? 'Customer creation failed' : undefined
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
        description: "<AI summary coming soon>",
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
      contentLength: parsedEmail.text?.length || 0
    });
    
    const emailActivityContent = `**Incoming Email**\n\nFrom: ${source}\nSubject: ${subject}\nDate: ${parsedEmail.date ? parsedEmail.date.toLocaleString() : new Date().toLocaleString()}\n\n---\n\n${parsedEmail.text || '(No content)'}`;
    
    const activityResponse = await client.models.TicketActivity.create({
      ticketId: ticket.id,
      type: 'EMAIL_RECEIVED',
      content: emailActivityContent,
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

//export { getEmailFromS3 };
