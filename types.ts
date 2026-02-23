
export enum MoodProfile {
  SOLACE = 'solace',     // Foggy, minimalist, typewriter
  LUSTRE = 'lustre',     // Golden hour, elegant, road-trips
  INTIMACY = 'intimacy', // Macro, rain, script/handwriting
  VANGUARD = 'vanguard', // Bold, high-contrast, modern sans
  NOIR = 'noir',         // Night, neon, gothic/mysterious
  SPIRIT = 'spirit',     // Planes, trains, transit, travel solitude
  DRIFT = 'drift'        // Lo-fi illustrations, anime-style pensiveness
}

export enum ArtisticStyle {
  OBSIDIAN = 'obsidian',
  ETHEREAL = 'ethereal',
  RAW = 'raw',
  MOODY_ATMOSPHERE = 'moody_atmosphere',
  LOFI_STILL = 'lofi_still'
}

export enum AppStyle {
  PLAINT = 'plaint',
  RANDOM_AESTHETIC = 'random_aesthetic'
}

export type AspectRatio = '1:1' | '16:9' | '9:16';
export type FontFamily = 
  | 'Inter' | 'Playfair Display' | 'Lora' | 'Courier Prime' | 'Syne' | 'Space Grotesk' | 'Fraunces' 
  | 'Cormorant Garamond' | 'Caveat' | 'UnifrakturMaguntia' | 'Bebas Neue' | 'Montserrat'
  | 'Cinzel' | 'Italiana' | 'Major Mono Display' | 'Krona One' | 'Old Standard TT' | 'Six Caps' 
  | 'VT323' | 'Libre Caslon Display' | 'Abril Fatface';

export type LayoutType = 'hero_stack' | 'minimal_typewriter' | 'classic_serif' | 'boxed_minimal' | 'neon_reflection' | 'bold_headline' | 'window_scribe';

// Added missing TextPosition type
export type TextPosition = 'top' | 'center' | 'bottom';

// Added missing Theme and ColorPalette types for preference tracking
export type Theme = 'peaceful' | 'melancholic' | 'motivated' | 'hopeful';
export type ColorPalette = 'cool_blues' | 'warm_oranges' | 'dark_moody' | 'pastel_soft' | 'lofi_mutes';
export type SceneType = string;

export interface AestheticPlan {
  quote: string;
  heading: string;
  heroFont: FontFamily;
  supportFont: FontFamily;
  textColor: string;
  textGlowColor: string;
  textOpacity: number;
  letterSpacing: string;
  layoutType: LayoutType;
  visualNuance: string;
  verticalAlign: TextPosition;
  backgroundColor?: string; // For boxed layouts
}

export interface GenerationConfig {
  mood?: MoodProfile;
  style: ArtisticStyle | AppStyle;
  aspectRatio: AspectRatio;
  subject?: string;
  customQuote?: string;
  // Added optional fields used by preferenceService and Generator
  theme?: Theme;
  colors?: ColorPalette;
  scene?: string;
  quote?: string;
  // Included AestheticPlan properties for combined usage in Generator
  heroFont?: FontFamily;
  supportFont?: FontFamily;
  textColor?: string;
  textGlowColor?: string;
  textOpacity?: number;
  heading?: string;
}

// Added missing UserPreferences interface
export interface UserPreferences {
  styleHistory: Record<string, { totalSeen: number; chosen: number; strength: number }>;
  themes: Record<string, { totalSeen: number; chosen: number; strength: number }>;
  colorPalettes: Record<string, { totalSeen: number; chosen: number; strength: number }>;
  sceneTypes: Record<string, { totalSeen: number; chosen: number; strength: number }>;
  totalGenerations: number;
  confidenceScore: number;
}

export interface ImpactImage {
  id: string;
  url: string;
  plan: AestheticPlan;
  config: GenerationConfig;
  timestamp: number;
}

export interface UserProfile {
  credits: number;
}
