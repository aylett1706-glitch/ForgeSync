'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ClipboardList, Clock, Layers3 } from 'lucide-react';

interface Submission {
  id: string;
  template_id?: string;
  status?: string;
  sector?: string;
}

interface Template {
  key: string;
  sector?: string;
}

interface Props {
  templates: Template[];
  submissions: Submission[];
  templateMap?: Record<string, Template>;
}

export default function FormsAnalyticsPanel({ 
  templates = [], 
  submissions = [], 
  templateMap = {} 
}: Props) {
  const workflows = useMemo(() => {
    return submissions.reduce((acc, submission) => {
      const status = submission.status || 'submitted';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [submissions]);

  const sectors = useMemo(() => {
    return submissions.reduce((acc, submission) => {
      const sector = submission.sector || 
                    templateMap[submission.template_id]?.sector || 
                    'general';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [submissions, templateMap]);

  const stats = [
    { 
      label: 'Templates', 
      value: templates.length, 
      icon: Layers3, 
      tone: 'bg-blue-50 text-blue-600' 
    },
    { 
      label: 'Submissions', 
      value: submissions.length, 
      icon: ClipboardList, 
      tone: 'bg-cyan-50 text-cyan-600' 
    },
    { 
      label: 'In Review', 
      value: workflows.in_review || 0, 
      icon: Clock, 
      tone: 'bg-amber-50 text-amber-600' 
    },
    { 
      label: 'Approved', 
      value: workflows.approved || 0, 
      icon: CheckCircle2, 
      tone: 'bg-emerald-50 text-emerald-600' 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-sm hover:shadow transition-all">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.tone}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workflow Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(workflows).length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No workflow activity yet.
              </p>
            ) : (
              Object.entries(workflows).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-xl border p-4">
                  <span className="font-medium capitalize text-slate-800">
                    {status.replace(/_/g, ' ')}
                  </span>
                  <Badge variant="outline" className="text-base px-4 py-1">
                    {count}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Sector Mix */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sector Mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(sectors).length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No sector data yet.
              </p>
            ) : (
              Object.entries(sectors).map(([sector, count]) => (
                <div key={sector} className="flex items-center justify-between rounded-xl border p-4">
                  <span className="font-medium capitalize text-slate-800">
                    {sector.replace(/_/g, ' ')}
                  </span>
                  <Badge variant="outline" className="text-base px-4 py-1">
                    {count}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
