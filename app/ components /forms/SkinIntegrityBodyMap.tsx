'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, Crosshair, Box } from 'lucide-react';

interface BodyRegion {
  id: string;
  label: string;
  path: string;
}

interface AreaDetail {
  pinpoint: string;
  detail: string;
}

interface BodyMapModel {
  mode: '2D' | '3D';
  view: string;
  areas: Record<string, AreaDetail>;
}

const BODY_REGIONS: BodyRegion[] = [
  { id: 'head', label: 'Head / Face', path: 'M50 4 C43 4 38 9 38 17 C38 26 43 32 50 32 C57 32 62 26 62 17 C62 9 57 4 50 4Z' },
  { id: 'neck', label: 'Neck', path: 'M43 31 H57 L60 39 H40 Z' },
  { id: 'chest', label: 'Chest', path: 'M35 39 C40 35 60 35 65 39 L62 58 H38 Z' },
  { id: 'abdomen', label: 'Abdomen', path: 'M38 58 H62 L60 76 H40 Z' },
  { id: 'pelvis', label: 'Pelvis / Sacrum', path: 'M40 76 H60 L66 91 H34 Z' },
  { id: 'left_upper_arm', label: 'Left Upper Arm', path: 'M34 40 L23 45 L19 64 L29 66 L36 51 Z' },
  { id: 'right_upper_arm', label: 'Right Upper Arm', path: 'M66 40 L77 45 L81 64 L71 66 L64 51 Z' },
  { id: 'left_forearm', label: 'Left Forearm', path: 'M19 64 L29 66 L26 84 L15 83 Z' },
  { id: 'right_forearm', label: 'Right Forearm', path: 'M81 64 L71 66 L74 84 L85 83 Z' },
  { id: 'left_hand', label: 'Left Hand', path: 'M14 83 L26 84 L24 95 L12 94 Z' },
  { id: 'right_hand', label: 'Right Hand', path: 'M86 83 L74 84 L76 95 L88 94 Z' },
  { id: 'left_thigh', label: 'Left Thigh', path: 'M35 91 H49 L47 124 H34 Z' },
  { id: 'right_thigh', label: 'Right Thigh', path: 'M51 91 H65 L66 124 H53 Z' },
  { id: 'left_lower_leg', label: 'Left Lower Leg', path: 'M34 124 H47 L45 160 H32 Z' },
  { id: 'right_lower_leg', label: 'Right Lower Leg', path: 'M53 124 H66 L68 160 H55 Z' },
  { id: 'left_foot', label: 'Left Foot', path: 'M31 160 H45 L47 172 H27 Z' },
  { id: 'right_foot', label: 'Right Foot', path: 'M55 160 H69 L73 172 H53 Z' },
];

const VIEW_OPTIONS = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
  { id: 'left_side', label: 'Left side' },
  { id: 'right_side', label: 'Right side' },
  { id: '360', label: '360 view' },
];

const REGION_VIEW_LABELS: Record<string, Record<string, string>> = {
  front: {
    head: 'Front head / face', neck: 'Front neck / throat', chest: 'Chest / sternum', abdomen: 'Abdomen', pelvis: 'Front pelvis / groin',
    left_upper_arm: 'Left front upper arm', right_upper_arm: 'Right front upper arm', left_forearm: 'Left front forearm', right_forearm: 'Right front forearm', left_hand: 'Left palm / hand', right_hand: 'Right palm / hand',
    left_thigh: 'Left front thigh', right_thigh: 'Right front thigh', left_lower_leg: 'Left shin', right_lower_leg: 'Right shin', left_foot: 'Left top of foot', right_foot: 'Right top of foot'
  },
  back: {
    head: 'Back of head', neck: 'Back of neck', chest: 'Upper back / shoulder blades', abdomen: 'Lower back / flank', pelvis: 'Sacrum / buttocks',
    left_upper_arm: 'Left back upper arm', right_upper_arm: 'Right back upper arm', left_forearm: 'Left back forearm', right_forearm: 'Right back forearm', left_hand: 'Left back of hand', right_hand: 'Right back of hand',
    left_thigh: 'Left back thigh', right_thigh: 'Right back thigh', left_lower_leg: 'Left calf', right_lower_leg: 'Right calf', left_foot: 'Left heel / sole', right_foot: 'Right heel / sole'
  },
  left_side: {
    head: 'Left side head / ear', neck: 'Left side neck', chest: 'Left shoulder / ribs', abdomen: 'Left flank / waist', pelvis: 'Left hip',
    left_upper_arm: 'Left outer upper arm', right_upper_arm: 'Right inner upper arm visible from left', left_forearm: 'Left outer forearm', right_forearm: 'Right inner forearm visible from left', left_hand: 'Left side hand', right_hand: 'Right hand visible from left',
    left_thigh: 'Left outer thigh', right_thigh: 'Right inner thigh visible from left', left_lower_leg: 'Left outer calf / ankle', right_lower_leg: 'Right inner lower leg visible from left', left_foot: 'Left outer foot / heel', right_foot: 'Right foot visible from left'
  },
  right_side: {
    head: 'Right side head / ear', neck: 'Right side neck', chest: 'Right shoulder / ribs', abdomen: 'Right flank / waist', pelvis: 'Right hip',
    left_upper_arm: 'Left inner upper arm visible from right', right_upper_arm: 'Right outer upper arm', left_forearm: 'Left inner forearm visible from right', right_forearm: 'Right outer forearm', left_hand: 'Left hand visible from right', right_hand: 'Right side hand',
    left_thigh: 'Left inner thigh visible from right', right_thigh: 'Right outer thigh', left_lower_leg: 'Left inner lower leg visible from right', right_lower_leg: 'Right outer calf / ankle', left_foot: 'Left foot visible from right', right_foot: 'Right outer foot / heel'
  },
  '360': {}
};

const VIEW_TRANSFORMS: Record<string, string> = {
  front: 'rotateY(0deg)',
  right_side: 'rotateY(-58deg) skewY(1deg)',
  back: 'rotateY(180deg)',
  left_side: 'rotateY(58deg) skewY(-1deg)',
  '360': 'rotateY(0deg)'
};

const VIEW_SCALE: Record<string, string> = {
  front: 'scaleX(1)',
  back: 'scaleX(-1)',
  left_side: 'scaleX(0.58)',
  right_side: 'scaleX(0.58)',
  '360': 'scaleX(1)'
};

const ROTATION_VIEWS = ['front', 'right_side', 'back', 'left_side'];

const EMPTY_MODEL: BodyMapModel = { mode: '2D', view: 'front', areas: {} };

const parseValue = (value: any): BodyMapModel => {
  if (!value) return EMPTY_MODEL;
  if (typeof value === 'object') return { ...EMPTY_MODEL, ...value, areas: value.areas || {} };
  try {
    const parsed = JSON.parse(value);
    return { ...EMPTY_MODEL, ...parsed, areas: parsed.areas || {} };
  } catch {
    // Fallback for legacy string format
    const [, rawAreas = ''] = String(value).split(':');
    const areas = rawAreas.split(',').map((area) => area.trim()).filter(Boolean).reduce((acc, label) => {
      acc[label] = { pinpoint: '', detail: '' };
      return acc;
    }, {} as Record<string, AreaDetail>);
    return { ...EMPTY_MODEL, areas };
  }
};

const formatDisplayValue = (model: BodyMapModel): string => 
  JSON.stringify({ mode: model.mode, view: model.view, areas: model.areas });

interface Props {
  value?: any;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function SkinIntegrityBodyMap({ value, onChange, required = false }: Props) {
  const model = useMemo(() => parseValue(value), [value]);
  const [activeArea, setActiveArea] = useState<string>(Object.keys(model.areas || {})[0] || '');
  const [rotationStep, setRotationStep] = useState(0);

  const selectedLabels = Object.keys(model.areas || {});
  const activeDetails = model.areas?.[activeArea] || { pinpoint: '', detail: '' };
  const activeView = model.view === '360' 
    ? ROTATION_VIEWS[rotationStep % ROTATION_VIEWS.length] 
    : model.view;

  const visibleViewLabel = VIEW_OPTIONS.find(item => item.id === activeView)?.label || 'Front';

  useEffect(() => {
    if (model.view !== '360') return undefined;
    const timer = setInterval(() => {
      setRotationStep(prev => (prev + 1) % 4);
    }, 1200);
    return () => clearInterval(timer);
  }, [model.view]);

  const updateModel = (newModel: BodyMapModel) => {
    onChange(formatDisplayValue(newModel));
  };

  const toggleArea = (label: string) => {
    const areas = { ...(model.areas || {}) };
    if (areas[label]) {
      delete areas[label];
      if (activeArea === label) setActiveArea(Object.keys(areas)[0] || '');
    } else {
      areas[label] = { pinpoint: '', detail: '' };
      setActiveArea(label);
    }
    updateModel({ ...model, areas });
  };

  const updateAreaDetail = (field: 'pinpoint' | 'detail', nextValue: string) => {
    if (!activeArea) return;
    updateModel({
      ...model,
      areas: {
        ...(model.areas || {}),
        [activeArea]: { ...activeDetails, [field]: nextValue }
      }
    });
  };

  return (
    <div className="min-w-0 space-y-6 overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-emerald-900">Interactive Skin Integrity Body Map</p>
          <p className="text-sm text-emerald-700">Tap a body region, then add pinpoint location and detail.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['2D', '3D'].map(mode => (
            <Button
              key={mode}
              size="sm"
              variant={model.mode === mode ? 'default' : 'outline'}
              onClick={() => updateModel({ ...model, mode: mode as '2D' | '3D' })}
              className={model.mode === mode ? 'bg-emerald-700 text-white' : ''}
            >
              {mode} Model
            </Button>
          ))}
          {VIEW_OPTIONS.map(item => (
            <Button
              key={item.id}
              size="sm"
              variant={model.view === item.id ? 'default' : 'outline'}
              onClick={() => updateModel({ ...model, view: item.id })}
              className={model.view === item.id ? 'bg-slate-800 text-white' : ''}
            >
              {item.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateModel({ ...EMPTY_MODEL })}
          >
            <RotateCcw className="h-4 w-4" /> Clear
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(240px,360px)_1fr]">
        {/* Interactive SVG Body Map */}
        <div className="min-w-0 overflow-hidden rounded-3xl border bg-white p-4 shadow-inner">
          <div className="relative mx-auto h-auto max-h-[480px] w-full max-w-[280px]">
            <svg
              viewBox="0 0 100 176"
              role="img"
              aria-label={`Clickable human body model — ${visibleViewLabel} view`}
              className={`transition-transform duration-700 ease-in-out ${model.view === '360' ? 'drop-shadow-2xl' : ''}`}
              style={{
                transform: `${VIEW_TRANSFORMS[activeView]} ${VIEW_SCALE[activeView]}`,
                transformStyle: 'preserve-3d'
              }}
            >
              <defs>
                <linearGradient id="skinMapBodyFill" x1="0" x2="1">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="55%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
              </defs>
              <text x="50" y="174" textAnchor="middle" className="fill-slate-400 text-[5px] font-semibold uppercase tracking-wide">
                {model.view === '360' ? `360 motion — ${visibleViewLabel}` : visibleViewLabel} view
              </text>

              {BODY_REGIONS.map((region) => {
                const regionLabel = REGION_VIEW_LABELS[activeView]?.[region.id] || region.label;
                const active = Boolean(model.areas?.[regionLabel]);
                const focused = activeArea === regionLabel;

                return (
                  <path
                    key={region.id}
                    d={region.path}
                    onClick={() => toggleArea(regionLabel)}
                    className={`cursor-pointer transition-all ${active ? 'fill-red-400 stroke-red-700' : 'fill-[url(#skinMapBodyFill)] stroke-slate-300 hover:fill-emerald-100 hover:stroke-emerald-500'} ${focused ? 'drop-shadow-lg' : ''}`}
                    strokeWidth={focused ? 1.8 : 1}
                  />
                );
              })}

              {selectedLabels.map(label => {
                const region = BODY_REGIONS.find(r => 
                  REGION_VIEW_LABELS[activeView]?.[r.id] === label || r.label === label
                );
                if (!region) return null;
                const match = region.path.match(/M([0-9.]+) ([0-9.]+)/);
                const x = match ? Number(match[1]) : 50;
                const y = match ? Number(match[2]) : 50;
                return (
                  <circle
                    key={label}
                    cx={x}
                    cy={y}
                    r="2.2"
                    className="fill-red-700 stroke-white"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Details Panel */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Selected Regions {required && <span className="text-red-500">*</span>}
            </p>
            {selectedLabels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedLabels.map(label => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActiveArea(label)}
                    className="rounded-full"
                  >
                    <Badge className={activeArea === label ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'}>
                      {label}
                    </Badge>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No body areas selected yet.</p>
            )}
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-emerald-900">
              <Crosshair className="h-4 w-4" />
              <p className="text-sm font-semibold">Pinpoint Detail</p>
            </div>
            {activeArea ? (
              <div className="space-y-4">
                <Badge className="bg-emerald-100 text-emerald-800">{activeArea}</Badge>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Specific point / landmark</Label>
                  <Input
                    value={activeDetails.pinpoint || ''}
                    onChange={(e) => updateAreaDetail('pinpoint', e.target.value)}
                    placeholder="e.g. left heel, outer ankle, lower sacrum, right elbow"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Observation details</Label>
                  <Textarea
                    value={activeDetails.detail || ''}
                    onChange={(e) => updateAreaDetail('detail', e.target.value)}
                    placeholder="Describe redness, wound, bruise, pain, size, appearance, treatment or escalation needed."
                    rows={5}
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                <Box className="mx-auto mb-3 h-8 w-8" />
                Select an area on the human model to add pinpoint details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
