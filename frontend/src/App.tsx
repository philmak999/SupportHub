import { Link, NavLink, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AgentPage from "./pages/AgentPage";
import SupervisorPage from "./pages/SupervisorPage";
import RulesPage from "./pages/RulesPage";
import { clearAuth, getRole, getName } from "./auth/auth";
import { useEffect, useRef, useState } from "react";
import { startHub } from "./realtime/hub";
import * as signalR from "@microsoft/signalr";
import { api, API_BASE } from "./api/client";
import "./App.css";

function Shell({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();
  const location = useLocation();
  const [name, setName] = useState(getName());
  const role = getRole();
  const isAuthed = !!role;
  const [botOpen, setBotOpen] = useState(false);
  const [botMessages, setBotMessages] = useState<{ from: "bot" | "user"; text: string }[]>([
    { from: "bot", text: "Hi! I’m the SupportHub assistant. How can I help?" },
  ]);
  const [botInput, setBotInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    setName(getName());
  }, [location.pathname]);

  function botAnswer(question: string) {
    const q = question.toLowerCase();
    if (q.includes("hours") || q.includes("open")) {
      return "Support hours: Weekdays 8:00 AM - 8:00 PM, weekends 10:00 AM - 6:00 PM.";
    }
    if (q.includes("phone")) {
      return "Phone support: 1-800-555-0149.";
    }
    if (q.includes("live chat") || q.includes("agent")) {
      return "You can start a live agent chat from the Live Agent tab.";
    }
    if (q.includes("ticket")) {
      return "Submit a ticket from the Submit Ticket tab and you’ll receive a case number.";
    }
    return "I can help with hours, phone support, tickets, or connecting you to a live agent.";
  }

  function sendBotMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = botInput.trim();
    if (!text) return;
    setBotInput("");
    setBotMessages((m) => [...m, { from: "user", text }]);
    setBotTyping(true);
    const delay = 700 + Math.min(text.length * 20, 1200);
    setTimeout(() => {
      setBotMessages((m) => [...m, { from: "bot", text: botAnswer(text) }]);
      setBotTyping(false);
    }, delay);
  }

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #ddd", display: "flex", alignItems: "center", gap: 12 }}>
        <strong>SupportHub</strong>
        <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
          Home
        </NavLink>
        {!isAuthed && (
          <>
            <NavLink to="/submit" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Submit Ticket
            </NavLink>
            <NavLink to="/live-chat" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Live Agent
            </NavLink>
          </>
        )}
        {isAuthed && (
          <div
            className="nav-dropdown"
            onMouseEnter={() => setContactOpen(true)}
            onMouseLeave={() => setContactOpen(false)}
          >
            <button className="nav-link nav-button" onClick={() => setContactOpen((v) => !v)}>
              Contact
            </button>
            {contactOpen && (
              <div className="nav-menu">
                <NavLink to="/submit" className="nav-menu-item" onClick={() => setContactOpen(false)}>
                  Submit Ticket
                </NavLink>
                <NavLink to="/live-chat" className="nav-menu-item" onClick={() => setContactOpen(false)}>
                  Live Agent
                </NavLink>
              </div>
            )}
          </div>
        )}
        {role === "Agent" && (
          <NavLink to="/agent" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Agent
          </NavLink>
        )}
        {(role === "Supervisor" || role === "Admin") && (
          <NavLink to="/supervisor" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Supervisor
          </NavLink>
        )}
        {(role === "Supervisor" || role === "Admin") && (
          <NavLink to="/rules" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Rules
          </NavLink>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "#666" }}>
            {isAuthed ? `Welcome, ${name ?? ""}!` : "Viewing as guest"}
          </span>
          {!isAuthed ? (
            <button className="secondary" onClick={() => nav("/login")}>
              Login
            </button>
          ) : (
            <button
              className="secondary"
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
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-title">Company</div>
            <a className="footer-link" href="#" aria-label="Company About page">
              About
            </a>
            <a className="footer-link" href="#" aria-label="Company Careers page">
              Careers
            </a>
            <a className="footer-link" href="#" aria-label="Company News page">
              Newsroom
            </a>
          </div>
          <div>
            <div className="footer-title">Support</div>
            <a className="footer-link" href="#" aria-label="Support Knowledge Base">
              Knowledge Base
            </a>
            <a className="footer-link" href="#" aria-label="Support FAQs">
              FAQs
            </a>
            <a className="footer-link" href="#" aria-label="System Status page">
              System Status
            </a>
          </div>
          <div>
            <div className="footer-title">Legal</div>
            <a className="footer-link" href="#" aria-label="Privacy Policy">
              Privacy Policy
            </a>
            <a className="footer-link" href="#" aria-label="Terms of Service">
              Terms of Service
            </a>
            <a className="footer-link" href="#" aria-label="Security page">
              Security
            </a>
          </div>
          <div>
            <div className="footer-title">Contact</div>
            <a className="footer-link" href="#" aria-label="Contact Sales">
              Contact Sales
            </a>
            <a className="footer-link" href="#" aria-label="Partner Program">
              Partner Program
            </a>
            <a className="footer-link" href="#" aria-label="Company Website">
              Company Website
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>SupportHub by Your Company Name</span>
          <span>© 2026 All rights reserved.</span>
        </div>
      </footer>
      <div className="bot-widget">
        {botOpen && (
          <div className="bot-panel">
            <div className="bot-header">
              <span>SupportHub Assistant</span>
              <button className="bot-close" onClick={() => setBotOpen(false)}>
                ✕
              </button>
            </div>
            <div className="bot-body">
              {botMessages.map((m, i) => (
                <div key={i} className={`bot-msg ${m.from}`}>
                  <div className="bot-bubble">{m.text}</div>
                </div>
              ))}
              {botTyping && (
                <div className="bot-msg bot">
                  <div className="bot-bubble typing">...</div>
                </div>
              )}
            </div>
            <form className="bot-input" onSubmit={sendBotMessage}>
              <input value={botInput} onChange={(e) => setBotInput(e.target.value)} placeholder="Ask a question..." />
              <button className="primary" type="submit">
                Send
              </button>
            </form>
          </div>
        )}
        {!botOpen && (
          <button className="bot-fab" onClick={() => setBotOpen(true)}>
            AI Help
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const nav = useNavigate();
  const role = getRole();

  useEffect(() => {
    // start real-time connection; refresh pages manually for now
    startHub();
  }, []);

  return (
    <Shell>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<TicketSubmissionPage />} />
        <Route path="/live-chat" element={<LiveChatPage />} />
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
          <div className="contact-header">
            <div className="contact-icon">📞</div>
            <h2>Phone Support</h2>
          </div>
          <p>Call and speak with an agent for urgent or complex issues.</p>
          <div className="contact-detail">1-800-555-0149</div>
          <div className="contact-meta">Average wait: 2-4 minutes</div>
        </div>
        <div className="contact-card">
          <div className="contact-header">
            <div className="contact-icon">💬</div>
            <h2>Live Agent</h2>
          </div>
          <p>Chat with a support agent right now.</p>
          <div className="contact-detail">Available now</div>
          <button className="link" onClick={() => nav("/live-chat")}>
            Start Live Chat
          </button>
        </div>
        <div className="contact-card">
          <div className="contact-header">
            <div className="contact-icon">📝</div>
            <h2>Submit A Ticket</h2>
          </div>
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

type ChatStep = "greeting" | "name" | "email" | "phone" | "issue" | "submitting" | "queued";

function LiveChatPage() {
  const [messages, setMessages] = useState<{ from: "bot" | "user" | "agent"; text: string }[]>([
    { from: "bot", text: "Hi! I'm SupportHub's virtual assistant. I can get you connected to a live agent." },
    { from: "bot", text: "First, what is your name?" },
  ]);
  const [step, setStep] = useState<ChatStep>("name");
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [issue, setIssue] = useState("");
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [typing, setTyping] = useState(false);
  const guestConnRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;

    const conn = new signalR.HubConnectionBuilder().withUrl(`${API_BASE}/guest-hub`).withAutomaticReconnect().build();
    guestConnRef.current = conn;

    conn.on("ConversationMessage", (p: any) => {
      if (p?.conversationId !== conversationId) return;
      if (p?.from === "guest") return;
      const from = typeof p?.from === "string" && p.from.startsWith("agent:") ? "agent" : "bot";
      setMessages((m) => [...m, { from, text: p.body }]);
    });

    conn
      .start()
      .then(() => conn.invoke("JoinConversation", conversationId))
      .catch(() => {
        // keep the user in queue even if realtime connection fails
      });

    return () => {
      conn.stop();
    };
  }, [conversationId]);

  function botAnswer(question: string) {
    const q = question.toLowerCase();
    if (q.includes("hours") || q.includes("open")) {
      return "Our support hours are weekdays 8:00 AM - 8:00 PM and weekends 10:00 AM - 6:00 PM.";
    }
    if (q.includes("phone")) {
      return "You can reach phone support at 1-800-555-0149.";
    }
    if (q.includes("status") || q.includes("ticket")) {
      return "Once we create your ticket, you’ll be placed in the queue and an agent will follow up shortly.";
    }
    if (q.includes("live chat") || q.includes("agent")) {
      return "I can connect you to a live agent after I collect a few details about your issue.";
    }
    return "I can help with common questions, or collect your details to connect you with a live agent.";
  }

  function pushBot(text: string, delayMs = 700) {
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text }]);
      setTyping(false);
    }, delayMs);
  }

  function pushUser(text: string) {
    setMessages((m) => [...m, { from: "user", text }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const value = input.trim();
    setInput("");
    pushUser(value);

    if (step === "name") {
      if (value.length < 2) {
        pushBot("Please enter your full name (at least 2 characters).");
        return;
      }
      setName(value);
      pushBot(`Thanks, ${value}. What's the best email to reach you?`, 800);
      setStep("email");
      return;
    }
    if (step === "email") {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!emailOk) {
        pushBot("That doesn't look like a valid email. Please enter a valid email address.", 700);
        return;
      }
      setEmail(value);
      pushBot("Got it. Can you share a phone number (optional)?", 800);
      setStep("phone");
      return;
    }
    if (step === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length > 0 && digits.length < 10) {
        pushBot("Please enter a valid phone number (at least 10 digits) or type 'skip'.", 700);
        return;
      }
      if (value.toLowerCase() === "skip") {
        setPhone("");
      } else {
        setPhone(value);
      }
      pushBot("Please describe the issue you're having.", 800);
      setStep("issue");
      return;
    }
    if (step === "issue") {
      if (value.endsWith("?")) {
        pushBot(botAnswer(value), 700);
        pushBot("If you’re ready, please describe the issue you want help with.", 900);
        return;
      }
      setIssue(value);
      setStep("submitting");
      pushBot("Thanks. I'm creating your ticket and placing you in the queue...", 900);

      try {
        const res = await api<{ conversationId: number; ticketId: number; queuePosition: number }>("/inbound/chat", {
          method: "POST",
          body: JSON.stringify({
            from: email || phone || "web",
            customer: {
              name: name || "Unknown",
              email,
              phone,
              isVip: false,
            },
            subject: "Live chat request",
            body: value,
            timestamp: new Date().toISOString(),
          }),
        });

        setTicketId(res.ticketId);
        setQueuePosition(res.queuePosition ?? null);
        setConversationId(res.conversationId);
        setStep("queued");
        if (res.queuePosition && res.queuePosition > 0) {
          pushBot(`You're in the queue. Your current position is ${res.queuePosition}.`, 800);
        } else {
          pushBot("You're in the queue. An agent will be with you shortly.", 800);
        }
        pushBot("An agent will join shortly.", 900);
      } catch (e: any) {
        setError(e.message || "Failed to create ticket");
        setStep("issue");
        pushBot("Something went wrong. Please try describing the issue again.", 700);
      }
      return;
    }

    if (step === "queued" && conversationId) {
      try {
        await api(`/guest/conversations/${conversationId}/messages`, {
          method: "POST",
          body: JSON.stringify({ body: value }),
        });
      } catch (e: any) {
        setError(e.message || "Failed to send message");
      }
      return;
    }
  }

  return (
    <div className="home">
      <section className="form-section">
        <div className="form-header">
          <h2>Live Agent Chat</h2>
          <p>
            You are connected to an AI assistant first. It will collect basic information and place you in a waiting queue for a live
            agent.
          </p>
        </div>

        <div className="chat-window">
          {messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.from}`}>
              <div className="chat-bubble">{m.text}</div>
            </div>
          ))}
          {typing && (
            <div className="chat-message bot">
              <div className="chat-bubble typing">...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={step === "queued" ? "Send a message while you wait..." : "Type your response"}
            disabled={step === "submitting"}
          />
          <button className="primary" type="submit" disabled={step === "submitting"}>
            Send
          </button>
        </form>

        {queuePosition && (
          <div className="status success">You are queued. Your position is {queuePosition}.</div>
        )}
        {error && <div className="status error">{error}</div>}
      </section>
    </div>
  );
}
