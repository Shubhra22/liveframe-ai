export interface SelectionState {
  element: HTMLElement | null;
  type: 'text' | 'image' | 'container' | 'button' | 'unknown';
  rect: DOMRect | null;
}

export interface AiResponse {
  text?: string;
  imageUrl?: string;
  error?: string;
}

export enum AiActionType {
  REWRITE = 'REWRITE',
  TRANSLATE = 'TRANSLATE',
  SHORTER = 'SHORTER',
  LONGER = 'LONGER',
  TONE_PROFESSIONAL = 'TONE_PROFESSIONAL',
  TONE_CASUAL = 'TONE_CASUAL',
  GENERATE_IMAGE = 'GENERATE_IMAGE',
}