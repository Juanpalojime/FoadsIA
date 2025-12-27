
export type AdObjective = 'direct_sales' | 'brand_awareness' | 'traffic';

export type VisualStyle = 'ecommerce_clean' | 'lifestyle_outdoor' | 'cyber_marketing' | 'minimalist_studio';

export type AspectRatio = '1:1' | '9:16' | '16:9';

export interface AdvancedSettings {
  creativity: number;
  variations: number;
  guidanceScale: number;
}

export interface AdConfiguration {
  objective: AdObjective;
  visualStyle: VisualStyle;
  mood: 'bright' | 'dark_mode' | 'neon';
  aspectRatio: AspectRatio;
  advanced: AdvancedSettings;
}
