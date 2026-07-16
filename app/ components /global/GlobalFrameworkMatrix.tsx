'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe2 } from 'lucide-react';

interface Continent {
  key: string;
  label: string;
  focus: string;
}

interface Profile {
  continent: string;
  [key: string]: any;
}

const CONTINENTS: Continent[] = [
  { 
    key: 'africa', 
    label: 'Africa', 
    focus: 'Country, state/province and local authority requirements' 
  },
  { 
    key: 'asia', 
    label: 'Asia', 
    focus: 'National law, provincial controls and language localisation' 
  },
  { 
    key: 'europe', 
    label: 'Europe', 
    focus: 'GDPR, local care standards and worker safety frameworks' 
  },
  { 
    key: 'north_america', 
    label: 'North America', 
    focus: 'Federal, state/provincial and county-level compliance' 
  },
  { 
    key: 'oceania', 
    label: 'Oceania', 
    focus: 'Australia, New Zealand and Pacific jurisdiction controls' 
  },
  { 
    key: 'south_america', 
    label: 'South America', 
    focus: 'National legislation and local service standards' 
  },
  { 
    key: 'antarctica', 
    label: 'Antarctica', 
    focus: 'Remote work, emergency and expedition safety controls' 
  },
];

interface Props {
  profiles: Profile[];
}

export default function GlobalFrameworkMatrix({ profiles = [] }: Props) {
  const counts = profiles.reduce((acc: Record<string, number>, profile) => {
    const continent = profile.continent || 'other';
    acc[continent] = (acc[continent] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-950">
          <Globe2 className="h-5 w-5 text-blue-700" /> 
          Global Operating Framework
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {CONTINENTS.map((continent) => (
          <div key={continent.key} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-950">{continent.label}</p>
              <Badge variant="outline">
                {counts[continent.key] || 0} profiles
              </Badge>
            </div>
            <p className="mt-2 text-sm text-slate-600">{continent.focus}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
