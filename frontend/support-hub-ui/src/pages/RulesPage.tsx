import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { RuleDto } from "../types";

export default function RulesPage() {
  const [rules, setRules] = useState<RuleDto[]>([]);
  const [selected, setSelected] = useState<RuleDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await api<RuleDto[]>("/routing-rules");
    setRules(res);
    if (!selected && res[0]) setSelected(res[0]);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!selected) return;
    setError(null);
    try {
      await api(`/routing-rules/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: selected.name,
          isEnabled: selected.isEnabled,
          priorityOrder: selected.priorityOrder,
          conditionJson: selected.conditionJson,
          actionJson: selected.actionJson,
        }),
      });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16, padding: 16, fontFamily: "system-ui" }}>
      <div>
        <h3>Routing Rules</h3>
        <button onClick={load}>Refresh</button>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {rules.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelected(r)}
              style={{ border: "1px solid #ddd", padding: 10, cursor: "pointer", background: selected?.id === r.id ? "#f3f3f3" : "white" }}
            >
              <div style={{ fontWeight: 700 }}>
                {r.priorityOrder}. {r.name}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>{r.isEnabled ? "Enabled" : "Disabled"}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3>Edit</h3>
        {!selected ? (
          <div>Select a rule</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <label>
              Name
              <input value={selected.name} onChange={(e) => setSelected({ ...selected, name: e.target.value })} />
            </label>

            <label>
              Priority Order
              <input
                type="number"
                value={selected.priorityOrder}
                onChange={(e) => setSelected({ ...selected, priorityOrder: Number(e.target.value) })}
              />
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={selected.isEnabled} onChange={(e) => setSelected({ ...selected, isEnabled: e.target.checked })} />
              Enabled
            </label>

            <label>
              Condition JSON
              <textarea
                rows={6}
                value={selected.conditionJson}
                onChange={(e) => setSelected({ ...selected, conditionJson: e.target.value })}
              />
              <div style={{ color: "#666", fontSize: 12 }}>
                Supports: {"{keywords:[...], isVip:true/false, channel:\"SMS\"}"}
              </div>
            </label>

            <label>
              Action JSON
              <textarea
                rows={6}
                value={selected.actionJson}
                onChange={(e) => setSelected({ ...selected, actionJson: e.target.value })}
              />
              <div style={{ color: "#666", fontSize: 12 }}>
                Supports: {"{queueName:\"Billing\", priority:\"High\", category:\"Billing\", autoAssignAgent:true}"}
              </div>
            </label>

            <button onClick={save}>Save</button>
            {error && <pre style={{ whiteSpace: "pre-wrap", color: "crimson" }}>{error}</pre>}
          </div>
        )}
      </div>
    </div>
  );
}
