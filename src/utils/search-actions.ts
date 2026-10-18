/**
 * Pagefind hits → ninja-keys actions, plus the guard rails the palette needs.
 *
 * ninja-keys re-filters every action it is handed against the typed text, and
 * it only inspects `title` and `keywords`. A full-text hit whose words live in
 * the page body — the entire point of Pagefind — would therefore vanish from
 * the palette and leave the visitor with an empty list. Each action therefore
 * carries the raw query (plus the highlighted excerpt) as `keywords`, so every
 * genuine hit stays listed.
 *
 * That same internal filter builds a regular expression straight from the typed
 * text, which `installLiteralFilter` neutralises so queries such as `c++`
 * cannot break the palette.
 */

export type PagefindHit = {
  url: string;
  meta?: { title?: string } | null;
  excerpt?: string;
};

export type SearchAction = {
  id: string;
  title: string;
  section: string;
  keywords: string;
  handler: () => void;
};

/** Characters that carry a special meaning inside a regular expression. */
const REGEX_META = /[.*+?^${}()|[\]\\]/g;

export function escapeSearchQuery(query: string): string {
  return query.replace(REGEX_META, '\\$&');
}

export function unescapeSearchQuery(query: string): string {
  return query.replace(/\\(.)/g, '$1');
}

export type LiteralFilter = {
  /** Back to what the visitor typed, from ninja-keys' own `change` payload. */
  query: (payload: string) => string;
};

/**
 * `ninja-keys` narrows the palette with `new RegExp(typedText)`, so a query such
 * as `c++`, `(` or `a**` throws inside its render and freezes the list on the
 * previous results. Redefining the `_search` field it owns keeps a valid,
 * literal copy for that filter, and `query()` undoes the escaping for search.
 */
export function installLiteralFilter(el: { _search?: string }): LiteralFilter {
  let escaped = '';
  let assigned = false;

  try {
    Object.defineProperty(el, '_search', {
      configurable: true,
      get: () => escaped,
      set: (value: string) => {
        escaped = escapeSearchQuery(String(value ?? ''));
        assigned = true;
      },
    });
  } catch {
    // Field is locked down — keep ninja-keys' own behaviour.
  }

  return {
    // `assigned` stays false only if the component never wrote the field, in
    // which case the payload is already raw text and must not be unescaped.
    query: (payload: string) =>
      assigned ? unescapeSearchQuery(String(payload ?? '')) : String(payload ?? ''),
  };
}

/** Pagefind marks the matched terms with `<mark>` tags inside the excerpt. */
export function plainExcerpt(excerpt = ''): string {
  return excerpt
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildSearchActions(
  hits: PagefindHit[],
  rawQuery: string,
  section: string,
  limit = 10,
): SearchAction[] {
  return hits.slice(0, limit).map((hit) => ({
    id: hit.url,
    title: hit.meta?.title || hit.url,
    section,
    keywords: `${rawQuery} ${plainExcerpt(hit.excerpt)}`.trim(),
    handler: () => {
      window.location.href = hit.url;
    },
  }));
}
