import { useEffect, useMemo, useState } from 'react';

import type { CoauthorMap } from '../../utils/authors';
import { linkAuthors } from '../../utils/authors';
import type { BibEntry } from '../../utils/bibtex';
import {
  getAuthors,
  getBoolField,
  getCleanBibtex,
  getTitle,
  getVenue,
  getYear,
} from '../../utils/bibtex';
import { BadgeSet } from './BadgeSet';
import { GoogleScholarBadge } from './GoogleScholarBadge';
import { InspireHEPBadge } from './InspireHEPBadge';

interface Labels {
  abstract?: string;
  bibtex?: string;
  supp?: string;
  searchPlaceholder?: string;
  noResults?: string;
}

/** Translated publication strings (both languages, switched live). */
export interface PubI18n {
  searchPlaceholder: string;
  noResults: string;
  showingOne: string;
  showingMany: string;
  moreOne: string;
  moreMany: string;
  details: string;
}

interface BadgeConfig {
  altmetric: boolean;
  dimensions: boolean;
  googleScholar: boolean;
  inspirehep: boolean;
}

interface Props {
  entries: BibEntry[];
  maxAuthorLimit?: number;
  showThumbnails?: boolean;
  /** Last name to italicise in author lists (case-insensitive). */
  authorLastName?: string;
  /** Path prefix for publication preview images (relative to public/). */
  previewDir?: string;
  /** Path prefix for publication PDFs and supplements (relative to public/). */
  pdfDir?: string;
  /** UI labels — override for non-English sites. */
  labels?: Labels;
  /** Translated UI strings for live language switching. */
  i18n?: { en: PubI18n; fa: PubI18n };
  /** Default chrome language. */
  lang?: string;
  /** site.base value used to build links to individual publication detail pages. */
  detailBase?: string;
  /** Parsed coauthors.yml — used to link co-author names to their profiles. */
  coauthors?: CoauthorMap;
  /** google_scholar_id → citation count (from citations.yml). */
  citations?: Record<string, number>;
  /** Google Scholar user ID for badge profile links (site.socials.scholar_userid). */
  scholarUserId?: string;
  /** Badge visibility flags from site.publications.badges. */
  badges?: BadgeConfig;
}

function entryUrl(entry: BibEntry): string {
  if (entry.fields.html) return entry.fields.html;
  if (entry.fields.doi) return `https://doi.org/${entry.fields.doi}`;
  return '';
}

function PublicationEntry({
  entry,
  maxAuthorLimit = 3,
  showThumbnails = true,
  authorLastName = '',
  previewDir = '/assets/img/publication_preview/',
  pdfDir = '/assets/pdf/',
  labels = {},
  detailBase,
  coauthors = {},
  citations = {},
  scholarUserId = '',
  badges,
  ui,
}: {
  entry: BibEntry;
  maxAuthorLimit?: number;
  showThumbnails?: boolean;
  authorLastName?: string;
  previewDir?: string;
  pdfDir?: string;
  labels?: Labels;
  detailBase?: string;
  coauthors?: CoauthorMap;
  citations?: Record<string, number>;
  scholarUserId?: string;
  badges?: BadgeConfig;
  ui?: PubI18n;
}) {
  const [abstractOpen, setAbstractOpen] = useState(false);
  const [bibtexOpen, setBibtexOpen] = useState(false);
  const [awardOpen, setAwardOpen] = useState(false);

  const abbr = entry.fields.abbr ?? '';
  const preview = entry.fields.preview ?? '';
  const title = getTitle(entry);
  const url = entryUrl(entry);
  const authorsRaw = getAuthors(entry);
  const authorList = authorsRaw ? authorsRaw.split(', ') : [];
  const venue = getVenue(entry);
  const year = getYear(entry);
  const abstract = entry.fields.abstract ?? '';
  const doi = entry.fields.doi ?? '';
  const arxiv = entry.fields.arxiv ?? '';
  const hal = entry.fields.hal ?? '';
  const pdfPath = entry.fields.pdf ?? '';
  const supp = entry.fields.supp ?? '';
  const codeUrl = entry.fields.code ?? '';
  const blog = entry.fields.blog ?? '';
  const website = entry.fields.website ?? '';
  const slides = entry.fields.slides ?? '';
  const poster = entry.fields.poster ?? '';
  const video = entry.fields.video ?? '';
  const hasAward = entry.fields.award ?? '';
  const awardName = entry.fields.award_name ?? '';
  const bibtex_show = getBoolField(entry, 'bibtex_show');
  const annotation = entry.fields.annotation ?? '';
  const additionalInfo = entry.fields.additional_info ?? '';

  // Badge fields
  const googleScholarId = entry.fields.google_scholar_id ?? '';
  const inspirehepId = entry.fields.inspirehep_id ?? '';
  const altmetricField = entry.fields.altmetric ?? '';
  const dimensionsField = entry.fields.dimensions ?? '';

  // Altmetric: explicit ID overrides DOI/arXiv lookup when value is not "true"
  const altmetricExplicitId =
    altmetricField && altmetricField !== 'true' ? altmetricField : undefined;
  const hasAltmetricSource = !!(altmetricExplicitId || doi || arxiv);

  const showAltmetric = !!(badges?.altmetric && altmetricField && hasAltmetricSource);
  const showDimensions = !!(badges?.dimensions && dimensionsField && doi);
  const showGoogleScholar = !!(badges?.googleScholar && googleScholarId && scholarUserId);
  const showInspireHEP = !!(badges?.inspirehep && inspirehepId);
  const hasBadges = showAltmetric || showDimensions || showGoogleScholar || showInspireHEP;

  // Author links with coauthor URL and self-identification
  const authorLinks = useMemo(
    () => linkAuthors(authorList, coauthors, authorLastName),

    [authorsRaw, authorLastName],
  );
  const visibleAuthorLinks = maxAuthorLimit ? authorLinks.slice(0, maxAuthorLimit) : authorLinks;
  const hiddenCount = authorLinks.length - visibleAuthorLinks.length;

  const contentColClass = showThumbnails && (abbr || preview) ? 'col-sm-8' : 'col-sm-10';

  // Resolve asset paths — use full URL if provided, otherwise prefix with configured dir
  const previewSrc = preview.includes('://') ? preview : `${previewDir}${preview}`;
  const pdfHref = pdfPath.startsWith('http') ? pdfPath : `${pdfDir}${pdfPath}`;
  const suppHref = supp.startsWith('http') ? supp : `${pdfDir}${supp}`;
  const slidesHref = slides.startsWith('http') ? slides : `${pdfDir}${slides}`;
  const posterHref = poster.startsWith('http') ? poster : `${pdfDir}${poster}`;

  const scholarCount = googleScholarId ? citations[googleScholarId] : undefined;

  return (
    <li>
      <div className="row">
        {/* Left column: abbr badge + thumbnail */}
        {showThumbnails && (abbr || preview) && (
          <div className="col col-sm-2 abbr">
            {abbr && <abbr className="badge w-100 rounded">{abbr}</abbr>}
            {preview && (
              <img
                className="preview z-depth-1 rounded"
                src={previewSrc}
                alt={preview}
                loading="lazy"
              />
            )}
          </div>
        )}

        {/* Right column: content */}
        <div id={entry.key} className={contentColClass}>
          {/* Title — links to internal detail page when available, otherwise to external URL */}
          <div className="title">
            {detailBase !== undefined ? (
              <a href={`${detailBase}/publications/${entry.key}/`}>{title}</a>
            ) : url ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                {title}
              </a>
            ) : (
              title
            )}
          </div>

          {/* Authors with coauthor links and self-identification */}
          {authorLinks.length > 0 && (
            <div className="author">
              {visibleAuthorLinks.map((al, i) => {
                const isLast = i === visibleAuthorLinks.length - 1 && hiddenCount === 0;
                const nameEl = al.isSelf ? <em>{al.name}</em> : <>{al.name}</>;
                return (
                  <span key={i}>
                    {al.url ? (
                      <a href={al.url} target="_blank" rel="noopener noreferrer">
                        {nameEl}
                      </a>
                    ) : (
                      nameEl
                    )}
                    {!isLast && ', '}
                  </span>
                );
              })}
              {hiddenCount > 0 && (
                <span>
                  ,{' '}
                  {(hiddenCount === 1
                    ? (ui?.moreOne ?? 'and {n} more author')
                    : (ui?.moreMany ?? 'and {n} more authors')
                  ).replace('{n}', String(hiddenCount))}
                </span>
              )}
              {/* Annotation tooltip — info icon with hover text */}
              {annotation && (
                <span
                  title={annotation}
                  aria-label={annotation}
                  data-tooltip={annotation}
                  style={{ cursor: 'help', marginLeft: '0.3rem', opacity: 0.65, fontSize: '0.9em' }}
                >
                  ⓘ
                </span>
              )}
            </div>
          )}

          {/* Venue + year + additional_info */}
          {(venue || year) && (
            <div className="periodical">
              {venue && <em>{venue}</em>}
              {venue && year ? ', ' : ''}
              {year || ''}
              {additionalInfo && <span style={{ marginLeft: '0.25rem' }}> · {additionalInfo}</span>}
            </div>
          )}

          {/* Link buttons */}
          <div className="links">
            {hasAward && (
              <button
                className="award btn btn-sm z-depth-0"
                onClick={() => setAwardOpen(!awardOpen)}
                style={{ cursor: 'pointer', background: 'none' }}
              >
                {awardName || 'Awarded'}
              </button>
            )}
            {abstract && (
              <button
                className="abstract btn btn-sm z-depth-0"
                onClick={() => setAbstractOpen(!abstractOpen)}
                style={{ cursor: 'pointer', background: 'none' }}
              >
                {labels.abstract ?? 'Abs'}
              </button>
            )}
            {doi && (
              <a
                href={`https://doi.org/${doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm z-depth-0"
              >
                DOI
              </a>
            )}
            {arxiv && (
              <a
                href={`https://arxiv.org/abs/${arxiv}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm z-depth-0"
              >
                arXiv
              </a>
            )}
            {hal && (
              <a
                href={`https://hal.science/${hal}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm z-depth-0"
              >
                HAL
              </a>
            )}
            {bibtex_show && (
              <button
                className="bibtex btn btn-sm z-depth-0"
                onClick={() => setBibtexOpen(!bibtexOpen)}
                style={{ cursor: 'pointer', background: 'none' }}
              >
                {labels.bibtex ?? 'Bib'}
              </button>
            )}
            {entry.fields.html && (
              <a
                href={entry.fields.html}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm z-depth-0"
              >
                HTML
              </a>
            )}
            {pdfPath && (
              <a
                href={pdfHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm z-depth-0"
              >
                PDF
              </a>
            )}
            {supp && (
              <a
                href={suppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm z-depth-0"
              >
                {labels.supp ?? 'Supp'}
              </a>
            )}
            {slides && (
              <a
                href={slidesHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm z-depth-0"
              >
                Slides
              </a>
            )}
            {poster && (
              <a
                href={posterHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm z-depth-0"
              >
                Poster
              </a>
            )}
            {video && (
              <a
                href={video}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm z-depth-0"
              >
                Video
              </a>
            )}
            {codeUrl && (
              <a
                href={codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm z-depth-0"
              >
                Code
              </a>
            )}
            {blog && (
              <a
                href={blog}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm z-depth-0"
              >
                Blog
              </a>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm z-depth-0"
              >
                Website
              </a>
            )}
            {detailBase !== undefined && (
              <a href={`${detailBase}/publications/${entry.key}/`} className="btn btn-sm z-depth-0">
                {ui?.details ?? 'Details'}
              </a>
            )}
          </div>

          {/* Metric badges row */}
          {hasBadges && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginTop: '0.4rem',
              }}
            >
              <BadgeSet
                doi={doi || undefined}
                arxiv={arxiv || undefined}
                altmetricId={altmetricExplicitId}
                showAltmetric={showAltmetric}
                showDimensions={showDimensions}
              />
              {showGoogleScholar && (
                <GoogleScholarBadge
                  scholarUserId={scholarUserId}
                  googleScholarId={googleScholarId}
                  count={scholarCount}
                />
              )}
              {showInspireHEP && <InspireHEPBadge inspirehepId={inspirehepId} />}
            </div>
          )}

          {/* Award hidden block */}
          {hasAward && (
            <div className={`award hidden${awardOpen ? 'open' : ''}`}>
              <p>{hasAward}</p>
            </div>
          )}

          {/* Abstract hidden block */}
          {abstract && (
            <div className={`abstract hidden${abstractOpen ? 'open' : ''}`}>
              <p>{abstract}</p>
            </div>
          )}

          {/* BibTeX hidden block — internal fields filtered out */}
          {bibtex_show && (
            <div className={`bibtex hidden${bibtexOpen ? 'open' : ''}`}>
              <pre>{getCleanBibtex(entry)}</pre>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function BibSearch({
  entries,
  maxAuthorLimit = 3,
  showThumbnails = true,
  authorLastName = '',
  previewDir = '/assets/img/publication_preview/',
  pdfDir = '/assets/pdf/',
  labels = {},
  detailBase,
  coauthors = {},
  citations = {},
  scholarUserId = '',
  badges,
  i18n,
  lang = 'en',
}: Props) {
  const [query, setQuery] = useState('');
  // Read the applied chrome language at mount: the engine's pre-paint script
  // sets <html lang> before React hydrates, so the first paint is correct.
  const [uiLang, setUiLang] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.lang === 'fa'
      ? 'fa'
      : lang === 'fa'
        ? 'fa'
        : 'en',
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const next = (e as CustomEvent).detail?.lang;
      if (next === 'fa' || next === 'en') setUiLang(next);
    };
    window.addEventListener('lab-lang-change', handler);
    return () => window.removeEventListener('lab-lang-change', handler);
  }, []);

  const ui: PubI18n | undefined = i18n?.[uiLang as 'en' | 'fa'] ?? i18n?.en;
  // Live chrome language wins; the static `labels` prop is the fallback.
  const searchPlaceholder =
    ui?.searchPlaceholder ?? labels.searchPlaceholder ?? 'Search publications\u2026';
  const noResults = ui?.noResults ?? labels.noResults ?? 'No publications match your search.';
  const showing =
    entries.length === 1
      ? (ui?.showingOne ?? 'Showing {filtered} of {total} publication')
      : (ui?.showingMany ?? 'Showing {filtered} of {total} publications');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    const words = q.split(/\s+/).filter(Boolean);
    return entries.filter((entry) => {
      const haystack = [getTitle(entry), getAuthors(entry), getVenue(entry), String(getYear(entry))]
        .join(' ')
        .toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
  }, [entries, query]);

  const byYear = useMemo(() => {
    const map = new Map<number, BibEntry[]>();
    for (const entry of filtered) {
      const year = getYear(entry);
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(entry);
    }
    return map;
  }, [filtered]);

  const years = useMemo(() => [...byYear.keys()].sort((a, b) => b - a), [byYear]);

  return (
    <div className="publications" dir={uiLang === 'fa' ? 'rtl' : 'ltr'}>
      {/* Search bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            fontSize: '0.9375rem',
            border: '1px solid var(--global-divider-color)',
            borderRadius: '6px',
            color: 'var(--global-text-color)',
            backgroundColor: 'transparent',
            outline: 'none',
          }}
          aria-label={searchPlaceholder}
        />
        <p
          style={{
            marginTop: '0.375rem',
            fontSize: '0.8125rem',
            color: 'var(--global-text-color-light)',
          }}
        >
          {showing
            .replace('{filtered}', String(filtered.length))
            .replace('{total}', String(entries.length))}
        </p>
      </div>

      {/* Publications grouped by year */}
      {filtered.length === 0 ? (
        <p style={{ color: 'var(--global-text-color-light)' }}>{noResults}</p>
      ) : (
        years.map((year) => (
          <div key={year}>
            <h2 className="year">{year}</h2>
            <ol className="bibliography">
              {byYear.get(year)!.map((entry) => (
                <PublicationEntry
                  key={entry.key}
                  entry={entry}
                  maxAuthorLimit={maxAuthorLimit}
                  showThumbnails={showThumbnails}
                  authorLastName={authorLastName}
                  previewDir={previewDir}
                  pdfDir={pdfDir}
                  labels={labels}
                  detailBase={detailBase}
                  coauthors={coauthors}
                  citations={citations}
                  scholarUserId={scholarUserId}
                  badges={badges}
                  ui={ui}
                />
              ))}
            </ol>
          </div>
        ))
      )}
    </div>
  );
}

export default BibSearch;
