export type ProjectStatus = 'active' | 'past';

export interface Project {
  title: string;
  status: ProjectStatus;
  tags: string[];
  summary: string;
  link?: string;
}

export const projects: Project[] = [
  {
    title: 'Agent Coding Contract',
    status: 'active',
    tags: ['AI agents', 'tooling', 'TypeScript'],
    summary:
      'A behavioral contract and skill set for LLM coding agents that enforces minimal-diff edits, explicit authorization, and decision logging.',
    link: 'https://github.com/eehengchen/agent-coding-contract',
  },
  {
    title: 'Personal Website',
    status: 'active',
    tags: ['Astro', 'Tailwind', 'GitHub Pages'],
    summary:
      'This site. Statically generated with Astro and deployed via GitHub Actions.',
  },
  {
    title: 'PhD Thesis Toolkit',
    status: 'past',
    tags: ['research', 'Python'],
    summary:
      'A collection of scripts and notebooks supporting my doctoral research before transitioning into industry.',
  },
];
