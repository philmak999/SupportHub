import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Queue, TicketListItem } from "../types";

export default function SupervisorPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [queueId, setQueueId] = useState<number | "all">("all");

  async function load() {
    const qs = await api<Queue[]>("/queues");
    setQueues(qs);
    const ts = await api<TicketListItem[]>("/tickets");
    setTickets(ts);
  }

  useEffect(() => {
    load();
  }, []);

  const visible = queueId === "all" ? tickets : tickets.filter((t) => t.queue !== "(unrouted)" && queues.find((q) => q.id === queueId)?.name === t.queue);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h3>Supervisor Dashboard</h3>
      <button onClick={load}>Refresh</button>

      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
        <span>Queue:</span>
        <select value={queueId} onChange={(e) => setQueueId(e.target.value === "all" ? "all" : Number(e.target.value))}>
          <option value="all">All</option>
          {queues.map((q) => (
            <option key={q.id} value={q.id}>
              {q.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 12, border: "1px solid #ddd" }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 140px 140px 120px 160px", fontWeight: 700, padding: 8, borderBottom: "1px solid #ddd" }}>
          <div>ID</div>
          <div>Customer</div>
          <div>Queue</div>
          <div>Status</div>
          <div>Priority</div>
          <div>Assigned</div>
        </div>

        {visible.map((t) => (
          <div key={t.id} style={{ display: "grid", gridTemplateColumns: "80px 1fr 140px 140px 120px 160px", padding: 8, borderBottom: "1px solid #eee" }}>
            <div>#{t.id}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{t.customerName}</div>
              <div style={{ color: "#666", fontSize: 12 }}>
                {t.channel} · {t.category}
              </div>
            </div>
            <div>{t.queue}</div>
            <div>{t.status}</div>
            <div>{t.priority}</div>
            <div>{t.assignedAgent ?? "-"}</div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 10, color: "#666" }}>
        Tip: trigger inbound tickets with Postman to see real-time updates.
      </p>
    </div>
  );
}
