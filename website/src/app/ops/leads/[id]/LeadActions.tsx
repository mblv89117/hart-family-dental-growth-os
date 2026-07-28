"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function csrf() {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|; )hfd_ops_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export function LeadActions({ leadId, locationId }: { leadId: string; locationId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function patch(body: Record<string, unknown>) {
    setMsg("");
    const res = await fetch(`/api/ops/leads/${leadId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf(),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setMsg(data.ok ? "Updated" : data.error || "Failed");
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-slate-300 bg-white p-4 text-sm">
      <h2 className="font-medium">Actions</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded border px-3 py-1" onClick={() => patch({ status: "closed" })}>
          Close
        </button>
        <button className="rounded border px-3 py-1" onClick={() => patch({ status: "new" })}>
          Reopen
        </button>
        <button className="rounded border px-3 py-1" onClick={() => patch({ pauseAutomation: true })}>
          Pause automation
        </button>
        <a className="rounded border px-3 py-1" href={`/ops/scheduling?leadId=${leadId}&locationId=${locationId}`}>
          Schedule (mock)
        </a>
      </div>
      {msg ? <p className="mt-2 text-slate-600">{msg}</p> : null}
    </div>
  );
}
