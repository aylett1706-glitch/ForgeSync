'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Languages, ShieldCheck } from 'lucide-react';

interface RegionProfile {
  country_name: string;
  country_code: string;
  state_region?: string;
  scope_level?: string;
  continent?: string;
  supported_languages?: string[];
  primary_language?: string;
  privacy_framework?: string;
}

interface Props {
  profile: RegionProfile;
}

export default function RegionProfileCard({ profile }: Props) {
  const languages = profile.supported_languages?.length 
    ? profile.supported_languages 
    : [profile.primary_language].filter(Boolean);

  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg text-slate-950">{profile.country_name}</CardTitle>
            <p className="mt-1 text-sm text-slate-600">
              {profile.state_region || 'National'} · {profile.scope_level}
            </p>
          </div>
          <Badge variant="outline" className="uppercase">
            {profile.country_code}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-700" />
          {profile.continent || 'Global'}
        </div>
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-blue-700" />
          {languages.join(', ') || 'Language not set'}
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-700" />
          {profile.privacy_framework || 'Compliance framework pending'}
        </div>
      </CardContent>
    </Card>
  );
}
