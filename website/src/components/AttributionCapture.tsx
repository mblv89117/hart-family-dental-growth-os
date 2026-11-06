"use client";

import { useEffect } from "react";
import { officeFromTel } from "@/lib/office-routing";
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
      const path = window.location.pathname;
      if (a.href.startsWith("tel:")) {
        const office = officeFromTel(a.getAttribute("href") || "");
        trackEvent("phone_click", { office: office || undefined, path });
      } else if (a.href.startsWith("mailto:")) {
        trackEvent("email_click", { path });
      } else if (a.getAttribute("href")?.includes("#request") || a.getAttribute("href")?.includes("smile-assessment")) {
        trackEvent("appointment_link_click", { path });
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
