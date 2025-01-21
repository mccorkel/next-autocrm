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
    comments: a.hasMany('Comment', 'ticketId'),
  }),

  Comment: a.model({
    id: a.id(),
    content: a.string(),
    authorId: a.string(),
    ticketId: a.string(),
    createdAt: a.datetime(),
    ticket: a.belongsTo('Ticket', 'ticketId'),
  }),

  Customer: a.model({
    id: a.id(),
    name: a.string(),
    email: a.string(),
    phone: a.string(),
    company: a.string(),
    tickets: a.hasMany('Ticket', 'customerId'),
  }),

  Agent: a.model({
    id: a.id(),
    name: a.string(),
    email: a.string(),
    role: a.enum(['ADMIN', 'AGENT', 'SUPERVISOR']),
    assignedTickets: a.hasMany('Ticket', 'assignedAgentId'),
  })
});

export default schema;
export type Schema = typeof schema;