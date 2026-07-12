'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface SummaryItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  bg: string;
  color: string;
}

interface Props {
  items: SummaryItem[];
}

export default function AppraisalSummaryCards({ items }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border-0 shadow-sm bg-white/90">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${item.bg}`}>
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="text-sm text-slate-500">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
