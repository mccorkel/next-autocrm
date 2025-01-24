"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import {
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  View,
  useTheme,
  SelectField,
  TextAreaField,
  Divider,
  SwitchField,
  TextField,
} from "@aws-amplify/ui-react";
import { useParams, useRouter } from "next/navigation";
import { useAgent } from "@/app/contexts/AgentContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { Suspense } from "react";

const client = generateClient<Schema>();

type BadgeVariation = "info" | "warning" | "error" | "success";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type TicketStatus = "OPEN" | "IN_PROGRESS" | "BLOCKED" | "CLOSED";
type TicketCategory = "ACCOUNT" | "BILLING" | "SUPPORT" | "SALES" | "OTHER";
type ActivityType = "NOTE" | "STATUS_CHANGE" | "PRIORITY_CHANGE" | "ASSIGNMENT_CHANGE";
type TicketActivity = NonNullable<Schema["TicketActivity"]["type"]>;

function getPriorityColor(priority: string | null | undefined): BadgeVariation {
  switch (priority) {
    case "URGENT":
      return "error";
    case "HIGH":
      return "warning";
    case "MEDIUM":
      return "info";
    default:
      return "info";
  }
}

function getStatusColor(status: string | null | undefined): BadgeVariation {
  switch (status) {
    case "OPEN":
      return "warning";
    case "IN_PROGRESS":
      return "info";
    case "BLOCKED":
      return "error";
    case "CLOSED":
      return "success";
    default:
      return "info";
  }
}

function TicketDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const { tokens } = useTheme();
  const { currentAgentId, isInitialized } = useAgent();
  const { translations } = useLanguage();
  const [ticket, setTicket] = useState<Schema["Ticket"]["type"] | null>(null);
  const [customer, setCustomer] = useState<Schema["Customer"]["type"] | null>(null);
  const [assignedAgent, setAssignedAgent] = useState<Schema["Agent"]["type"] | null>(null);
  const [activities, setActivities] = useState<TicketActivity[]>([]);
  const [activityAgents, setActivityAgents] = useState<Record<string, Schema["Agent"]["type"]>>({});
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [notificationPrefs, setNotificationPrefs] = useState<Schema["NotificationPreference"]["type"] | null>(null);
  const [isEditingPrefs, setIsEditingPrefs] = useState(false);
  const [prefsForm, setPrefsForm] = useState({
    emailEnabled: false,
    smsEnabled: false,
    emailAddress: "",
    phoneNumber: "",
    notifyOnStatusChange: true,
    notifyOnCommentAdded: true,
    notifyOnPriorityChange: true,
    notifyOnAssignmentChange: true,
  });

  useEffect(() => {
    async function fetchTicketDetails() {
      if (!params.id || typeof params.id !== 'string') return;

      try {
        setLoading(true);
        // Fetch ticket
        const ticketResponse = await client.models.Ticket.get({ id: params.id });
        if (ticketResponse.data) {
          setTicket(ticketResponse.data);

          // Fetch customer if available
          if (ticketResponse.data.customerId) {
            const customerResponse = await client.models.Customer.get({ 
              id: ticketResponse.data.customerId 
            });
            setCustomer(customerResponse.data);
          }

          // Fetch assigned agent if available
          if (ticketResponse.data.assignedAgentId) {
            const agentResponse = await client.models.Agent.get({ 
              id: ticketResponse.data.assignedAgentId 
            });
            setAssignedAgent(agentResponse.data);
          }

          // Fetch activities
          const activitiesResponse = await client.models.TicketActivity.list({
            filter: { ticketId: { eq: params.id } }
          });
          if (activitiesResponse.data) {
            // Sort activities by createdAt in descending order
            const sortedActivities = [...activitiesResponse.data].sort((a, b) => 
              new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
            );
            setActivities(sortedActivities as TicketActivity[]);

            // Fetch agent details for each activity
            const agentIds = Array.from(new Set(sortedActivities
              .map(activity => activity.agentId)
              .filter(id => id && id !== "SYSTEM") as string[]));
            
            const agentDetails: Record<string, Schema["Agent"]["type"]> = {};
            for (const agentId of agentIds) {
              const agentResponse = await client.models.Agent.get({ id: agentId });
              if (agentResponse.data) {
                agentDetails[agentId] = agentResponse.data;
              }
            }
            setActivityAgents(agentDetails);
          }

          // Fetch notification preferences
          if (ticketResponse.data) {
            const prefsResponse = await client.models.NotificationPreference.get({ 
              id: params.id 
            });
            if (prefsResponse.data) {
              setNotificationPrefs(prefsResponse.data);
              setPrefsForm({
                emailEnabled: prefsResponse.data.emailEnabled || false,
                smsEnabled: prefsResponse.data.smsEnabled || false,
                emailAddress: prefsResponse.data.emailAddress || "",
                phoneNumber: prefsResponse.data.phoneNumber || "",
                notifyOnStatusChange: prefsResponse.data.notifyOnStatusChange || true,
                notifyOnCommentAdded: prefsResponse.data.notifyOnCommentAdded || true,
                notifyOnPriorityChange: prefsResponse.data.notifyOnPriorityChange || true,
                notifyOnAssignmentChange: prefsResponse.data.notifyOnAssignmentChange || true,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching ticket details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTicketDetails();
  }, [params.id]);

  async function createActivity(type: ActivityType, content: string, oldValue?: string, newValue?: string) {
    if (!ticket || !currentAgentId || !isInitialized || !ticket.id) {
      console.log('createActivity - Early return due to missing data:', {
        hasTicket: !!ticket,
        currentAgentId,
        isInitialized,
        ticketId: ticket?.id
      });
      return;
    }

    try {
      console.log('createActivity - Starting activity creation:', {
        type,
        content,
        oldValue,
        newValue,
        ticketId: ticket.id,
        currentAgentId
      });

      // Get current agent's email
      const agentResponse = await client.models.Agent.get({ id: currentAgentId });
      console.log('createActivity - Got agent data:', {
        agentId: currentAgentId,
        agentEmail: agentResponse.data?.email
      });

      const activity = await client.models.TicketActivity.create({
        ticketId: ticket.id,
        agentId: currentAgentId,
        type,
        content,
        oldValue,
        newValue,
        createdAt: new Date().toISOString(),
      });

      console.log('createActivity - Activity created:', {
        activityId: activity.data?.id,
        success: !!activity.data
      });

      if (activity.data) {
        console.log('createActivity - Updating activities state');
        setActivities(currentActivities => [activity.data as TicketActivity, ...currentActivities]);
      }
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket || !isInitialized || !ticket.id) {
      console.log('handleStatusChange - Early return due to missing data:', {
        hasTicket: !!ticket,
        isInitialized,
        ticketId: ticket?.id
      });
      return;
    }

    try {
      console.log('handleStatusChange - Starting status update:', {
        ticketId: ticket.id,
        oldStatus: ticket.status,
        newStatus
      });

      const oldStatus = ticket.status || 'OPEN';
      await client.models.Ticket.update({
        id: ticket.id,
        status: newStatus
      });

      console.log('handleStatusChange - Ticket status updated, creating activity');
      
      // Create activity
      await createActivity(
        'STATUS_CHANGE',
        `Status changed from ${oldStatus} to ${newStatus}`,
        oldStatus,
        newStatus
      );

      // Refresh ticket data
      console.log('handleStatusChange - Refreshing ticket data');
      const response = await client.models.Ticket.get({ id: ticket.id });
      if (response.data) {
        console.log('handleStatusChange - Ticket data refreshed');
        setTicket(response.data);
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!ticket || !isInitialized || !ticket.id) {
      console.log('handlePriorityChange - Early return due to missing data:', {
        hasTicket: !!ticket,
        isInitialized,
        ticketId: ticket?.id
      });
      return;
    }

    try {
      console.log('handlePriorityChange - Starting priority update:', {
        ticketId: ticket.id,
        oldPriority: ticket.priority,
        newPriority
      });

      const oldPriority = ticket.priority || 'MEDIUM';
      await client.models.Ticket.update({
        id: ticket.id,
        priority: newPriority
      });

      console.log('handlePriorityChange - Ticket priority updated, creating activity');
      
      // Create activity
      await createActivity(
        'PRIORITY_CHANGE',
        `Priority changed from ${oldPriority} to ${newPriority}`,
        oldPriority,
        newPriority
      );

      // Refresh ticket data
      console.log('handlePriorityChange - Refreshing ticket data');
      const response = await client.models.Ticket.get({ id: ticket.id });
      if (response.data) {
        console.log('handlePriorityChange - Ticket data refreshed');
        setTicket(response.data);
      }
    } catch (error) {
      console.error('Error updating ticket priority:', error);
    }
  };

  const handleAddNote = async () => {
    if (!ticket || !isInitialized || !newNote.trim()) return;
    try {
      await createActivity('NOTE', newNote.trim());
      setNewNote("");
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handlePrefsSubmit = async () => {
    if (!ticket || !ticket.id) return;

    try {
      const data = {
        ...prefsForm,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (notificationPrefs?.id) {
        // Update existing preferences
        await client.models.NotificationPreference.update({
          id: notificationPrefs.id,
          ...data,
        });
      } else {
        // Create new preferences
        await client.models.NotificationPreference.create({
          id: ticket.id,
          ...data,
        });
      }

      // Refresh notification preferences
      const prefsResponse = await client.models.NotificationPreference.get({ 
        id: ticket.id 
      });
      if (prefsResponse.data) {
        setNotificationPrefs(prefsResponse.data);
      }

      setIsEditingPrefs(false);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  };

  function getActivityIcon(type: ActivityType) {
    switch (type) {
      case 'NOTE':
        return '📝';
      case 'STATUS_CHANGE':
        return '🔄';
      case 'PRIORITY_CHANGE':
        return '⚡';
      case 'ASSIGNMENT_CHANGE':
        return '👤';
      default:
        return '•';
    }
  }

  if (loading) {
    return (
      <View padding={tokens.space.large}>
        <Text>Loading ticket details...</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View padding={tokens.space.large}>
        <Text>Ticket not found</Text>
      </View>
    );
  }

  return (
    <View padding={tokens.space.large}>
      <Flex direction="column" gap={tokens.space.medium}>
        {/* Header */}
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={2}>Ticket #{ticket.id?.slice(0, 8)}</Heading>
          <Button
            onClick={() => router.push('/protected/employee/agent-dashboard')}
            variation="link"
          >
            Back to Dashboard
          </Button>
        </Flex>

        {/* Main content */}
        <Flex gap={tokens.space.large}>
          {/* Left column - Activity feed */}
          <Card width="60%">
            <Flex direction="column" gap={tokens.space.medium}>
              <Heading level={3}>Activity Feed</Heading>
              
              {/* Add note form */}
              <Card variation="outlined">
                <Flex direction="column" gap={tokens.space.small}>
                  <TextAreaField
                    label="Add a note"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleAddNote}
                    variation="primary"
                    isDisabled={!newNote.trim()}
                  >
                    Add Note
                  </Button>
                </Flex>
              </Card>

              {/* Activity list */}
              <Flex direction="column" gap={tokens.space.small}>
                {activities.map((activity) => (
                  <Card key={activity.id} variation="outlined">
                    <Flex direction="column" gap={tokens.space.xxs}>
                      <Flex alignItems="center" gap={tokens.space.xs}>
                        <Text fontSize={tokens.fontSizes.large}>
                          {getActivityIcon(activity.type as ActivityType)}
                        </Text>
                        {activity.agentId === "SYSTEM" ? (
                          <Text fontWeight={tokens.fontWeights.bold}>
                            System
                          </Text>
                        ) : (
                          <a
                            onClick={(e) => {
                              e.preventDefault();
                              if (activity.agentId) {
                                router.push(`/protected/agents/${activity.agentId}`);
                              }
                            }}
                            href="#"
                            style={{
                              color: '#007EB9',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            {activityAgents[activity.agentId || ""]?.name || 
                             activityAgents[activity.agentId || ""]?.email || 
                             activity.agentId?.slice(0, 8)}
                          </a>
                        )}
                        <Text color={tokens.colors.font.tertiary}>
                          {new Date(activity.createdAt || "").toLocaleString()}
                        </Text>
                      </Flex>
                      <Text>{activity.content}</Text>
                      {(activity.type === 'PRIORITY_CHANGE' || activity.type === 'STATUS_CHANGE') && (
                        <Flex gap={tokens.space.xs} alignItems="center" marginTop={tokens.space.xxs}>
                          <Badge variation="info">{activity.oldValue}</Badge>
                          <Text>→</Text>
                          <Badge variation={activity.type === 'PRIORITY_CHANGE' ? 
                            getPriorityColor(activity.newValue) : 
                            getStatusColor(activity.newValue)
                          }>
                            {activity.newValue}
                          </Badge>
                        </Flex>
                      )}
                    </Flex>
                  </Card>
                ))}
                {activities.length === 0 && (
                  <Text color={tokens.colors.font.tertiary}>No activity yet</Text>
                )}
              </Flex>
            </Flex>
          </Card>

          {/* Right column - Metadata */}
          <Card width="40%">
            <Flex direction="column" gap={tokens.space.medium}>
              <Heading level={3}>Ticket Details</Heading>

              <Flex direction="column" gap={tokens.space.small}>
                <Text>
                  <strong>Title:</strong> {ticket.title}
                </Text>
                <Text>
                  <strong>Description:</strong> {ticket.description}
                </Text>
                
                <Divider />

                <SelectField
                  label="Status"
                  value={ticket.status || "OPEN"}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="CLOSED">Closed</option>
                </SelectField>

                <SelectField
                  label="Priority"
                  value={ticket.priority || "MEDIUM"}
                  onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </SelectField>

                <Text>
                  <strong>Category:</strong> {ticket.category}
                </Text>

                <Divider />

                {customer && (
                  <Text>
                    <strong>Customer:</strong>{" "}
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/protected/customers/${customer.id}`);
                      }}
                      href="#"
                      style={{
                        color: '#007EB9',
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {customer.name} ({customer.email})
                    </a>
                  </Text>
                )}

                {assignedAgent && (
                  <Text>
                    <strong>Assigned To:</strong>{" "}
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/protected/agents/${assignedAgent.id}`);
                      }}
                      href="#"
                      style={{
                        color: '#007EB9',
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {assignedAgent.email}
                    </a>
                  </Text>
                )}

                <Divider />

                <Text>
                  <strong>Created:</strong> {new Date(ticket.createdAt || "").toLocaleString()}
                </Text>
                <Text>
                  <strong>Last Updated:</strong> {new Date(ticket.updatedAt || "").toLocaleString()}
                </Text>
              </Flex>

              {/* Notification Preferences */}
              <Flex direction="column" gap={tokens.space.small}>
                <Heading level={4}>Notification Preferences</Heading>
                
                {isEditingPrefs ? (
                  <Card variation="outlined">
                    <Flex direction="column" gap={tokens.space.small}>
                      <SwitchField
                        label="Email Notifications"
                        checked={prefsForm.emailEnabled}
                        onChange={(e) => setPrefsForm(prev => ({
                          ...prev,
                          emailEnabled: e.target.checked
                        }))}
                      />
                      
                      {prefsForm.emailEnabled && (
                        <TextField
                          label="Email Address"
                          value={prefsForm.emailAddress}
                          onChange={(e) => setPrefsForm(prev => ({
                            ...prev,
                            emailAddress: e.target.value
                          }))}
                          type="email"
                        />
                      )}

                      <SwitchField
                        label="SMS Notifications"
                        checked={prefsForm.smsEnabled}
                        onChange={(e) => setPrefsForm(prev => ({
                          ...prev,
                          smsEnabled: e.target.checked
                        }))}
                      />
                      
                      {prefsForm.smsEnabled && (
                        <TextField
                          label="Phone Number"
                          value={prefsForm.phoneNumber}
                          onChange={(e) => setPrefsForm(prev => ({
                            ...prev,
                            phoneNumber: e.target.value
                          }))}
                          type="tel"
                        />
                      )}

                      <Divider />

                      <Text fontWeight={tokens.fontWeights.bold}>
                        Notify me when:
                      </Text>

                      <SwitchField
                        label="Status Changes"
                        checked={prefsForm.notifyOnStatusChange}
                        onChange={(e) => setPrefsForm(prev => ({
                          ...prev,
                          notifyOnStatusChange: e.target.checked
                        }))}
                      />

                      <SwitchField
                        label="Comments Added"
                        checked={prefsForm.notifyOnCommentAdded}
                        onChange={(e) => setPrefsForm(prev => ({
                          ...prev,
                          notifyOnCommentAdded: e.target.checked
                        }))}
                      />

                      <SwitchField
                        label="Priority Changes"
                        checked={prefsForm.notifyOnPriorityChange}
                        onChange={(e) => setPrefsForm(prev => ({
                          ...prev,
                          notifyOnPriorityChange: e.target.checked
                        }))}
                      />

                      <SwitchField
                        label="Assignment Changes"
                        checked={prefsForm.notifyOnAssignmentChange}
                        onChange={(e) => setPrefsForm(prev => ({
                          ...prev,
                          notifyOnAssignmentChange: e.target.checked
                        }))}
                      />

                      <Flex gap={tokens.space.small}>
                        <Button
                          onClick={handlePrefsSubmit}
                          variation="primary"
                        >
                          Save Preferences
                        </Button>
                        <Button
                          onClick={() => setIsEditingPrefs(false)}
                          variation="link"
                        >
                          Cancel
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                ) : (
                  <Card variation="outlined">
                    <Flex direction="column" gap={tokens.space.small}>
                      {notificationPrefs ? (
                        <>
                          {notificationPrefs.emailEnabled && (
                            <Text>
                              <strong>Email:</strong> {notificationPrefs.emailAddress}
                            </Text>
                          )}
                          {notificationPrefs.smsEnabled && (
                            <Text>
                              <strong>SMS:</strong> {notificationPrefs.phoneNumber}
                            </Text>
                          )}
                          <Text>
                            <strong>Notifications:</strong>{" "}
                            {[
                              notificationPrefs.notifyOnStatusChange && "Status Changes",
                              notificationPrefs.notifyOnCommentAdded && "Comments",
                              notificationPrefs.notifyOnPriorityChange && "Priority Changes",
                              notificationPrefs.notifyOnAssignmentChange && "Assignment Changes",
                            ].filter(Boolean).join(", ")}
                          </Text>
                        </>
                      ) : (
                        <Text>No notification preferences set</Text>
                      )}
                      <Button
                        onClick={() => setIsEditingPrefs(true)}
                        variation="link"
                      >
                        {notificationPrefs ? "Edit Preferences" : "Set Up Notifications"}
                      </Button>
                    </Flex>
                  </Card>
                )}
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Flex>
    </View>
  );
}

export default function TicketDetailsPage() {
  return (
    <Suspense>
      <TicketDetailsContent />
    </Suspense>
  );
}