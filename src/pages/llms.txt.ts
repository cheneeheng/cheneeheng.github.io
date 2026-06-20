import type { APIRoute } from 'astro';

interface PostFrontmatter {
  title: string;
  date?: string;
  description?: string;
}

// This site does not use Astro content collections; posts are standalone
// Markdown pages under src/pages/blog/. Discover them the same way the blog
// index and homepage do, so llms.txt stays in sync as posts are published.
const modules = import.meta.glob<{ frontmatter: PostFrontmatter; url: string }>(
  './blog/*.md',
  { eager: true },
);

const SITE = 'https://cheneeheng.github.io';

const posts = Object.values(modules)
  .map((m) => ({ ...m.frontmatter, url: m.url ?? '' }))
  .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));

export const GET: APIRoute = () => {
  const body = `# EE Heng Chen — Blog

> Practical guides and working examples for Claude Code, plus notes on research and projects. Each post is also available as raw Markdown at the same URL with a .md suffix.

## Posts
${posts
  .map((p) => `- [${p.title}](${SITE}${p.url}): ${p.description ?? ''}`)
  .join('\n')}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
