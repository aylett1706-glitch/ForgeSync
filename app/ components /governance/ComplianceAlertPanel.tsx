'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface Requirement {
  id?: string;
  country_code?: string;
  region_profile_id?: string;
  risk_level?: string;
}

interface PolicyPack {
  id?: string;
  country_code?: string;
  region_profile_id?: string;
}

interface Region {
  id: string;
  country_name: string;
  country_code: string;
}

interface Props {
  requirements?: Requirement[];
  policyPacks?: PolicyPack[];
  selectedRegion?: Region | null;
}

export default function ComplianceAlertPanel({ 
  requirements = [], 
  policyPacks = [], 
  selectedRegion 
}: Props) {
  const activeRequirements = selectedRegion
    ? requirements.filter((item) => 
        item.country_code === selectedRegion.country_code || 
        item.region_profile_id === selectedRegion.id
      )
    : requirements;

  const activePacks = selectedRegion
    ? policyPacks.filter((item) => 
        item.country_code === selectedRegion.country_code || 
        item.region_profile_id === selectedRegion.id
      )
    : policyPacks;

  const criticalCount = activeRequirements.filter((item) => 
    ['critical', 'high'].includes(item.risk_level || '')
  ).length;

  return (
    <Card className="border-amber-100 bg-amber-50/70">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-amber-500 p-3 text-white">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-950">Compliance Alerts</h2>
            <p className="mt-1 text-sm text-slate-700">
              {selectedRegion 
                ? `${selectedRegion.country_name} scoped alerts` 
                : 'All organisation regions'
              } are currently driving this dashboard.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="bg-white text-amber-800 hover:bg-white">
                {criticalCount} high-priority requirements
              </Badge>
              <Badge className="bg-white text-amber-800 hover:bg-white">
                {activePacks.length} active policy packs
              </Badge>
              <Badge className="bg-white text-amber-800 hover:bg-white">
                Org-only data view
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
