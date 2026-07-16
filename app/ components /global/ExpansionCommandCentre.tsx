'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe2, ShieldCheck, Building2, Lock } from 'lucide-react';

interface ExpansionStats {
  profiles?: number;
  sectors?: number;
  policyPacks?: number;
}

interface Pillar {
  title: string;
  description: string;
  icon: React.ElementType;
  tone: string;
}

const PILLARS: Pillar[] = [
  {
    title: 'Global compliance',
    description: 'Country, jurisdiction, language, privacy, safety and source-bound AI boundaries.',
    icon: Globe2,
    tone: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    title: 'Sector expansion',
    description: 'Disability, aged care, healthcare, mental health, child/family, education and security.',
    icon: Building2,
    tone: 'bg-purple-50 text-purple-700 border-purple-100',
  },
  {
    title: 'Org-only security',
    description: 'Every operational dataset must remain scoped to the current organisation by default.',
    icon: Lock,
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
];

interface Props {
  stats?: ExpansionStats;
}

export default function ExpansionCommandCentre({ stats = {} }: Props) {
  return (
    <Card className="border-slate-200 bg-white/95">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Badge className="mb-3 bg-slate-900 text-white hover:bg-slate-900">
              Expansion command layer
            </Badge>
            <h2 className="text-xl font-bold text-slate-950">
              One framework for global, sector and organisation-safe growth
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Use this as the control layer for adding new countries, new industries and stricter tenant boundaries without changing the core product experience.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-lg font-bold text-slate-950">{stats.profiles || 0}</p>
              <p className="text-slate-500">regions</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-lg font-bold text-slate-950">{stats.sectors || 0}</p>
              <p className="text-slate-500">sectors</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-lg font-bold text-slate-950">{stats.policyPacks || 0}</p>
              <p className="text-slate-500">packs</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className={`rounded-2xl border p-5 ${pillar.tone}`}
              >
                <Icon className="h-6 w-6" />
                <h3 className="mt-4 font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-sm opacity-80">{pillar.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <span>
            Expansion rule: new pages, reports and analytics must filter by organisation before showing operational data.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
