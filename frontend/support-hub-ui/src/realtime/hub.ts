import * as signalR from "@microsoft/signalr";
import { API_BASE } from "../api/client";
import { getRole, getToken } from "../auth/auth";

let conn: signalR.HubConnection | null = null;

export async function startHub(onEvent: (name: string, payload: any) => void) {
  const token = getToken();
  if (!token) return;

  conn = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE}/hub?access_token=${encodeURIComponent(token)}`)
    .withAutomaticReconnect()
    .build();

  conn.on("TicketCreatedOrUpdated", (p) => onEvent("TicketCreatedOrUpdated", p));
  conn.on("TicketAssigned", (p) => onEvent("TicketAssigned", p));

  await conn.start();

  const role = getRole();
  if (role) await conn.invoke("JoinRoleRoom", role);
}

export async function stopHub() {
  if (conn) await conn.stop();
  conn = null;
}
