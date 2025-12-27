
export interface AdIdea {
  id: string;
  imageUrl: string;
  category: string;
  ctr?: string;
  conv?: string;
  aspectRatio: '9:16' | '1:1' | '16:9' | '4:5';
  title: string;
  prompt: string;
}

export type ViewMode = 'normal' | 'compact';
export type TabCategory = 'Todo' | 'E-Commerce' | 'SaaS B2B' | 'Apps Móviles' | 'Salud & Belleza' | 'Finanzas';
export type Format = 'all' | '9:16' | '1:1' | '16:9';
