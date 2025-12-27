
export enum ToolCategory {
  ALL = 'Todas',
  IMAGE = 'Imagen',
  VIDEO = 'Video',
  COPYWRITING = 'Copywriting'
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: ToolCategory;
}

export interface AdCopyResult {
  headline: string;
  primaryText: string;
  cta: string;
}
