'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Edit2, CheckCircle2 } from 'lucide-react';

const COLUMNS = [
  { key: 'pending', title: 'Pending', statuses: ['pending', 'open'] },
  { key: 'in_progress', title: 'In Progress', statuses: ['in_progress', 'awaiting_parts', 'awaiting_approval', 'pending_safety_signoff', 'on_hold'] },
  { key: 'completed', title: 'Completed', statuses: ['completed', 'resolved'] },
];

interface MaintenanceRequest {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  property_id?: string;
  job_code?: string;
}

interface Property {
  id: string;
  name: string;
}

interface Props {
  requests: MaintenanceRequest[];
  properties: Property[];
  onEdit: (request: MaintenanceRequest) => void;
  onComplete: (request: MaintenanceRequest) => void;
}

export default function MaintenanceKanbanBoard({
  requests = [],
  properties = [],
  onEdit,
  onComplete,
}: Props) {
  const propertyById = Object.fromEntries(properties.map((property) => [property.id, property.name]));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {COLUMNS.map((column) => {
        const items = requests.filter((request) => column.statuses.includes(request.status || 'pending'));
        return (
          <div key={column.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="font-bold text-slate-900">{column.title}</h3>
              <Badge variant="outline">{items.length}</Badge>
            </div>
            <div className="space-y-3">
              {items.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
                  No tasks
                </div>
              )}
              {items.map((request) => (
                <Card key={request.id} className="border-slate-200 bg-white shadow-sm hover:shadow-md">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">{request.title}</h4>
                      {(request.priority === 'high' || request.priority === 'critical') && (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs text-slate-600">{request.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="capitalize">
                        {(request.status || 'pending').replace(/_/g, ' ')}
                      </Badge>
                      {propertyById[request.property_id] && (
                        <Badge variant="outline">{propertyById[request.property_id]}</Badge>
                      )}
                      {request.job_code && <Badge variant="outline">{request.job_code}</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(request)}>
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </Button>
                      {!['completed', 'resolved'].includes(request.status || '') && (
                        <Button
                          size="sm"
                          className="flex-1 bg-green-700 hover:bg-green-800"
                          onClick={() => onComplete(request)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
