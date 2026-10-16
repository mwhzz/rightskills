import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { SITE_ORIGIN } from "@/lib/seo";

const GRAPH_VERSION = "v23.0";

export type MetaConfig = {
  pixelId: string;
  accessToken: string;
  testEventCode: string;
};

export type MetaUser = {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
};

export type MetaEventResult =
  | { status: "sent"; eventsReceived: number }
  | { status: "skipped"; reason: "event" | "unconfigured" }
  | { status: "failed"; reason: "configuration" | "network" | "rejected"; code?: number };

const EVENTS = new Set([
  "PageView",
  "ViewContent",
  "InitiateCheckout",
  "CompleteRegistration",
  "Purchase",
]);

export function parseMeta(raw: string | null | undefined): MetaConfig {
  if (!raw) return { pixelId: "", accessToken: "", testEventCode: "" };
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { pixelId: "", accessToken: "", testEventCode: "" };
    }
    return {
      pixelId: cleanPixelId(typeof parsed.pixelId === "string" ? parsed.pixelId : ""),
      accessToken: cleanToken(typeof parsed.accessToken === "string" ? parsed.accessToken : ""),
      testEventCode: cleanCode(typeof parsed.testEventCode === "string" ? parsed.testEventCode : ""),
    };
  } catch {
    return { pixelId: "", accessToken: "", testEventCode: "" };
  }
}

export function cleanPixelId(raw: string) {
  const value = raw.trim();
  return /^\d{5,20}$/.test(value) ? value : "";
}

export function cleanToken(raw: string) {
  const value = raw.trim();
  // Tokens are opaque credentials. Never silently truncate a valid token.
  return value.length <= 4096 && /^[A-Za-z0-9_|.\/+\-=]+$/.test(value) ? value : "";
}

export function cleanCode(raw: string) {
  return raw.replace(/[^A-Za-z0-9]/g, "").slice(0, 32);
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hashEmail(email?: string | null) {
  const value = email?.trim().toLowerCase() ?? "";
  if (!value.includes("@")) return "";
  return sha256(value);
}

function hashPhone(phone?: string | null) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (!digits) return "";
  const withCountry = digits.startsWith("880")
    ? digits
    : digits.startsWith("0")
      ? `880${digits.slice(1)}`
      : `880${digits}`;
  return sha256(withCountry);
}

function hashName(name?: string | null) {
  const value = name?.trim().toLowerCase().split(/\s+/)[0] ?? "";
  if (value.length < 2) return "";
  return sha256(value);
}

function cookieValue(cookie: string, name: string) {
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  try {
    return match ? decodeURIComponent(match[1]) : "";
  } catch {
    return "";
  }
}

export async function trackMetaEvent(input: {
  eventName: string;
  eventId: string;
  actionSource?: "website" | "phone_call";
  url?: string;
  user?: MetaUser;
  contentIds?: string[];
  contentName?: string;
  value?: number;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
}): Promise<MetaEventResult> {
  if (!EVENTS.has(input.eventName)) return { status: "skipped", reason: "event" };
  let config: MetaConfig;
  try {
    const settings = await prisma.setting.findUnique({
      where: { id: "default" },
      select: { metaTracking: true },
    });
    config = parseMeta(settings?.metaTracking);
  } catch {
    console.error("[Meta CAPI] Unable to read tracking configuration");
    return { status: "failed", reason: "configuration" };
  }
  if (!config.pixelId || !config.accessToken) {
    return { status: "skipped", reason: "unconfigured" };
  }

  try {
    const actionSource = input.actionSource ?? "website";
    // Staff confirming a phone order are not the customer. Do not attach their
    // browser's cookies, IP address, or user agent to the customer's Purchase.
    const headerList = actionSource === "website" ? await headers().catch(() => null) : null;
    const forwarded = headerList?.get("x-forwarded-for") ?? "";
    const ip = input.ip || forwarded.split(",")[0]?.trim() || headerList?.get("x-real-ip") || "";
    const userAgent = input.userAgent || headerList?.get("user-agent") || "";
    const cookie = headerList?.get("cookie") ?? "";
    const email = hashEmail(input.user?.email);
    const phone = hashPhone(input.user?.phone);
    const firstName = hashName(input.user?.name);
    const userData: Record<string, string> = {};
    if (email) userData.em = email;
    if (phone) userData.ph = phone;
    if (firstName) userData.fn = firstName;
    if (ip) userData.client_ip_address = ip;
    if (userAgent) userData.client_user_agent = userAgent;
    const fbp = input.fbp || cookieValue(cookie, "_fbp");
    const fbc = input.fbc || cookieValue(cookie, "_fbc");
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;

    const customData: Record<string, unknown> = { currency: "BDT" };
    if (input.contentIds?.length) {
      customData.content_ids = input.contentIds.slice(0, 20);
      customData.content_type = "product";
    }
    if (input.contentName) customData.content_name = input.contentName.slice(0, 200);
    if (typeof input.value === "number" && Number.isFinite(input.value)) {
      customData.value = input.value;
    }

    const payload: Record<string, unknown> = {
      data: [
        {
          event_name: input.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: input.eventId.slice(0, 80),
          action_source: actionSource,
          event_source_url: input.url || SITE_ORIGIN,
          user_data: userData,
          custom_data: customData,
        },
      ],
    };
    if (config.testEventCode) payload.test_event_code = config.testEventCode;

    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${config.pixelId}/events`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${config.accessToken}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.error || !(result?.events_received > 0)) {
      const code = typeof result?.error?.code === "number" ? result.error.code : undefined;
      // Do not log tokens, customer data, or the upstream error message.
      console.error("[Meta CAPI] Event rejected", {
        event: input.eventName,
        status: response.status,
        code,
      });
      return { status: "failed", reason: "rejected", code };
    }
    return { status: "sent", eventsReceived: result.events_received };
  } catch {
    // Checkout and approval still succeed if Meta is unreachable.
    console.error("[Meta CAPI] Event request failed", { event: input.eventName });
    return { status: "failed", reason: "network" };
  }
}
