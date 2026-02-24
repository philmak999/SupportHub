import * as signalR from "@microsoft/signalr";
import { API_BASE } from "../api/client";
import { getRole, getToken } from "../auth/auth";

let conn: signalR.HubConnection | null = null;
const handlers = new Set<(name: string, payload: any) => void>();

export async function startHub() {
  const token = getToken();
  if (!token) return;

  conn = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE}/hub?access_token=${encodeURIComponent(token)}`)
    .withAutomaticReconnect()
    .build();

  conn.on("TicketCreatedOrUpdated", (p) => handlers.forEach((h) => h("TicketCreatedOrUpdated", p)));
  conn.on("TicketAssigned", (p) => handlers.forEach((h) => h("TicketAssigned", p)));
  conn.on("ConversationMessage", (p) => handlers.forEach((h) => h("ConversationMessage", p)));

  await conn.start();

  const role = getRole();
  if (role) await conn.invoke("JoinRoleRoom", role);
}

export async function stopHub() {
  if (conn) await conn.stop();
  conn = null;
}

export function onHubEvent(handler: (name: string, payload: any) => void) {
  handlers.add(handler);
  return () => handlers.delete(handler);
}
