# SupportHub UI (React + Vite + TypeScript)

This frontend is the operator console for the SupportHub omnichannel ticketing demo. It authenticates with the API, renders role-based views, and subscribes to real-time updates via SignalR.

**How It Works**
- Uses JWT stored in `localStorage` for API and SignalR auth.
- Renders separate experiences for agents and supervisors.
- Pulls ticket lists and conversations on demand, with manual refresh controls.
- Receives real-time events for ticket creation/updates and assignments.

**Routes And Pages**
- `/login` -> Login form that exchanges credentials for a JWT and role.
- `/` -> Home page with an example inbound request payload.
- `/agent` -> Agent workspace to view assigned tickets, read conversations, send replies, and update status.
- `/supervisor` -> Supervisor dashboard to filter tickets by queue and monitor assignment/status.
- `/rules` -> Routing rules editor to view and update rule JSON.

**Page Behavior Details**
- `LoginPage`
- Function: calls `POST /auth/login`, stores token + role + name, then navigates to `/`.
- Errors: displays API error text if login fails.
- `AgentPage`
- Function: loads `GET /tickets?assignedTo=me`, loads `GET /tickets/{id}/conversation`, sends `POST /conversations/{id}/messages`, updates `PATCH /tickets/{id}`.
- Status controls: sets `Open`, `Pending`, `Resolved`, `Closed`.
- Refresh: manual refresh button reloads ticket list and selected conversation.
- `SupervisorPage`
- Function: loads `GET /queues` and `GET /tickets`, filters view by queue.
- Focus: global overview, assignment visibility, and channel/category context.
- `RulesPage`
- Function: loads `GET /routing-rules`, edits rule JSON, saves with `PATCH /routing-rules/{id}`.
- Validation: API errors are displayed inline if save fails.

**Realtime**
- `startHub` connects to `GET /hub` using the JWT in the query string.
- Joins a role-specific SignalR group (`Agent` or `Supervisor`).
- Subscribes to `TicketCreatedOrUpdated` and `TicketAssigned` events.

**Key Modules**
- `src/api/client.ts`
- Function: typed API wrapper that attaches `Authorization: Bearer <token>`.
- `src/auth/auth.ts`
- Function: stores and retrieves JWT, role, and display name.
- `src/realtime/hub.ts`
- Function: SignalR connection lifecycle and event subscription.

**Run**
```powershell
cd support-hub\frontend\support-hub-ui
npm install
npm run dev
```

**Environment Assumptions**
- API base URL is `http://localhost:5169` in `src/api/client.ts`.
- SignalR hub is `http://localhost:5169/hub`.
