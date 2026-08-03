"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in monitoring later; avoid logging PII or secrets.
    console.error("App error boundary:", error.digest || error.name);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center px-5 py-20 md:px-8">
      <p className="font-display text-4xl text-sky-deep">Something went wrong</p>
      <p className="mt-4 text-ink-soft">
        Please try again. If the problem continues, call Yucca Valley at (760) 389-7707 or Desert Hot Springs at
        (760) 314-4160.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-deep focus-ring"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full bg-white px-5 py-3 text-sm font-medium text-sky-deep ring-1 ring-[var(--line)] focus-ring"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
