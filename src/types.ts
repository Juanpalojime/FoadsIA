
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

export const AspectRatio = {
    PORTRAIT: '9:16',
    SQUARE: '1:1',
    LANDSCAPE: '16:9'
} as const;

export type AspectRatio = typeof AspectRatio[keyof typeof AspectRatio];

export interface Layer {
    id: string;
    name: string;
    type: 'image' | 'text' | 'background' | 'ai';
    visible: boolean;
    locked: boolean;
    content: string;
    isProcessing?: boolean;
}

export type ToolType = 'select' | 'move' | 'text' | 'brush' | 'ai';

export interface Selection {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const WizardStep = {
    UPLOAD: 1,
    CONFIG: 2,
    REVIEW: 3
} as const;

export type WizardStep = typeof WizardStep[keyof typeof WizardStep];

export interface BrandImage {
    id: string;
    url: string;
    alt: string;
    selected: boolean;
}
