'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import {
  Shield, AlertTriangle, CheckCircle, Users, FileText,
  Activity, TrendingUp, AlertCircle
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, subDays, differenceInDays } from 'date-fns';

// --- Supabase Client ---
const supabase = createClientComponentClient();

// --- Constants ---
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'] as const;

type SeverityKey = 'minor' | 'moderate' | 'major' | 'critical' | 'unknown';
const SEVERITY_COLORS: Record<SeverityKey, string> = {
  minor: '#10B981',
  moderate: '#F59E0B',
  major: '#F97316',
  critical: '#EF4444',
  unknown: '#94A3B8'
};

// --- Database Schema Types (matches your Supabase tables) ---
interface ComplianceCheck {
  id: string;
  status?: string;
  created_date?: string;
  updated_date?: string;
}

interface Incident {
  id: string;
  status?: string;
  severity?: string;
  incident_type?: string;
  restrictive_practice_used?: boolean;
  created_date?: string;
  updated_date?: string;
}

interface AuditLog {
  id: string;
  action?: string;
  severity?: string;
  created_date?: string;
  updated_date?: string;
}

interface WorkerCredential {
  id: string;
  status?: string;
  credential_type?: string;
  type?: string;
  expiry_date?: string;
  created_date?: string;
  updated_date?: string;
}

interface SupportAssessment {
  id: string;
  updated_date?: string;
}

interface ServiceAgreement {
  id: string;
  status?: string;
  end_date?: string;
  updated_date?: string;
}

interface Policy {
  id: string;
  status?: string;
  updated_date?: string;
}

interface PolicyAcknowledgment {
  id: string;
  updated_date?: string;
}

interface RestrictivePracticeLog {
  id: string;
  practice_type?: string;
  type?: string;
  updated_date?: string;
}

interface Risk {
  id: string;
  status?: string;
  risk_level?: string;
  severity?: string;
  updated_date?: string;
}

interface Participant {
  id: string;
  risk_level?: string;
  updated_date?: string;
}

interface AppUser {
  id: string;
  updated_date?: string;
}

interface QueryResult {
  checks: ComplianceCheck[];
  incidents: Incident[];
  auditLogs: AuditLog[];
  credentials: WorkerCredential[];
  assessments: SupportAssessment[];
  agreements: ServiceAgreement[];
  policies: Policy[];
  acknowledgments: PolicyAcknowledgment[];
  restrictivePractices: RestrictivePracticeLog[];
  risks: Risk[];
  participants: Participant[];
  users: AppUser[];
}

interface TrendDataPoint {
  month: string;
  incidents: number;
  checks: number;
  credentials: number;
  audits: number;
}

interface AnalyticsData {
  complianceScore: number;
  totalChecks: number;
  recentChecks: number;
  checksByStatus: Record<string, number>;
  totalCredentials: number;
  expired: number;
  expiring90: number;
  credsByStatus: Record<string, number>;
  credsByType: Record<string, number>;
  totalIncidents: number;
  openIncidents: number;
  criticalIncidents: number;
  restrictiveUsed: number;
  incidentsBySeverity: Record<string, number>;
  incidentsByType: Record<string, number>;
  incidentsByStatus: Record<string, number>;
  auditLogs: number;
  highSeverityAudit: number;
  recentAudit7: number;
  auditByAction: Record<string, number>;
  auditBySeverity: Record<string, number>;
  totalAgreements: number;
  activeAgreements: number;
  expiredAgreements: number;
  agreementsByStatus: Record<string, number>;
  totalPolicies: number;
  activePolicies: number;
  policyAcknowledgments: number;
  policyAckRate: number;
  restrictivePractices: number;
  rpByType: Record<string, number>;
  totalRisks: number;
  openRisks: number;
  risksByLevel: Record<string, number>;
  participantRisk: Record<string, number>;
  growthData: TrendDataPoint[];
}

interface StatItem {
  name: string;
  value: number;
}

// --- Sub-Components ---
function ScoreRing({ score, label, size = 120 }: { score: number; label: string; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-3xl font-bold" style={{ color }}>{score}%</span>
      </div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  );
}

// --- Main Component ---
export default function ComplianceAnalyticsPanel() {
  const { data: allData, isLoading } = useQuery<QueryResult>({
    queryKey: ['compliance-deep-analytics'],
    queryFn: async () => {
      // Fetch all tables from Supabase
      const [
        { data: checks },
        { data: incidents },
        { data: auditLogs },
        { data: credentials },
        { data: assessments },
        { data: agreements },
        { data: policies },
        { data: acknowledgments },
        { data: restrictivePractices },
        { data: risks },
        { data: participants },
        { data: users },
      ] = await Promise.all([
        supabase.from('compliance_checks').select('*').order('updated_date', { ascending: false }).limit(500),
        supabase.from('incidents').select('*').order('updated_date', { ascending: false }).limit(500),
        supabase.from('audit_logs').select('*').order('updated_date', { ascending: false }).limit(500),
        supabase.from('worker_credentials').select('*').order('updated_date', { ascending: false }).limit(500),
        supabase.from('support_assessments').select('*').order('updated_date', { ascending: false }).limit(500),
        supabase.from('service_agreements').select('*').order('updated_date', { ascending: false }).limit(500),
        supabase.from('policies').select('*').order('updated_date', { ascending: false }).limit(500),
        supabase.from('policy_acknowledgments').select('*').order('updated_date', { ascending: false }).limit(500),
        supabase.from('restrictive_practice_logs').select('*').order('updated_date', { ascending: false }).limit(500),
        supabase.from('risks').select('*').order('updated_date', { ascending: false }).limit(500),
        supabase.from('participants').select('*').order('updated_date', { ascending: false }).limit(500),
        supabase.from('users').select('*').order('updated_date', { ascending: false }).limit(500),
      ]);

      return {
        checks: checks || [],
        incidents: incidents || [],
        auditLogs: auditLogs || [],
        credentials: credentials || [],
        assessments: assessments || [],
        agreements: agreements || [],
        policies: policies || [],
        acknowledgments: acknowledgments || [],
        restrictivePractices: restrictivePractices || [],
        risks: risks || [],
        participants: participants || [],
        users: users || [],
      };
    },
    staleTime: 60000,
  });

  const analytics = useMemo<AnalyticsData | null>(() => {
    if (!allData) return null;
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // --- Compliance Checks ---
    const checksByStatus = allData.checks.reduce<Record<string, number>>((a, c) => {
      const key = c.status || 'unknown';
      a[key] = (a[key] || 0) + 1;
      return a;
    }, {});
    const compliantChecks = checksByStatus.compliant || checksByStatus.pass || 0;
    const complianceScore = allData.checks.length ? Math.round((compliantChecks / allData.checks.length) * 100) : 0;
    const recentChecks = allData.checks.filter(c => c.created_date && new Date(c.created_date) > thirtyDaysAgo);

    // --- Credentials ---
    const expired = allData.credentials.filter(c => c.expiry_date && new Date(c.expiry_date) < now);
    const expiring90 = allData.credentials.filter(c =>
      c.expiry_date && new Date(c.expiry_date) > now && differenceInDays(new Date(c.expiry_date), now) <= 90
    );
    const credsByStatus = allData.credentials.reduce<Record<string, number>>((a, c) => {
      const key = c.status || 'unknown';
      a[key] = (a[key] || 0) + 1;
      return a;
    }, {});
    const credsByType = allData.credentials.reduce<Record<string, number>>((a, c) => {
      const rawType = c.credential_type || c.type || 'other';
      const key = rawType.replace(/_/g, ' ');
      a[key] = (a[key] || 0) + 1;
      return a;
    }, {});

    // --- Incidents ---
    const openIncidents = allData.incidents.filter(i => i.status !== 'closed');
    const criticalIncidents = allData.incidents.filter(i => i.severity === 'critical' || i.severity === 'major');
    const incidentsBySeverity = allData.incidents.reduce<Record<string, number>>((a, i) => {
      const key = i.severity || 'unknown';
      a[key] = (a[key] || 0) + 1;
      return a;
    }, {});
    const incidentsByType = allData.incidents.reduce<Record<string, number>>((a, i) => {
      const rawType = i.incident_type || 'other';
      const key = rawType.replace(/_/g, ' ');
      a[key] = (a[key] || 0) + 1;
      return a;
    }, {});
    const incidentsByStatus = allData.incidents.reduce<Record<string, number>>((a, i) => {
      const key = i.status || 'unknown';
      a[key] = (a[key] || 0) + 1;
      return a;
    }, {});
    const restrictiveUsed = allData.incidents.filter(i => i.restrictive_practice_used);

    // --- Audit Logs ---
    const highSeverityAudit = allData.auditLogs.filter(l => l.severity === 'high' || l.severity === 'critical');
    const recentAudit7 = allData.auditLogs.filter(l => l.created_date && new Date(l.created_date) > subDays(now, 7));
    const auditByAction = allData.auditLogs.reduce<Record<string, number>>((a, l) => {
      const key = l.action || 'unknown';
      a[key] = (a[key] || 0) + 1;
      return a;
    }, {});
    const auditBySeverity = allData.auditLogs.reduce<Record<string, number>>((a, l) => {
      const key = l.severity || 'low';
      a[key] = (a[key] || 0) + 1;
      return a;
    }, {});

    // --- Service Agreements ---
    const activeAgreements = allData.agreements.filter(a => a.status === 'active');
    const expiredAgreements = allData.agreements.filter(a => a.status === 'expired' || (a.end_date && new Date(a.end_date) < now));
    const agreementsByStatus = allData.agreements.reduce<Record<string, number>>((a, s) => {
      const key = s.status || 'unknown';
      a[key] = (a[key] || 0) + 1;
      return a;
    }, {});

    // --- Policies ---
    const activePolicies = allData.policies.filter(p => p.status === 'active' || p.status === 'published');
    const policyAckRate = allData.policies.length && allData.users.length
      ? Math.round((allData.acknowledgments.length / (allData.policies.length * allData.users.length)) * 100)
      : 0;

    // --- Restrictive Practices ---
    const rpByType = allData.restrictivePractices.reduce<Record<string, number>>((a, r) => {
      const rawType = r.practice_type || r.type || 'other';
      const key = rawType.replace(/_/g, ' ');
      a[key] = (a[key] || 0) + 1;
      return a;
    }, {});

    // --- Risks ---
    const risksByLevel = allData.risks.reduce<Record<string, number>>((a, r) => {
      const key = r.risk_level || r.severity || 'unknown';
      a[key] = (a[key] || 0) + 1;
      return a;
    }, {});
    const openRisks = allData.risks.filter(r => r.status !== 'closed' && r.status !== 'resolved');

    // --- 6-Month Trend Data ---
    const growthData: TrendDataPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const ms = startOfMonth(month);
      const me = endOfMonth(month);
      const inRange = (d?: string) => d && new Date(d) >= ms && new Date(d) <= me;

      growthData.push({
        month: format(month, 'MMM yy'),
        incidents: allData.incidents.filter(inc => inRange(inc.created_date)).length,
        checks: allData.checks.filter(c => inRange(c.created_date)).length,
        credentials: allData.credentials.filter(c => inRange(c.created_date)).length,
        audits: allData.auditLogs.filter(l => inRange(l.created_date)).length,
      });
    }

    // --- Participant Risk ---
    const participantRisk = allData.participants.reduce<Record<string, number>>((a, p) => {
      const key = p.risk_level || 'unset';
      a[key] = (a[key] || 0) + 1;
      return a;
    }, {});

    return {
      complianceScore,
      totalChecks: allData.checks.length,
      recentChecks: recentChecks.length,
      checksByStatus,
      totalCredentials: allData.credentials.length,
      expired: expired.length,
      expiring90: expiring90.length,
      credsByStatus,
      credsByType,
      totalIncidents: allData.incidents.length,
      openIncidents: openIncidents.length,
      criticalIncidents: criticalIncidents.length,
      restrictiveUsed: restrictiveUsed.length,
      incidentsBySeverity,
      incidentsByType,
      incidentsByStatus,
      auditLogs: allData.auditLogs.length,
      highSeverityAudit: highSeverityAudit.length,
      recentAudit7: recentAudit7.length,
      auditByAction,
      auditBySeverity,
      totalAgreements: allData.agreements.length,
      activeAgreements: activeAgreements.length,
      expiredAgreements: expiredAgreements.length,
      agreementsByStatus,
      totalPolicies: allData.policies.length,
      activePolicies: activePolicies.length,
      policyAcknowledgments: allData.acknowledgments.length,
      policyAckRate: Math.min(policyAckRate, 100),
      restrictivePractices: allData.restrictivePractices.length,
      rpByType,
      totalRisks: allData.risks.length,
      openRisks: openRisks.length,
      risksByLevel,
      participantRisk,
      growthData,
    };
  }, [allData]);

  // Helper to convert objects to chart arrays
  const toArr = (obj?: Record<string, number>): StatItem[] =>
    Object.entries(obj || {}).map(([name, value]) => ({ name, value }));

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold">Deep Compliance Analytics</h2>
        </div>
        <p className="text-emerald-200 text-sm">
          Live compliance posture across all entities — {analytics.totalChecks} checks, {analytics.totalCredentials} credentials, {analytics.totalIncidents} incidents tracked
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge className={`${
            analytics.complianceScore >= 80 ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30' :
            analytics.complianceScore >= 60 ? 'bg-amber-500/20 text-amber-100 border-amber-400/30' :
            'bg-red-500/20 text-red-100 border-red-400/30'
          }`}>Score: {analytics.complianceScore}%</Badge>
          <Badge className="bg-white/10 text-white border-white/20">{analytics.openIncidents} Open Incidents</Badge>
          <Badge className="bg-white/10 text-white border-white/20">{analytics.expired} Expired Creds</Badge>
          <Badge className="bg-white/10 text-white border-white/20">{analytics.openRisks} Open Risks</Badge>
          <Badge className="bg-white/10 text-white border-white/20">{analytics.restrictivePractices} RP Logs</Badge>
        </div>
      </div>

      {/* Score + Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="md:col-span-1 flex items-center justify-center py-6">
          <ScoreRing score={analytics.complianceScore} label="Overall Compliance" size={140} />
        </Card>
        <div className="md:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Shield, label: 'Compliance Checks', value: analytics.totalChecks, sub: `${analytics.recentChecks} in 30d`, color: 'bg-blue-50 text-blue-600' },
            { icon: AlertCircle, label: 'Expired Credentials', value: analytics.expired, sub: `${analytics.expiring90} expiring 90d`, color: 'bg-red-50 text-red-600' },
            { icon: AlertTriangle, label: 'Critical Incidents', value: analytics.criticalIncidents, sub: `${analytics.openIncidents} open total`, color: 'bg-orange-50 text-orange-600' },
            { icon: Activity, label: 'High Severity Audits', value: analytics.highSeverityAudit, sub: `${analytics.recentAudit7} in 7d`, color: 'bg-amber-50 text-amber-600' },
            { icon: FileText, label: 'Active Agreements', value: analytics.activeAgreements, sub: `${analytics.expiredAgreements} expired`, color: 'bg-green-50 text-green-600' },
            { icon: FileText, label: 'Active Policies', value: analytics.activePolicies, sub: `${analytics.policyAcknowledgments} acks`, color: 'bg-indigo-50 text-indigo-600' },
            { icon: Shield, label: 'Restrictive Practices', value: analytics.restrictivePractices, sub: `${analytics.restrictiveUsed} in incidents`, color: 'bg-pink-50 text-pink-600' },
            { icon: AlertTriangle, label: 'Open Risks', value: analytics.openRisks, sub: `${analytics.totalRisks} total`, color: 'bg-violet-50 text-violet-600' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-3 flex items-start gap-2">
                <div className={`p-1.5 rounded-lg ${stat.color}`}><stat.icon className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                  {stat.sub && <p className="text-[10px] text-gray-400">{stat.sub}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 6-Month Trend Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Compliance Trend — 6 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={analytics.growthData}>
              <defs>
                <linearGradient id="cIncidents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cChecks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cAudits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="checks" stroke="#10B981" fill="url(#cChecks)" strokeWidth={2} />
              <Area type="monotone" dataKey="incidents" stroke="#EF4444" fill="url(#cIncidents)" strokeWidth={2} />
              <Area type="monotone" dataKey="audits" stroke="#F59E0B" fill="url(#cAudits)" strokeWidth={2} />
              <Area type="monotone" dataKey="credentials" stroke="#8B5CF6" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Severity */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Incidents by Severity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={toArr(analytics.incidentsBySeverity)} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {toArr(analytics.incidentsBySeverity).map((e, i) => <Cell key={i} fill={SEVERITY_COLORS[e.name as SeverityKey] || COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incidents by Type */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" /> Incidents by Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={toArr(analytics.incidentsByType).sort((a, b) => b.value - a.value)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={130} />
                <Tooltip />
                <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Credentials by Status */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Credentials by Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={toArr(analytics.credsByStatus)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Audit Severity */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" /> Audit Severity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={toArr(analytics.auditBySeverity)} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {toArr(analytics.auditBySeverity).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Audit Actions */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> Top Audit Actions</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={toArr(analytics.auditByAction).sort((a, b) => b.value - a.value).slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Participant Risk Levels */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-violet-500" /> Participant Risk Levels</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={toArr(analytics.participantRisk)} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {toArr(analytics.participantRisk).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Incidents by Status', data: analytics.incidentsByStatus },
          { title: 'Agreements by Status', data: analytics.agreementsByStatus },
          { title: 'Risks by Level', data: analytics.risksByLevel },
          { title: 'RP by Type', data: analytics.rpByType },
        ].map((section) => (
          <Card key={section.title}>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{section.title}</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {Object.entries(section.data || {}).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-gray-600 text-xs">{key.replace(/_/g, ' ')}</span>
                  <Badge variant="outline" className="text-xs">{val}</Badge>
                </div>
              ))}
              {Object.keys(section.data || {}).length === 0 && <p className="text-xs text-gray-400">No data</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Credentials by Type */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" /> Credentials by Type</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={toArr(analytics.credsByType).sort((a, b) => b.value - a.value).slice(0, 15)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={150} />
              <Tooltip />
              <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
