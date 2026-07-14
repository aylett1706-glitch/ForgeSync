'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, Circle, Clock, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompletionPhase, CompletionPriority } from './completionPhases'; // Adjust import path as needed

// --- Types ---
type ItemStatus = 'not_started' | 'in_progress' | 'blocked' | 'complete' | 'verified';

interface SavedCompletionItem {
  phase_key: string;
  title: string;
  status: ItemStatus;
  [key: string]: any;
}

interface Props {
  phase: CompletionPhase;
  savedItems: SavedCompletionItem[];
  onSeedItem: (item: {
    title: string;
    description: string;
    target_page: string;
    phase_key: string;
    priority: CompletionPriority;
  }) => void;
  onAdvanceStatus: (item: SavedCompletionItem) => void;
}

const statusIcon: Record<ItemStatus, React.ElementType> = {
  complete: CheckCircle2,
  verified: CheckCircle2,
  in_progress: Clock,
  blocked: ShieldAlert,
  not_started: Circle,
};

const statusLabel: Record<ItemStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  blocked: 'Blocked',
  complete: 'Complete',
  verified: 'Verified',
};

export default function CompletionPhaseCard({ phase, savedItems, onSeedItem, onAdvanceStatus }: Props) {
  const searchParams = useSearchParams();
  const managedOrgId = searchParams.get('org_id') || (typeof window !== 'undefined' ? sessionStorage.getItem('dev_selected_org_id') : null);

  const buildPageLink = (targetPage: string) => {
    return managedOrgId ? `/${targetPage}?org_id=${managedOrgId}` : `/${targetPage}`;
  };

  const savedByKey = new Map(
    savedItems.map((item) => [`${item.phase_key}:${item.title}`, item])
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl">{phase.title}</CardTitle>
            <p className="mt-1 text-sm text-slate-600">{phase.summary}</p>
          </div>
          <Badge className={
            phase.priority === 'critical'
              ? 'bg-red-100 text-red-700 border-red-200'
              : 'bg-amber-100 text-amber-700 border-amber-200'
          }>
            {phase.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {phase.items.map(([title, description, targetPage]) => {
          const saved = savedByKey.get(`${phase.key}:${title}`);
          const status: ItemStatus = saved?.status || 'not_started';
          const Icon = statusIcon[status];

          return (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-3">
                  <Icon className={`mt-1 h-5 w-5 ${
                    status === 'complete' || status === 'verified'
                      ? 'text-emerald-600'
                      : status === 'blocked'
                        ? 'text-red-600'
                        : 'text-slate-400'
                  }`} />
                  <div>
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-600">{description}</p>
                    <Badge variant="outline" className="mt-2">{statusLabel[status]}</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={buildPageLink(targetPage)}>
                      Open area <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  {saved ? (
                    <Button size="sm" onClick={() => onAdvanceStatus(saved)}>
                      Update status
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => onSeedItem({
                      title,
                      description,
                      target_page: targetPage,
                      phase_key: phase.key,
                      priority: phase.priority
                    })}>
                      Track item
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
