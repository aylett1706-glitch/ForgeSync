'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ComplianceRequirement {
  id: string;
  title: string;
  country_code: string;
  sector: string;
  requirement_type: string;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  summary?: string;
}

const RISK_CLASSES: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

interface Props {
  requirements: ComplianceRequirement[];
}

export default function ComplianceRequirementList({ requirements = [] }: Props) {
  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader>
        <CardTitle className="text-slate-950">Regional Compliance Requirements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requirements.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-600">
            No regional requirements added yet.
          </p>
        ) : (
          requirements.slice(0, 8).map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.country_code} · {item.sector} · {item.requirement_type}
                  </p>
                </div>
                <Badge className={RISK_CLASSES[item.risk_level] || RISK_CLASSES.medium}>
                  {item.risk_level.toUpperCase()}
                </Badge>
              </div>
              {item.summary && (
                <p className="mt-3 text-sm text-slate-700">{item.summary}</p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
