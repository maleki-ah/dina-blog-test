import { site } from '@config/site';
import { getCollection } from 'astro:content';

export interface ResolvedAuthor {
  slug: string;
  name: string;
  href: string | null;
}

/** Build a link to a People profile page. */
export function personUrl(slug: string): string {
  return `${site.base}/members/${slug}/`;
}

/**
 * Resolve post author slugs to display names with profile links.
 * Unknown slugs fall back to a readable name with no link.
 * Server-only (uses astro:content) — do not import from client components.
 */
export async function resolvePostAuthors(slugs: string[] = []): Promise<ResolvedAuthor[]> {
  if (slugs.length === 0) return [];
  const people = await getCollection('people');
  const byId = new Map(people.map((p) => [p.id.replace(/\.mdx?$/, ''), p]));
  // Also index by full id for safety.
  for (const p of people) byId.set(p.id, p);
  return slugs.map((raw) => {
    const slug = raw.trim();
    const key = slug.replace(/\.mdx?$/, '');
    const entry = byId.get(slug) ?? byId.get(key);
    if (entry) {
      return { slug: key, name: entry.data.name, href: personUrl(key) };
    }
    const readable = slug.replace(/[-_]+/g, ' ');
    return { slug: key, name: readable, href: null };
  });
}
