# SupportHub (Personal Project)

A full-stack omnichannel support hub built to practice modern routing, prioritization, and real-time collaboration. The UI focuses on agent and supervisor workflows, while the backend exposes clean API endpoints and SignalR events that can scale as the product grows.

## Highlights (Customer UX)
- Unified view of chat, email, and SMS conversations in a single workspace.
- Role-based experiences for agents and supervisors.
- Clear queue visibility with priority and category context.
- Real-time ticket updates and assignments via SignalR.
- Fast routing decisions based on configurable rules.

## Core Features
- Auth with JWT for API and SignalR access.
- Inbound ingestion for chat, email, and SMS.
- Ticket lifecycle management with status and assignment updates.
- Queue stats and supervisor visibility.
- Routing rules engine with condition/action JSON.

## Scalability and Architecture
- Clean separation between frontend and backend with an API-driven flow.
- Modular controller design and service layer for routing logic.
- SignalR-based real-time events for scalable client updates.
- Routing rules can expand to additional conditions and actions.
- Ready for database-backed persistence as datasets grow.

## Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: ASP.NET Core + EF Core + JWT + SignalR
- HTTP: REST endpoints with JSON
