
export interface AdVariation {
  id: string;
  headline: string;
  description: string;
  cta: string;
  imageUrl: string;
  imagePrompt: string;
}

export interface AdConfig {
  tone: string;
  audience: string;
  goal: string;
  creativity: number;
  brandSafety: boolean;
  includeLogo: boolean;
}

export enum AspectRatio {
  PORTRAIT = '9:16',
  SQUARE = '1:1',
  LANDSCAPE = '16:9'
}
