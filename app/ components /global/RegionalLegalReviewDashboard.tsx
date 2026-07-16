'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe2, ShieldCheck, FileCheck2, AlertTriangle, Scale } from 'lucide-react';

interface Profile {
  country_code?: string;
}

interface PolicyPack {
  id?: string;
  pack_name: string;
  jurisdiction?: string;
  sector?: string;
  approval_status?: string;
}

interface Requirement {
  id?: string;
}

interface Props {
  profiles?: Profile[];
  requirements?: Requirement[];
  policyPacks?: PolicyPack[];
}

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending_review: 'bg-amber-100 text-amber-700 border-amber-200',
  draft: 'bg-blue-100 text-blue-700 border-blue-200',
  needs_update: 'bg-orange-100 text-orange-700 border-orange-200',
  archived: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function RegionalLegalReviewDashboard({ 
  profiles = [], 
  requirements = [], 
  policyPacks = [] 
}: Props) {
  const review = useMemo(() => {
    const countries = new Set(profiles.map((profile) => profile.country_code).filter(Boolean));
    const reviewed = policyPacks.filter((pack) => pack.approval_status === 'approved').length;
    const pending = policyPacks.filter((pack) => ['draft', 'pending_review', 'needs_update'].includes(pack.approval_status)).length;
    const countriesWithPacks = new Set(policyPacks.map((pack) => pack.country_code).filter(Boolean));
    const missingPackCountries = [...countries].filter((country) => !countriesWithPacks.has(country));

    return {
      countries: countries.size,
      requirements: requirements.length,
      policyPacks: policyPacks.length,
      reviewed,
      pending,
      missingPackCountries,
    };
  }, [profiles, requirements, policyPacks]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-amber-500 p-3 text-white">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Regional Legal Review Status</h2>
              <p className="mt-2 text-sm text-slate-700">
                Policy packs are readiness templates until reviewed by qualified local compliance or legal advisers for each operating market.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric icon={Globe2} label="Regions" value={review.countries} />
                <Metric icon={FileCheck2} label="Rules" value={review.requirements} />
                <Metric icon={CheckCircle2} label="Approved" value={review.reviewed} />
                <Metric icon={AlertTriangle} label="Needs review" value={review.pending} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Policy Pack Coverage</h2>
              <p className="mt-2 text-sm text-slate-600">
                Every active region should have at least one policy pack and one compliance requirement before market launch.
              </p>
            </div>
            {review.missingPackCountries.length ? (
              <Badge className="border-red-200 bg-red-50 text-red-700">
                {review.missingPackCountries.length} gaps
              </Badge>
            ) : (
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Covered</Badge>
            )}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {policyPacks.slice(0, 8).map((pack) => (
              <div key={pack.id || `${pack.country_code}-${pack.pack_name}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{pack.pack_name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {pack.jurisdiction} · {pack.sector?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <Badge className={STATUS_STYLES[pack.approval_status] || STATUS_STYLES.draft}>
                    {(pack.approval_status || 'draft').replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
}) {
  return (
    <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
      <Icon className="h-4 w-4 text-amber-600" />
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}
