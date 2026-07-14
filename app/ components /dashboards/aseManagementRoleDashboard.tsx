'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileText, Target, TrendingUp, Users, DollarSign } from 'lucide-react';
import PositionDashboardTemplate from './PositionDashboardTemplate';

// --- Types ---
interface User {
  id?: string;
  organization_id?: string;
  [key: string]: any;
}

interface ParticipantRow {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  client_type?: string;
  updated_at: string;
  [key: string]: any;
}

interface GoalRow {
  id: string;
  status: string;
  updated_at: string;
  [key: string]: any;
}

interface SupportPlanRow {
  id: string;
  status: string;
  review_date?: string;
  [key: string]: any;
}

interface IncidentRow {
  id: string;
  status: string;
  incident_date: string;
  [key: string]: any;
}

interface Props {
  user?: User;
}

export default function CaseManagementRoleDashboard({ user }: Props) {
  const supabase = createClientComponentClient<Database>();
  const orgId = user?.organization_id;

  // --- Queries ---
  const { data: participants = [] } = useQuery<ParticipantRow[]>({
    queryKey: ['case-role-participants', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('participants')
        .select('id, first_name, last_name, status, client_type, updated_at')
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false })
        .limit(100);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  const { data: goals = [] } = useQuery<GoalRow[]>({
    queryKey: ['case-role-goals', orgId],
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

  const { data: plans = [] } = useQuery<SupportPlanRow[]>({
    queryKey: ['case-role-plans', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('support_plans')
        .select('id, status, review_date')
        .eq('organization_id', orgId)
        .order('review_date', { ascending: false, nullsFirst: false })
        .limit(100);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  const { data: incidents = [] } = useQuery<IncidentRow[]>({
    queryKey: ['case-role-incidents', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('incidents')
        .select('id, status, incident_date')
        .eq('organization_id', orgId)
        .order('incident_date', { ascending: false })
        .limit(100);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  // --- Metrics & Actions ---
  const metrics = [
    { label: 'Active Participants', value: participants.filter((item) => item.status === 'active').length, icon: Users, tone: 'bg-blue-50 text-blue-600' },
    { label: 'Goals In Progress', value: goals.filter((item) => item.status === 'in_progress').length, icon: Target, tone: 'bg-purple-50 text-purple-600' },
    { label: 'Reviews Due', value: plans.filter((item) => item.review_date).length, icon: TrendingUp, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Open Incidents', value: incidents.filter((item) => item.status !== 'closed').length, icon: AlertTriangle, tone: 'bg-red-50 text-red-600' },
  ];

  const actions = [
    { title: 'Participants', link: 'Participants', icon: Users, color: '#0ea5e9' },
    { title: 'Case Management', link: 'CaseManagement', icon: FileText, color: '#7c3aed' },
    { title: 'Goals', link: 'GoalsTracking', icon: Target, color: '#10b981' },
    { title: 'Funding', link: 'FundingTracker', icon: DollarSign, color: '#f59e0b' },
    { title: 'Plans', link: 'NDISPlanManagement', icon: TrendingUp, color: '#6366f1' },
    { title: 'Reports', link: 'ReportingAnalytics', icon: FileText, color: '#ef4444' },
  ];

  return (
    <PositionDashboardTemplate
      user={user}
      title="Case Management Dashboard"
      subtitle="Focused on caseloads, goals, reviews, service plans, and participant risk follow-up for coordination roles."
      metrics={metrics}
      actions={actions}
    >
      <Card>
        <CardHeader><CardTitle>Priority Participants</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {participants.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
              <span>{item.first_name} {item.last_name}</span>
              <Badge variant="outline">{item.client_type}</Badge>
            </div>
          ))}
          {participants.length === 0 && <p className="text-sm text-slate-500">No participants available.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Goal & Review Snapshot</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>Under review plans: <span className="font-semibold text-slate-900">{plans.filter((item) => item.status === 'under_review').length}</span></p>
          <p>Achieved goals: <span className="font-semibold text-slate-900">{goals.filter((item) => item.status === 'achieved').length}</span></p>
          <p>Reported incidents: <span className="font-semibold text-slate-900">{incidents.filter((item) => item.status === 'reported').length}</span></p>
        </CardContent>
      </Card>
    </PositionDashboardTemplate>
  );
}
