'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, Target, TrendingUp } from 'lucide-react';
import PositionDashboardTemplate from './PositionDashboardTemplate';

// --- Types ---
interface User {
  id?: string;
  organization_id?: string;
  [key: string]: any;
}

interface SupportPlanRow {
  id: string;
  status: string;
  updated_at: string;
  [key: string]: any;
}

interface ClaimRow {
  id: string;
  status: string;
  claim_date: string;
  [key: string]: any;
}

interface GoalRow {
  id: string;
  status: string;
  updated_at: string;
  [key: string]: any;
}

interface Props {
  user?: User;
}

export default function ExternalPartnerDashboard({ user }: Props) {
  const supabase = createClientComponentClient<Database>();
  const orgId = user?.organization_id;

  // --- Queries ---
  const { data: plans = [] } = useQuery<SupportPlanRow[]>({
    queryKey: ['external-role-plans', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('support_plans')
        .select('id, status, updated_at')
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false })
        .limit(100);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  const { data: claims = [] } = useQuery<ClaimRow[]>({
    queryKey: ['external-role-claims', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('claims')
        .select('id, status, claim_date')
        .eq('organization_id', orgId)
        .order('claim_date', { ascending: false })
        .limit(100);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  const { data: goals = [] } = useQuery<GoalRow[]>({
    queryKey: ['external-role-goals', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('id, status, updated_at')
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false })
        .limit(100);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  // --- Metrics & Actions ---
  const metrics = [
    { label: 'Plans', value: plans.length, icon: FileText, tone: 'bg-blue-50 text-blue-600' },
    { label: 'Submitted Claims', value: claims.filter((item) => item.status === 'submitted').length, icon: TrendingUp, tone: 'bg-purple-50 text-purple-600' },
    { label: 'Goals Tracked', value: goals.length, icon: Target, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Paid Claims', value: claims.filter((item) => item.status === 'paid').length, icon: MessageSquare, tone: 'bg-amber-50 text-amber-600' },
  ];

  const actions = [
    { title: 'Plans', link: 'NDISPlanManagement', icon: FileText, color: '#0ea5e9' },
    { title: 'Goals', link: 'GoalsTracking', icon: Target, color: '#7c3aed' },
    { title: 'Reports', link: 'ReportingAnalytics', icon: TrendingUp, color: '#10b981' },
    { title: 'Messages', link: 'Messages', icon: MessageSquare, color: '#ef4444' },
  ];

  return (
    <PositionDashboardTemplate
      user={user}
      title="External Partner Dashboard"
      subtitle="A focused workspace for external plan managers and external allied health partners with access still controlled by role rules."
      metrics={metrics}
      actions={actions}
    >
      <Card>
        <CardHeader><CardTitle>Plan & Claim Snapshot</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>Active plans: <span className="font-semibold text-slate-900">{plans.filter((item) => item.status === 'active').length}</span></p>
          <p>Draft claims: <span className="font-semibold text-slate-900">{claims.filter((item) => item.status === 'draft').length}</span></p>
          <p>Approved claims: <span className="font-semibold text-slate-900">{claims.filter((item) => item.status === 'approved').length}</span></p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Goal Progress Snapshot</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>In-progress goals: <span className="font-semibold text-slate-900">{goals.filter((item) => item.status === 'in_progress').length}</span></p>
          <p>Achieved goals: <span className="font-semibold text-slate-900">{goals.filter((item) => item.status === 'achieved').length}</span></p>
        </CardContent>
      </Card>
    </PositionDashboardTemplate>
  );
}
