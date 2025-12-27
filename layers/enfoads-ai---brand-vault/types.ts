
export interface BrandImage {
  id: string;
  url: string;
  alt: string;
  selected: boolean;
}

export enum WizardStep {
  UPLOAD = 1,
  CONFIG = 2,
  REVIEW = 3,
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}
