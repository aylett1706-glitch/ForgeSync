'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, DollarSign, Shield, TrendingUp, Users, Calendar } from 'lucide-react';
import PositionDashboardTemplate from './PositionDashboardTemplate';
import MaintenanceSummaryView from '@/components/maintenance/MaintenanceSummaryView';
import ParticipantRiskOverview from '@/components/participants/ParticipantRiskOverview';

// --- Types ---
interface User {
  id?: string;
  organization_id?: string;
  [key: string]: any;
}

interface ParticipantRow {
  id: string;
  status: string;
  updated_at: string;
  [key: string]: any;
}

interface WorkerRow {
  id: string;
  updated_at: string;
  [key: string]: any;
}

interface IncidentRow {
  id: string;
  status: string;
  severity?: string;
  incident_date: string;
  [key: string]: any;
}

interface ClaimRow {
  id: string;
  status: string;
  total_amount?: string | number;
  claim_date: string;
  [key: string]: any;
}

interface Props {
  user?: User;
}

export default function LeadershipRoleDashboard({ user }: Props) {
  const supabase = createClientComponentClient<Database>();
  const orgId = user?.organization_id;

  // --- Queries ---
  const { data: participants = [] } = useQuery<ParticipantRow[]>({
    queryKey: ['lead-role-participants', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('participants')
        .select('id, status, updated_at')
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false })
        .limit(100);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  const { data: workers = [] } = useQuery<WorkerRow[]>({
    queryKey: ['lead-role-workers', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('users')
        .select('id, updated_at')
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false })
        .limit(100);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  const { data: incidents = [] } = useQuery<IncidentRow[]>({
    queryKey: ['lead-role-incidents', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('incidents')
        .select('id, status, severity, incident_date')
        .eq('organization_id', orgId)
        .order('incident_date', { ascending: false })
        .limit(100);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  const { data: claims = [] } = useQuery<ClaimRow[]>({
    queryKey: ['lead-role-claims', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('claims')
        .select('id, status, total_amount, claim_date')
        .eq('organization_id', orgId)
        .order('claim_date', { ascending: false })
        .limit(100);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  // --- Metrics & Actions ---
  const revenue = claims
    .filter((item) => item.status === 'paid')
    .reduce((sum, item) => sum + Number(item.total_amount || 0), 0);

  const metrics = [
    { label: 'Participants', value: participants.filter((item) => item.status === 'active').length, icon: Users, tone: 'bg-blue-50 text-blue-600' },
    { label: 'Team Members', value: workers.length, icon: Calendar, tone: 'bg-purple-50 text-purple-600' },
    { label: 'Paid Revenue', value: `$${Math.round(revenue).toLocaleString()}`, icon: DollarSign, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Open Incidents', value: incidents.filter((item) => item.status !== 'closed').length, icon: AlertTriangle, tone: 'bg-red-50 text-red-600' },
  ];

  const actions = [
    { title: 'Reports', link: 'ReportingAnalytics', icon: TrendingUp, color: '#0ea5e9' },
    { title: 'Compliance', link: 'ComplianceDashboard', icon: Shield, color: '#ef4444' },
    { title: 'Funding', link: 'FundingForecast', icon: DollarSign, color: '#10b981' },
    { title: 'Rostering', link: 'Rostering', icon: Calendar, color: '#7c3aed' },
    { title: 'Workers', link: 'Workers', icon: Users, color: '#f59e0b' },
    { title: 'Incidents', link: 'Incidents', icon: AlertTriangle, color: '#6366f1' },
  ];

  return (
    <PositionDashboardTemplate
      user={user}
      title="Leadership Dashboard"
      subtitle="A higher-level operational view for executive, service, clinical, and quality leadership roles."
      metrics={metrics}
      actions={actions}
    >
      <MaintenanceSummaryView organizationId={orgId} limit={5} />
      <ParticipantRiskOverview participants={participants} limit={5} />
      <Card>
        <CardHeader><CardTitle>Risk & Quality Overview</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>Critical incidents: <span className="font-semibold text-slate-900">{incidents.filter((item) => item.severity === 'critical').length}</span></p>
          <p>Under review incidents: <span className="font-semibold text-slate-900">{incidents.filter((item) => item.status === 'under_review').length}</span></p>
          <p>Claim approvals in flight: <span className="font-semibold text-slate-900">{claims.filter((item) => ['submitted', 'approved'].includes(item.status)).length}</span></p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Organisation Snapshot</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>Active participants: <span className="font-semibold text-slate-900">{participants.filter((item) => item.status === 'active').length}</span></p>
          <p>Total workers: <span className="font-semibold text-slate-900">{workers.length}</span></p>
          <p>Paid claims: <span className="font-semibold text-slate-900">{claims.filter((item) => item.status === 'paid').length}</span></p>
        </CardContent>
      </Card>
    </PositionDashboardTemplate>
  );
}
