'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

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

export default function FinanceSummaryCards({ items }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="border-0 shadow-sm hover:shadow transition-all">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${item.bg}`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </p>
                <p className={`text-2xl font-bold mt-1 ${item.color}`}>
                  {item.value}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
