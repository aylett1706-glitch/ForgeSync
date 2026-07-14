import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { Database, Users, Shield, Activity, Server, TrendingUp, FileText, Calendar, Clock, AlertTriangle, Building2, CheckCircle } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, subDays } from 'date-fns';

// --- Supabase Client ---
const supabase = createClientComponentClient();

// --- Constants ---
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];
const TABLES = [
  'users', 'participants', 'shifts', 'incidents', 'audit_logs',
  'worker_credentials', 'tasks', 'progress_notes', 'documents',
  'timesheets', 'goals', 'medications'
] as const;

// --- Types ---
type TableName = typeof TABLES[number];

interface BaseRecord {
  id?: string;
  created_at?: string;
  updated_at?: string;
  organization_id?: string;
  [key: string]: unknown;
}

interface UserRecord extends BaseRecord {
  role?: string;
  position?: string;
  organization_id?: string;
}

interface ParticipantRecord extends BaseRecord {
  status?: string;
}

interface ShiftRecord extends BaseRecord {
  status?: string;
}

interface IncidentRecord extends BaseRecord {
  status?: string;
  severity?: string;
}

interface AuditLogRecord extends BaseRecord {
  severity?: string;
}

interface CredentialRecord extends BaseRecord {
  expiry_date?: string;
}

interface TaskRecord extends BaseRecord {
  status?: string;
  due_date?: string;
}

interface TimesheetRecord extends BaseRecord {
  status?: string;
}

interface User {
  organization_id?: string;
}

interface Organization {
  id?: string;
  app_name?: string;
  name?: string;
}

interface SettingsAnalyticsPanelProps {
  user?: User | null;
  organization?: Organization | null;
}

interface AnalyticsData {
  users: UserRecord[];
  participants: ParticipantRecord[];
  shifts: ShiftRecord[];
  incidents: IncidentRecord[];
  auditLogs: AuditLogRecord[];
  credentials: CredentialRecord[];
  tasks: TaskRecord[];
  notes: BaseRecord[];
  documents: BaseRecord[];
  timesheets: TimesheetRecord[];
  goals: BaseRecord[];
  medications: BaseRecord[];
}

interface ComputedAnalytics {
  users: number;
  recentUsers: number;
  participants: number;
  activeParticipants: number;
  shifts: number;
  incidents: number;
  openIncidents: number;
  auditLogs: number;
  credentials: number;
  expiredCreds: number;
  tasks: number;
  overdueTasks: number;
  notes: number;
  documents: number;
  timesheets: number;
  pendingTimesheets: number;
  goals: number;
  medications: number;
  totalRecords: number;
  usersByRole: Record<string, number>;
  usersByPosition: Record<string, number>;
  tasksByStatus: Record<string, number>;
  shiftsByStatus: Record<string, number>;
  growthData: Array<{
    month: string;
    users: number;
    participants: number;
    shifts: number;
    notes: number;
  }>;
}

// --- Helper: Convert object to sorted array ---
const toArr = (obj?: Record<string, number>) =>
  Object.entries(obj || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

// --- Component ---
export default function SettingsAnalyticsPanel({
  user,
  organization,
}: SettingsAnalyticsPanelProps) {
  const orgId = organization?.id || user?.organization_id;

  // Fetch all core datasets
  const { data: allData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['settings-analytics', orgId],
    queryFn: async () => {
      const filter = orgId ? { eq: ['organization_id', orgId] } : {};

      // Helper: Fetch table with optional org filter
      const fetchTable = async (table: TableName) => {
        let query = supabase.from(table).select('*');
        if (orgId) query = query.eq('organization_id', orgId);
        const { data, error } = await query.limit(500);
        if (error) throw new Error(`Failed to load ${table}: ${error.message}`);
        return data || [];
      };

      const [
        users, participants, shifts, incidents, auditLogs,
        credentials, tasks, notes, documents, timesheets, goals, medications
      ] = await Promise.all(TABLES.map(fetchTable));

      return {
        users: users as UserRecord[],
        participants: participants as ParticipantRecord[],
        shifts: shifts as ShiftRecord[],
        incidents: incidents as IncidentRecord[],
        auditLogs: auditLogs as AuditLogRecord[],
        credentials: credentials as CredentialRecord[],
        tasks: tasks as TaskRecord[],
        notes: notes as BaseRecord[],
        documents: documents as BaseRecord[],
        timesheets: timesheets as TimesheetRecord[],
        goals: goals as BaseRecord[],
        medications: medications as BaseRecord[],
      };
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: !!user,
  });

  // Compute derived analytics
  const analytics = useMemo<ComputedAnalytics | null>(() => {
    if (!allData) return null;

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const isRecent = (dateStr?: string) => dateStr && new Date(dateStr) > thirtyDaysAgo;
    const isInMonth = (dateStr?: string, start: Date, end: Date) =>
      dateStr && new Date(dateStr) >= start && new Date(dateStr) <= end;

    // Core counts
    const recentUsers = allData.users.filter(u => isRecent(u.created_at)).length;
    const activeParticipants = allData.participants.filter(p => !p.status || p.status === 'active').length;
    const openIncidents = allData.incidents.filter(i => i.status !== 'closed').length;
    const expiredCreds = allData.credentials.filter(c => c.expiry_date && new Date(c.expiry_date) < now).length;
    const pendingTimesheets = allData.timesheets.filter(t => t.status === 'submitted' || t.status === 'pending').length;
    const overdueTasks = allData.tasks.filter(
      t => t.status !== 'completed' && t.status !== 'cancelled' && t.due_date && new Date(t.due_date) < now
    ).length;

    // Grouped counts
    const usersByRole = allData.users.reduce(
      (acc, u) => { acc[u.role || 'user'] = (acc[u.role || 'user'] || 0) + 1; return acc; },
      {} as Record<string, number>
    );

    const usersByPosition = allData.users.reduce(
      (acc, u) => {
        const key = (u.position || 'unset').replace(/_/g, ' ');
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const tasksByStatus = allData.tasks.reduce(
      (acc, t) => { acc[t.status || 'unknown'] = (acc[t.status || 'unknown'] || 0) + 1; return acc; },
      {} as Record<string, number>
    );

    const shiftsByStatus = allData.shifts.reduce(
      (acc, s) => { acc[s.status || 'unknown'] = (acc[s.status || 'unknown'] || 0) + 1; return acc; },
      {} as Record<string, number>
    );

    // Total records
    const totalRecords = Object.values(allData).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    );

    // 6-month growth trend
    const growthData = Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(now, 5 - i);
      const ms = startOfMonth(month);
      const me = endOfMonth(month);
      return {
        month: format(month, 'MMM'),
        users: allData.users.filter(u => isInMonth(u.created_at, ms, me)).length,
        participants: allData.participants.filter(p => isInMonth(p.created_at, ms, me)).length,
        shifts: allData.shifts.filter(s => isInMonth(s.created_at, ms, me)).length,
        notes: allData.notes.filter(n => isInMonth(n.created_at, ms, me)).length,
      };
    });

    return {
      users: allData.users.length,
      recentUsers,
      participants: allData.participants.length,
      activeParticipants,
      shifts: allData.shifts.length,
      incidents: allData.incidents.length,
      openIncidents,
      auditLogs: allData.auditLogs.length,
      credentials: allData.credentials.length,
      expiredCreds,
      tasks: allData.tasks.length,
      overdueTasks,
      notes: allData.notes.length,
      documents: allData.documents.length,
      timesheets: allData.timesheets.length,
      pendingTimesheets,
      goals: allData.goals.length,
      medications: allData.medications.length,
      totalRecords,
      usersByRole,
      usersByPosition,
      tasksByStatus,
      shiftsByStatus,
      growthData,
    };
  }, [allData]);

  // Loading state
  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const orgName = organization?.app_name || organization?.name || 'Your Organisation';

  return (
    <div className="space-y-6 mt-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Server className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">{orgName} — System Overview</h2>
        </div>
        <p className="text-slate-300 text-sm">
          {analytics.totalRecords.toLocaleString()} total records across your organisation
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge className="bg-white/10 text-white border-white/20">{analytics.users} Users</Badge>
          <Badge className="bg-white/10 text-white border-white/20">{analytics.activeParticipants} Active Participants</Badge>
          <Badge className="bg-white/10 text-white border-white/20">{analytics.shifts} Shifts</Badge>
          <Badge className="bg-white/10 text-white border-white/20">{analytics.openIncidents} Open Incidents</Badge>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'Team Members', value: analytics.users, sub: `${analytics.recentUsers} new (30d)`, color: 'bg-purple-50 text-purple-600' },
          { icon: Users, label: 'Active Participants', value: analytics.activeParticipants, sub: `${analytics.participants} total`, color: 'bg-cyan-50 text-cyan-600' },
          { icon: Calendar, label: 'Shifts', value: analytics.shifts, color: 'bg-green-50 text-green-600' },
          { icon: AlertTriangle, label: 'Open Incidents', value: analytics.openIncidents, sub: `${analytics.incidents} total`, color: 'bg-red-50 text-red-600' },
          { icon: Clock, label: 'Pending Timesheets', value: analytics.pendingTimesheets, sub: `${analytics.timesheets} total`, color: 'bg-orange-50 text-orange-600' },
          { icon: CheckCircle, label: 'Expired Credentials', value: analytics.expiredCreds, sub: `${analytics.credentials} total`, color: 'bg-amber-50 text-amber-600' },
          { icon: FileText, label: 'Progress Notes', value: analytics.notes, color: 'bg-indigo-50 text-indigo-600' },
          { icon: AlertTriangle, label: 'Overdue Tasks', value: analytics.overdueTasks, sub: `${analytics.tasks} total`, color: 'bg-pink-50 text-pink-600' },
        ].map(m => (
          <Card key={m.label} className="overflow-hidden">
            <CardContent className="p-3 flex items-start gap-2">
              <div className={`p-1.5 rounded-lg ${m.color}`}>
                <m.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{m.label}</p>
                <p className="text-xl font-bold text-slate-900">{m.value}</p>
                {m.sub && <p className="text-[10px] text-gray-400">{m.sub}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Volume */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4" /> Data Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { name: 'Users', count: analytics.users, bg: 'bg-purple-50' },
              { name: 'Participants', count: analytics.participants, bg: 'bg-cyan-50' },
              { name: 'Shifts', count: analytics.shifts, bg: 'bg-green-50' },
              { name: 'Timesheets', count: analytics.timesheets, bg: 'bg-orange-50' },
              { name: 'Incidents', count: analytics.incidents, bg: 'bg-red-50' },
              { name: 'Audit Logs', count: analytics.auditLogs, bg: 'bg-amber-50' },
              { name: 'Notes', count: analytics.notes, bg: 'bg-indigo-50' },
              { name: 'Documents', count: analytics.documents, bg: 'bg-blue-50' },
              { name: 'Goals', count: analytics.goals, bg: 'bg-emerald-50' },
              { name: 'Tasks', count: analytics.tasks, bg: 'bg-violet-50' },
              { name: 'Medications', count: analytics.medications, bg: 'bg-pink-50' },
              { name: 'Credentials', count: analytics.credentials, bg: 'bg-slate-50' },
            ].map(e => (
              <div key={e.name} className={`${e.bg} rounded-xl p-3 text-center`}>
                <p className="text-xl font-bold text-slate-900">{e.count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{e.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6-Month Trend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Activity Trend — 6 Months
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={analytics.growthData}>
              <defs>
                <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradShifts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="users" stroke="#8B5CF6" fill="url(#gradUsers)" strokeWidth={2} />
              <Area type="monotone" dataKey="shifts" stroke="#10B981" fill="url(#gradShifts)" strokeWidth={2} />
              <Area type="monotone" dataKey="participants" stroke="#06B6D4" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="notes" stroke="#3B82F6" fill="transparent" strokeWidth={1.5} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Role & Position Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" /> Users by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={toArr(analytics.usersByRole)}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {toArr(analytics.usersByRole).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> Top Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={toArr(analytics.usersByPosition).slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={140} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Tasks by Status', data: analytics.tasksByStatus },
          { title: 'Shifts by Status', data: analytics.shiftsByStatus },
        ].map(s => (
          <Card key={s.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {toArr(s.data).map(({ name, value }) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-gray-600 text-xs">{name.replace(/_/g, ' ')}</span>
                  <Badge variant="outline" className="text-xs font-mono">{value}</Badge>
                </div>
              ))}
              {toArr(s.data).length === 0 && <p className="text-xs text-gray-400">No data available</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
