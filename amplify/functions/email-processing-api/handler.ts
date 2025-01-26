import { Amplify } from 'aws-amplify';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../data/resource";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { simpleParser } from 'mailparser';
import { Readable } from 'stream';

interface EmailParams {
  bucketName: string;
  objectKey: string;
}

const s3Client = new S3Client({ region: 'us-west-2' });

// Initialize client after authentication
let client: ReturnType<typeof generateClient<Schema>> | null = null;

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

export const handler = async (event: any) => {
  console.log('Received request:', JSON.stringify(event, null, 2));

  try {
    // Initialize Amplify client
    client = generateClient<Schema>();

    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    console.log('Received email processing request:', body);
    
    // Extract email data
    const { messageId, timestamp, source, subject } = body;
    console.log('Extracted email metadata:', { messageId, timestamp, source, subject });
    
    // Get email content from S3
    console.log('Starting email content retrieval:', { messageId });
    const rawContent = await getEmailFromS3({ bucketName: 'tigerpandatv-mail', objectKey: messageId });
    const parsedEmail = await simpleParser(rawContent);
    console.log('Retrieved and parsed email content:', { 
      messageId, 
      contentLength: rawContent.length,
      subject: parsedEmail.subject,
      from: parsedEmail.from?.text,
      date: parsedEmail.date
    });

    // Find or create customer
    const formattedEmail = source.trim().toLowerCase();
    console.log('Starting customer lookup:', { 
      source,
      formattedEmail,
      query: { email: { eq: formattedEmail } }
    });
    
    let customer = null;
    const customerResponse = await client.models.Customer.list({
      filter: { email: { eq: formattedEmail } }
    });
    console.log('Customer lookup response:', { 
      source, 
      formattedEmail,
      found: customerResponse.data?.length > 0,
      count: customerResponse.data?.length,
      data: customerResponse.data
    });

    if (customerResponse.data && customerResponse.data.length > 0) {
      customer = customerResponse.data[0];
      console.log('Found existing customer:', { 
        customerId: customer?.id,
        customerName: customer?.name,
        customerEmail: customer?.email
      });
    } else {
      console.log('Creating new customer:', { formattedEmail });
      try {
        const createResponse = await client.models.Customer.create({
          email: formattedEmail,
          name: formattedEmail.split('@')[0] // Use email prefix as name
        });
        
        console.log('Customer create response:', { 
          response: createResponse,
          data: createResponse.data,
          errors: createResponse.errors
        });
        
        if (!createResponse.data) {
          throw new Error('Customer creation returned no data');
        }
        
        customer = createResponse.data;
        console.log('Created new customer:', { 
          customerId: customer?.id,
          customerName: customer?.name,
          customerEmail: customer?.email
        });
      } catch (error: any) {
        console.error('Failed to create customer:', {
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
      throw new Error('Failed to find or create customer');
    }

    // Find existing open support ticket or create new one
    console.log('Starting ticket lookup:', { customerId: customer.id });
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
    console.log('Ticket lookup response:', {
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
      console.log('Found existing ticket:', { 
        ticketId: ticket?.id,
        status: ticket?.status,
        lastEmailReceivedAt: ticket?.lastEmailReceivedAt
      });
    } else {
      console.log('Creating new ticket:', { 
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
      console.log('Created new ticket:', { 
        ticketId: ticket?.id,
        status: ticket?.status,
        emailThreadId: ticket?.emailThreadId
      });
    }

    if (!ticket || !ticket.id) {
      throw new Error('Failed to find or create ticket');
    }

    // Add email activity to ticket
    console.log('Creating email activity:', { 
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
    console.log('Created email activity:', { 
      ticketId: ticket.id,
      activityId: activityResponse.data?.id
    });

    // Update ticket's lastEmailReceivedAt
    console.log('Updating ticket timestamp:', { ticketId: ticket.id });
    const updateResponse = await client.models.Ticket.update({
      id: ticket.id,
      lastEmailReceivedAt: new Date().toISOString()
    });
    console.log('Updated ticket timestamp:', { 
      ticketId: ticket.id,
      lastEmailReceivedAt: updateResponse.data?.lastEmailReceivedAt
    });

    console.log('Email processing completed successfully:', {
      messageId,
      customerId: customer.id,
      ticketId: ticket.id
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error: any) {
    console.error('Error processing email:', { 
      error: {
        name: error?.name || 'Unknown',
        message: error?.message || 'Unknown error',
        stack: error?.stack || '',
        details: error?.response?.errors || error?.errors || []
      }
    });
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process email',
        details: error?.message,
        name: error?.name
      })
    };
  }
}; 