'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

type Tone = 'blue' | 'amber' | 'green' | 'red';

interface Props {
  title: string;
  description?: string;
  items?: string[];
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  blue: 'border-blue-200 bg-blue-50 text-blue-900',
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  green: 'border-green-200 bg-green-50 text-green-900',
  red: 'border-red-200 bg-red-50 text-red-900'
};

export default function AusCompliancePrompt({ title, description, items = [], tone = 'blue' }: Props) {
  const boxClass = toneClasses[tone] || toneClasses.blue;
  const Icon = tone === 'green' ? CheckCircle2 : tone === 'red' ? AlertTriangle : Shield;

  return (
    <div className={`rounded-xl border p-4 ${boxClass}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-2">
          <h4 className="font-semibold">{title}</h4>
          {description && <p className="text-sm opacity-90">{description}</p>}
          {items.length > 0 && (
            <ul className="space-y-1 text-sm">
              {items.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
