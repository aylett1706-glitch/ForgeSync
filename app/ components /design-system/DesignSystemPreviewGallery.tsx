'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Bell, Users, Activity, BarChart3 } from 'lucide-react';
import { FONT_LABELS, FontKey } from './brandPresets';

// --- Helper Functions ---
const hexToRgb = (hex: string) => {
  const normalized = String(hex || '').replace('#', '').trim();
  if (![3, 6].includes(normalized.length)) return null;
  const full = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;
  const int = Number.parseInt(full, 16);
  if (Number.isNaN(int)) return null;
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
};

const withAlpha = (hex: string, alpha: number) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

type PatternType = 'grid' | 'diagonal' | 'stripes' | 'crosshatch' | 'none';
type IntensityType = 'subtle' | 'medium' | 'bold';

const getPatternLayer = (pattern: PatternType, color: string, intensity: IntensityType = 'subtle'): string => {
  if (!pattern || pattern === 'none') return 'none';
  const alpha = intensity === 'bold' ? 0.16 : intensity === 'medium' ? 0.1 : 0.06;
  const line = withAlpha(color, alpha);

  if (pattern === 'grid') {
    return `repeating-linear-gradient(0deg, transparent 0 20px, ${line} 20px 21px), repeating-linear-gradient(90deg, transparent 0 20px, ${line} 20px 21px)`;
  }
  if (pattern === 'diagonal') {
    return `repeating-linear-gradient(135deg, transparent 0 14px, ${line} 14px 16px)`;
  }
  if (pattern === 'stripes') {
    return `repeating-linear-gradient(90deg, transparent 0 18px, ${line} 18px 24px)`;
  }
  if (pattern === 'crosshatch') {
    return `repeating-linear-gradient(45deg, transparent 0 14px, ${line} 14px 16px), repeating-linear-gradient(-45deg, transparent 0 14px, ${line} 14px 16px)`;
  }
  return 'none';
};

// --- Types ---
interface GraphSettings {
  graph_palette?: string[];
  graph_line_width?: 'thin' | 'default' | 'thick';
  graph_grid?: 'solid' | 'dashed' | 'none' | 'strong';
  graph_fill?: 'none' | 'solid' | 'gradient';
  graph_style?: 'smooth' | 'straight' | 'stepped';
}

interface DesignDraft {
  app_name?: string;
  heading_font: FontKey;
  body_font: FontKey;
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
  card_shadow: 'soft' | 'subtle' | 'floating';
  button_style: 'shadow' | 'elevated' | 'flat';
  card_border_style: 'subtle' | 'strong' | 'none';
  gradient_angle?: string;
  nav_style: 'solid' | 'glass' | 'gradient';
  nav_pattern: PatternType;
  surface_pattern: PatternType;
  pattern_intensity: IntensityType;
  sidebar_width: string;
  nav_height: string;
  card_radius: string;
  button_radius: string;
  settings?: GraphSettings;
  [key: string]: any;
}

interface Props {
  draft: DesignDraft;
}

// --- Component ---
export default function DesignSystemPreviewGallery({ draft }: Props) {
  const headingFont = FONT_LABELS[draft.heading_font] || 'Inter';
  const bodyFont = FONT_LABELS[draft.body_font] || 'Inter';

  // Derived preview styles
  const previewCardShadow = draft.card_shadow === 'floating'
    ? '0 22px 50px -26px rgba(15,23,42,0.35)'
    : draft.card_shadow === 'subtle'
      ? '0 10px 24px -18px rgba(15,23,42,0.18)'
      : '0 16px 36px -24px rgba(15,23,42,0.25)';

  const previewButtonShadow = draft.button_style === 'elevated'
    ? '0 16px 30px -18px rgba(15,23,42,0.34)'
    : draft.button_style === 'shadow'
      ? '0 10px 22px -16px rgba(15,23,42,0.26)'
      : 'none';

  const previewBorderWidth = draft.card_border_style === 'strong' ? '2px' : draft.card_border_style === 'none' ? '0px' : '1px';
  const previewBorderColor = draft.card_border_style === 'none' ? 'transparent' : `${draft.muted_color}CC`;
  const angle = draft.gradient_angle || '135deg';

  const navBaseLayer = draft.nav_style === 'solid'
    ? `linear-gradient(${angle}, ${draft.primary_color} 0%, ${draft.primary_color} 100%)`
    : draft.nav_style === 'glass'
      ? `linear-gradient(${angle}, ${withAlpha(draft.primary_color, 0.82)} 0%, ${withAlpha(draft.secondary_color, 0.74)} 100%)`
      : `linear-gradient(${angle}, ${draft.primary_color} 0%, ${draft.secondary_color} 100%)`;

  const navPatternLayer = getPatternLayer(draft.nav_pattern, draft.text_color, draft.pattern_intensity);
  const surfacePatternLayer = getPatternLayer(draft.surface_pattern, draft.muted_color, draft.pattern_intensity);
  const navBackgroundImage = navPatternLayer === 'none' ? navBaseLayer : `${navPatternLayer}, ${navBaseLayer}`;

  const graphSettings = draft.settings || {};
  const graphPalette = graphSettings.graph_palette || [draft.secondary_color, draft.accent_color, draft.success_color, draft.danger_color, draft.info_color, draft.primary_color];
  const graphLineWidth = graphSettings.graph_line_width === 'thick' ? 5 : graphSettings.graph_line_width === 'thin' ? 2 : 3;
  const graphGridClass = graphSettings.graph_grid === 'dashed' ? 'border-dashed' : graphSettings.graph_grid === 'none' ? 'border-transparent' : '';

  // Sidebar width mapping
  const getSidebarWidth = () => {
    switch (draft.sidebar_width) {
      case '20rem': return '92%';
      case '18rem': return '84%';
      case '15rem': return '70%';
      default: return '76%';
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.36fr_0.64fr]">
      {/* Sidebar Preview */}
      <Card className="overflow-hidden" style={{ borderWidth: previewBorderWidth, borderColor: previewBorderColor }}>
        <div className="p-4 text-white" style={{ backgroundImage: navBackgroundImage, minHeight: draft.nav_height }}>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${draft.text_color}22` }}>
              <Palette className="h-5 w-5" style={{ color: draft.text_color }} />
            </div>
            <div>
              <div className="font-semibold" style={{ color: draft.text_color, fontFamily: `var(--app-heading-font, ${headingFont})` }}>
                {draft.app_name}
              </div>
              <div className="text-xs" style={{ color: `${draft.text_color}CC` }}>
                Sidebar behaviour preview
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {['Dashboard', 'Participants', 'Funding', 'Reports'].map((item, index) => (
              <div
                key={item}
                className={`rounded-xl px-3 py-2 ${index === 0 ? 'bg-white/20' : 'bg-white/10'}`}
                style={{ color: draft.text_color, width: getSidebarWidth() }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Preview Area */}
      <div className="space-y-6">
        {/* Top Bar Preview */}
        <Card className="overflow-hidden" style={{ backgroundColor: draft.background_color, borderWidth: previewBorderWidth, borderColor: previewBorderColor }}>
          <div className="p-5" style={{ backgroundImage: navBackgroundImage }}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-bold" style={{ color: draft.text_color, fontFamily: `var(--app-heading-font, ${headingFont})` }}>
                  {draft.app_name}
                </div>
                <div className="text-sm" style={{ color: `${draft.text_color}CC`, fontFamily: `var(--app-body-font, ${bodyFont})` }}>
                  Navigation, contrast, pattern and shell tone
                </div>
              </div>
              <Badge className="border-0" style={{ backgroundColor: `${draft.text_color}22`, color: draft.text_color }}>
                Live shell
              </Badge>
            </div>
          </div>
        </Card>

        {/* Component Preview Card */}
        <Card
          style={{
            backgroundColor: draft.surface_color,
            backgroundImage: surfacePatternLayer,
            borderRadius: draft.card_radius,
            boxShadow: previewCardShadow,
            borderWidth: previewBorderWidth,
            borderColor: previewBorderColor
          }}
        >
          <CardHeader>
            <CardTitle style={{ fontFamily: `var(--app-heading-font, ${headingFont})` }}>
              Components, patterns and typography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5" style={{ fontFamily: `var(--app-body-font, ${bodyFont})` }}>
            {/* Buttons & Badges */}
            <div className="flex flex-wrap gap-3">
              <Button
                style={{
                  backgroundColor: draft.secondary_color,
                  color: draft.text_color,
                  borderRadius: draft.button_radius,
                  boxShadow: previewButtonShadow
                }}
              >
                Primary Action
              </Button>
              <Button variant="outline" style={{ borderRadius: draft.button_radius }}>
                Secondary Action
              </Button>
              <Badge className="border-0" style={{ backgroundColor: `${draft.success_color}22`, color: draft.success_color }}>
                Success
              </Badge>
              <Badge className="border-0" style={{ backgroundColor: `${draft.warning_color}22`, color: draft.warning_color }}>
                Warning
              </Badge>
              <Badge className="border-0" style={{ backgroundColor: `${draft.danger_color}22`, color: draft.danger_color }}>
                Critical
              </Badge>
              <Badge variant="outline">Nav: {draft.nav_pattern || 'none'}</Badge>
              <Badge variant="outline">Surface: {draft.surface_pattern || 'none'}</Badge>
            </div>

            {/* Sample Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <div
                className="rounded-2xl border p-4"
                style={{ borderRadius: draft.card_radius, borderWidth: previewBorderWidth, borderColor: previewBorderColor }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" style={{ color: draft.info_color }} />
                  <span className="font-semibold text-slate-900">Readable data card</span>
                </div>
                <p className="text-sm text-slate-600">
                  Use this system for dashboards, forms and operational screens without losing visual consistency.
                </p>
              </div>
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderRadius: draft.card_radius,
                  backgroundColor: `${draft.muted_color}55`,
                  backgroundImage: surfacePatternLayer,
                  borderWidth: previewBorderWidth,
                  borderColor: previewBorderColor
                }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4" style={{ color: draft.accent_color }} />
                  <span className="font-semibold text-slate-900">Signature accent treatment</span>
                </div>
                <div
                  className="mt-3 h-2 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${draft.primary_color} 0%, ${draft.secondary_color} 60%, ${draft.accent_color} 100%)` }}
                />
              </div>
            </div>

            {/* Full Palette */}
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Full colour scheme</div>
                <p className="mt-1 text-sm text-slate-600">See the complete live palette for this organisation in one place.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Primary', color: draft.primary_color },
                  { label: 'Secondary', color: draft.secondary_color },
                  { label: 'Accent', color: draft.accent_color },
                  { label: 'Text', color: draft.text_color },
                  { label: 'Background', color: draft.background_color },
                  { label: 'Surface', color: draft.surface_color },
                  { label: 'Muted', color: draft.muted_color },
                  { label: 'Info', color: draft.info_color },
                  { label: 'Success', color: draft.success_color },
                  { label: 'Warning', color: draft.warning_color },
                  { label: 'Danger', color: draft.danger_color }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border p-3"
                    style={{ borderRadius: draft.card_radius, borderWidth: previewBorderWidth, borderColor: previewBorderColor }}
                  >
                    <div className="mb-3 h-16 rounded-xl border" style={{ backgroundColor: item.color }} />
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
                    <div className="mt-1 font-mono text-sm text-slate-900">{item.color}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Graph Preview */}
            <div
              className="rounded-2xl border p-4"
              style={{ borderRadius: draft.card_radius, borderWidth: previewBorderWidth, borderColor: previewBorderColor }}
            >
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" style={{ color: graphPalette[0] }} />
                <span className="font-semibold text-slate-900">Graph style preview</span>
              </div>
              <div className="relative h-40 overflow-hidden rounded-2xl border bg-white p-4" style={{ borderColor: previewBorderColor }}>
                <div
                  className={`absolute inset-4 grid grid-rows-4 border-y ${graphGridClass}`}
                  style={{ borderColor: graphSettings.graph_grid === 'strong' ? draft.muted_color : `${draft.muted_color}99` }}
                >
                  <span className="border-b" style={{ borderColor: `${draft.muted_color}66` }} />
                  <span className="border-b" style={{ borderColor: `${draft.muted_color}66` }} />
                  <span className="border-b" style={{ borderColor: `${draft.muted_color}66` }} />
                </div>
                <svg viewBox="0 0 320 120" className="relative h-full w-full" preserveAspectRatio="none">
                  {graphSettings.graph_fill !== 'none' && (
                    <path
                      d="M0 95 C55 70 85 76 130 48 C178 18 218 55 260 32 C290 15 306 28 320 20 L320 120 L0 120 Z"
                      fill={graphSettings.graph_fill === 'gradient' ? 'url(#graphGradient)' : graphPalette[0]}
                      opacity={graphSettings.graph_fill === 'solid' ? 0.18 : 0.12}
                    />
                  )}
                  <defs>
                    <linearGradient id="graphGradient" x1="0" x2="1">
                      <stop offset="0%" stopColor={graphPalette[0]} />
                      <stop offset="100%" stopColor={graphPalette[1]} />
                    </linearGradient>
                  </defs>
                  <path
                    d={
                      graphSettings.graph_style === 'stepped'
                        ? 'M0 95 L60 95 L60 72 L130 72 L130 48 L210 48 L210 56 L260 56 L260 32 L320 32'
                        : graphSettings.graph_style === 'straight'
                          ? 'M0 95 L70 72 L130 48 L210 56 L260 32 L320 20'
                          : 'M0 95 C55 70 85 76 130 48 C178 18 218 55 260 32 C290 15 306 28 320 20'
                    }
                    fill="none"
                    stroke={graphPalette[0]}
                    strokeWidth={graphLineWidth}
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 105 C70 88 110 92 150 76 C190 60 235 78 320 54"
                    fill="none"
                    stroke={graphPalette[1]}
                    strokeWidth={Math.max(2, graphLineWidth - 1)}
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                </svg>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {graphPalette.map((color, index) => (
                  <span key={`${color}-${index}`} className="h-6 w-6 rounded-full border" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>

            {/* Typography Preview */}
            <div
              className="rounded-2xl border p-4"
              style={{ borderRadius: draft.card_radius, borderWidth: previewBorderWidth, borderColor: previewBorderColor }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Bell className="h-4 w-4" style={{ color: draft.accent_color }} />
                <span className="font-semibold text-slate-900">Typography pair</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900" style={{ fontFamily: `var(--app-heading-font, ${headingFont})` }}>
                Heading in {headingFont}
              </h3>
              <p className="mt-2 text-sm text-slate-600" style={{ fontFamily: `var(--app-body-font, ${bodyFont})` }}>
                Body copy in {bodyFont} helps shape the tone of the whole product, from premium and editorial through to crisp and operational.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
