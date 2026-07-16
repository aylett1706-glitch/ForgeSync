'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Globe2, Languages, ShieldCheck, Building2 } from 'lucide-react';

const STATS_CONFIG = [
  { 
    key: 'profiles', 
    label: 'Regional profiles', 
    icon: Globe2 
  },
  { 
    key: 'languages', 
    label: 'Languages mapped', 
    icon: Languages 
  },
  { 
    key: 'requirements', 
    label: 'Compliance items', 
    icon: ShieldCheck 
  },
  { 
    key: 'policyPacks', 
    label: 'Policy packs', 
    icon: Building2 
  },
];

interface Stats {
  profiles?: number;
  languages?: number;
  requirements?: number;
  policyPacks?: number;
}

interface Props {
  stats?: Stats;
}

export default function GlobalReadinessSummary({ stats = {} }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS_CONFIG.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.key} className="border-slate-200 bg-white/90">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-950">
                  {stats[item.key] || 0}
                </p>
                <p className="text-sm text-slate-600">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
