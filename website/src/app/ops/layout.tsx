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

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  if (!opsEnabled()) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-300 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="font-semibold tracking-tight">Hart Family Dental — Ops</div>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link href="/ops">Today</Link>
            <Link href="/ops/inbox">Inbox</Link>
            <Link href="/ops/scheduling">Scheduling</Link>
            <Link href="/ops/safety">Safety</Link>
            <Link href="/ops/login">Login</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
