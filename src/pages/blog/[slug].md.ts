import type { APIRoute, GetStaticPaths } from 'astro';

// Markdown twins: serve every post's raw Markdown at /blog/<slug>.md so AI
// coding agents can consume plain Markdown instead of the HTML page (cleaner
// parse, fewer tokens). Posts are standalone Markdown pages, not a content
// collection, so we read the raw source via a ?raw glob and strip the layout
// frontmatter, leaving agent-friendly Markdown.
const rawModules = import.meta.glob<string>('./*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

interface PostFrontmatter {
  title: string;
  description?: string;
}
const metaModules = import.meta.glob<{ frontmatter: PostFrontmatter }>('./*.md', {
  eager: true,
});

const slugFromPath = (path: string) =>
  path.split('/').pop()!.replace(/\.md$/, '');

const stripFrontmatter = (raw: string) =>
  raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();

export const getStaticPaths: GetStaticPaths = () =>
  Object.keys(rawModules).map((path) => ({
    params: { slug: slugFromPath(path) },
    props: { path },
  }));

export const GET: APIRoute = ({ props }) => {
  const { path } = props as { path: string };
  const raw = rawModules[path];
  const { title, description } = metaModules[path].frontmatter;

  const body = `# ${title}\n\n${description ? `> ${description}\n\n` : ''}${stripFrontmatter(raw)}\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
