export type HomeJustAdded = {
  title: string;
  titleBn: string;
  courseIds: string[];
};

export const emptyHomeJustAdded: HomeJustAdded = {
  title: "",
  titleBn: "",
  courseIds: [],
};

export function parseHomeJustAdded(raw: string | null | undefined): HomeJustAdded {
  if (!raw?.trim()) return emptyHomeJustAdded;
  try {
    const data = JSON.parse(raw) as Partial<HomeJustAdded>;
    const courseIds = Array.isArray(data.courseIds)
      ? data.courseIds.filter((id): id is string => typeof id === "string" && id.length > 0)
      : [];
    return {
      title: clip(data.title),
      titleBn: clip(data.titleBn),
      courseIds: courseIds.slice(0, 24),
    };
  } catch {
    return emptyHomeJustAdded;
  }
}

/** Saved order, with courses published since then placed at the front. */
export function justAddedOrder(savedIds: string[], publishedNewestFirst: string[]) {
  const published = new Set(publishedNewestFirst);
  const kept = savedIds.filter((id) => published.has(id));
  if (kept.length === 0) return publishedNewestFirst.slice(0, 3);
  const extra = publishedNewestFirst.filter((id) => !kept.includes(id));
  return [...extra, ...kept].slice(0, 24);
}

function clip(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 80) : "";
}
