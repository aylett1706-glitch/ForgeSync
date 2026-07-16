'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, AlertTriangle, Wrench, FileText, ClipboardList, BarChart3, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Hub {
  id?: string;
  organization_id?: string;
  name?: string;
}

interface Props {
  hub?: Hub;
}

const buildHubLink = (path: string, hub?: Hub): string => {
  const params = new URLSearchParams();
  if (hub?.organization_id) params.set('org_id', hub.organization_id);
  if (hub?.id) params.set('hub_id', hub.id);
  if (hub?.name) params.set('search', hub.name);
  return `${path}?${params.toString()}`;
};

export default function HubPathwayActions({ hub }: Props) {
  const actions = [
    { 
      label: 'Roster this hub', 
      icon: Calendar, 
      to: buildHubLink('/Rostering', hub), 
      detail: 'Create and review shifts' 
    },
    { 
      label: 'People & residents', 
      icon: Users, 
      to: buildHubLink('/Participants', hub), 
      detail: 'View linked participants' 
    },
    { 
      label: 'Incidents & safety', 
      icon: AlertTriangle, 
      to: buildHubLink('/Incidents', hub), 
      detail: 'Manage safety events' 
    },
    { 
      label: 'Maintenance', 
      icon: Wrench, 
      to: buildHubLink('/Maintenance', hub), 
      detail: 'Property and repair jobs' 
    },
    { 
      label: 'Documents', 
      icon: FileText, 
      to: buildHubLink('/DocumentManagement', hub), 
      detail: 'Hub files and evidence' 
    },
    { 
      label: 'Forms', 
      icon: ClipboardList, 
      to: buildHubLink('/Forms', hub), 
      detail: 'Audits and checklists' 
    },
    { 
      label: 'Reports', 
      icon: BarChart3, 
      to: buildHubLink('/ReportingAnalytics', hub), 
      detail: 'Hub performance insights' 
    },
  ];

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">Hub Pathways</h3>
            <p className="text-sm text-slate-500">Jump to the right operational area with this hub context kept attached.</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button 
                key={action.label} 
                asChild 
                variant="outline" 
                className="h-auto justify-between bg-white p-3 text-left"
              >
                <Link to={action.to}>
                  <span className="flex min-w-0 items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-[#0088A8]" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{action.label}</span>
                      <span className="block truncate text-xs font-normal text-slate-500">{action.detail}</span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
