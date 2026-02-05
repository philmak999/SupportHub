# SupportHub: Intelligent Ticket Routing + Omnichannel Hub

SupportHub is a full-stack reference implementation of how modern support organizations route, prioritize, and resolve inbound support requests across chat, email, and SMS. It combines an authenticated API, rule-based routing logic, real-time updates, and role-specific UI so teams can manage customer conversations in one place.

**Why This Matters In Business**
- **Operational efficiency**: Routing rules automate where work goes, reducing manual triage and response time.
- **Better customer experience**: VIPs and urgent topics get prioritized consistently.
- **Supervisory visibility**: Supervisors can monitor queues, workload, and assignment status in real time.
- **Agent focus**: Agents see only the tickets assigned to them and can respond quickly.
- **Auditability**: Centralized tickets and conversation history create a clear record.

**What The System Demonstrates**
- **API design**: Auth, inbound ingestion, ticket operations, queue stats, and rules management.
- **Business logic**: Rule-based routing with priorities and auto-assignment.
- **Realtime features**: SignalR pushes ticket updates and assignments instantly.
- **Omnichannel handling**: Inbound events from chat, email, and SMS use the same workflow.
- **Enterprise relevance**: Role-based permissions (Agent, Supervisor, Admin) and scalable routing.

**Project Structure**
- `backend/SupportHub.Api`
- ASP.NET Core API + EF Core + JWT + SignalR.
- Inbound endpoints, routing engine, real-time events, and data persistence.
- `frontend/support-hub-ui`
- React + Vite + TypeScript UI.
- Agent and supervisor consoles, rules editor, and real-time updates.

**Quick Start**
```powershell
# Backend
cd support-hub\backend\SupportHub.Api
dotnet restore
dotnet run

# Frontend (new terminal)
cd support-hub\frontend\support-hub-ui
npm install
npm run dev
```

**How It Fits In Practice**
- **Customer support**: Unified intake from email, chat, and SMS to avoid missed requests.
- **IT helpdesk**: Rule-based routing to the right team (network, billing, access, etc.).
- **Order/returns**: Auto-prioritize refund or delivery issues with clear SLA ownership.
- **Compliance/SLA tracking**: Consistent queueing and priority logic to meet response targets.

**Where To Look Next**
- Backend details: `https://github.com/philmak999/SupportHub/blob/main/backend/SupportHub.Api/README.md)`
- Frontend details: `(https://github.com/philmak999/SupportHub/blob/main/frontend/support-hub-ui/README.md)`
