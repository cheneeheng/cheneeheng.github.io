export type ProjectStatus = 'active' | 'past';

export interface Project {
  title: string;
  status: ProjectStatus;
  tags: string[];
  summary: string;
  link?: string;
  /** Shown on the homepage. Mirrors the featured projects on the GitHub profile. */
  featured?: boolean;
}

export const projects: Project[] = [
  {
    title: 'PR Compliance Gate',
    status: 'active',
    featured: true,
    tags: ['LangGraph', 'Claude Agent SDK', 'FastAPI', 'Policy compliance'],
    summary:
      'A LangGraph + Claude Agent SDK pipeline that reviews pull requests against security, licensing, and data-handling policy before merge — cost-gated, human-in-the-loop.',
    link: 'https://github.com/cheneeheng/pr-compliance-gate',
  },
  {
    title: 'Presidio Compliance Stack',
    status: 'active',
    featured: true,
    tags: ['PDPA', 'PII redaction', 'Presidio', 'Python'],
    summary:
      'A pip-installable PDPA compliance layer for Malaysian SMEs using AI/LLM tooling with customer data. One shared codebase, two packages: presidio-audit and presidio-malaysia.',
    link: 'https://github.com/cheneeheng/presidio-compliance-stack',
  },
  {
    title: 'MLOps Incident Commander',
    status: 'active',
    featured: true,
    tags: ['Multi-agent', 'MLOps', 'Monitoring', 'Post-mortem'],
    summary:
      'Multi-agent supervision of a live ML model: monitoring, investigation, remediation, post-mortem.',
    link: 'https://github.com/cheneeheng/mlops-incident-commander',
  },
  {
    title: 'MCP Cassette',
    status: 'active',
    featured: true,
    tags: ['MCP', 'Testing', 'PyPI', 'Python'],
    summary:
      'vcrpy for MCP. Records real agent–server sessions into diffable cassettes and replays them as deterministic mock servers.',
    link: 'https://github.com/cheneeheng/mcp-cassette',
  },
  {
    title: 'Personal Website',
    status: 'active',
    tags: ['Astro', 'Tailwind', 'GitHub Pages'],
    summary:
      'This site. Statically generated with Astro and deployed to GitHub Pages via GitHub Actions.',
    link: 'https://github.com/cheneeheng/cheneeheng.github.io',
  },
  {
    title: 'Computer-vision PhD research',
    status: 'past',
    tags: [
      'Computer vision',
      'Autonomous vehicles',
      'Optical flow',
      'Object detection',
      'Segmentation',
      'PyTorch',
      'TensorFlow',
    ],
    summary:
      'Doctoral research on perception for autonomous vehicles: traffic-junction crossing, dense optical flow for objects, pixelwise junction segmentation, and binary neural networks for traffic-sign detection. Also contributed to ICU patient-monitoring models.',
  },
  {
    title: 'Object-centric manipulation labeling',
    status: 'past',
    tags: ['Robotics', 'Manipulation', 'ICRA 2018'],
    summary:
      'Master/early-PhD work on an object-centric approach to predicting and labeling robot manipulation tasks (ICRA 2018).',
    link: 'https://ieeexplore.ieee.org/abstract/document/8462973',
  },
];
