'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShieldCheck } from 'lucide-react';

interface Requirement {
  id?: string;
  title?: string;
  summary?: string;
  sector?: string;
  country_code?: string;
  region_profile_id?: string;
}

interface PolicyPack {
  id?: string;
  pack_name?: string;
  summary?: string;
  sector?: string;
  country_code?: string;
  region_profile_id?: string;
}

interface Policy {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  summary?: string;
  category?: string;
  policy_type?: string;
  country_code?: string;
  region_profile_id?: string;
}

interface Region {
  id: string;
  country_code: string;
}

interface Props {
  requirements?: Requirement[];
  policyPacks?: PolicyPack[];
  policies?: Policy[];
  selectedRegion?: Region | null;
}

export default function GlobalComplianceSearch({
  requirements = [],
  policyPacks = [],
  policies = [],
  selectedRegion,
}: Props) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const combined = [
      ...requirements.map((item) => ({
        type: 'Legislation / requirement',
        title: item.title,
        summary: item.summary,
        sector: item.sector,
        country_code: item.country_code,
        region_profile_id: item.region_profile_id,
      })),
      ...policyPacks.map((item) => ({
        type: 'Policy pack',
        title: item.pack_name,
        summary: item.summary,
        sector: item.sector,
        country_code: item.country_code,
        region_profile_id: item.region_profile_id,
      })),
      ...policies.map((item) => ({
        type: 'Company policy',
        title: item.title || item.name,
        summary: item.description || item.summary,
        sector: item.category || item.policy_type,
        country_code: item.country_code,
        region_profile_id: item.region_profile_id,
      })),
    ];

    return combined
      .filter((item) => {
        if (!selectedRegion) return true;
        return (
          item.country_code === selectedRegion.country_code ||
          item.region_profile_id === selectedRegion.id
        );
      })
      .filter((item) =>
        [item.title, item.summary, item.sector, item.country_code]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(term)
      )
      .slice(0, 8);
  }, [query, requirements, policyPacks, policies, selectedRegion]);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold text-slate-950">Global Policy and Legislation Search</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search legislation acts, standards or company policies..."
            className="bg-white pl-10"
          />
        </div>

        <div className="mt-4 space-y-2">
          {query && results.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              No matching records for the selected region.
            </p>
          )}

          {results.map((item, index) => (
            <div
              key={`${item.type}-${item.title}-${index}`}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{item.type}</Badge>
                {item.country_code && (
                  <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                    {item.country_code}
                  </Badge>
                )}
                {item.sector && (
                  <Badge variant="secondary" className="capitalize">
                    {String(item.sector).replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
              <p className="mt-2 font-semibold text-slate-950">{item.title}</p>
              {item.summary && (
                <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
