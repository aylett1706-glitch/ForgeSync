import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Shield, Building2 } from 'lucide-react';

// --- Types ---
interface Organization {
  id?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

interface Incident {
  id?: string;
  status?: string;
  severity?: string;
  [key: string]: unknown;
}

interface AuditLog {
  id?: string;
  severity?: string;
  [key: string]: unknown;
}

interface SystemHealthItem {
  title: string;
  value: number;
  icon: React.ElementType;
  okText: string;
  alertText: string;
  tone: 'ok' | 'alert';
}

interface DeveloperSystemHealthProps {
  organizations: Organization[];
  incidents: Incident[];
  auditLogs: AuditLog[];
}

export default function DeveloperSystemHealth({
  organizations = [],
  incidents = [],
  auditLogs = [],
}: DeveloperSystemHealthProps) {
  // Safe calculations with defaults for empty arrays
  const inactiveOrganizations = organizations.filter(org => org.is_active === false).length;
  const openIncidents = incidents.filter(inc => inc.status !== 'closed').length;
  const criticalIncidents = incidents.filter(inc => inc.severity === 'critical').length;
  const highSeverityLogs = auditLogs.filter(
    log => log.severity === 'high' || log.severity === 'critical'
  ).length;

  const items: SystemHealthItem[] = [
    {
      title: 'Organization health',
      value: inactiveOrganizations,
      icon: Building2,
      okText: 'All organizations active',
      alertText: `${inactiveOrganizations} inactive organizations`,
      tone: inactiveOrganizations > 0 ? 'alert' : 'ok'
    },
    {
      title: 'Open incidents',
      value: openIncidents,
      icon: AlertTriangle,
      okText: 'No open incidents',
      alertText: `${openIncidents} incidents need attention`,
      tone: openIncidents > 0 ? 'alert' : 'ok'
    },
    {
      title: 'Critical incidents',
      value: criticalIncidents,
      icon: AlertTriangle,
      okText: 'No critical incidents',
      alertText: `${criticalIncidents} critical incidents`,
      tone: criticalIncidents > 0 ? 'alert' : 'ok'
    },
    {
      title: 'Audit risk',
      value: highSeverityLogs,
      icon: Shield,
      okText: 'No high-risk audit events',
      alertText: `${highSeverityLogs} high-risk audit events`,
      tone: highSeverityLogs > 0 ? 'alert' : 'ok'
    }
  ];

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">System Health</CardTitle>
        <CardDescription>A cleaner operational view instead of a checklist-driven layout.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isAlert = item.tone === 'alert';
          return (
            <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isAlert ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {isAlert ? <Icon className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
              </div>
              <div className="mt-3">
                <Badge className={`${
                  isAlert ? 'bg-orange-100 text-orange-800 border-transparent' : 'bg-emerald-100 text-emerald-800 border-transparent'
                }`}>
                  {isAlert ? item.alertText : item.okText}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
