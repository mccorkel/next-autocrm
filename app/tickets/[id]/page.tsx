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
import { useRouter } from "next/navigation";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function TicketDetail({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<Schema["Ticket"]["type"] | null>(null);
  const [comments, setComments] = useState<Schema["Comment"]["type"][]>([]);
  const [newComment, setNewComment] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchTicket();
    fetchComments();
  }, [params.id]);

  async function fetchTicket() {
    try {
      const result = await client.models.Ticket.get({
        id: params.id
      });
      setTicket(result);
    } catch (error) {
      console.error("Error fetching ticket:", error);
    }
  }

  async function fetchComments() {
    try {
      const result = await client.models.Comment.list({
        filter: {
          ticketId: { eq: params.id }
        }
      });
      setComments(result.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }

  async function addComment() {
    if (!newComment.trim()) return;

    try {
      await client.models.Comment.create({
        content: newComment,
        ticketId: params.id,
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
    return <Text>Loading...</Text>;
  }

  return (
    <Flex direction="column" padding="1rem" gap="1rem">
      <Button onClick={() => router.push("/")}>Back to Dashboard</Button>
      
      <Card>
        <Heading level={2}>{ticket.title}</Heading>
        <Flex gap="1rem">
          <Badge variation={ticket.status === "OPEN" ? "info" : "success"}>
            {ticket.status}
          </Badge>
          <Badge variation={ticket.priority === "HIGH" ? "error" : "warning"}>
            {ticket.priority}
          </Badge>
        </Flex>
        <Text>{ticket.description}</Text>
      </Card>

      <Card>
        <Heading level={3}>Comments</Heading>
        <Flex direction="column" gap="1rem">
          {comments.map((comment) => (
            <Card key={comment.id} variation="outlined">
              <Text>{comment.content}</Text>
              <Text as="span" fontSize="small" color="gray">
                {new Date(comment.createdAt).toLocaleString()}
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