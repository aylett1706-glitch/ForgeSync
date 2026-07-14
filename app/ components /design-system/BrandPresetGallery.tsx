'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BRAND_PRESETS, FONT_LABELS } from './brandPresets';

// --- Types ---
interface BrandPresetValues {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  surface_color: string;
  heading_font: string;
  body_font: string;
  card_shadow: string;
  nav_style: string;
  density: string;
  button_style: string;
  nav_pattern: string;
  surface_pattern: string;
  [key: string]: string;
}

interface BrandPreset {
  key: string;
  name: string;
  description: string;
  values: BrandPresetValues;
}

interface Props {
  onApply: (values: BrandPresetValues) => void;
}

export default function BrandPresetGallery({ onApply }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Signature Presets
        </CardTitle>
        <CardDescription>
          Start with a strong visual direction, then fine-tune every token.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {BRAND_PRESETS.map((preset: BrandPreset) => (
          <div key={preset.key} className="rounded-2xl border p-4">
            {/* Gradient Preview */}
            <div
              className="mb-4 rounded-2xl border p-4"
              style={{
                background: `linear-gradient(135deg, ${preset.values.primary_color} 0%, ${preset.values.secondary_color} 68%, ${preset.values.accent_color} 100%)`,
                borderColor: `${preset.values.surface_color}66`
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{preset.name}</p>
                  <p className="mt-1 text-sm text-white/80">{preset.description}</p>
                </div>
                <div className="flex gap-2">
                  {[
                    preset.values.primary_color,
                    preset.values.secondary_color,
                    preset.values.accent_color,
                    preset.values.surface_color
                  ].map((color) => (
                    <span
                      key={color}
                      className="h-6 w-6 rounded-full border border-white/40 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Color Breakdown */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  ['Primary', preset.values.primary_color],
                  ['Secondary', preset.values.secondary_color],
                  ['Accent', preset.values.accent_color],
                  ['Surface', preset.values.surface_color]
                ].map(([label, color]) => (
                  <div key={label} className="rounded-xl bg-white/12 p-2 backdrop-blur-sm">
                    <div
                      className="h-8 rounded-lg border border-white/30"
                      style={{ backgroundColor: color }}
                    />
                    <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                      {label}
                    </div>
                    <div className="mt-1 text-[11px] font-mono text-white/90">
                      {color}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Style Details */}
            <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>Heading: <span className="font-medium text-slate-700">{FONT_LABELS[preset.values.heading_font]}</span></div>
              <div>Body: <span className="font-medium text-slate-700">{FONT_LABELS[preset.values.body_font]}</span></div>
              <div>Cards: <span className="font-medium text-slate-700 capitalize">{preset.values.card_shadow}</span></div>
              <div>Navigation: <span className="font-medium text-slate-700 capitalize">{preset.values.nav_style}</span></div>
              <div>Density: <span className="font-medium text-slate-700 capitalize">{preset.values.density}</span></div>
              <div>Buttons: <span className="font-medium text-slate-700 capitalize">{preset.values.button_style}</span></div>
              <div>Nav Pattern: <span className="font-medium text-slate-700 capitalize">{preset.values.nav_pattern}</span></div>
              <div>Surface Pattern: <span className="font-medium text-slate-700 capitalize">{preset.values.surface_pattern}</span></div>
            </div>

            {/* Apply Button */}
            <Button variant="outline" className="w-full" onClick={() => onApply(preset.values)}>
              Apply Preset
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
