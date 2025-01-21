import { a } from "@aws-amplify/backend";

const schema = a.schema({
  Ticket: a.model({
    id: a.id(),
    title: a.string(),
    description: a.string(),
    status: a.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
    priority: a.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    customerId: a.string(),
    assignedAgentId: a.string(),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
    comments: a.hasMany('Comment', ['ticketId']),
    customer: a.belongsTo('Customer', ['customerId']),
    assignedAgent: a.belongsTo('Agent', ['assignedAgentId']),
    category: a.enum(['ACCOUNT', 'BILLING', 'SUPPORT', 'SALES', 'OTHER']),
  }).authorization(allow => allow.authenticated()),

  Agent: a.model({
    id: a.id(),
    name: a.string(),
    email: a.string(),
    assignedTickets: a.hasMany('Ticket', ['assignedAgentId']),
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