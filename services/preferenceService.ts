
import { AppStyle, UserPreferences, GenerationConfig, Theme, ColorPalette, SceneType } from "../types";

const DEFAULT_PREFS: UserPreferences = {
  styleHistory: {
    [AppStyle.RANDOM_AESTHETIC]: { totalSeen: 0, chosen: 0, strength: 0.5 },
    [AppStyle.PLAINT]: { totalSeen: 0, chosen: 0, strength: 0.5 },
  },
  themes: {},
  colorPalettes: {},
  sceneTypes: {},
  totalGenerations: 0,
  confidenceScore: 0
};

export const preferenceService = {
  getInitialPrefs(): UserPreferences {
    const saved = localStorage.getItem('sentience_prefs');
    return saved ? JSON.parse(saved) : DEFAULT_PREFS;
  },

  savePrefs(prefs: UserPreferences) {
    localStorage.setItem('sentience_prefs', JSON.stringify(prefs));
  },

  recordChoice(prefs: UserPreferences, chosen: GenerationConfig, rejected: GenerationConfig): UserPreferences {
    const newPrefs = { ...prefs };
    newPrefs.totalGenerations += 1;

    // Update Styles
    const chosenStyle = chosen.style as string;
    const rejectedStyle = rejected.style as string;

    if (!newPrefs.styleHistory[chosenStyle]) {
      newPrefs.styleHistory[chosenStyle] = { totalSeen: 0, chosen: 0, strength: 0.5 };
    }
    if (!newPrefs.styleHistory[rejectedStyle]) {
      newPrefs.styleHistory[rejectedStyle] = { totalSeen: 0, chosen: 0, strength: 0.5 };
    }

    newPrefs.styleHistory[chosenStyle].chosen += 1;
    newPrefs.styleHistory[chosenStyle].totalSeen += 1;
    newPrefs.styleHistory[rejectedStyle].totalSeen += 1;
    
    // Recalculate strengths
    Object.keys(newPrefs.styleHistory).forEach((style) => {
      const data = newPrefs.styleHistory[style];
      data.strength = data.totalSeen > 0 ? data.chosen / data.totalSeen : 0.5;
    });

    // Update Themes/Colors
    const updateAttr = (category: Record<string, any>, val: string | undefined, isChosen: boolean) => {
      if (!val) return;
      if (!category[val]) category[val] = { totalSeen: 0, chosen: 0, strength: 0.5 };
      category[val].totalSeen += 1;
      if (isChosen) category[val].chosen += 1;
      category[val].strength = category[val].chosen / category[val].totalSeen;
    };

    updateAttr(newPrefs.themes, chosen.theme, true);
    updateAttr(newPrefs.themes, rejected.theme, false);
    updateAttr(newPrefs.colorPalettes, chosen.colors, true);
    updateAttr(newPrefs.colorPalettes, rejected.colors, false);

    // Calculate confidence
    newPrefs.confidenceScore = Math.min(newPrefs.totalGenerations * 0.05, 0.95);

    return newPrefs;
  },

  getTopAttribute(category: Record<string, any>, defaults: string[]): string {
    const entries = Object.entries(category);
    if (entries.length === 0) return defaults[Math.floor(Math.random() * defaults.length)];
    return entries.sort((a, b) => b[1].strength - a[1].strength)[0][0];
  },

  determineGenerationStrategy(prefs: UserPreferences): { optionA: GenerationConfig; optionB: GenerationConfig } {
    const themes: Theme[] = ['peaceful', 'melancholic', 'motivated', 'hopeful'];
    const colors: ColorPalette[] = ['cool_blues', 'warm_oranges', 'dark_moody', 'pastel_soft'];
    
    const styles = [AppStyle.RANDOM_AESTHETIC, AppStyle.PLAINT];

    if (prefs.totalGenerations < 5) {
      // Exploration Phase
      const styleA = styles[Math.floor(Math.random() * styles.length)];
      const styleB = styles.filter(s => s !== styleA)[Math.floor(Math.random() * (styles.length - 1))];
      return {
        optionA: { 
          style: styleA, 
          theme: themes[Math.floor(Math.random() * themes.length)],
          colors: colors[Math.floor(Math.random() * colors.length)],
          aspectRatio: '9:16',
          quote: ''
        },
        optionB: { 
          style: styleB, 
          theme: themes[Math.floor(Math.random() * themes.length)],
          colors: colors[Math.floor(Math.random() * colors.length)],
          aspectRatio: '9:16',
          quote: ''
        }
      };
    }

    // Personalized Phase
    const topStyle = this.getTopAttribute(prefs.styleHistory, styles) as AppStyle;
    const topTheme = this.getTopAttribute(prefs.themes, themes) as Theme;
    const topColor = this.getTopAttribute(prefs.colorPalettes, colors) as ColorPalette;

    return {
      optionA: { 
        style: topStyle, 
        theme: topTheme, 
        colors: topColor, 
        aspectRatio: '9:16',
        quote: '' 
      },
      optionB: { 
        style: styles.filter(s => s !== topStyle)[0] || AppStyle.PLAINT, 
        theme: themes.filter(t => t !== topTheme)[Math.floor(Math.random() * (themes.length - 1))],
        colors: topColor,
        aspectRatio: '9:16',
        quote: ''
      }
    };
  }
};
