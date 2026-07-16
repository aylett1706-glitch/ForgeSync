'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface Region {
  id: string;
  country_name: string;
  country_code?: string;
  state_region?: string;
  privacy_framework?: string;
  care_quality_framework?: string;
}

interface Props {
  regions: Region[];
  selectedRegionId?: string | null;
  onRegionChange: (regionId: string) => void;
}

export default function RegionSelectorPanel({
  regions = [],
  selectedRegionId,
  onRegionChange,
}: Props) {
  const selectedRegion = regions.find((region) => region.id === selectedRegionId);

  return (
    <Card className="border-blue-100 bg-blue-50/70">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-blue-600 p-3 text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-950">Regional Compliance Selector</h2>
              <p className="mt-1 text-sm text-slate-600">
                Switch region to automatically scope policy packs, legislation references and alerts shown on this dashboard.
              </p>
            </div>
          </div>

          <Select 
            value={selectedRegionId || 'all'} 
            onValueChange={onRegionChange}
          >
            <SelectTrigger className="w-full bg-white lg:w-80">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All selected organisation regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.country_name}
                  {region.state_region ? ` · ${region.state_region}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedRegion && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-white">
              {selectedRegion.country_code}
            </Badge>
            {selectedRegion.privacy_framework && (
              <Badge variant="outline" className="bg-white">
                {selectedRegion.privacy_framework}
              </Badge>
            )}
            {selectedRegion.care_quality_framework && (
              <Badge variant="outline" className="bg-white">
                {selectedRegion.care_quality_framework}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
