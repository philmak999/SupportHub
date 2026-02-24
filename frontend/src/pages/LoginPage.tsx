import { useState } from "react";
import { api } from "../api/client";
import { setAuth } from "../auth/auth";
import type { Role } from "../types";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("super@demo.local");
  const [password, setPassword] = useState("password");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const res = await api<{ token: string; role: Role; name: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuth(res.token, res.role, res.name);
      nav("/");
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", fontFamily: "system-ui" }}>
      <h2>SupportHub Login</h2>
      <p style={{ color: "#555" }}>
        Demo users: admin@demo.local / super@demo.local / alex@demo.local / bea@demo.local (password: password)
      </p>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" />
        <button>Login</button>
        {err && <pre style={{ whiteSpace: "pre-wrap", color: "crimson" }}>{err}</pre>}
      </form>
    </div>
  );
}
