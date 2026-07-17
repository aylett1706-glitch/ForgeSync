'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface SummaryItem {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

interface Props {
  items: SummaryItem[];
}

export default function IntegrationSummaryCards({ items = [] }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-xl ${item.bg}`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
