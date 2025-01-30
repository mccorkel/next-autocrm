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
  }).authorization(allow => [
      allow.authenticated(),
      allow.publicApiKey()]),

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
  }).authorization(allow => [
    allow.authenticated(),
    allow.publicApiKey()]),

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
    incomingEmail: a.hasOne('IncomingEmail', ['ticketActivityId']),
  }).authorization(allow => [
    allow.authenticated(),
    allow.publicApiKey()]),

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
  }).authorization(allow => [
    allow.authenticated(),
    allow.publicApiKey()]),

  Comment: a.model({
    id: a.id(),
    content: a.string(),
    authorId: a.string(),
    ticketId: a.string(),
    createdAt: a.datetime(),
    ticket: a.belongsTo('Ticket', ['ticketId'])
  }).authorization(allow => [
    allow.authenticated(),
    allow.publicApiKey()]),

  Customer: a.model({
    id: a.id(),
    name: a.string(),
    email: a.string(),
    phone: a.string(),
    company: a.string(),
    tickets: a.hasMany('Ticket', ['customerId']),
    emails: a.hasMany('IncomingEmail', ['fromAddress']),
  }).authorization(allow => [
    allow.authenticated(),
    allow.publicApiKey()]),

  EmailCategorization: a.model({
    id: a.id(),
    incomingEmailId: a.string(),
    subject: a.string(),
    category: a.enum(['ACCOUNT', 'BILLING', 'SUPPORT', 'SALES', 'OTHER']),
    language: a.enum(['EN', 'DE', 'ES', 'FR', 'JA']),
    confidence: a.float(),
    createdAt: a.datetime(),
    email: a.belongsTo('IncomingEmail', ['incomingEmailId']),
    isCategoryCorrect: a.boolean(),
    isLanguageCorrect: a.boolean(),
    feedbackSentToLLM: a.boolean(),
    feedbackSentAt: a.datetime(),
    llmSuggestion: a.string(),
    llmSuggestionCategory: a.enum(['ACCOUNT', 'BILLING', 'SUPPORT', 'SALES', 'OTHER']),
    llmSuggestionLanguage: a.enum(['EN', 'DE', 'ES', 'FR', 'JA']),
  }).authorization(allow => [
    allow.authenticated(),
    allow.publicApiKey()]),

  IncomingEmail: a.model({
    id: a.id(),
    fromAddress: a.string(),
    toAddress: a.string(),
    subject: a.string(),
    body: a.string(),
    createdAt: a.datetime(),
    categorization: a.hasOne('EmailCategorization', ['incomingEmailId']),
    customer: a.belongsTo('Customer', ['fromAddress']),
    ticketActivityId: a.string(),
    ticketActivity: a.belongsTo('TicketActivity', ['ticketActivityId']),
  }).authorization(allow => [
    allow.authenticated(),
    allow.publicApiKey()]),
});

export default schema;
export type Schema = typeof schema;