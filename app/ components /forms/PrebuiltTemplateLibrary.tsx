'use client';

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  HeartPulse, Brain, Users, Shield, ClipboardList, FileText, Search, 
  AlertTriangle, Car, Briefcase, Stethoscope, Home, Activity, Scale,
  BookOpen, Phone, UserCheck, Flame, Droplets, CheckCircle2, Eye 
} from 'lucide-react';
import TemplatePreviewDialog from './TemplatePreviewDialog';

// Import all your upgraded catalogs
import { ELITE_FORM_TEMPLATE_CATALOG } from '@/data/eliteFormTemplateCatalog';
import { MEGA_INDUSTRY_TEMPLATE_CATALOG } from '@/data/megaIndustryTemplates';
import { INDUSTRY_500_TEMPLATE_CATALOG } from '@/data/industry500Templates';
import { HUB_WORKFLOW_TEMPLATE_CATALOG } from '@/data/hubFormTemplates';
import { HUB_WORKFLOW_TEMPLATE_ADDITIONS } from '@/data/hubWorkflowTemplateAdditions';
// ... import others as needed

const SECTOR_STYLES: Record<string, { label: string; icon: React.ElementType; badge: string; ring: string }> = {
  ndis: { label: 'NDIS', icon: Shield, badge: 'bg-blue-100 text-blue-800 border-transparent', ring: 'ring-blue-200' },
  aged_care: { label: 'Aged Care', icon: HeartPulse, badge: 'bg-rose-100 text-rose-800 border-transparent', ring: 'ring-rose-200' },
  mental_health: { label: 'Mental Health', icon: Brain, badge: 'bg-violet-100 text-violet-800 border-transparent', ring: 'ring-violet-200' },
  youth: { label: 'Youth', icon: Users, badge: 'bg-amber-100 text-amber-800 border-transparent', ring: 'ring-amber-200' },
  allied_health: { label: 'Allied Health', icon: Stethoscope, badge: 'bg-emerald-100 text-emerald-800 border-transparent', ring: 'ring-emerald-200' },
  community: { label: 'Community', icon: FileText, badge: 'bg-cyan-100 text-cyan-800 border-transparent', ring: 'ring-cyan-200' },
  education: { label: 'Education', icon: BookOpen, badge: 'bg-indigo-100 text-indigo-800 border-transparent', ring: 'ring-indigo-200' },
  hospital_clinical: { label: 'Hospital / Clinical', icon: Stethoscope, badge: 'bg-red-100 text-red-800 border-transparent', ring: 'ring-red-200' },
  child_family: { label: 'Child & Family', icon: Users, badge: 'bg-orange-100 text-orange-800 border-transparent', ring: 'ring-orange-200' },
  supported_employment: { label: 'Supported Employment', icon: Briefcase, badge: 'bg-lime-100 text-lime-800 border-transparent', ring: 'ring-lime-200' },
  security: { label: 'Security', icon: Shield, badge: 'bg-slate-100 text-slate-800 border-transparent', ring: 'ring-slate-200' },
  general: { label: 'General', icon: ClipboardList, badge: 'bg-slate-100 text-slate-800 border-transparent', ring: 'ring-slate-200' },
};

const normalizeSector = (sector: string) => 
  ({ clinical: 'hospital_clinical', hospital: 'hospital_clinical' }[sector] || sector || 'general');

export default function PrebuiltTemplateLibrary({
  templates = [], // Already installed templates
  onInstall,
  installingKey,
  organization,
  allowedSectors,
  isDeveloper = false,
}: {
  templates: any[];
  onInstall: (template: any) => void;
  installingKey?: string;
  organization?: any;
  allowedSectors?: Set<string>;
  isDeveloper?: boolean;
}) {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);

  const [search, setSearch] = useState(urlParams.get('search') || '');
  const [sectorFilter, setSectorFilter] = useState(urlParams.get('sector') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(urlParams.get('category') || 'all');
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  // Combine all catalogs
  const fullCatalog = [
    ...INDUSTRY_500_TEMPLATE_CATALOG,
    ...MEGA_INDUSTRY_TEMPLATE_CATALOG,
    ...HUB_WORKFLOW_TEMPLATE_CATALOG,
    ...HUB_WORKFLOW_TEMPLATE_ADDITIONS,
    ...ELITE_FORM_TEMPLATE_CATALOG,
    // Add more catalogs as needed
  ];

  const catalog = allowedSectors 
    ? fullCatalog.filter(t => allowedSectors.has(normalizeSector(t.sector)))
    : fullCatalog;

  const installedKeys = new Set(templates.map(t => t.title));

  const filtered = useMemo(() => {
    return catalog.filter(template => {
      const searchTerms = search.toLowerCase().split(/\s+/).filter(Boolean);
      const haystack = [template.title, template.description, template.key, template.category, normalizeSector(template.sector)]
        .join(' ').toLowerCase();

      const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => haystack.includes(term));
      const matchesSector = sectorFilter === 'all' || normalizeSector(template.sector) === sectorFilter;
      const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;

      return matchesSearch && matchesSector && matchesCategory;
    });
  }, [catalog, search, sectorFilter, categoryFilter]);

  const categories = ['all', ...new Set(catalog.map(t => t.category))];
  const sectors = ['all', ...new Set(catalog.map(t => normalizeSector(t.sector)))];

  const sectorCounts = catalog.reduce((acc, t) => {
    const s = normalizeSector(t.sector);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const installedCount = catalog.filter(t => installedKeys.has(t.title)).length;

  return (
    <div className="space-y-8">
      {allowedSectors && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
          Showing templates matched to this organisation’s selected industry/field.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{catalog.length}</p>
            <p className="text-sm text-muted-foreground">Available Templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-emerald-600">{installedCount}</p>
            <p className="text-sm text-muted-foreground">Installed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-amber-600">{catalog.length - installedCount}</p>
            <p className="text-sm text-muted-foreground">Ready to Install</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>
      </div>

      {/* Sector Filters */}
      <div className="flex flex-wrap gap-2">
        {sectors.map(s => {
          const cfg = SECTOR_STYLES[s] || SECTOR_STYLES.general;
          return (
            <button
              key={s}
              onClick={() => setSectorFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all flex items-center gap-2 ${
                sectorFilter === s 
                  ? `${cfg.badge} ring-1 ${cfg.ring}` 
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'All Sectors' : cfg.label}
              <span className="text-xs bg-white/30 px-1.5 py-0.5 rounded-full font-mono">
                {sectorCounts[s] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(template => {
          const cfg = SECTOR_STYLES[normalizeSector(template.sector)] || SECTOR_STYLES.general;
          const Icon = cfg.icon;
          const installed = installedKeys.has(template.title);

          return (
            <Card key={template.key} className="group hover:shadow-xl transition-all border-slate-200 hover:-translate-y-0.5">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${cfg.badge.split(' ')[0]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-base leading-tight">{template.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                  {installed && <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1" />}
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={cfg.badge}>{cfg.label}</Badge>
                  <Badge variant="outline" className="capitalize">{template.category}</Badge>
                  <Badge variant="outline">{template.schema.fields.length} fields</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>

                  <Button 
                    size="sm"
                    variant={installed ? "secondary" : "default"}
                    disabled={installed || installingKey === template.key}
                    onClick={() => onInstall(template)}
                  >
                    {installed ? 'Installed' : installingKey === template.key ? 'Installing...' : 'Install Template'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          No templates match your filters.
        </div>
      )}

      <TemplatePreviewDialog 
        template={previewTemplate} 
        onClose={() => setPreviewTemplate(null)} 
      />
    </div>
  );
}
