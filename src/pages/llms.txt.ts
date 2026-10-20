import type { APIRoute } from 'astro';
import { formatDate } from '../lib/date';

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
  .sort((a, b) => formatDate(b.date).localeCompare(formatDate(a.date)));

// A post without a description ships with no meta description; fail the build instead.
const undescribed = posts.filter((p) => !p.description).map((p) => p.url);
if (undescribed.length) throw new Error(`Posts missing a description: ${undescribed.join(', ')}`);

export const GET: APIRoute = () => {
  const body = `# EE Heng Chen

> ML engineer in Munich: computer-vision PhD and postdoc (2018–2023), now building auditable LLM systems and tooling for AI coding agents. Blog posts are build logs told as series; each post is also available as raw Markdown at the same URL with a .md suffix.

## Pages
- [About](${SITE}/about): background, from mechatronics to self-driving research to hospital ICUs to AI agents
- [Projects](${SITE}/projects): current and past projects with links to their repositories
- [Research](${SITE}/research): publications, 2018–2023
- [Resume](${SITE}/resume): experience and skills
- [Now](${SITE}/now): current focus

## Posts
${posts
  .map((p) => `- [${p.title}](${SITE}${p.url}): ${p.description}`)
  .join('\n')}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
