export interface Publication {
  title: string;
  venue: string;
  year: number;
  abstract: string;
  pdf_url?: string;
}

export const publications: Publication[] = [
  {
    title: 'Placeholder Paper Title A',
    venue: 'Conference / Journal A',
    year: 2024,
    abstract:
      'A short abstract describing the contribution of this paper. Replace with a real publication entry.',
    pdf_url: 'https://example.com/paper-a.pdf',
  },
  {
    title: 'Placeholder Paper Title B',
    venue: 'Conference / Journal B',
    year: 2022,
    abstract:
      'Another short abstract. Replace with a real publication entry.',
  },
];
