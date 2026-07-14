'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, ShieldAlert, ListChecks } from 'lucide-react';

interface Props {
  total: number;
  complete: number;
  critical: number;
  inProgress: number;
}

interface SummaryCard {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: string;
}

export default function CompletionSummaryCards({ total, complete, critical, inProgress }: Props) {
  const cards: SummaryCard[] = [
    { label: 'Total checks', value: total, icon: ListChecks, tone: 'text-slate-700 bg-slate-100' },
    { label: 'Critical checks', value: critical, icon: ShieldAlert, tone: 'text-red-700 bg-red-100' },
    { label: 'In progress', value: inProgress, icon: Clock, tone: 'text-amber-700 bg-amber-100' },
    { label: 'Complete / verified', value: complete, icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-100' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-2xl p-3 ${card.tone}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">{card.label}</p>
                <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
