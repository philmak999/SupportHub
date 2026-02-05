# SupportHub API (ASP.NET Core + EF Core + SignalR + JWT)

This backend implements an omnichannel ticket routing system with authentication, configurable routing rules, and real-time updates for agents and supervisors.

**How It Works**
- Inbound messages create or update conversations and tickets.
- A routing engine applies JSON-based rules to set queue, priority, category, and auto-assign agents.
- JWT auth protects API routes and SignalR hub access.
- SignalR broadcasts ticket updates and assignments to role-based groups.

**Run**
```powershell
cd support-hub\backend\SupportHub.Api
dotnet restore
dotnet run
```

**Default URLs**
- HTTP: `http://localhost:5169`
- HTTPS: `https://localhost:7142`
- Swagger: `http://localhost:5169/swagger`

**Authentication**
- `POST /auth/login`
- Function: validates user credentials, issues JWT, returns role and display name.
- Request body: `{ "email": "...", "password": "..." }`
- Response: `{ "token": "...", "role": "Agent|Supervisor|Admin", "name": "..." }`

**Inbound Channels**
- `POST /inbound/chat`
- `POST /inbound/email`
- `POST /inbound/sms`
- Function: upserts customer, creates or reuses an open conversation, creates ticket if needed, stores message, applies routing rules, and emits real-time events.
- Request body:
```json
{
  "from": "sam@email.com",
  "customer": { "name": "Sam", "email": "sam@email.com", "phone": "", "isVip": false },
  "subject": "Refund request",
  "body": "I was charged twice on my invoice",
  "timestamp": "2026-02-04T18:30:00Z"
}
```
- Response: `{ "conversationId": 123, "ticketId": 456 }`

**Tickets**
- `GET /tickets`
- Function: list tickets, optional filters by `assignedTo=me`, `queueId`, or `status`.
- `PATCH /tickets/{id}`
- Function: update status, priority, or category; broadcasts `TicketCreatedOrUpdated`.
- `POST /tickets/{id}/assign`
- Function: supervisor/admin-only assignment or queue change; broadcasts `TicketAssigned`.
- `GET /tickets/{id}/conversation`
- Function: returns ticket details, customer info, and ordered conversation messages.

**Queues**
- `GET /queues`
- Function: list queues with name and description.
- `GET /queues/{id}/stats`
- Function: supervisor/admin-only queue stats (open count and oldest ticket).

**Routing Rules**
- `GET /routing-rules`
- Function: list routing rules in priority order.
- `POST /routing-rules`
- Function: create a routing rule.
- `PATCH /routing-rules/{id}`
- Function: update rule name, priority, enablement, condition JSON, or action JSON.

**Routing Rule Format**
- Condition JSON supports:
- `keywords` (array of strings)
- `isVip` (boolean)
- `channel` (`Chat`, `Email`, `SMS`)
- Action JSON supports:
- `queueName` (string)
- `priority` (`Low`, `Normal`, `High`, `Urgent`)
- `category` (string)
- `autoAssignAgent` (boolean)

**Real-time (SignalR)**
- Hub endpoint: `GET /hub`
- Auth: JWT in `access_token` query string.
- Groups: clients join `Agent` or `Supervisor`.
- Events:
- `TicketCreatedOrUpdated` -> `{ ticketId }`
- `TicketAssigned` -> `{ ticketId, agentUserId }`

**Key Services**
- `RoutingEngine`
- Function: evaluates enabled rules in priority order and applies the first match.
- `JwtService`
- Function: issues JWTs with role and identity claims.
- `SeedData`
- Function: seeds demo users, queues, rules, and tickets on first run.
