"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    fbq?: PixelFunction;
    _fbq?: PixelFunction;
  }
}

type PixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: PixelFunction;
  loaded: boolean;
  version: string;
};

const initializedPixels = new Set<string>();

function initializePixel(pixelId: string) {
  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as PixelFunction;
    fbq.queue = [];
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq ??= fbq;
  }
  if (!initializedPixels.has(pixelId)) {
    window.fbq("init", pixelId);
    initializedPixels.add(pixelId);
  }
}

function newEventId() {
  // randomUUID is unavailable on plain HTTP previews and older browsers.
  return globalThis.crypto?.randomUUID?.() ?? `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  try {
    return match ? decodeURIComponent(match[1]) : "";
  } catch {
    return "";
  }
}

function whenPixel(run: () => void) {
  let tries = 0;
  let timer: number | undefined;
  const tick = () => {
    if (typeof window.fbq === "function") {
      run();
      return;
    }
    if (tries < 100) {
      tries += 1;
      timer = window.setTimeout(tick, 150);
    }
  };
  tick();
  return () => window.clearTimeout(timer);
}

function sendServer(body: Record<string, unknown>) {
  // Keep the URL of this event if navigation happens before the cookie delay.
  const url = window.location.href;
  window.setTimeout(() => {
    void fetch("/api/meta", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        ...body,
        url,
        fbp: readCookie("_fbp"),
        fbc: readCookie("_fbc"),
      }),
    }).catch(() => {
      // Tracking must not interrupt navigation if the request is blocked.
    });
  }, 400);
}

export function MetaPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    initializePixel(pixelId);
    const timer = window.setTimeout(() => {
      const eventId = newEventId();
      window.fbq?.("track", "PageView", {}, { eventID: eventId });
      sendServer({ event: "PageView", eventId });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname, pixelId]);

  return (
    <Script id="meta-pixel" src="https://connect.facebook.net/en_US/fbevents.js" strategy="afterInteractive" />
  );
}

export function MetaEvent({
  event,
  eventId,
  params,
  server = true,
}: {
  event: "ViewContent" | "InitiateCheckout";
  eventId: string;
  params?: { content_ids?: string[]; content_name?: string; value?: number };
  server?: boolean;
}) {
  const encoded = JSON.stringify(params ?? null);
  useEffect(() => {
    const parsed = JSON.parse(encoded) as {
      content_ids?: string[];
      content_name?: string;
      value?: number;
    } | null;
    let cancelPixel: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      cancelPixel = whenPixel(() => {
        window.fbq?.("track", event, { currency: "BDT", ...parsed }, { eventID: eventId });
      });
      if (server) sendServer({
        event,
        eventId,
        contentIds: parsed?.content_ids,
        contentName: parsed?.content_name,
        value: parsed?.value,
      });
    }, 0);
    return () => {
      window.clearTimeout(timer);
      cancelPixel?.();
    };
  }, [encoded, event, eventId, server]);

  return null;
}
