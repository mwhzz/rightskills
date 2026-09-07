export function coverImageSrc(uploaded?: string | null) {
  const path = uploaded?.trim() ?? "";
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("https://")) return path;
  return `/api/media/${path}`;
}
