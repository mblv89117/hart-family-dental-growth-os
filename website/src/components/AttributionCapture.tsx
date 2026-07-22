"use client";

import { useEffect } from "react";
import { captureAttributionFromLocation, trackEvent } from "@/lib/tracking";

/** Captures UTM/referrer once per session and binds phone/email click tracking. */
export function AttributionCapture() {
  useEffect(() => {
    captureAttributionFromLocation(window.location.search, document.referrer || "");
    trackEvent("page_view_custom", { path: window.location.pathname });

    function onClick(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      const a = t?.closest?.("a") as HTMLAnchorElement | null;
      if (!a?.href) return;
      if (a.href.startsWith("tel:")) {
        trackEvent("phone_click", { href: a.getAttribute("href") || "", path: window.location.pathname });
      } else if (a.href.startsWith("mailto:")) {
        trackEvent("email_click", { href: a.getAttribute("href") || "", path: window.location.pathname });
      } else if (a.getAttribute("href")?.includes("#request") || a.getAttribute("href")?.includes("smile-assessment")) {
        trackEvent("appointment_link_click", { href: a.getAttribute("href") || "", path: window.location.pathname });
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
