export type VideoEmbed =
  | { kind: "youtube"; src: string; id: string }
  | { kind: "file"; src: string };

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

const VIMEO_ID = /^\d+$/;

/**
 * Keeps only http(s) links, so a stored value can never become a
 * javascript: or data: URL in a src attribute.
 */
export function sanitizeVideoUrl(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString().slice(0, 500);
  } catch {
    return "";
  }
}

export function youtubeId(value: string) {
  const clean = sanitizeVideoUrl(value);
  if (!clean) return "";
  let url: URL;
  try {
    url = new URL(clean);
  } catch {
    return "";
  }
  if (!YOUTUBE_HOSTS.has(url.hostname)) return "";

  const fromQuery = url.searchParams.get("v");
  if (fromQuery) return safeId(fromQuery);

  const parts = url.pathname.split("/").filter(Boolean);
  if (url.hostname.endsWith("youtu.be")) return safeId(parts[0] ?? "");
  if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
    return safeId(parts[1] ?? "");
  }
  return "";
}

function safeId(value: string) {
  return /^[A-Za-z0-9_-]{6,20}$/.test(value) ? value : "";
}

export function youtubeEmbedSrc(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
}

export function youtubeThumbnail(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/**
 * Turns an admin-entered link into something we can render: a YouTube embed
 * when it is a YouTube URL, otherwise a plain video file URL.
 */
export function videoEmbed(value: string | null | undefined): VideoEmbed | null {
  const clean = sanitizeVideoUrl(value);
  if (!clean) return null;
  const id = youtubeId(clean);
  if (id) return { kind: "youtube", src: youtubeEmbedSrc(id), id };
  return { kind: "file", src: clean };
}

/**
 * Admins paste all kinds of things. Accept a full URL, and also a bare
 * YouTube ID or a vimeo-style number, so the field is forgiving.
 */
export function normalizeVideoInput(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) {
    return `https://www.youtube.com/watch?v=${raw}`;
  }
  if (VIMEO_ID.test(raw)) return `https://vimeo.com/${raw}`;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return sanitizeVideoUrl(withProtocol);
}
