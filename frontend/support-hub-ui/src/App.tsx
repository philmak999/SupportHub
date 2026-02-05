import { Link, Route, Routes, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AgentPage from "./pages/AgentPage";
import SupervisorPage from "./pages/SupervisorPage";
import RulesPage from "./pages/RulesPage";
import { clearAuth, getRole, getName } from "./auth/auth";
import { useEffect, useState } from "react";
import { startHub } from "./realtime/hub";
import { api } from "./api/client";
import "./App.css";

function Shell({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();
  const [name, setName] = useState(getName());
  const role = getRole();
  const isAuthed = !!role;
  const title = role ? `(${role})` : "(Guest)";

  useEffect(() => {
    setName(getName());
  }, []);

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #ddd", display: "flex", alignItems: "center", gap: 12 }}>
        <strong>SupportHub</strong>
        <Link to="/">Home</Link>
        <Link to="/submit">Submit Ticket</Link>
        {role === "Agent" && <Link to="/agent">Agent</Link>}
        {(role === "Supervisor" || role === "Admin") && <Link to="/supervisor">Supervisor</Link>}
        {(role === "Supervisor" || role === "Admin") && <Link to="/rules">Rules</Link>}

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "#666" }}>
            {isAuthed ? `${name ?? ""} ${title}`.trim() : "Viewing as guest"}
          </span>
          {!isAuthed ? (
            <button onClick={() => nav("/login")}>Login</button>
          ) : (
            <button
              onClick={() => {
                clearAuth();
                nav("/");
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function App() {
  const nav = useNavigate();
  const role = getRole();

  useEffect(() => {
    // start real-time connection; refresh pages manually for now
    startHub(() => {
      // For simplicity: no global store; you can add one later.
      // This proves real-time connectivity.
      // Each page has Refresh button.
    });
  }, []);

  return (
    <Shell>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<TicketSubmissionPage />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/supervisor" element={<SupervisorPage />} />
        <Route path="/rules" element={<RulesPage />} />
      </Routes>
    </Shell>
  );
}

function Home() {
  const nav = useNavigate();

  return (
    <div className="home">
      <section className="hero">
        <div>
          <h1>Welcome to SupportHub</h1>
          <p className="hero-subtitle">
            SupportHub is a centralized customer support hub that routes chat, email, SMS, and phone requests to the right team based on
            priority and business rules. Every request becomes a trackable ticket with clear ownership.
          </p>
        </div>
        <div className="hero-panel">
          <div className="panel-title">Support Hours</div>
          <div className="panel-row">
            <span>Weekdays</span>
            <span>8:00 AM - 8:00 PM</span>
          </div>
          <div className="panel-row">
            <span>Weekend</span>
            <span>10:00 AM - 6:00 PM</span>
          </div>
          <div className="panel-foot">Urgent issues are routed with highest priority.</div>
        </div>
      </section>

      <section className="contact-grid">
        <div className="contact-card">
          <h3>Phone Support</h3>
          <p>Call and speak with an agent for urgent or complex issues.</p>
          <div className="contact-detail">1-800-555-0149</div>
          <div className="contact-meta">Average wait: 2-4 minutes</div>
          <a className="link" href="tel:18005550149">
            Call Now
          </a>
        </div>
        <div className="contact-card">
          <h3>Live Agent</h3>
          <p>Chat with a support agent right now.</p>
          <div className="contact-detail">Available now</div>
          <button className="link" onClick={() => nav("/submit?channel=chat")}>
            Start Live Chat
          </button>
        </div>
        <div className="contact-card">
          <h3>Submit A Ticket</h3>
          <p>Send details and get a case number instantly.</p>
          <div className="contact-detail">Response within 1 business day</div>
          <button className="link" onClick={() => nav("/submit")}>
            Submit A Ticket
          </button>
        </div>
      </section>
    </div>
  );
}

function TicketSubmissionPage() {
  const nav = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const initial = (params.get("channel") as "email" | "chat" | "sms" | null) ?? "email";

  const [channel, setChannel] = useState<"email" | "chat" | "sms">(initial);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setError(null);

    try {
      const res = await api<{ conversationId: number; ticketId: number }>(`/inbound/${channel}`, {
        method: "POST",
        body: JSON.stringify({
          from: email || phone || "web",
          customer: {
            name: name || "Unknown",
            email,
            phone,
            isVip: false,
          },
          subject,
          body,
          timestamp: new Date().toISOString(),
        }),
      });

      setStatus(`Ticket submitted. Ticket #${res.ticketId} created.`);
      setSubject("");
      setBody("");
    } catch (e: any) {
      setError(e.message || "Failed to submit ticket");
    }
  }

  return (
    <div className="home">
      <section className="form-section">
        <div className="form-header">
          <h2>Ticket Submission</h2>
          <p>
            Choose how you want to contact us, then describe your issue. We will route the request to the right team automatically.
          </p>
        </div>
        <form className="ticket-form" onSubmit={submit}>
          <div className="field">
            <label>Preferred Contact Channel</label>
            <select value={channel} onChange={(e) => setChannel(e.target.value as "email" | "chat" | "sms")}>
              <option value="email">Email</option>
              <option value="chat">Live Chat</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div className="field">
            <label>Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@email.com" />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 222-3344" />
          </div>
          <div className="field full">
            <label>Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Billing issue, refund request, delivery delay" />
          </div>
          <div className="field full">
            <label>Issue Details</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Describe the issue in detail..." />
          </div>
          <div className="form-actions">
            <button className="primary" type="submit" disabled={!body.trim()}>
              Submit Ticket
            </button>
            <button type="button" className="secondary" onClick={() => nav("/")}>
              Back To Home
            </button>
            {status && <div className="status success">{status}</div>}
            {error && <div className="status error">{error}</div>}
          </div>
        </form>
      </section>
    </div>
  );
}
