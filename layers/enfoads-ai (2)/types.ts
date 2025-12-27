
export enum View {
  DASHBOARD = 'dashboard',
  CAMPAIGNS = 'campaigns',
  GENERATE = 'generate',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings'
}

export interface Campaign {
  id: string;
  name: string;
  assetsCount: number;
  thumbnails: string[];
}

export interface Generation {
  id: string;
  title: string;
  timeAgo: string;
  status: 'Ready' | 'Processing';
  imageUrl?: string;
}
