import { Link, Route, Routes, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AgentPage from "./pages/AgentPage";
import SupervisorPage from "./pages/SupervisorPage";
import RulesPage from "./pages/RulesPage";
import { clearAuth, getRole, getName } from "./auth/auth";
import { useEffect, useState } from "react";
import { startHub } from "./realtime/hub";

function Shell({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();
  const [name, setName] = useState(getName());
  const role = getRole();

  useEffect(() => {
    setName(getName());
  }, []);

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #ddd", display: "flex", alignItems: "center", gap: 12 }}>
        <strong>SupportHub</strong>
        <Link to="/">Home</Link>
        {role === "Agent" && <Link to="/agent">Agent</Link>}
        {(role === "Supervisor" || role === "Admin") && <Link to="/supervisor">Supervisor</Link>}
        {(role === "Supervisor" || role === "Admin") && <Link to="/rules">Rules</Link>}

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "#666" }}>{name ? `${name} (${role})` : ""}</span>
          <button
            onClick={() => {
              clearAuth();
              nav("/login");
            }}
          >
            Logout
          </button>
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

    if (!role) nav("/login");
  }, []);

  return (
    <Shell>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/supervisor" element={<SupervisorPage />} />
        <Route path="/rules" element={<RulesPage />} />
      </Routes>
    </Shell>
  );
}

function Home() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Home</h2>
      <p>Use Postman to create inbound messages and watch tickets appear.</p>
      <pre style={{ background: "#f6f6f6", padding: 12, overflow: "auto" }}>
POST http://localhost:5000/inbound/email
{`{
  "from": "sam@email.com",
  "customer": { "name": "Sam", "email": "sam@email.com", "phone": "", "isVip": false },
  "subject": "Refund request",
  "body": "I was charged twice on my invoice",
  "timestamp": "2026-02-04T18:30:00Z"
}`}
      </pre>
    </div>
  );
}
