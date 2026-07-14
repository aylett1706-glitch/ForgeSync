import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

// --- Types ---
interface SummaryCardItem {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone: string; // e.g. "bg-blue-50 text-blue-600"
}

interface DeveloperSummaryCardsProps {
  items: SummaryCardItem[];
}

export default function DeveloperSummaryCards({ items }: DeveloperSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-xs uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {item.value}
                  </p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tone}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
