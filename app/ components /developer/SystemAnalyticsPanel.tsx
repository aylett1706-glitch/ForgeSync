import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Database, Users, Activity, AlertCircle, Calendar, Clock,
  FileText, Shield, TrendingUp, Server
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, subDays } from 'date-fns';

// --- Supabase Client ---
const supabase = createClientComponentClient();

// --- Constants ---
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];
const TABLES = [
  'organizations', 'users', 'participants', 'incidents', 'audit_logs',
  'shifts', 'timesheets', 'medications', 'goals', 'progress_notes',
  'documents', 'tasks'
] as const;

// --- Types ---
type TableName = typeof TABLES[number];

interface BaseRecord {
  id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

interface OrganizationRecord extends BaseRecord {}
interface UserRecord extends BaseRecord { role?: string; position?: string; }
interface ParticipantRecord extends BaseRecord { status?: string; client_type?: string; }
interface IncidentRecord extends BaseRecord { status?: string; severity?: string; incident_type?: string; }
interface AuditLogRecord extends BaseRecord { action?: string; severity?: string; }
interface ShiftRecord extends BaseRecord { status?: string; }
interface TimesheetRecord extends BaseRecord { status?: string; }
interface GoalRecord extends BaseRecord { status?: string; }

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

interface RawDataset {
  orgs: OrganizationRecord[];
  users: UserRecord[];
  participants: ParticipantRecord[];
  incidents: IncidentRecord[];
  auditLogs: AuditLogRecord[];
  shifts: ShiftRecord[];
  timesheets: TimesheetRecord[];
  medications: BaseRecord[];
  goals: GoalRecord[];
  progressNotes: BaseRecord[];
  documents: BaseRecord[];
  tasks: BaseRecord[];
}

interface ChartItem { name: string; value: number; }

// --- Helper Components ---
function MetricCard({ icon: Icon, label, value, sub, color = 'bg-blue-50 text-blue-600' }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold mt-0.5">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

const toChartArr = (obj?: Record<string, number>): ChartItem[] =>
  Object.entries(obj || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

// --- Main Component ---
export default function SystemAnalyticsPanel() {
  const { data: allData, isLoading } = useQuery<RawDataset>({
    queryKey: ['ai-diag-system-analytics'],
    queryFn: async () => {
      const fetchTable = async (table: TableName) => {
        const { data, error } = await supabase.from(table).select('*').order('updated_at', { ascending: false }).limit(500);
        if (error) throw new Error(`Failed to load ${table}: ${error.message}`);
        return data || [];
      };

      const [
        orgs, users, participants, incidents, auditLogs, shifts,
        timesheets, medications, goals, progressNotes, documents, tasks
      ] = await Promise.all(TABLES.map(fetchTable));

      return {
        orgs, users, participants, incidents, auditLogs, shifts,
        timesheets, medications, goals, progressNotes, documents, tasks
      } as RawDataset;
    },
    staleTime: 60000, // 1 minute cache
  });

  const analytics = useMemo(() => {
    if (!allData) return null;
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);
    const isRecent = (dateStr?: string) => dateStr && new Date(dateStr) > thirtyDaysAgo;
    const isInMonth = (dateStr?: string, start: Date, end: Date) =>
      dateStr && new Date(dateStr) >= start && new Date(dateStr) <= end;

    // Core counts
    const recentUsers = allData.users.filter(u => isRecent(u.created_at)).length;
    const recentParticipants = allData.participants.filter(p => isRecent(p.created_at)).length;
    const activeParticipants = allData.participants.filter(p => !p.status || p.status === 'active').length;
    const openIncidents = allData.incidents.filter(i => i.status !== 'closed').length;
    const criticalIncidents = allData.incidents.filter(i => i.severity === 'critical' || i.severity === 'major').length;
    const recentAudit = allData.auditLogs.filter(l => l.created_at && new Date(l.created_at) > sevenDaysAgo).length;

    // Grouped counts
    const incidentsBySeverity = allData.incidents.reduce(
      (acc, i) => { acc[i.severity || 'unknown'] = (acc[i.severity || 'unknown'] || 0) + 1; return acc; },
      {} as Record<string, number>
    );
    const incidentsByType = allData.incidents.reduce(
      (acc, i) => { const t = (i.incident_type || 'other').replace(/_/g, ' '); acc[t] = (acc[t] || 0) + 1; return acc; },
      {} as Record<string, number>
    );
    const usersByRole = allData.users.reduce(
      (acc, u) => { acc[u.role || 'user'] = (acc[u.role || 'user'] || 0) + 1; return acc; },
      {} as Record<string, number>
    );
    const usersByPosition = allData.users.reduce(
      (acc, u) => { const pos = (u.position || 'unset').replace(/_/g, ' '); acc[pos] = (acc[pos] || 0) + 1; return acc; },
      {} as Record<string, number>
    );
    const auditByAction = allData.auditLogs.reduce(
      (acc, l) => { acc[l.action || 'unknown'] = (acc[l.action || 'unknown'] || 0) + 1; return acc; },
      {} as Record<string, number>
    );
    const auditBySeverity = allData.auditLogs.reduce(
      (acc, l) => { acc[l.severity || 'low'] = (acc[l.severity || 'low'] || 0) + 1; return acc; },
      {} as Record<string, number>
    );
    const shiftsByStatus = allData.shifts.reduce(
      (acc, s) => { acc[s.status || 'unknown'] = (acc[s.status || 'unknown'] || 0) + 1; return acc; },
      {} as Record<string, number>
    );
    const timesheetsByStatus = allData.timesheets.reduce(
      (acc, t) => { acc[t.status || 'unknown'] = (acc[t.status || 'unknown'] || 0) + 1; return acc; },
      {} as Record<string, number>
    );
    const tasksByStatus = allData.tasks.reduce(
      (acc, t) => { acc[t.status || 'unknown'] = (acc[t.status || 'unknown'] || 0) + 1; return acc; },
      {} as Record<string, number>
    );
    const goalsByStatus = allData.goals.reduce(
      (acc, g) => { const st = (g.status || 'unknown').replace(/_/g, ' '); acc[st] = (acc[st] || 0) + 1; return acc; },
      {} as Record<string, number>
    );
    const participantsByType = allData.participants.reduce(
      (acc, p) => { const t = (p.client_type || 'unset').replace(/_/g, ' '); acc[t] = (acc[t] || 0) + 1; return acc; },
      {} as Record<string, number>
    );

    // 6-month growth data
    const growthData = Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(now, 5 - i);
      const ms = startOfMonth(month);
      const me = endOfMonth(month);
      return {
        month: format(month, 'MMM yy'),
        users: allData.users.filter(u => isInMonth(u.created_at, ms, me)).length,
        participants: allData.participants.filter(p => isInMonth(p.created_at, ms, me)).length,
        incidents: allData.incidents.filter(inc => isInMonth(inc.created_at, ms, me)).length,
        shifts: allData.shifts.filter(s => isInMonth(s.created_at, ms, me)).length,
        notes: allData.progressNotes.filter(n => isInMonth(n.created_at, ms, me)).length,
      };
    });

    const totalRecords = Object.values(allData).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    );

    return {
      orgs: allData.orgs.length,
      users: allData.users.length,
      participants: allData.participants.length,
      activeParticipants: activeParticipants.length,
      incidents: allData.incidents.length,
      openIncidents: openIncidents.length,
      criticalIncidents: criticalIncidents.length,
      shifts: allData.shifts.length,
      timesheets: allData.timesheets.length,
      medications: allData.medications.length,
      goals: allData.goals.length,
      progressNotes: allData.progressNotes.length,
      documents: allData.documents.length,
      tasks: allData.tasks.length,
      auditLogs: allData.auditLogs.length,
      recentUsers, recentParticipants, recentAudit, totalRecords,
      incidentsBySeverity, incidentsByType, usersByRole, usersByPosition,
      auditByAction, auditBySeverity, shiftsByStatus, timesheetsByStatus,
      tasksByStatus, goalsByStatus, participantsByType, growthData,
    };
  }, [allData]);

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Server className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-bold">System Analytics & Performance</h2>
        </div>
        <p className="text-slate-300 text-sm">
          Live data across {analytics.orgs} organisations — {analytics.totalRecords.toLocaleString()} total records
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Badge className="bg-white/10 text-white border-white/20">{analytics.users} Users</Badge>
          <Badge className="bg-white/10 text-white border-white/20">{analytics.participants} Participants</Badge>
          <Badge className="bg-white/10 text-white border-white/20">{analytics.shifts} Shifts</Badge>
          <Badge className="bg-white/10 text-white border-white/20">{analytics.incidents} Incidents</Badge>
          <Badge className="bg-white/10 text-white border-white/20">{analytics.auditLogs} Audit Logs</Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <MetricCard icon={Database} label="Organisations" value={analytics.orgs} color="bg-blue-50 text-blue-600" />
        <MetricCard icon={Users} label="Total Users" value={analytics.users} sub={`${analytics.recentUsers} new (30d)`} color="bg-purple-50 text-purple-600" />
        <MetricCard icon={Users} label="Active Participants" value={analytics.activeParticipants} sub={`${analytics.recentParticipants} new (30d)`} color="bg-cyan-50 text-cyan-600" />
        <MetricCard icon={AlertCircle} label="Open Incidents" value={analytics.openIncidents} sub={`${analytics.criticalIncidents} critical/major`} color="bg-red-50 text-red-600" />
        <MetricCard icon={Calendar} label="Shifts" value={analytics.shifts} color="bg-green-50 text-green-600" />
        <MetricCard icon={Clock} label="Timesheets" value={analytics.timesheets} color="bg-orange-50 text-orange-600" />
        <MetricCard icon={FileText} label="Progress Notes" value={analytics.progressNotes} color="bg-indigo-50 text-indigo-600" />
        <MetricCard icon={Shield} label="Audit Events (7d)" value={analytics.recentAudit} sub={`${analytics.auditLogs} total`} color="bg-amber-50 text-amber-600" />
      </div>

      {/* Data Volume */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base"><Database className="w-4 h-4" /> Entity Record Counts</CardTitle>
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
              { name: 'Progress Notes', count: analytics.progressNotes, bg: 'bg-indigo-50' },
              { name: 'Medications', count: analytics.medications, bg: 'bg-pink-50' },
              { name: 'Goals', count: analytics.goals, bg: 'bg-emerald-50' },
              { name: 'Documents', count: analytics.documents, bg: 'bg-blue-50' },
              { name: 'Tasks', count: analytics.tasks, bg: 'bg-violet-50' },
              { name: 'Organisations', count: analytics.orgs, bg: 'bg-slate-50' },
            ].map(e => (
              <div key={e.name} className={`${e.bg} rounded-xl p-3 text-center`}>
                <p className="text-2xl font-bold">{e.count}</p>
                <p className="text-xs text-gray-500 mt-1">{e.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="w-4 h-4" /> Record Growth — Last 6 Months</CardTitle>
          <CardDescription>New records created per month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.growthData}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gShifts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gIncidents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="users" stroke="#8B5CF6" fill="url(#gUsers)" strokeWidth={2} />
              <Area type="monotone" dataKey="shifts" stroke="#10B981" fill="url(#gShifts)" strokeWidth={2} />
              <Area type="monotone" dataKey="incidents" stroke="#EF4444" fill="url(#gIncidents)" strokeWidth={2} />
              <Area type="monotone" dataKey="notes" stroke="#3B82F6" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500" /> Incidents by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={toChartArr(analytics.incidentsBySeverity)} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {toChartArr(analytics.incidentsBySeverity).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-500" /> Incidents by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={toChartArr(analytics.incidentsByType)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-purple-500" /> Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={toChartArr(analytics.usersByRole)} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {toChartArr(analytics.usersByRole).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-cyan-500" /> Participants by Client Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={toChartArr(analytics.participantsByType)} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {toChartArr(analytics.participantsByType).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> Audit Actions (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={toChartArr(analytics.auditByAction).slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={60} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-amber-500" /> Audit by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={toChartArr(analytics.auditBySeverity)} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {toChartArr(analytics.auditBySeverity).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Operational Status Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Shifts by Status', data: analytics.shiftsByStatus },
          { title: 'Timesheets by Status', data: analytics.timesheetsByStatus },
          { title: 'Tasks by Status', data: analytics.tasksByStatus },
          { title: 'Goals by Status', data: analytics.goalsByStatus },
        ].map(section => (
          <Card key={section.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {toChartArr(section.data).map(({ name, value }) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-gray-600">{name}</span>
                  <Badge variant="outline" className="text-xs font-mono">{value}</Badge>
                </div>
              ))}
              {toChartArr(section.data).length === 0 && <p className="text-xs text-gray-400">No data</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Positions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Users by Position (Top 15)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={toChartArr(analytics.usersByPosition).slice(0, 15)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={140} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
