'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe2, ShieldCheck } from 'lucide-react';
import { OPERATING_AREAS } from '@/lib/regionalCompliance';

interface OperatingArea {
  code: string;
  label: string;
  complianceFramework: string;
  legislativeSources?: any[];
}

export default function JurisdictionCoveragePanel() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-slate-950 p-3 text-white">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-950">Jurisdiction Coverage</h2>
            <p className="mt-1 text-sm text-slate-600">
              Regional AI prompts, funding context and regulator source boundaries now follow the selected operating area.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {OPERATING_AREAS.map((area: OperatingArea) => (
            <div key={area.code} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-950">{area.label}</p>
                <Badge variant="outline">{area.code}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-slate-600">{area.complianceFramework}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" /> 
                {area.legislativeSources?.length || 0} source priorities
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
