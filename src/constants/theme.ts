export const Colors = {
  bg:         '#0F0F14',
  card:       '#17171F',
  tag:        '#1E1E2A',
  border:     'rgba(255,255,255,0.08)',
  sol:        '#9945FF',
  solLight:   '#C08AFF',
  green:      '#14F195',
  usdc:       '#2775CA',
  bonk:       '#FFA000',
  text:       '#F2F2F2',
  muted:      '#888888',
  danger:     '#FF5757',
  warning:    '#F5A623',
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
} as const;

export const Radius = {
  sm:   8,
  md:  12,
  lg:  16,
  pill: 999,
} as const;

export const FontSize = {
  xs:   11,
  sm:   12,
  md:   13,
  base: 14,
  lg:   16,
  xl:   18,
  xxl:  22,
  h1:   28,
} as const;

export const FontFamily = {
  sans: 'System',   // replaced by custom font via expo-font in App
  mono: 'SpaceMono',
} as const;
