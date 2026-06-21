import { Dimensions, PixelRatio } from 'react-native'

// ─── Responsive Font Scale ────────────────────────────────────
const { width: _W } = Dimensions.get('window')
const _rf = (n: number) =>
  Math.round(PixelRatio.roundToNearestPixel((_W / 390) * n))

export const FS = {
  micro: _rf(9),
  xs:    _rf(11),
  sm:    _rf(13),
  md:    _rf(15),
  lg:    _rf(17),
  xl:    _rf(20),
  h3:    _rf(22),
  h2:    _rf(26),
  h1:    _rf(30),
  d1:    _rf(36),
  d2:    _rf(42),
}

// ─── Text Shadows (light-mode toned) ─────────────────────────
export const TEXT_SHADOW = {
  ar: {
    textShadowColor:  'rgba(15, 18, 33, 0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  neon: {
    textShadowColor:  'rgba(47, 108, 255, 0.40)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  teal: {
    textShadowColor:  'rgba(0, 168, 150, 0.40)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
}

// ─── Scrim Backplates (light-mode) ───────────────────────────
export const SCRIM = {
  ar:     'rgba(255, 255, 255, 0.82)',
  modal:  'rgba(255, 255, 255, 0.92)',
  subtle: 'rgba(255, 255, 255, 0.60)',
}

export const COLORS = {
  // ── Canvas ────────────────────────────────────────────────────
  canvas:    '#F5F7FF',   // cool off-white main background
  canvasAlt: '#FFFFFF',   // pure white secondary background

  // ── Brand Accents ─────────────────────────────────────────────
  primary:      '#2F6CFF',
  primaryLight: '#5A8FFF',
  primaryDark:  '#1A4FCC',
  teal:         '#00A896',   // darker teal — visible on white
  secondary:    '#7B5EA7',

  // ── Light Surfaces ─────────────────────────────────────────────
  surface:          '#FFFFFF',
  surfaceBright:    '#EEF2FF',
  surfaceBorder:    'rgba(15, 18, 33, 0.10)',
  surfaceHighlight: 'rgba(47, 108, 255, 0.08)',

  // ── Typography ─────────────────────────────────────────────────
  text:          '#0F1221',
  textSecondary: 'rgba(15, 18, 33, 0.62)',
  textMuted:     'rgba(15, 18, 33, 0.40)',

  // ── Semantic ───────────────────────────────────────────────────
  success: '#00A896',
  warning: '#F59E0B',
  error:   '#E53E3E',

  // ── Legacy aliases ──────────────────────────────────────────────
  background:        '#F5F7FF',
  backgroundAlt:     '#FFFFFF',
  surface2:          'rgba(15, 18, 33, 0.04)',
  border:            'rgba(15, 18, 33, 0.10)',
  divider:           'rgba(15, 18, 33, 0.06)',
  gradient:          ['#2F6CFF', '#7B5EA7'] as const,
  neonGradient:      ['#2F6CFF', '#00A896'] as const,

  features: {
    cv:        { from: '#2F6CFF', to: '#00B4D8' },
    skills:    { from: '#9D4EDD', to: '#7B2FBE' },
    interview: { from: '#FF3B6B', to: '#C1121F' },
    jobs:      { from: '#F59E0B', to: '#E76F51' },
    community: { from: '#00A896', to: '#0096C7' },
    resources: { from: '#00B4D8', to: '#0077B6' },
  },
}

export const FONT = {
  regular:   'Cairo_400Regular',
  medium:    'Cairo_500Medium',
  semibold:  'Cairo_600SemiBold',
  bold:      'Cairo_700Bold',
  extrabold: 'Cairo_800ExtraBold',
  black:     'Cairo_900Black',
}

export const SPACING = {
  xs:  4,
  sm:  10,
  md:  20,
  lg:  28,
  xl:  40,
  xxl: 56,
}

export const RADIUS = {
  sm:   10,
  md:   14,
  lg:   18,
  xl:   22,
  xxl:  28,
  xxxl: 34,
  full: 9999,
}

export const SHADOW = {
  sm: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius:  8,
    elevation:     3,
  },
  md: {
    shadowColor:   '#2F6CFF',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius:  16,
    elevation:     8,
  },
  lg: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius:  20,
    elevation:     16,
  },
  neon: {
    shadowColor:   '#2F6CFF',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius:  12,
    elevation:     8,
  },
  teal: {
    shadowColor:   '#00A896',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius:  10,
    elevation:     6,
  },
}
