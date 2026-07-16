'use client';

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GovernanceControl {
  key: string;
  label: string;
  description: string;
}

interface Props {
  enabledControls: string[];
  onToggle: (key: string) => void;
  globalControls: GovernanceControl[];
}

export default function GovernanceControlPanel({ 
  enabledControls = [], 
  onToggle, 
  globalControls = [] 
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Governance Controls</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {globalControls.map((control) => {
          const enabled = enabledControls.includes(control.key);
          return (
            <button
              key={control.key}
              type="button"
              onClick={() => onToggle(control.key)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                enabled 
                  ? 'border-emerald-200 bg-emerald-50' 
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex gap-3">
                {enabled ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                )}
                <div>
                  <p className="font-semibold text-slate-950">{control.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{control.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
