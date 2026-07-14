'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, FileText, Shield, Users } from 'lucide-react';
import PositionDashboardTemplate from './PositionDashboardTemplate';

// --- Types ---
interface User {
  id?: string;
  organization_id?: string;
  [key: string]: any;
}

interface TimesheetRow {
  id: string;
  status: string;
  clock_in_time: string;
  [key: string]: any;
}

interface ClaimRow {
  id: string;
  status: string;
  claim_date: string;
  [key: string]: any;
}

interface TrainingEnrollmentRow {
  id: string;
  status: string;
  created_at: string;
  [key: string]: any;
}

interface LeaveRow {
  id: string;
  status: string;
  start_date: string;
  [key: string]: any;
}

interface Props {
  user?: User;
}

export default function AdministrativeRoleDashboard({ user }: Props) {
  const supabase = createClientComponentClient<Database>();
  const orgId = user?.organization_id;

  // --- Queries ---
  const { data: timesheets = [] } = useQuery<TimesheetRow[]>({
    queryKey: ['admin-role-timesheets', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('timesheets')
        .select('id, status, clock_in_time')
        .eq('organization_id', orgId)
        .order('clock_in_time', { ascending: false })
        .limit(100);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  const { data: claims = [] } = useQuery<ClaimRow[]>({
    queryKey: ['admin-role-claims', orgId],
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

  const { data: trainings = [] } = useQuery<TrainingEnrollmentRow[]>({
    queryKey: ['admin-role-training', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('training_enrollments')
        .select('id, status, created_at')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(100);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  const { data: leaveRequests = [] } = useQuery<LeaveRow[]>({
    queryKey: ['admin-role-leave', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('leave_requests')
        .select('id, status, start_date')
        .eq('organization_id', orgId)
        .order('start_date', { ascending: false })
        .limit(100);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  // --- Metrics & Actions ---
  const metrics = [
    { label: 'Pending Timesheets', value: timesheets.filter((item) => ['submitted', 'pending'].includes(item.status)).length, icon: Clock, tone: 'bg-orange-50 text-orange-600' },
    { label: 'Draft Claims', value: claims.filter((item) => item.status === 'draft').length, icon: DollarSign, tone: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Leave', value: leaveRequests.filter((item) => item.status === 'pending').length, icon: Calendar, tone: 'bg-purple-50 text-purple-600' },
    { label: 'Training Tasks', value: trainings.filter((item) => item.status !== 'completed').length, icon: Shield, tone: 'bg-emerald-50 text-emerald-600' },
  ];

  const actions = [
    { title: 'Rostering', link: 'Rostering', icon: Calendar, color: '#0ea5e9' },
    { title: 'Timesheets', link: 'Timesheets', icon: Clock, color: '#f59e0b' },
    { title: 'Payroll', link: 'Payroll', icon: DollarSign, color: '#7c3aed' },
    { title: 'Billing', link: 'Billing', icon: FileText, color: '#10b981' },
    { title: 'Workers', link: 'Workers', icon: Users, color: '#ef4444' },
    { title: 'Training', link: 'Training', icon: Shield, color: '#6366f1' },
  ];

  return (
    <PositionDashboardTemplate
      user={user}
      title="Administrative Dashboard"
      subtitle="Built for finance, HR, intake, compliance, training, and rostering roles with access still controlled by your role rules."
      metrics={metrics}
      actions={actions}
    >
      <Card>
        <CardHeader><CardTitle>Approval Queue</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {timesheets.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
              <span>Timesheet #{item.id.slice(0, 8)}</span>
              <Badge variant="outline">{item.status}</Badge>
            </div>
          ))}
          {timesheets.length === 0 && <p className="text-sm text-slate-500">No approval items right now.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Billing & Workforce Snapshot</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>Claims in progress: <span className="font-semibold text-slate-900">{claims.filter((item) => ['draft', 'submitted', 'approved'].includes(item.status)).length}</span></p>
          <p>Upcoming leave items: <span className="font-semibold text-slate-900">{leaveRequests.filter((item) => ['pending', 'approved'].includes(item.status)).length}</span></p>
          <p>Open training enrolments: <span className="font-semibold text-slate-900">{trainings.filter((item) => item.status !== 'completed').length}</span></p>
        </CardContent>
      </Card>
    </PositionDashboardTemplate>
  );
}
