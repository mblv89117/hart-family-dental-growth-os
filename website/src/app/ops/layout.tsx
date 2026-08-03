import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Operations",
  robots: { index: false, follow: false },
};

function opsEnabled() {
  return ["1", "true", "yes", "on"].includes((process.env.OPS_ENABLED || "").toLowerCase());
}

function isStaging() {
  return (process.env.APP_ENV || "").toLowerCase() === "staging";
}

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  if (!opsEnabled()) {
    notFound();
  }

  const staging = isStaging();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {staging ? (
        <div
          className="bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-amber-950"
          role="status"
        >
          STAGING — DO NOT ENTER REAL PATIENT INFORMATION
        </div>
      ) : null}
      <header className="border-b border-slate-300 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="font-semibold tracking-tight">
            Hart Family Dental — Ops{staging ? " (Staging)" : ""}
          </div>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link href="/ops">Today</Link>
            <Link href="/ops/inbox">Inbox</Link>
            <Link href="/ops/scheduling">Scheduling</Link>
            <Link href="/ops/setup">Practice setup</Link>
            <Link href="/ops/mappings">Mappings</Link>
            <Link href="/ops/safety">Safety</Link>
            <Link href="/ops/login">Login</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
