"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import {
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextAreaField,
  Badge,
} from "@aws-amplify/ui-react";
import { useRouter, useParams } from "next/navigation";

Amplify.configure(outputs);
const client = generateClient<Schema>();

type TicketType = Schema['Ticket']['type'];
type CommentType = Schema['Comment']['type'];

export default function TicketDetail() {
  const params = useParams();
  const ticketId = typeof params.id === 'string' ? params.id : '';
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
      fetchComments();
    }
  }, [ticketId]);

  async function fetchTicket() {
    if (!ticketId) return;
    
    try {
      const result = await client.models.Ticket.get({
        id: ticketId
      });
      if (result.data) {
        setTicket(result.data);
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
    }
  }

  async function fetchComments() {
    if (!ticketId) return;

    try {
      const result = await client.models.Comment.list({
        filter: {
          ticketId: { eq: ticketId }
        }
      });
      if (result.data) {
        setComments(result.data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }

  async function addComment() {
    if (!newComment.trim()) return;

    try {
      await client.models.Comment.create({
        content: newComment,
        ticketId: ticketId,
        authorId: "current-user", // This should be the actual logged-in user's ID
        createdAt: new Date().toISOString(),
      });
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }

  if (!ticket) {
    return <div>Loading...</div>;
  }

  return (
    <Flex direction="column" padding="1rem" gap="1rem">
      <Card>
        <Heading level={2}>{ticket.title}</Heading>
        <Text>{ticket.description}</Text>
        <Flex gap="0.5rem" marginTop="1rem">
          <Badge variation="info">{ticket.status}</Badge>
          <Badge variation="warning">{ticket.priority}</Badge>
        </Flex>
      </Card>

      <Card>
        <Heading level={3}>Comments</Heading>
        <Flex direction="column" gap="1rem">
          {comments.map(comment => (
            <Card key={comment.id}>
              <Text>{comment.content}</Text>
              <Text variation="tertiary">
                {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
              </Text>
            </Card>
          ))}
        </Flex>

        <Flex direction="column" gap="1rem" marginTop="1rem">
          <TextAreaField
            label="Add a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button onClick={addComment}>Add Comment</Button>
        </Flex>
      </Card>
    </Flex>
  );
}