import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type { ConversationView, TicketListItem } from "../types";

export default function AgentPage() {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [view, setView] = useState<ConversationView | null>(null);
  const [reply, setReply] = useState("");

  const selectedTicket = useMemo(() => tickets.find((t) => t.id === selected) || null, [tickets, selected]);

  async function loadTickets() {
    const res = await api<TicketListItem[]>("/tickets?assignedTo=me");
    setTickets(res);
    if (!selected && res[0]) setSelected(res[0].id);
  }

  async function loadConversation(ticketId: number) {
    const res = await api<ConversationView>(`/tickets/${ticketId}/conversation`);
    setView(res);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (selected) loadConversation(selected);
  }, [selected]);

  async function sendReply() {
    if (!view || !reply.trim()) return;
    await api(`/conversations/${view.conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body: reply }),
    });
    setReply("");
    await loadConversation(view.ticketId);
    await loadTickets();
  }

  async function setStatus(status: string) {
    if (!selectedTicket) return;
    await api(`/tickets/${selectedTicket.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    await loadTickets();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16, padding: 16, fontFamily: "system-ui" }}>
      <div>
        <h3>My Tickets</h3>
        <button onClick={loadTickets}>Refresh</button>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelected(t.id)}
              style={{
                border: "1px solid #ddd",
                padding: 10,
                cursor: "pointer",
                background: selected === t.id ? "#f3f3f3" : "white",
              }}
            >
              <div style={{ fontWeight: 700 }}>
                #{t.id} · {t.customerName}
              </div>
              <div style={{ fontSize: 13, color: "#555" }}>
                {t.queue} · {t.priority} · {t.status} · {t.channel}
              </div>
              <div style={{ fontSize: 12, color: "#777" }}>{t.category}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3>Ticket</h3>
        {!selectedTicket || !view ? (
          <div>Select a ticket</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700 }}>
                  #{selectedTicket.id} · {selectedTicket.customerName}{" "}
                  {view.customer.isVip ? <span style={{ color: "purple" }}>(VIP)</span> : null}
                </div>
                <div style={{ color: "#666" }}>
                  {selectedTicket.queue} · {selectedTicket.priority} · {selectedTicket.status} · {view.channel}
                </div>
                {view.subject && <div style={{ color: "#666" }}>Subject: {view.subject}</div>}
              </div>

              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button onClick={() => setStatus("Open")}>Open</button>
                <button onClick={() => setStatus("Pending")}>Pending</button>
                <button onClick={() => setStatus("Resolved")}>Resolved</button>
                <button onClick={() => setStatus("Closed")}>Closed</button>
              </div>
            </div>

            <div style={{ border: "1px solid #ddd", marginTop: 12, padding: 10, height: 360, overflow: "auto" }}>
              {view.messages.map((m) => (
                <div key={m.id} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {new Date(m.sentAt).toLocaleString()} · {m.direction} · {m.from}
                  </div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                style={{ width: "100%" }}
                placeholder="Type a reply..."
              />
              <button onClick={sendReply} style={{ height: 42 }}>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
