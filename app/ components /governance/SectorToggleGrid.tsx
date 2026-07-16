'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SectorOption } from '@/data/sectorGovernanceConfig';

interface Props {
  selectedSectors: string[];
  onToggle: (key: string) => void;
  sectorOptions: SectorOption[];
}

export default function SectorToggleGrid({ 
  selectedSectors = [], 
  onToggle, 
  sectorOptions = [] 
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {sectorOptions.map((sector) => {
        const Icon = sector.icon;
        const selected = selectedSectors.includes(sector.key);

        return (
          <button
            key={sector.key}
            type="button"
            onClick={() => onToggle(sector.key)}
            className="text-left"
          >
            <Card className={`h-full transition-all ${selected ? 'ring-2 ring-slate-900' : 'hover:ring-2 hover:ring-slate-200'}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  {selected && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                </div>
                <h3 className="mt-4 font-bold text-slate-950">{sector.label}</h3>
                <p className="mt-2 text-sm text-slate-600">{sector.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {sector.controls.slice(0, 3).map((control) => (
                    <span 
                      key={control} 
                      className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                    >
                      {control}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
