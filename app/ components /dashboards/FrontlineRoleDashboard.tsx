'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, ClipboardList, FileText, Users, Bell, LifeBuoy, Clock } from 'lucide-react';
import PositionDashboardTemplate from './PositionDashboardTemplate';
import MandatoryWorkerNoteButton from '@/components/notes/MandatoryWorkerNoteButton';
import WeeklyWellbeingCard from '@/components/wellbeing/WeeklyWellbeingCard';
import WorkerAvailabilityScheduler from '@/components/workers/WorkerAvailabilityScheduler';
import WorkerComplianceAlerts from '@/components/workers/WorkerComplianceAlerts';
import WorkerSupportRequestCard from '@/components/workers/WorkerSupportRequestCard';
import { createPageUrl } from '@/utils';

// --- Types ---
interface User {
  id?: string;
  organization_id?: string;
  [key: string]: any;
}

interface ShiftRow {
  id: string;
  status: string;
  start_time: string;
  worker_id: string;
  [key: string]: any;
}

interface TaskRow {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigned_to: string;
  created_at: string;
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

export default function FrontlineRoleDashboard({ user }: Props) {
  const supabase = createClientComponentClient<Database>();
  const orgId = user?.organization_id;
  const userId = user?.id;

  // --- Queries ---
  const { data: shifts = [] } = useQuery<ShiftRow[]>({
    queryKey: ['frontline-role-shifts', userId, orgId],
    queryFn: async () => {
      if (!userId || !orgId) return [];
      const { data, error } = await supabase
        .from('shifts')
        .select('id, status, start_time, worker_id')
        .eq('worker_id', userId)
        .eq('organization_id', orgId)
        .order('start_time', { ascending: false })
        .limit(50);
      return error ? [] : data;
    },
    enabled: !!userId && !!orgId
  });

  const { data: tasks = [] } = useQuery<TaskRow[]>({
    queryKey: ['frontline-role-tasks', userId, orgId],
    queryFn: async () => {
      if (!userId || !orgId) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, status, priority, assigned_to, created_at')
        .eq('assigned_to', userId)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(50);
      return error ? [] : data;
    },
    enabled: !!userId && !!orgId
  });

  const { data: incidents = [] } = useQuery<IncidentRow[]>({
    queryKey: ['frontline-role-incidents', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('incidents')
        .select('id, status, incident_date')
        .eq('organization_id', orgId)
        .order('incident_date', { ascending: false })
        .limit(50);
      return error ? [] : data;
    },
    enabled: !!orgId
  });

  // --- Metrics & Actions ---
  const metrics = [
    { label: 'Upcoming Shifts', value: shifts.filter((item) => ['assigned', 'confirmed', 'open'].includes(item.status)).length, icon: Calendar, tone: 'bg-blue-50 text-blue-600' },
    { label: 'My Tasks', value: tasks.filter((item) => item.status !== 'completed').length, icon: ClipboardList, tone: 'bg-purple-50 text-purple-600' },
    { label: 'Urgent Tasks', value: tasks.filter((item) => item.priority === 'urgent').length, icon: AlertTriangle, tone: 'bg-red-50 text-red-600' },
    { label: 'Completed Notes', value: tasks.filter((item) => item.status === 'completed').length, icon: FileText, tone: 'bg-emerald-50 text-emerald-600' },
  ];

  const actions = [
    { title: 'My Shifts', link: 'MyShifts', icon: Calendar, color: '#0ea5e9' },
    { title: 'Shift Notes', link: 'ShiftNotes', icon: FileText, color: '#7c3aed' },
    { title: 'Tasks', link: 'EnhancedTaskManagement', icon: ClipboardList, color: '#10b981' },
    { title: 'Participants', link: 'WorkerParticipants', icon: Users, color: '#f59e0b' },
    { title: 'Incidents', link: 'WorkerIncidents', icon: AlertTriangle, color: '#ef4444' },
    { title: 'Availability', link: 'WorkerProfile', icon: Clock, color: '#0d9488' },
    { title: 'Support', link: 'WorkerDashboard', icon: LifeBuoy, color: '#2563eb' },
    { title: 'Notifications', link: 'NotificationsCenter', icon: Bell, color: '#6366f1' },
  ];

  return (
    <PositionDashboardTemplate
      user={user}
      title="Frontline Dashboard"
      subtitle="A day-of-shift view for support workers and care roles, showing the work that matters most right now."
      metrics={metrics}
      actions={actions}
    >
      <MandatoryWorkerNoteButton />
      <WeeklyWellbeingCard user={user} mode="worker" href={createPageUrl('WorkerExperience')} />
      <WorkerComplianceAlerts user={user} />
      <WorkerSupportRequestCard user={user} />
      <Card>
        <CardHeader><CardTitle>Availability Snapshot</CardTitle></CardHeader>
        <CardContent>
          <WorkerAvailabilityScheduler workerId={userId} organizationId={orgId} readOnly />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Next Shifts</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {shifts.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
              <span>{new Date(item.start_time).toLocaleDateString()}</span>
              <Badge variant="outline">{item.status}</Badge>
            </div>
          ))}
          {shifts.length === 0 && <p className="text-sm text-slate-500">No shifts scheduled yet.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>My Work Queue</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {tasks.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
              <span>{item.title}</span>
              <Badge variant="outline">{item.priority}</Badge>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-sm text-slate-500">No tasks assigned right now.</p>}
        </CardContent>
      </Card>
    </PositionDashboardTemplate>
  );
}
