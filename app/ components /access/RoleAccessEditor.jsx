'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Shield, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_SECTION_OPTIONS, DEFAULT_ROLE_ACCESS_PROFILES, ROLE_GROUPS, ROLE_OPTIONS, ROLE_PAGE_GROUPS } from '@/components/access/roleAccessDefaults';
import { buildRoleAccessProfilesMap, writeStoredRoleAccessProfiles } from '@/components/access/roleAccess';

const EMPTY_PROFILES: never[] = [];

export default function RoleAccessEditor({ currentUser: initialUser }: { currentUser?: any }) {
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient<Database>();
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [activeGroup, setActiveGroup] = useState('core');
  const [activeRole, setActiveRole] = useState('admin');

  // Fetch current user from Supabase if not provided
  useEffect(() => {
    if (!initialUser) {
      supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    }
  }, [initialUser, supabase]);

  const managedOrgId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('org_id') || sessionStorage.getItem('dev_selected_org_id')
    : null;
  const orgContextId = currentUser?.is_developer || currentUser?.position === 'app_developer' || currentUser?.email === 'michael.aylett@devonfield.com.au'
    ? (managedOrgId || currentUser?.organization_id)
    : currentUser?.organization_id;

  // Fetch role profiles from Supabase instead of base44
  const { data: profileRecords } = useQuery({
    queryKey: ['role-access-profiles', orgContextId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('RoleAccessProfile') // Use 'role_access_profile' if your table is snake_case
        .select('*')
        .eq('organization_id', orgContextId);

      if (error) throw error;
      return data;
    },
    enabled: !!orgContextId
  });

  const profiles = profileRecords || EMPTY_PROFILES;

  const storedMap = useMemo(() => buildRoleAccessProfilesMap(profiles), [profiles]);
  const mergedProfiles = useMemo(() => {
    return ROLE_OPTIONS.reduce((acc, role) => {
      acc[role.key] = {
        ...DEFAULT_ROLE_ACCESS_PROFILES[role.key],
        ...storedMap[role.key],
        allowed_pages: storedMap[role.key]?.allowed_pages || DEFAULT_ROLE_ACCESS_PROFILES[role.key].allowed_pages,
        allowed_admin_sections: storedMap[role.key]?.allowed_admin_sections || DEFAULT_ROLE_ACCESS_PROFILES[role.key].allowed_admin_sections,
      };
      return acc;
    }, {} as Record<string, any>);
  }, [storedMap]);

  const [localProfiles, setLocalProfiles] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    setLocalProfiles(mergedProfiles);
  }, [mergedProfiles]);

  // Save mutation using Supabase instead of base44
  const saveMutation = useMutation({
    mutationFn: async (roleKey: string) => {
      if (!localProfiles || !orgContextId) throw new Error('Missing required data');
      
      const profile = localProfiles[roleKey];
      const existing = profiles.find((item: any) => item.role_key === roleKey);
      const payload = {
        organization_id: orgContextId,
        role_key: roleKey,
        role_name: profile.role_name,
        home_dashboard: profile.home_dashboard,
        allowed_pages: profile.allowed_pages,
        allowed_admin_sections: profile.allowed_admin_sections,
        allowed_form_sectors: profile.allowed_form_sectors || [],
        allowed_form_categories: profile.allowed_form_categories || [],
        full_access: profile.full_access,
        notes: profile.notes || ''
      };

      if (existing) {
        const { error } = await supabase
          .from('RoleAccessProfile')
          .update(payload)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('RoleAccessProfile')
          .insert(payload);
        if (error) throw error;
      }

      const nextMap = { ...localProfiles, [roleKey]: payload };
      writeStoredRoleAccessProfiles(nextMap);
      return roleKey;
    },
    onSuccess: (roleKey) => {
      queryClient.invalidateQueries({ queryKey: ['role-access-profiles'] });
      toast.success(`${mergedProfiles[roleKey]?.role_name || 'Role'} access saved and applied`);
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  });

  const resetRole = (roleKey: string) => {
    setLocalProfiles((prev) => prev ? { ...prev, [roleKey]: { ...DEFAULT_ROLE_ACCESS_PROFILES[roleKey] } } : prev);
  };

  const updateRole = (roleKey: string, updates: Partial<any>) => {
    setLocalProfiles((prev) => prev ? {
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        ...updates
      }
    } : prev);
  };

  const togglePage = (roleKey: string, page: string) => {
    if (!localProfiles) return;
    const currentPages = localProfiles[roleKey].allowed_pages || [];
    const nextPages = currentPages.includes(page)
      ? currentPages.filter((item: string) => item !== page)
      : [...currentPages, page];
    updateRole(roleKey, { allowed_pages: nextPages });
  };

  const toggleAdminSection = (roleKey: string, sectionKey: string) => {
    if (!localProfiles) return;
    const currentSections = localProfiles[roleKey].allowed_admin_sections || [];
    const nextSections = currentSections.includes(sectionKey)
      ? currentSections.filter((item: string) => item !== sectionKey)
      : [...currentSections, sectionKey];
    updateRole(roleKey, { allowed_admin_sections: nextSections });
  };

  if (!currentUser || !localProfiles) {
    return <div className="p-8 text-center text-slate-500">Loading role access editor…</div>;
  }

  const rolesInActiveGroup = ROLE_OPTIONS.filter((role) => role.group === activeGroup);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Shield className="h-5 w-5 text-blue-600" /> Detailed Role Access
            </CardTitle>
            <CardDescription className="mt-1">Choose which pages and dashboard sections each detailed role or position can access.</CardDescription>
          </div>
          <Badge variant="outline" className="self-center rounded-full border-blue-200 bg-blue-50 px-4 py-1 text-center text-blue-700 sm:self-start">Developer controlled</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeRole} onValueChange={setActiveRole} className="w-full">
          <div className="mb-4 grid gap-3 lg:grid-cols-[260px_1fr]">
            <div>
              <Label>Role category</Label>
              <Select value={activeGroup} onValueChange={(value) => {
                setActiveGroup(value);
                const firstRole = ROLE_OPTIONS.find((role) => role.group === value);
                if (firstRole) setActiveRole(firstRole.key);
              }}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_GROUPS.map((group) => (
                    <SelectItem key={group.key} value={group.key}>{group.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role / position</Label>
              <div className="mt-2 flex flex-wrap justify-center gap-2 rounded-xl border bg-slate-50 p-3 sm:justify-start">
                {rolesInActiveGroup.map((role) => (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => setActiveRole(role.key)}
                    className={`min-w-[140px] rounded-full px-4 py-2 text-center text-sm transition-colors ${activeRole === role.key ? 'border border-slate-200 bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/80'}`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {ROLE_OPTIONS.map((role) => {
            const profile = localProfiles[role.key];
            return (
              <TabsContent key={role.key} value={role.key} className="mt-6 space-y-6">
                <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">{role.label}</CardTitle>
                      <CardDescription>Set the landing page and broad access mode for this role.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Home dashboard</Label>
                        <Select value={profile.home_dashboard} onValueChange={(value) => updateRole(role.key, { home_dashboard: value })}>
                          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ROLE_PAGE_GROUPS.flatMap((group) => group.pages).map((page) => (
                              <SelectItem key={page.page} value={page.page}>{page.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <label className="flex items-center gap-3 rounded-xl border bg-slate-50 p-3 text-sm font-medium text-slate-700">
                        <Checkbox checked={profile.full_access} onCheckedChange={(checked) => updateRole(role.key, { full_access: !!checked })} />
                        Full access for this role
                      </label>

                      <div>
                        <Label>Notes</Label>
                        <Input className="mt-2" value={profile.notes || ''} onChange={(e) => updateRole(role.key, { notes: e.target.value })} placeholder="Optional note for this role profile" />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" onClick={() => resetRole(role.key)} className="flex-1">
                          <RotateCcw className="mr-2 h-4 w-4" /> Reset
                        </Button>
                        <Button onClick={() => saveMutation.mutate(role.key)} disabled={saveMutation.isPending} className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <Save className="mr-2 h-4 w-4" /> Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <Card className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Allowed Pages</CardTitle>
                        <CardDescription>Turn page access on or off for this role.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[520px] pr-3">
                          <div className="space-y-5">
                            {ROLE_PAGE_GROUPS.map((group) => (
                              <div key={group.category} className="rounded-xl border p-4">
                                <h4 className="mb-3 font-semibold text-slate-800">{group.category}</h4>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                  {group.pages.map((page) => {
                                    const checked = profile.allowed_pages?.includes(page.page);
                                    return (
                                      <label key={page.page} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 cursor-pointer">
                                        <Checkbox checked={checked} onCheckedChange={() => togglePage(role.key, page.page)} />
                                        <span>{page.label}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {(role.key === 'admin' || role.group === 'leadership' || role.key === 'app_developer') && (
                      <Card className="border-slate-200">
                        <CardHeader>
                          <CardTitle className="text-lg">Admin Dashboard Sections</CardTitle>
                          <CardDescription>Choose which admin-only sections this role can use.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {ADMIN_SECTION_OPTIONS.map((section) => {
                              const checked = profile.allowed_admin_sections?.includes(section.key);
                              return (
                                <label key={section.key} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 cursor-pointer">
                                  <Checkbox checked={checked} onCheckedChange={() => toggleAdminSection(role.key, section.key)} />
                                  <span>{section.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
