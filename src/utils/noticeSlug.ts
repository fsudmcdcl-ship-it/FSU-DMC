import { NewsItem } from "../types";

/**
 * Creates a clean, human-readable SEO slug for a notice.
 * Example: "First Term Examination Routine 2083", id: "abc12345" -> "first-term-examination-routine-2083-abc123"
 */
export function createNoticeSlug(heading: string, id: string): string {
  const cleanTitle = (heading || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 45);

  const shortId = id.length > 8 ? id.slice(-6) : id;
  return cleanTitle ? `${cleanTitle}-${shortId}` : id;
}

/**
 * Resolves a notice from a list by either its exact ID, its generated slug,
 * or partial slug match.
 */
export function findNoticeBySlugOrId(newsList: NewsItem[], query: string): NewsItem | undefined {
  if (!query || !newsList || newsList.length === 0) return undefined;
  const q = decodeURIComponent(query).toLowerCase().trim();

  // 1. Direct match by ID
  const directMatch = newsList.find((n) => n.id.toLowerCase() === q);
  if (directMatch) return directMatch;

  // 2. Exact match by generated slug
  const slugMatch = newsList.find(
    (n) => createNoticeSlug(n.headingEn, n.id).toLowerCase() === q
  );
  if (slugMatch) return slugMatch;

  // 3. Partial match (if query contains the ID or ID ends with the query suffix)
  return newsList.find((n) => {
    const slug = createNoticeSlug(n.headingEn, n.id).toLowerCase();
    const shortId = n.id.slice(-6).toLowerCase();
    return (
      slug.includes(q) ||
      q.includes(n.id.toLowerCase()) ||
      q.endsWith(shortId) ||
      n.id.toLowerCase().endsWith(q)
    );
  });
}
