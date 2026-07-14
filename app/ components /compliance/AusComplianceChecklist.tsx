'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ComplianceStatus = 'complete' | 'warning' | 'critical';

interface ComplianceItem {
  label: string;
  description: string;
  status: ComplianceStatus;
  status_label: string;
}

interface Props {
  items?: ComplianceItem[];
}

const statusClasses: Record<ComplianceStatus, string> = {
  complete: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  critical: 'bg-red-100 text-red-700 border-red-200'
};

export default function AusComplianceChecklist({ items = [] }: Props) {
  return (
    <Card className="bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle>Australian compliance readiness checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium text-slate-900">{item.label}</p>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            </div>
            <Badge variant="outline" className={statusClasses[item.status] || statusClasses.warning}>
              {item.status_label}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
