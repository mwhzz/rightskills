export const DHAKA_TZ = "Asia/Dhaka";

const dhakaWhen: Intl.DateTimeFormatOptions = {
  timeZone: DHAKA_TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};

export function formatBdt(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}

export function formatHours(hours: number) {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours}h`;
}

export function formatStudents(count: number) {
  if (count >= 1000) {
    const thousands = count / 1000;
    return `${thousands.toFixed(thousands >= 10 ? 0 : 1)}k`;
  }
  return count.toLocaleString("en-BD");
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatWhen(date: Date) {
  return date.toLocaleString("en-GB", dhakaWhen);
}

export function formatDateDhaka(date: Date) {
  return date.toLocaleDateString("en-GB", {
    timeZone: DHAKA_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTimeDhaka(date: Date) {
  return date.toLocaleTimeString("en-GB", {
    timeZone: DHAKA_TZ,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function dhakaDayStart(ymd: string) {
  return new Date(`${ymd}T00:00:00+06:00`);
}

export function dhakaDayEnd(ymd: string) {
  return new Date(`${ymd}T23:59:59.999+06:00`);
}

export function formatAgo(date: Date) {
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDateDhaka(date);
}

export function formatMinutes(minutes: number) {
  if (minutes < 1) return "0 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}
