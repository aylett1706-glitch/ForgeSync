// --- Font Labels ---
export const FONT_LABELS = {
  inter: 'Inter',
  manrope: 'Manrope',
  outfit: 'Outfit',
  playfair: 'Playfair Display',
} as const;

export type FontKey = keyof typeof FONT_LABELS;

// --- Style Variant Types & Data ---
interface StyleVariant {
  key: string;
  label: string;
  nav_style: string;
  nav_pattern: string;
  surface_pattern: string;
  pattern_intensity: string;
  card_radius: string;
  button_radius: string;
  card_shadow: string;
  sidebar_width: string;
  nav_height: string;
  density: string;
  card_border_style: string;
  button_style: string;
}

const STYLE_VARIANTS: StyleVariant[] = [
  {
    key: 'refined',
    label: 'Refined',
    nav_style: 'gradient',
    nav_pattern: 'grid',
    surface_pattern: 'none',
    pattern_intensity: 'subtle',
    card_radius: '1rem',
    button_radius: '0.75rem',
    card_shadow: 'soft',
    sidebar_width: '16rem',
    nav_height: '4rem',
    density: 'comfortable',
    card_border_style: 'subtle',
    button_style: 'shadow',
  },
  {
    key: 'glass',
    label: 'Glass',
    nav_style: 'glass',
    nav_pattern: 'diagonal',
    surface_pattern: 'grid',
    pattern_intensity: 'subtle',
    card_radius: '1.5rem',
    button_radius: '9999px',
    card_shadow: 'floating',
    sidebar_width: '18rem',
    nav_height: '4.5rem',
    density: 'comfortable',
    card_border_style: 'subtle',
    button_style: 'elevated',
  },
  {
    key: 'editorial',
    label: 'Editorial',
    nav_style: 'gradient',
    nav_pattern: 'crosshatch',
    surface_pattern: 'diagonal',
    pattern_intensity: 'medium',
    card_radius: '1.5rem',
    button_radius: '9999px',
    card_shadow: 'floating',
    sidebar_width: '20rem',
    nav_height: '4.5rem',
    density: 'spacious',
    card_border_style: 'none',
    button_style: 'elevated',
  },
  {
    key: 'compact',
    label: 'Compact',
    nav_style: 'solid',
    nav_pattern: 'stripes',
    surface_pattern: 'none',
    pattern_intensity: 'subtle',
    card_radius: '0.75rem',
    button_radius: '0.375rem',
    card_shadow: 'subtle',
    sidebar_width: '15rem',
    nav_height: '3.75rem',
    density: 'compact',
    card_border_style: 'strong',
    button_style: 'flat',
  },
  {
    key: 'bold',
    label: 'Bold',
    nav_style: 'gradient',
    nav_pattern: 'grid',
    surface_pattern: 'crosshatch',
    pattern_intensity: 'bold',
    card_radius: '1rem',
    button_radius: '0.75rem',
    card_shadow: 'soft',
    sidebar_width: '18rem',
    nav_height: '4rem',
    density: 'comfortable',
    card_border_style: 'strong',
    button_style: 'shadow',
  },
];

// --- Preset Family Types & Data ---
interface PresetFamily {
  key: string;
  name: string;
  description: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  background_color: string;
  surface_color: string;
  muted_color: string;
  success_color: string;
  warning_color: string;
  danger_color: string;
  info_color: string;
  heading_font: FontKey;
  body_font: FontKey;
}

const PRESET_FAMILIES: PresetFamily[] = [
  {
    key: 'tasman-depth',
    name: 'Tasman Depth',
    description: 'Deep navy, teal and amber with a premium healthcare feel.',
    primary_color: '#0A2540',
    secondary_color: '#0088A8',
    accent_color: '#F59E0B',
    text_color: '#FFFFFF',
    background_color: '#F4F8FB',
    surface_color: '#FFFFFF',
    muted_color: '#D9E4EC',
    success_color: '#10B981',
    warning_color: '#F59E0B',
    danger_color: '#E11D48',
    info_color: '#2563EB',
    heading_font: 'manrope',
    body_font: 'inter',
  },
  {
    key: 'midnight-clinical',
    name: 'Midnight Clinical',
    description: 'Dark, high-contrast and polished for a technical operations aesthetic.',
    primary_color: '#111827',
    secondary_color: '#4F46E5',
    accent_color: '#22C55E',
    text_color: '#F8FAFC',
    background_color: '#EEF2FF',
    surface_color: '#FFFFFF',
    muted_color: '#CBD5E1',
    success_color: '#16A34A',
    warning_color: '#EAB308',
    danger_color: '#DC2626',
    info_color: '#3B82F6',
    heading_font: 'outfit',
    body_font: 'inter',
  },
  {
    key: 'sage-warmth',
    name: 'Sage Warmth',
    description: 'Soft greens and warm neutrals for a calmer, human-centred interface.',
    primary_color: '#2F4F4F',
    secondary_color: '#6B8E7E',
    accent_color: '#D97706',
    text_color: '#F8FAFC',
    background_color: '#F8F7F2',
    surface_color: '#FFFDF8',
    muted_color: '#E7E2D7',
    success_color: '#15803D',
    warning_color: '#D97706',
    danger_color: '#B91C1C',
    info_color: '#0F766E',
    heading_font: 'playfair',
    body_font: 'manrope',
  },
  {
    key: 'sunrise-energy',
    name: 'Sunrise Energy',
    description: 'Bold colour contrasts for a more distinct, memorable product brand.',
    primary_color: '#7C2D12',
    secondary_color: '#C2410C',
    accent_color: '#FBBF24',
    text_color: '#FFF7ED',
    background_color: '#FFF7ED',
    surface_color: '#FFFFFF',
    muted_color: '#FED7AA',
    success_color: '#16A34A',
    warning_color: '#F97316',
    danger_color: '#DC2626',
    info_color: '#2563EB',
    heading_font: 'outfit',
    body_font: 'manrope',
  },
  {
    key: 'ocean-glow',
    name: 'Ocean Glow',
    description: 'Crisp aqua and cyan tones with a clean SaaS calmness.',
    primary_color: '#0F172A',
    secondary_color: '#0891B2',
    accent_color: '#67E8F9',
    text_color: '#F8FAFC',
    background_color: '#ECFEFF',
    surface_color: '#FFFFFF',
    muted_color: '#CFFAFE',
    success_color: '#059669',
    warning_color: '#D97706',
    danger_color: '#DC2626',
    info_color: '#0284C7',
    heading_font: 'outfit',
    body_font: 'inter',
  },
  {
    key: 'forest-command',
    name: 'Forest Command',
    description: 'Grounded green structure with sharper operational clarity.',
    primary_color: '#16302B',
    secondary_color: '#2F6B5F',
    accent_color: '#D4A017',
    text_color: '#F8FAFC',
    background_color: '#F2F7F5',
    surface_color: '#FFFFFF',
    muted_color: '#D7E7E1',
    success_color: '#15803D',
    warning_color: '#CA8A04',
    danger_color: '#B91C1C',
    info_color: '#0F766E',
    heading_font: 'manrope',
    body_font: 'inter',
  },
  {
    key: 'plum-editorial',
    name: 'Plum Editorial',
    description: 'Richer premium look with elegant typography and softer colour depth.',
    primary_color: '#3F1D4D',
    secondary_color: '#7C3AED',
    accent_color: '#F472B6',
    text_color: '#FAF5FF',
    background_color: '#FCF7FF',
    surface_color: '#FFFFFF',
    muted_color: '#E9D5FF',
    success_color: '#16A34A',
    warning_color: '#E8790A',
    danger_color: '#E11D48',
    info_color: '#8B5CF6',
    heading_font: 'playfair',
    body_font: 'manrope',
  },
  {
    key: 'sand-minimal',
    name: 'Sand Minimal',
    description: 'Quiet, understated and airy with calm neutral balance.',
    primary_color: '#3B352F',
    secondary_color: '#8A7865',
    accent_color: '#C08457',
    text_color: '#FAFAF9',
    background_color: '#F8F5F1',
    surface_color: '#FFFCF8',
    muted_color: '#E9DFD4',
    success_color: '#4D7C0F',
    warning_color: '#B45309',
    danger_color: '#B91C1C',
    info_color: '#0369A1',
    heading_font: 'inter',
    body_font: 'inter',
  },
  {
    key: 'electric-horizon',
    name: 'Electric Horizon',
    description: 'High-energy SaaS styling with bright contrast and strong action emphasis.',
    primary_color: '#1E1B4B',
    secondary_color: '#2563EB',
    accent_color: '#22D3EE',
    text_color: '#EFF6FF',
    background_color: '#EFF6FF',
    surface_color: '#FFFFFF',
    muted_color: '#DBEAFE',
    success_color: '#16A34A',
    warning_color: '#EA580C',
    danger_color: '#DC2626',
    info_color: '#0EA5E9',
    heading_font: 'outfit',
    body_font: 'inter',
  },
  {
    key: 'rose-ember',
    name: 'Rose Ember',
    description: 'Warm rose, ember and blush tones for a bold human feel.',
    primary_color: '#6B1D3A',
    secondary_color: '#BE185D',
    accent_color: '#FB7185',
    text_color: '#FFF1F2',
    background_color: '#FFF5F7',
    surface_color: '#FFFFFF',
    muted_color: '#FBCFE8',
    success_color: '#16A34A',
    warning_color: '#EA580C',
    danger_color: '#BE123C',
    info_color: '#2563EB',
    heading_font: 'playfair',
    body_font: 'manrope',
  },
];

// --- Final Preset Types & Export ---
export interface BrandPresetValues extends PresetFamily, StyleVariant {}

export interface BrandPreset {
  key: string;
  name: string;
  description: string;
  values: BrandPresetValues;
}

export const BRAND_PRESETS: BrandPreset[] = PRESET_FAMILIES.flatMap((family) =>
  STYLE_VARIANTS.map((variant) => ({
    key: `${family.key}-${variant.key}`,
    name: `${family.name} ${variant.label}`,
    description: `${family.description} ${variant.label} styling adds a different shell feel and pattern treatment.`,
    values: {
      ...family,
      ...variant,
    },
  }))
);
