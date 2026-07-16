'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SectorOption {
  key: string;
  label: string;
  description: string;
  controls?: string[];
}

interface Props {
  selectedSectors: string[];
  enabledControls: string[];
  sectorOptions: SectorOption[];
}

export default function GovernanceReadinessMatrix({ 
  selectedSectors = [], 
  enabledControls = [], 
  sectorOptions = [] 
}: Props) {
  const activeSectors = sectorOptions.filter((sector) => 
    selectedSectors.includes(sector.key)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Readiness Matrix</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeSectors.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Choose at least one sector to generate the governance matrix.
          </p>
        ) : (
          activeSectors.map((sector) => (
            <div key={sector.key} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{sector.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{sector.description}</p>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Enabled
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {[...(sector.controls || []), ...enabledControls.slice(0, 4)].map((item) => (
                  <span 
                    key={item} 
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {item.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
