import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, AlertTriangle, Activity, Shield, Mail, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// --- Types ---
interface UserProfile {
  email?: string;
  position?: string;
  role?: string;
}

interface DeveloperProfilePanelProps {
  user?: UserProfile | null;
  organizationsCount: number;
  usersCount: number;
  incidentsCount: number;
  auditCount: number;
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

export default function DeveloperProfilePanel({
  user,
  organizationsCount,
  usersCount,
  incidentsCount,
  auditCount,
}: DeveloperProfilePanelProps) {
  const impersonatedRole = sessionStorage.getItem('dev_impersonate_role');

  const stats: StatItem[] = [
    { label: 'Organizations', value: organizationsCount, icon: Building2, color: 'text-blue-600 bg-blue-50' },
    { label: 'Users', value: usersCount, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: 'Open Incidents', value: incidentsCount, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
    { label: 'Audit Events', value: auditCount, icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
              <UserCog className="w-5 h-5 text-indigo-600" />
              Developer Profile
            </CardTitle>
            <CardDescription className="mt-1 max-w-md">
              High-trust access, system visibility, and fast control actions.
            </CardDescription>
          </div>
          <Badge className="self-start rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 border-transparent">
            Developer
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* User Info & Impersonation Status */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
            <Mail className="w-4 h-4 shrink-0 text-slate-500" />
            <span className="min-w-0 break-all">{user?.email ?? 'No email available'}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="justify-center text-center">
              {user?.position ?? 'app_developer'}
            </Badge>
            <Badge variant="outline" className="justify-center text-center">
              {user?.role ?? 'admin'}
            </Badge>

            {impersonatedRole ? (
              <Badge className="border-transparent bg-amber-100 text-center text-amber-800">
                Impersonating: {impersonatedRole}
              </Badge>
            ) : (
              <Badge className="border-transparent bg-green-100 text-center text-green-800">
                Native developer mode
              </Badge>
            )}
          </div>
        </div>

        {/* System Stats Grid */}
        <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-3">
          <Link to={createPageUrl('OrganizationManagement')} className="block min-w-0">
            <Button
              variant="outline"
              className="h-auto min-h-11 w-full justify-start whitespace-normal py-3 text-left text-sm leading-tight"
            >
              <Building2 className="w-4 h-4 shrink-0" />
              Manage Organizations
            </Button>
          </Link>

          <Link to={createPageUrl('DataSecuritySettings')} className="block min-w-0">
            <Button
              variant="outline"
              className="h-auto min-h-11 w-full justify-start whitespace-normal py-3 text-left text-sm leading-tight"
            >
              <Shield className="w-4 h-4 shrink-0" />
              Security Controls
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
