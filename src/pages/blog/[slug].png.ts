import type { APIRoute, GetStaticPaths } from 'astro';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

// Social-card twins: serve every post's banner as a 1200×630 PNG at
// /blog/<slug>.png for og:image. Link-preview scrapers (X, LinkedIn, Slack)
// mostly ignore SVG and expect ~1.91:1, so the 1200×300 SVG banner is
// rasterised and centred on the banner's own background colour.
interface PostFrontmatter {
  banner?: string;
}
const modules = import.meta.glob<{ frontmatter: PostFrontmatter }>('./*.md', { eager: true });

export const getStaticPaths: GetStaticPaths = () =>
  Object.entries(modules)
    .filter(([, m]) => m.frontmatter.banner)
    .map(([path, m]) => ({
      params: { slug: path.split('/').pop()!.replace(/\.md$/, '') },
      props: { banner: m.frontmatter.banner! },
    }));

export const GET: APIRoute = async ({ props }) => {
  const svg = readFileSync(`public${(props as { banner: string }).banner}`);
  const png = await sharp(svg)
    .resize(1200, 630, { fit: 'contain', background: '#0b1120' })
    .png()
    .toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
