import { a } from "@aws-amplify/backend";

const schema = a.schema({
  Ticket: a.model({
    id: a.id(),
    title: a.string(),
    description: a.string(),
    status: a.enum(['OPEN', 'IN_PROGRESS', 'BLOCKED', 'CLOSED']),
    priority: a.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    customerId: a.string(),
    assignedAgentId: a.string(),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
    comments: a.hasMany('Comment', ['ticketId']),
    activities: a.hasMany('TicketActivity', ['ticketId']),
    customer: a.belongsTo('Customer', ['customerId']),
    assignedAgent: a.belongsTo('Agent', ['assignedAgentId']),
    category: a.enum(['ACCOUNT', 'BILLING', 'SUPPORT', 'SALES', 'OTHER']),
    emailThreadId: a.string(),
    lastEmailReceivedAt: a.datetime(),
    notificationPreferences: a.hasOne('NotificationPreference', ['ticketId']),
  }).authorization(allow => allow.authenticated()),

  NotificationPreference: a.model({
    id: a.id(),
    ticketId: a.string(),
    ticket: a.belongsTo('Ticket', ['ticketId']),
    emailEnabled: a.boolean(),
    smsEnabled: a.boolean(),
    emailAddress: a.string(),
    phoneNumber: a.string(),
    notifyOnStatusChange: a.boolean(),
    notifyOnCommentAdded: a.boolean(),
    notifyOnPriorityChange: a.boolean(),
    notifyOnAssignmentChange: a.boolean(),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  }).authorization(allow => allow.authenticated()),

  TicketActivity: a.model({
    id: a.id(),
    ticketId: a.string(),
    agentId: a.string(),
    agentEmail: a.string(),
    type: a.enum(['NOTE', 'STATUS_CHANGE', 'PRIORITY_CHANGE', 'ASSIGNMENT_CHANGE', 'EMAIL_RECEIVED', 'EMAIL_SENT']),
    content: a.string(),
    oldValue: a.string(),
    newValue: a.string(),
    createdAt: a.datetime(),
    ticket: a.belongsTo('Ticket', ['ticketId']),
    agent: a.belongsTo('Agent', ['agentId']),
  }).authorization(allow => allow.authenticated()),

  Agent: a.model({
    id: a.id(),
    name: a.string(),
    email: a.string(),
    assignedTickets: a.hasMany('Ticket', ['assignedAgentId']),
    activities: a.hasMany('TicketActivity', ['agentId']),
    assignedCategories: a.string().array(),
    status: a.enum(['AVAILABLE', 'BUSY', 'OFFLINE']),
    maxConcurrentTickets: a.integer(),
    supervisorId: a.string(),
    supervisor: a.belongsTo('Agent', ['supervisorId']),
    agents: a.hasMany('Agent', ['supervisorId']),
  }).authorization(allow => allow.authenticated()),

  Comment: a.model({
    id: a.id(),
    content: a.string(),
    authorId: a.string(),
    ticketId: a.string(),
    createdAt: a.datetime(),
    ticket: a.belongsTo('Ticket', ['ticketId'])
  }).authorization(allow => allow.authenticated()),

  Customer: a.model({
    id: a.id(),
    name: a.string(),
    email: a.string(),
    phone: a.string(),
    company: a.string(),
    tickets: a.hasMany('Ticket', ['customerId'])
  }).authorization(allow => allow.authenticated()),
});

export default schema;
export type Schema = typeof schema;