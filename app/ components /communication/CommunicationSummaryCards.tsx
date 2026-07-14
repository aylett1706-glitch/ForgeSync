'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface SummaryItem {
  label: string;
  value: string | number;
  icon: React.ElementType;
  bg: string;
  color: string;
}

interface Props {
  items: SummaryItem[];
}

export default function CommunicationSummaryCards({ items }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 md:gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-3 p-3 sm:p-4">
              <div className={`shrink-0 rounded-xl p-2 ${item.bg}`}>
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-snug text-slate-600 break-words">{item.label}</p>
                <p className={`text-lg font-bold leading-none sm:text-xl ${item.color}`}>{item.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
