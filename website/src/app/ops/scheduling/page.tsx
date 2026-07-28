"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function csrf() {
  const match = document.cookie.match(/(?:^|; )hfd_ops_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function SchedulingInner() {
  const params = useSearchParams();
  const leadId = params.get("leadId") || "";
  const locationId = params.get("locationId") || "";
  const [locations, setLocations] = useState<Array<{ id: string; shortName: string }>>([]);
  const [selectedLocation, setSelectedLocation] = useState(locationId);
  const [slots, setSlots] = useState<Array<{ id: string; startAt: string; endAt: string; expiresAt: string }>>([]);
  const [patientLinkId, setPatientLinkId] = useState("");
  const [message, setMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    void (async () => {
      const me = await fetch("/api/ops/auth/me").then((r) => r.json());
      if (!me.ok) {
        setMessage("Login required");
        return;
      }
      const inbox = await fetch("/api/ops/inbox").then((r) => r.json());
      if (inbox.ok) {
        const locs = new Map<string, string>();
        for (const l of inbox.leads || []) {
          locs.set(l.locationId, l.location?.shortName || l.locationId);
        }
        // fallback fetch via dashboard not needed
        if (!locs.size && selectedLocation) locs.set(selectedLocation, "Selected");
        setLocations([...locs.entries()].map(([id, shortName]) => ({ id, shortName })));
      }
    })();
  }, [selectedLocation]);

  async function loadSlots() {
    setMessage("");
    const q = new URLSearchParams({
      locationId: selectedLocation,
      categoryKey: "new_patient_exam",
    });
    if (leadId) q.set("leadId", leadId);
    const res = await fetch(`/api/ops/scheduling?${q}`);
    const data = await res.json();
    if (!data.ok) {
      setMessage(data.error || "Failed to load slots");
      return;
    }
    setSlots(data.slots);
    setExpiresAt(data.expiresAt);
  }

  async function matchPatient() {
    const res = await fetch("/api/ops/scheduling", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf() },
      body: JSON.stringify({
        action: "match_patient",
        leadId,
        connectionKey: "shared-clinics",
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      setMessage(data.error || "Match failed");
      return;
    }
    setPatientLinkId(data.patientLink.id);
    setMessage(`Patient link state: ${data.patientLink.state}`);
  }

  async function book(slotId: string) {
    if (!patientLinkId) {
      setMessage("Match/create patient link first");
      return;
    }
    const res = await fetch("/api/ops/scheduling", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf() },
      body: JSON.stringify({
        action: "book",
        offeredSlotId: slotId,
        patientLinkId,
        idempotencyKey: `book:${slotId}:${patientLinkId}`,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      setMessage(data.error || "Booking failed");
      return;
    }
    setMessage(
      `Result: ${data.status}` +
        (data.externalAptNum ? ` · AptNum ${data.externalAptNum}` : "") +
        (data.confirmationGenerated ? " · confirmation generated after success" : " · no confirmation"),
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Supervised mock scheduling</h1>
        <p className="text-sm text-slate-600">
          Categories default autoBook=false. Confirmation is created only after mock Open Dental success.
        </p>
      </div>

      <div className="rounded-lg border border-slate-300 bg-white p-4 text-sm space-y-3">
        <label>
          Location ID
          <input
            className="mt-1 w-full rounded border px-2 py-1"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            placeholder="Paste locationId from Lead 360 URL params"
          />
        </label>
        {locations.length ? (
          <p className="text-slate-500">Known from inbox: {locations.map((l) => `${l.shortName}=${l.id}`).join(" · ")}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button className="rounded border px-3 py-1" onClick={loadSlots} disabled={!selectedLocation}>
            Load eligible slots
          </button>
          <button className="rounded border px-3 py-1" onClick={matchPatient} disabled={!leadId}>
            Match patient for lead
          </button>
        </div>
        {expiresAt ? <p>Offers expire at {new Date(expiresAt).toLocaleString()}</p> : null}
        {message ? <p className="text-slate-700">{message}</p> : null}
      </div>

      <ul className="space-y-2 text-sm">
        {slots.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded border border-slate-300 bg-white px-3 py-2">
            <span>
              {new Date(s.startAt).toLocaleString()} → {new Date(s.endAt).toLocaleTimeString()}
            </span>
            <button className="rounded bg-slate-900 px-3 py-1 text-white" onClick={() => book(s.id)}>
              Book (mock OD)
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SchedulingPage() {
  return (
    <Suspense fallback={<p className="text-sm">Loading…</p>}>
      <SchedulingInner />
    </Suspense>
  );
}
