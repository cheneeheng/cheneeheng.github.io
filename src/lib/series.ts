import { formatDate } from './date';

// Posts that share a `repo` are episodes of one series, ordered by date. The
// series is derived rather than declared per post so a new queued post joins
// its series on publish day with no frontmatter to remember.
interface SeriesFrontmatter {
  title: string;
  date?: unknown;
  repo?: string;
}

const modules = import.meta.glob<{ frontmatter: SeriesFrontmatter }>(
  '../pages/blog/*.md',
  { eager: true },
);

export interface Series {
  name: string;
  part: number;
  total: number;
  first: { slug: string; title: string };
}

/** Where `slug` sits in its series, or undefined if the post stands alone. */
export function seriesOf(repo: string | undefined, slug: string): Series | undefined {
  if (!repo) return undefined;
  // Read frontmatter lazily: posts import the layout that calls this, so
  // touching it at module scope would trip the import cycle.
  const parts = Object.entries(modules)
    .map(([path, m]) => ({
      slug: path.split('/').pop()!.replace(/\.md$/, ''),
      title: m.frontmatter.title,
      date: formatDate(m.frontmatter.date),
      repo: m.frontmatter.repo,
    }))
    .filter((p) => p.repo === repo)
    .sort((a, b) => a.date.localeCompare(b.date));
  const index = parts.findIndex((p) => p.slug === slug);
  if (parts.length < 2 || index < 0) return undefined;
  return {
    name: repo.split('/').pop()!,
    part: index + 1,
    total: parts.length,
    first: parts[0],
  };
}
