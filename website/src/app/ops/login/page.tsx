"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OpsLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("wendy@local.test");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/ops/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Login failed");
      return;
    }
    router.push("/ops");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Staff login</h1>
      <p className="mt-2 text-sm text-slate-600">
        Synthetic local credentials only. Production auth is blocked until owner-approved.
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block text-sm">
          Email
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
