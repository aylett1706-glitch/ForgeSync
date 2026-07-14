'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { createPageUrl } from '@/utils';
import { canAccessPage } from '@/components/access/roleAccess';

// --- Types ---
interface User {
  id?: string;
  role?: string;
  organization_id?: string;
  [key: string]: any;
}

interface Metric {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone: string;
}

interface Action {
  title: string;
  link: string;
  icon: React.ElementType;
  color: string;
}

interface Props {
  user?: User;
  title: string;
  subtitle: string;
  metrics?: Metric[];
  actions?: Action[];
  children?: React.ReactNode;
}

export default function PositionDashboardTemplate({
  user,
  title,
  subtitle,
  metrics = [],
  actions = [],
  children
}: Props) {
  const visibleActions = actions.filter((action) => canAccessPage(user, action.link));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-8">
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-slate-300">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="flex items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-sm text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{metric.value}</p>
                </div>
                <div className={`rounded-2xl p-3 ${metric.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {visibleActions.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {visibleActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.link} href={createPageUrl(action.link)}>
                  <div className="rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm transition-shadow hover:shadow-md">
                    <div
                      className="mx-auto flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${action.color}15` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: action.color }} />
                    </div>
                    <p className="mt-2 text-xs font-medium leading-tight text-slate-700">{action.title}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">{children}</div>
    </div>
  );
}
