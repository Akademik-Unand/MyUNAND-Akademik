/** Dua tema resmi: myUNAND terang dan gelap. */
export const AVAILABLE_THEMES = [
  {
    id: 'myunand',
    name: 'Terang',
    type: 'light',
  },
  {
    id: 'myunand-dark',
    name: 'Gelap',
    type: 'dark',
  },
];

export const DEFAULT_THEME = 'myunand';
export const DARK_THEME = 'myunand-dark';

const LEGACY_THEMES = {
  light: 'myunand',
  corporate: 'myunand',
  dark: 'myunand-dark',
};

export const normalizeTheme = (value) => {
  if (value === DARK_THEME || value === DEFAULT_THEME) return value;
  return LEGACY_THEMES[value] || DEFAULT_THEME;
};

export const isDarkTheme = (id) => normalizeTheme(id) === DARK_THEME;

/** Tangga ukuran huruf (px pada html, semua rem ikut membesar). */
export const FONT_SCALES = [
  { id: 'normal', label: 'Normal', px: 16 },
  { id: 'large', label: 'Besar', px: 18 },
  { id: 'xlarge', label: 'Lebih besar', px: 20 },
  { id: 'xxlarge', label: 'Sangat besar', px: 24 },
];

export const DEFAULT_FONT_SCALE = 'normal';

export const getFontScale = (id) =>
  FONT_SCALES.find((item) => item.id === id) || FONT_SCALES[0];
