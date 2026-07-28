"use client";

import { useEffect, useState } from "react";

function csrf() {
  const match = document.cookie.match(/(?:^|; )hfd_ops_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

type Safety = {
  automationMode: string;
  emergencyStop: boolean;
  dailyCaps: { actions: number; messages: number };
  outboundAllowlist: string[];
  openDentalWritesEnabled: boolean;
  outboundCommunicationsEnabled: boolean;
  openDentalMode: string;
  workflows: Array<{ key: string; enabled: boolean }>;
  failedAndDeadLetterJobs: Array<{ id: string; type: string; status: string; lastErrorSummary: string | null }>;
  integrationHealth: Array<{ status: string; connection: { name: string; mode: string } }>;
  recentAutomatedActions: Array<{ id: string; action: string; result: string; createdAt: string }>;
};

export default function SafetyPage() {
  const [safety, setSafety] = useState<Safety | null>(null);
  const [error, setError] = useState("");
  const [actions, setActions] = useState(50);
  const [messages, setMessages] = useState(25);
  const [allowlist, setAllowlist] = useState("");

  async function load() {
    const res = await fetch("/api/ops/safety");
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.error || "Unable to load safety center");
      return;
    }
    setSafety(data.safety);
    setActions(data.safety.dailyCaps.actions);
    setMessages(data.safety.dailyCaps.messages);
    setAllowlist(data.safety.outboundAllowlist.join(", "));
  }

  useEffect(() => {
    void load();
  }, []);

  async function post(body: Record<string, unknown>) {
    setError("");
    const res = await fetch("/api/ops/safety", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf() },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) setError(data.error || "Failed");
    await load();
  }

  if (!safety && !error) return <p className="text-sm">Loading Safety Center…</p>;
  if (!safety) return <p className="text-sm text-red-700">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Safety Center</h1>
        <p className="text-sm text-slate-600">
          Live controls. Decorative/no-op controls are not used. Production OD writes and outbound patient messaging
          remain disabled unless explicitly enabled in environment.
        </p>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <section className="rounded-lg border border-slate-300 bg-white p-4 text-sm space-y-3">
        <div>
          Automation mode: <strong>{safety.automationMode}</strong>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["off", "observe", "draft", "supervised", "autonomous"] as const).map((mode) => (
            <button
              key={mode}
              className="rounded border px-3 py-1"
              onClick={() => post({ action: "set_automation_mode", mode })}
            >
              Set {mode}
            </button>
          ))}
        </div>
        <div>
          Emergency stop: <strong>{safety.emergencyStop ? "ON" : "OFF"}</strong>
        </div>
        <button
          className="rounded bg-red-700 px-3 py-1 text-white"
          onClick={() => post({ action: "emergency_stop", enabled: !safety.emergencyStop })}
        >
          {safety.emergencyStop ? "Clear emergency stop" : "Activate emergency stop"}
        </button>
      </section>

      <section className="rounded-lg border border-slate-300 bg-white p-4 text-sm space-y-2">
        <h2 className="font-medium">Environment gates (read-only here)</h2>
        <p>Open Dental mode: {safety.openDentalMode}</p>
        <p>Open Dental writes enabled: {String(safety.openDentalWritesEnabled)}</p>
        <p>Outbound communications enabled: {String(safety.outboundCommunicationsEnabled)}</p>
        <p className="text-slate-500">Change these via environment variables — not a UI toggle — to avoid accidental production sends.</p>
      </section>

      <section className="rounded-lg border border-slate-300 bg-white p-4 text-sm space-y-3">
        <h2 className="font-medium">Per-workflow switches</h2>
        {safety.workflows.map((w) => (
          <div key={w.key} className="flex items-center justify-between gap-3">
            <span>{w.key}</span>
            <button
              className="rounded border px-3 py-1"
              onClick={() =>
                post({
                  action: "set_workflow",
                  workflowKey: w.key.replace(/^workflow:/, ""),
                  enabled: !w.enabled,
                })
              }
            >
              {w.enabled ? "Disable" : "Enable"}
            </button>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-slate-300 bg-white p-4 text-sm space-y-3">
        <h2 className="font-medium">Daily caps</h2>
        <label>
          Actions{" "}
          <input
            type="number"
            className="rounded border px-2 py-1"
            value={actions}
            onChange={(e) => setActions(Number(e.target.value))}
          />
        </label>
        <label className="ml-3">
          Messages{" "}
          <input
            type="number"
            className="rounded border px-2 py-1"
            value={messages}
            onChange={(e) => setMessages(Number(e.target.value))}
          />
        </label>
        <button
          className="ml-3 rounded border px-3 py-1"
          onClick={() => post({ action: "set_daily_caps", actions, messages })}
        >
          Save caps
        </button>
        <div>
          <label>
            Test-recipient allowlist (comma-separated)
            <input
              className="mt-1 w-full rounded border px-2 py-1"
              value={allowlist}
              onChange={(e) => setAllowlist(e.target.value)}
            />
          </label>
          <button
            className="mt-2 rounded border px-3 py-1"
            onClick={() =>
              post({
                action: "set_allowlist",
                allowlist: allowlist
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          >
            Save allowlist
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-300 bg-white p-4 text-sm">
        <h2 className="font-medium">Failed / dead-letter jobs</h2>
        <ul className="mt-2 space-y-1">
          {safety.failedAndDeadLetterJobs.length === 0 ? <li>None</li> : null}
          {safety.failedAndDeadLetterJobs.map((j) => (
            <li key={j.id}>
              {j.type} · {j.status} · {j.lastErrorSummary || "—"}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-slate-300 bg-white p-4 text-sm">
        <h2 className="font-medium">Integration health</h2>
        <ul className="mt-2 space-y-1">
          {safety.integrationHealth.map((h, i) => (
            <li key={i}>
              {h.connection.name} ({h.connection.mode}): {h.status}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-slate-300 bg-white p-4 text-sm">
        <h2 className="font-medium">Recent automated actions</h2>
        <ul className="mt-2 space-y-1">
          {safety.recentAutomatedActions.map((a) => (
            <li key={a.id}>
              {a.action} · {a.result} · {new Date(a.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
