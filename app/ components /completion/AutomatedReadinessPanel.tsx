'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRouteReadinessChecks } from '@/components/completion/routeReadiness';

// --- Types ---
type CheckStatus = 'pass' | 'attention' | 'fail';

interface ReadinessCheck {
  key: string;
  title: string;
  detail: string;
  status: CheckStatus;
}

const style: Record<CheckStatus, string> = {
  pass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  attention: 'bg-amber-100 text-amber-700 border-amber-200',
  fail: 'bg-red-100 text-red-700 border-red-200',
};

const icon: Record<CheckStatus, React.ElementType> = {
  pass: CheckCircle2,
  attention: AlertTriangle,
  fail: ShieldAlert,
};

export default function AutomatedReadinessPanel() {
  const checks: ReadinessCheck[] = getRouteReadinessChecks();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Automated readiness checks</CardTitle>
        <p className="text-sm text-slate-600">Live global checks for routing, role registry coverage and completion action links.</p>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {checks.map((check) => {
          const StatusIcon = icon[check.status] || AlertTriangle;
          return (
            <div key={check.key} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <StatusIcon className={`mt-1 h-5 w-5 ${
                    check.status === 'pass' ? 'text-emerald-600' :
                    check.status === 'fail' ? 'text-red-600' :
                    'text-amber-600'
                  }`} />
                  <div>
                    <h3 className="font-semibold text-slate-900">{check.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{check.detail}</p>
                  </div>
                </div>
                <Badge className={style[check.status]}>{check.status}</Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
