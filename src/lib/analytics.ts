export type AnalyticsConfig = {
  gtmId: string;
  gaId: string;
  clarityId: string;
};

const EMPTY: AnalyticsConfig = { gtmId: "", gaId: "", clarityId: "" };

export function parseAnalytics(raw: string | null | undefined): AnalyticsConfig {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return EMPTY;
    const text = (key: string) => (typeof parsed[key] === "string" ? (parsed[key] as string) : "");
    return {
      gtmId: cleanGtmId(text("gtmId")),
      gaId: cleanGaId(text("gaId")),
      clarityId: cleanClarityId(text("clarityId")),
    };
  } catch {
    return EMPTY;
  }
}

// IDs are written into inline scripts, so only the exact public formats pass.
export function cleanGtmId(raw: string) {
  const value = raw.trim().toUpperCase();
  return /^GTM-[A-Z0-9]{4,12}$/.test(value) ? value : "";
}

export function cleanGaId(raw: string) {
  const value = raw.trim().toUpperCase();
  return /^G-[A-Z0-9]{4,16}$/.test(value) ? value : "";
}

export function cleanClarityId(raw: string) {
  const value = raw.trim().toLowerCase();
  return /^[a-z0-9]{6,20}$/.test(value) ? value : "";
}
