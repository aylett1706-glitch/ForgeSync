'use client'; // Required for Next.js client components

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase'; // Add your Supabase types path
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const SECTORS = ['general', 'ndis', 'aged_care', 'mental_health', 'allied_health', 'child_family', 'education', 'hospital_clinical', 'supported_employment', 'security', 'community'];
const CATEGORIES = ['general', 'incident', 'safety', 'medical', 'participant', 'review', 'meeting', 'hr', 'education', 'clinical', 'hospital', 'child_safety', 'governance', 'consent', 'assessment', 'procedures'];

export default function FormAccessMatrix({ currentUser }) {
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient<Database>();
  const [resolvedUser, setResolvedUser] = useState(currentUser || null);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch current user from Supabase if not provided
  React.useEffect(() => {
    if (!currentUser) {
      const fetchUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          toast.error('Failed to load user data');
          return;
        }
        setResolvedUser(user);
      };
      fetchUser();
    }
  }, [currentUser, supabase]);

  const managedOrgId = new URLSearchParams(window.location.search).get('org_id') || sessionStorage.getItem('dev_selected_org_id');
  const isDeveloper = resolvedUser?.is_developer || resolvedUser?.position === 'app_developer' || resolvedUser?.email === 'michael.aylett@devonfield.com.au';
  const orgId = isDeveloper ? (managedOrgId || resolvedUser?.organization_id) : resolvedUser?.organization_id;

  // Fetch organization from Supabase
  const { data: organization, error: orgError } = useQuery({
    queryKey: ['form-access-org', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Organization')
        .select('*')
        .eq('id', orgId)
        .single();

      if (error) throw error;
      return data || null;
    },
    enabled: !!orgId,
    retry: false,
  });

  // Fetch form templates from Supabase
  const { data: templates = [], error: templateError } = useQuery({
    queryKey: ['form-access-templates', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('FormTemplate')
        .select('*')
        .eq('organization_id', orgId)
        .order('title', { ascending: true })
        .limit(500);

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
    initialData: [],
    retry: false,
  });

  // Load saved settings when org data loads
  React.useEffect(() => {
    if (organization) {
      const settings = organization.settings || {};
      setSelectedSectors(settings.allowed_form_sectors || organization.operating_sectors || ['general']);
      setSelectedCategories(settings.allowed_form_categories || CATEGORIES);
      setSelectedTemplateIds(settings.allowed_form_template_ids || []);
    }
  }, [organization]);

  // Save updates to Supabase
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error('No organization selected');

      const updatedSettings = {
        ...(organization?.settings || {}),
        allowed_form_sectors: selectedSectors,
        allowed_form_categories: selectedCategories,
        allowed_form_template_ids: selectedTemplateIds,
        form_access_mode: selectedTemplateIds.length > 0 ? 'specific_template_controlled' : 'role_and_sector_controlled',
      };

      const { data, error } = await supabase
        .from('Organization')
        .update({ settings: updatedSettings })
        .eq('id', orgId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-access-org'] });
      toast.success('Organisation form access saved');
    },
    onError: (err) => {
      toast.error(`Save failed: ${err.message}`);
    },
  });

  // --- ALL REMAINING LOGIC IS 100% UNCHANGED ---
  const filteredTemplates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return templates.filter((template) => {
      const sectorMatch = selectedSectors.includes(template.sector || 'general');
      const categoryMatch = selectedCategories.includes(template.category || 'general');
      const searchMatch = !query || `${template.title} ${template.description} ${template.category} ${template.sector}`.toLowerCase().includes(query);
      return sectorMatch && categoryMatch && searchMatch;
    });
  }, [templates, selectedSectors, selectedCategories, searchTerm]);

  const templatesBySector = useMemo(() => filteredTemplates.reduce((acc, template) => {
    const key = template.sector || 'general';
    if (!acc[key]) acc[key] = [];
    acc[key].push(template);
    return acc;
  }, {}), [filteredTemplates]);

  const accessSummary = useMemo(() => `${selectedSectors.length} sectors • ${selectedCategories.length} categories • ${selectedTemplateIds.length || 'all matching'} form types`, [selectedSectors, selectedCategories, selectedTemplateIds]);

  const toggle = (list, setList, value) => setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  const selectVisibleTemplates = () => setSelectedTemplateIds((prev) => [...new Set([...prev, ...filteredTemplates.map((template) => template.id)])]);
  const clearTemplateSelection = () => setSelectedTemplateIds([]);

  return (
    <Card className="border-emerald-200 bg-white/95 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-600" /> Organisation Form Access</CardTitle>
            <CardDescription>Control what form sectors and categories this organisation, company, or business can access.</CardDescription>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800">{accessSummary}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sectors Section - UNCHANGED */}
        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Allowed sectors</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SECTORS.map((sector) => (
              <label key={sector} className="flex items-center gap-3 rounded-xl border bg-slate-50 p-3 text-sm capitalize">
                <Checkbox checked={selectedSectors.includes(sector)} onCheckedChange={() => toggle(selectedSectors, setSelectedSectors, sector)} />
                {sector.replace(/_/g, ' ')}
              </label>
            ))}
          </div>
        </section>

        {/* Categories Section - UNCHANGED */}
        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Allowed categories</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category) => (
              <label key={category} className="flex items-center gap-3 rounded-xl border bg-slate-50 p-3 text-sm capitalize">
                <Checkbox checked={selectedCategories.includes(category)} onCheckedChange={() => toggle(selectedCategories, setSelectedCategories, category)} />
                {category.replace(/_/g, ' ')}
              </label>
            ))}
          </div>
        </section>

        {/* Templates Section - UNCHANGED */}
        <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-blue-900">Specific form types</h3>
              <p className="mt-1 text-sm text-blue-800">Choose exact templates for this industry. If none are selected, all matching sector/category forms remain available.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={selectVisibleTemplates} className="bg-white">Select visible</Button>
              <Button type="button" variant="outline" size="sm" onClick={clearTemplateSelection} className="bg-white">Allow all matching</Button>
            </div>
          </div>
          <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search form types for this industry..." className="mt-4 bg-white" />
          <div className="mt-4 max-h-[28rem] space-y-4 overflow-y-auto pr-1">
            {Object.entries(templatesBySector).map(([sector, sectorTemplates]) => (
              <div key={sector} className="rounded-xl border bg-white p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold capitalize text-slate-800">{sector.replace(/_/g, ' ')}</p>
                  <Badge variant="outline">{sectorTemplates.length} forms</Badge>
                </div>
                <div className="grid gap-2 lg:grid-cols-2">
                  {sectorTemplates.map((template) => (
                    <label key={template.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                      <Checkbox checked={selectedTemplateIds.includes(template.id)} onCheckedChange={() => toggle(selectedTemplateIds, setSelectedTemplateIds, template.id)} />
                      <span>
                        <span className="block font-semibold text-slate-900">{template.title}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{(template.category || 'general').replace(/_/g, ' ')} • {template.schema?.fields?.length || 0} fields</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {filteredTemplates.length === 0 && <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-500">No form templates match the selected industry rules.</p>}
          </div>
        </section>

        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-emerald-700 hover:bg-emerald-800">
          Save form access rules
        </Button>
      </CardContent>
    </Card>
  );
}
