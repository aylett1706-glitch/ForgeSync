'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, ClipboardList, FileText, HeartPulse, Target, Video, LifeBuoy } from 'lucide-react';
import PositionDashboardTemplate from './PositionDashboardTemplate';
import WeeklyWellbeingCard from '@/components/wellbeing/WeeklyWellbeingCard';
import WorkerComplianceAlerts from '@/components/workers/WorkerComplianceAlerts';
import WorkerSupportRequestCard from '@/components/workers/WorkerSupportRequestCard';
import { createPageUrl } from '@/utils';

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

interface GoalRow {
  id: string;
  status: string;
  updated_at: string;
  [key: string]: any;
}

interface ClinicalNoteRow {
  id: string;
  note_type?: string;
  mood_status?: string;
  follow_up_required: boolean;
  observation_time: string;
  [key: string]: any;
}

interface Props {
  user?: User;
}

export default function TherapeuticRoleDashboard({ user }: Props) {
  const supabase = createClientComponentClient<Database>();
  const orgId = user?.organization_id;

  // --- Queries ---
  const { data: participants = [] } = useQuery<ParticipantRow[]>({
    queryKey: ['therapy-role-participants', orgId],
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

  const { data: goals = [] } = useQuery<GoalRow[]>({
    queryKey: ['therapy-role-goals', orgId],
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

  const { data: notes = [] } = useQuery<ClinicalNoteRow[]>({
    queryKey: ['therapy-role-notes', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('clinical_notes')
        .select('id, note_type, mood_status, follow_up_required, observation_time')
        .eq('organization_id', orgId)
        .order('observation_time', { ascending: false })
        .limit(100);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  // --- Metrics & Actions ---
  const metrics = [
    { label: 'Caseload', value: participants.filter((item) => item.status === 'active').length, icon: HeartPulse, tone: 'bg-blue-50 text-blue-600' },
    { label: 'Goals In Progress', value: goals.filter((item) => item.status === 'in_progress').length, icon: Target, tone: 'bg-purple-50 text-purple-600' },
    { label: 'Clinical Notes', value: notes.length, icon: ClipboardList, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Follow-up Required', value: notes.filter((item) => item.follow_up_required).length, icon: Activity, tone: 'bg-red-50 text-red-600' },
  ];

  const actions = [
    { title: 'Participants', link: 'Participants', icon: HeartPulse, color: '#0ea5e9' },
    { title: 'Goals', link: 'GoalsTracking', icon: Target, color: '#7c3aed' },
    { title: 'Outcomes', link: 'OutcomeMeasurement', icon: Activity, color: '#10b981' },
    { title: 'Forms', link: 'Forms', icon: FileText, color: '#f59e0b' },
    { title: 'Telehealth', link: 'Telehealth', icon: Video, color: '#ef4444' },
    { title: 'Support', link: 'WorkerDashboard', icon: LifeBuoy, color: '#2563eb' },
    { title: 'Reports', link: 'ReportingAnalytics', icon: ClipboardList, color: '#6366f1' },
  ];

  return (
    <PositionDashboardTemplate
      user={user}
      title="Therapeutic Dashboard"
      subtitle="Designed for allied health, nursing, and therapy roles with quick access to caseload, outcomes, and session documentation."
      metrics={metrics}
      actions={actions}
    >
      <WeeklyWellbeingCard user={user} mode="worker" href={createPageUrl('WorkerExperience')} />
      <WorkerComplianceAlerts user={user} />
      <WorkerSupportRequestCard user={user} />
      <Card>
        <CardHeader><CardTitle>Latest Clinical Notes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {notes.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
              <span>{item.note_type?.replace(/_/g, ' ')}</span>
              <Badge variant="outline">{item.mood_status || 'not recorded'}</Badge>
            </div>
          ))}
          {notes.length === 0 && <p className="text-sm text-slate-500">No clinical notes recorded yet.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Therapy Progress Snapshot</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>Achieved goals: <span className="font-semibold text-slate-900">{goals.filter((item) => item.status === 'achieved').length}</span></p>
          <p>Notes awaiting follow-up: <span className="font-semibold text-slate-900">{notes.filter((item) => item.follow_up_required).length}</span></p>
          <p>Active participants: <span className="font-semibold text-slate-900">{participants.filter((item) => item.status === 'active').length}</span></p>
        </CardContent>
      </Card>
    </PositionDashboardTemplate>
  );
}
