// Tokens de diseño de la app. NADA de colores/espaciados hardcodeados fuera
// de este archivo. Paleta inspirada en HaircutFiveFriendsFrontend (dark UI,
// acento teal + acento dorado).

export const LIGHT_COLORS = {
  primary: '#00A99C',
  primaryDark: '#00877D',
  primaryLight: 'rgba(0, 169, 156, 0.12)',
  secondary: '#B8933F',
  secondaryDark: '#96772E',

  brandDeep: '#0A0A0A',
  brand: '#111111',
  brandMid: '#1A1A1A',
  brandBright: '#242424',
  accentStrong: '#00A99C',

  background: '#F5F6F7',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F1F3',
  overlay: 'rgba(10, 10, 10, 0.55)',

  text: '#0B0B0B',
  textSecondary: '#3A3A3A',
  textMuted: 'rgba(11, 11, 11, 0.6)',
  textOnPrimary: '#FFFFFF',

  border: 'rgba(11, 11, 11, 0.12)',
  borderStrong: 'rgba(11, 11, 11, 0.22)',

  success: '#0F9D6E',
  successBg: 'rgba(16, 185, 129, 0.15)',
  successBorder: 'rgba(16, 185, 129, 0.3)',
  danger: '#C0392B',
  dangerBg: 'rgba(244, 63, 94, 0.15)',
  dangerBorder: 'rgba(244, 63, 94, 0.3)',
  warning: '#B45309',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  warningBorder: 'rgba(245, 158, 11, 0.3)',
  info: '#0369A1',
  infoBg: 'rgba(14, 165, 233, 0.15)',
  infoBorder: 'rgba(14, 165, 233, 0.3)',
  neutral: '#334155',
  neutralBg: 'rgba(100, 116, 139, 0.15)',
  neutralBorder: 'rgba(100, 116, 139, 0.3)',

  star: '#C9A84C',
  starMuted: 'rgba(201, 168, 76, 0.25)',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const DARK_COLORS = {
  primary: '#00D2C4',
  primaryDark: '#00B4A8',
  primaryLight: 'rgba(0, 210, 196, 0.18)',
  secondary: '#C9A84C',
  secondaryDark: '#A88A3A',

  brandDeep: '#000000',
  brandMid: '#1A1A1A',
  brandBright: '#242424',
  brand: '#111111',
  accentStrong: '#00D2C4',

  background: '#0A0A0A',
  surface: '#141414',
  surfaceAlt: '#1C1C1C',
  overlay: 'rgba(0, 0, 0, 0.7)',

  text: '#F5F5F5',
  textSecondary: '#A3A3A3',
  textMuted: 'rgba(245, 245, 245, 0.5)',
  textOnPrimary: '#0A0A0A',

  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',

  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.15)',
  successBorder: 'rgba(16, 185, 129, 0.3)',
  danger: '#F43F5E',
  dangerBg: 'rgba(244, 63, 94, 0.15)',
  dangerBorder: 'rgba(244, 63, 94, 0.3)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  warningBorder: 'rgba(245, 158, 11, 0.3)',
  info: '#0EA5E9',
  infoBg: 'rgba(14, 165, 233, 0.15)',
  infoBorder: 'rgba(14, 165, 233, 0.3)',
  neutral: '#94A3B8',
  neutralBg: 'rgba(148, 163, 184, 0.15)',
  neutralBorder: 'rgba(148, 163, 184, 0.3)',

  star: '#C9A84C',
  starMuted: 'rgba(201, 168, 76, 0.25)',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const GRADIENTS = {
  brand: ['#0A0A0A', '#141414', '#1C1C1C'],
  brandLocations: [0, 0.5, 1],
  hero: ['#000000', '#0A0A0A', '#141414'],
  accent: ['#00877D', '#00D2C4'],
  start: { x: 0, y: 0 },
  endHorizontal: { x: 1, y: 0 },
  endDiagonal: { x: 1, y: 1 },
  endVertical: { x: 0, y: 1 },
};

// Sin fuentes personalizadas (no se instaló @expo-google-fonts): fontFamily
// queda en `undefined` (fuente del sistema) y el peso lo aporta fontWeight,
// que siempre se pasa junto a estas constantes.
export const FONTS = {
  body: undefined,
  medium: undefined,
  semibold: undefined,
  bold: undefined,
  display: undefined,
  displayBold: undefined,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
};

export const RADIUS = {
  sm: 10,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 4,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 2,
  },
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 10,
  },
  brand: {
    shadowColor: '#00D2C4',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
};
