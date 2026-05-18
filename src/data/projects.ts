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
