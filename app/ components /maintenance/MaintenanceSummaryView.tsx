'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Building2, Car, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

const PRIORITY_CLASSES: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  normal: 'bg-blue-100 text-blue-700 border-blue-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
};

const STATUS_CLASSES: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-purple-100 text-purple-700',
  open: 'bg-amber-100 text-amber-700',
  pending_safety_signoff: 'bg-red-100 text-red-700',
};

interface MaintenanceRequest {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  property_id?: string;
  asset_id?: string;
  assigned_to?: string;
  contractor_name?: string;
  contractor_company?: string;
  location?: string;
  category?: string;
}

interface Props {
  organizationId?: string;
  limit?: number;
}

export default function MaintenanceSummaryView({ organizationId, limit = 8 }: Props) {
  const { data: requests = [] } = useQuery({
    queryKey: ['dashboard-maintenance-summary', organizationId],
    queryFn: () => base44.entities.MaintenanceRequest.filter({ organization_id: organizationId }, '-updated_date', 100),
    enabled: !!organizationId,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['dashboard-maintenance-properties', organizationId],
    queryFn: () => base44.entities.Property.filter({ organization_id: organizationId }),
    enabled: !!organizationId,
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['dashboard-maintenance-assets', organizationId],
    queryFn: () => base44.entities.Asset.filter({ organization_id: organizationId }),
    enabled: !!organizationId,
  });

  const { data: workers = [] } = useQuery({
    queryKey: ['dashboard-maintenance-workers', organizationId],
    queryFn: () => base44.entities.User.filter({ organization_id: organizationId }),
    enabled: !!organizationId,
  });

  const activeRequests = requests.filter((item) => 
    !['completed', 'resolved', 'cancelled'].includes(item.status || '')
  );

  const rows = activeRequests.slice(0, limit).map((request: MaintenanceRequest) => {
    const property = properties.find((item) => item.id === request.property_id);
    const asset = assets.find((item) => item.id === request.asset_id);
    const assignee = workers.find((item) => item.id === request.assigned_to);
    const isVehicle = request.category === 'vehicle' || asset?.category === 'vehicle';
    return { request, property, asset, assignee, isVehicle };
  });

  return (
    <Card className="border-amber-100 bg-white">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wrench className="h-5 w-5 text-amber-600" /> 
          Property Maintenance Summary
        </CardTitle>
        <Badge className="bg-amber-100 text-amber-800">{activeRequests.length} active</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
            No active property, site or vehicle maintenance.
          </div>
        ) : (
          rows.map(({ request, property, asset, assignee, isVehicle }) => (
            <div key={request.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{request.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    {isVehicle ? <Car className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
                    {property?.name || asset?.name || request.location || 'General site'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className={STATUS_CLASSES[request.status || 'open'] || 'bg-slate-100 text-slate-700'}>
                    {request.status?.replace(/_/g, ' ') || 'open'}
                  </Badge>
                  <Badge variant="outline" className={PRIORITY_CLASSES[request.priority || 'normal']}>
                    {request.priority || 'normal'}
                  </Badge>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span>
                  Assignee: <strong>{assignee?.full_name || request.contractor_name || request.contractor_company || 'Unassigned'}</strong>
                </span>
                {request.priority === 'critical' && (
                  <span className="inline-flex items-center gap-1 text-red-700">
                    <AlertTriangle className="h-3.5 w-3.5" /> priority support needed
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        <Button asChild variant="outline" className="w-full">
          <Link to={createPageUrl('Maintenance')}>Open maintenance register</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
