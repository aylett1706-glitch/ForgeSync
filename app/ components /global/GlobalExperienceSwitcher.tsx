'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Globe2, Languages, MapPin, Mic, MicOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  applyGlobalExperience, 
  buildGlobalExperience, 
  buildGlobalExperienceFromSelection, 
  getDefaultOperatingAreaForRegion, 
  getLanguage, 
  getRegion, 
  getUiText, 
  resolveOperatingAreaForRegion, 
  SUPPORTED_LANGUAGES, 
  SUPPORTED_REGIONS 
} from '@/lib/globalExperience';
import { getOperatingArea, OPERATING_AREAS } from '@/lib/regionalCompliance';

interface User {
  id?: string;
  preferred_language?: string;
  preferred_region?: string;
  preferred_operating_area?: string;
  voice_controls_enabled?: boolean;
}

interface Props {
  user?: User;
}

export default function GlobalExperienceSwitcher({ user }: Props) {
  const [saving, setSaving] = useState(false);
  const [experience, setExperience] = useState(() => buildGlobalExperience(user));
  const [regionQuery, setRegionQuery] = useState('');
  const [languageQuery, setLanguageQuery] = useState('');

  useEffect(() => {
    const nextExperience = buildGlobalExperience(user);
    setExperience(nextExperience);
    applyGlobalExperience(nextExperience);
  }, [user]);

  const voiceSupported = useMemo(() => 
    typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  , []);

  const text = getUiText(experience.language_code);

  const filteredRegions = useMemo(() => 
    SUPPORTED_REGIONS.filter((region) =>
      region.label.toLowerCase().includes(regionQuery.toLowerCase()) ||
      region.code.toLowerCase().includes(regionQuery.toLowerCase())
    )
  , [regionQuery]);

  const filteredLanguages = useMemo(() => 
    SUPPORTED_LANGUAGES.filter((language) =>
      language.label.toLowerCase().includes(languageQuery.toLowerCase()) ||
      language.code.toLowerCase().includes(languageQuery.toLowerCase())
    )
  , [languageQuery]);

  const filteredOperatingAreas = useMemo(() => {
    const customAreas = OPERATING_AREAS.filter(
      (area) => experience.region_code === 'GLOBAL' || area.country === experience.region_code
    );
    return customAreas.length ? customAreas : [getOperatingArea(experience.region_code)];
  }, [experience.region_code]);

  const saveExperience = (updates: Partial<any>) => {
    const current = buildGlobalExperienceFromSelection(experience, updates);
    setExperience(current);
    applyGlobalExperience(current);

    if (!user?.id) return;

    setSaving(true);
    base44.auth.updateMe({
      preferred_language: current.language_code,
      preferred_region: current.region_code,
      preferred_operating_area: current.operating_area_code,
      preferred_timezone: current.timezone,
      preferred_currency: current.currency_code,
      preferred_date_format: current.date_format,
      regional_compliance_framework: getOperatingArea(current.operating_area_code).complianceFramework,
      regional_funding_model: getOperatingArea(current.operating_area_code).fundingModel,
      regional_content_scope: JSON.stringify(current.content_scope),
      regional_policy_status: JSON.stringify(current.regional_policy_status),
      voice_controls_enabled: current.voice_controls_enabled,
      ai_language_mode: current.ai_language_mode,
    }).finally(() => setSaving(false));
  };

  const selectLanguage = (code: string) => {
    saveExperience({ language_code: code });
  };

  const selectRegion = (code: string) => {
    const region = getRegion(code);
    const area = resolveOperatingAreaForRegion(
      region.code, 
      getDefaultOperatingAreaForRegion(region.code)
    );
    saveExperience({ 
      region_code: region.code, 
      operating_area_code: area.code, 
      timezone: area.timezone || region.timezone, 
      currency_code: region.currency, 
      date_format: region.dateFormat 
    });
  };

  const selectOperatingArea = (code: string) => {
    const area = getOperatingArea(code);
    const region = getRegion(area.country === 'GLOBAL' ? 'GLOBAL' : area.country);
    saveExperience({ 
      region_code: region.code, 
      operating_area_code: area.code, 
      timezone: area.timezone || region.timezone, 
      currency_code: region.currency, 
      date_format: region.dateFormat 
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex text-white/80 hover:text-white hover:bg-white/10"
          aria-label="Change region, language and voice controls"
          aria-busy={saving}
        >
          <Globe2 className="w-4 h-4" />
          <span className="hidden xl:inline">{experience.operating_area_code || experience.region_code}</span>
          <span className="hidden xl:inline">{getLanguage(experience.language_code).short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[80vh] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe2 className="w-4 h-4" /> {text.globalExperience}
        </DropdownMenuLabel>
        <div className="px-2 pb-2 text-xs text-slate-500">
          {text.description}
        </div>

        <div className="mx-2 mb-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
          <div><strong>{text.language}:</strong> {experience.language_label}</div>
          <div><strong>{text.operatingArea}:</strong> {experience.operating_area_label}</div>
          <div><strong>Timezone:</strong> {experience.timezone}</div>
          <div><strong>Region rule:</strong> {experience.content_scope?.content_rule}</div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs uppercase text-slate-500">{text.region}</DropdownMenuLabel>
        <div className="px-2 pb-2">
          <input
            value={regionQuery}
            onChange={(event) => setRegionQuery(event.target.value)}
            placeholder="Search all countries..."
            className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        {filteredRegions.map((region) => (
          <DropdownMenuItem 
            key={region.code} 
            onClick={() => selectRegion(region.code)} 
            className="justify-between"
          >
            <span>{region.label}</span>
            {experience.region_code === region.code && (
              <span className="text-xs font-semibold text-primary">{text.active}</span>
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-2 text-xs uppercase text-slate-500">
          <MapPin className="w-3.5 h-3.5" /> {text.operatingArea}
        </DropdownMenuLabel>
        {filteredOperatingAreas.map((area) => (
          <DropdownMenuItem 
            key={area.code} 
            onClick={() => selectOperatingArea(area.code)} 
            className="justify-between"
          >
            <span>{area.label}</span>
            {experience.operating_area_code === area.code && (
              <span className="text-xs font-semibold text-primary">{text.active}</span>
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-2 text-xs uppercase text-slate-500">
          <Languages className="w-3.5 h-3.5" /> {text.language}
        </DropdownMenuLabel>
        <div className="px-2 pb-2">
          <input
            value={languageQuery}
            onChange={(event) => setLanguageQuery(event.target.value)}
            placeholder="Search all languages..."
            className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        {filteredLanguages.map((language) => (
          <DropdownMenuItem 
            key={language.code} 
            onClick={() => selectLanguage(language.code)} 
            className="justify-between"
          >
            <span>{language.label}</span>
            {experience.language_code === language.code && (
              <span className="text-xs font-semibold text-primary">{text.active}</span>
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => saveExperience({ voice_controls_enabled: !experience.voice_controls_enabled })}
          className="justify-between"
        >
          <span className="flex items-center gap-2">
            {experience.voice_controls_enabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            {text.voiceControls}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {!voiceSupported ? text.limited : experience.voice_controls_enabled ? text.on : text.off}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
