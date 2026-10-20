import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';

interface PostFrontmatter {
  title: string;
  date: string;
  description: string;
}

// Same discovery as llms.txt.ts: posts are standalone Markdown pages, not a
// content collection.
const modules = import.meta.glob<{ frontmatter: PostFrontmatter; url: string }>(
  './blog/*.md',
  { eager: true },
);

export const GET: APIRoute = (context) =>
  rss({
    title: 'EE Heng Chen — Blog',
    description:
      "EE Heng Chen's build logs: Claude Code plugins, MCP tooling and LLM compliance projects, each told as a series that follows the project.",
    site: context.site!,
    items: Object.values(modules)
      .map((m) => ({
        title: m.frontmatter.title,
        description: m.frontmatter.description,
        pubDate: new Date(m.frontmatter.date),
        link: m.url,
      }))
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()),
  });
