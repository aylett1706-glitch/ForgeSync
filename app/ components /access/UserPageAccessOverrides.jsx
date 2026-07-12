'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Search, Shield, Save, RotateCcw, Users } from 'lucide-react';
import { toast } from 'sonner';
import { ROLE_PAGE_GROUPS } from '@/components/access/roleAccessDefaults';
import { readStoredUserPageOverrides, writeStoredUserPageOverrides } from '@/components/access/roleAccess';

export default function UserPageAccessOverrides({ currentUser: initialUser }: { currentUser?: any }) {
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient<Database>();
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState<Record<string, any>>({});

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

  // Fetch organization users from Supabase instead of base44
  const { data: orgUsers = [] } = useQuery({
    queryKey: ['role-user-overrides', orgContextId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users') // Use 'profiles' if your user table is named differently
        .select('*')
        .eq('organization_id', orgContextId);

      if (error) throw error;
      return data;
    },
    enabled: !!orgContextId
  });

  useEffect(() => {
    const storedOverrides = readStoredUserPageOverrides();
    const next = orgUsers.reduce((acc: Record<string, any>, user: any) => {
      acc[user.id] = {
        ...user,
        allowed_pages_override: storedOverrides[user.id]?.allowed_pages_override || user.allowed_pages_override || [],
        blocked_pages_override: storedOverrides[user.id]?.blocked_pages_override || user.blocked_pages_override || []
      };
      return acc;
    }, {});
    setLocalUsers(next);
    if (!selectedUserId && orgUsers.length > 0) {
      setSelectedUserId(orgUsers[0].id);
    }
  }, [orgUsers]);

  const filteredUsers = useMemo(() => {
    return orgUsers.filter((user: any) => {
      const haystack = `${user.full_name || ''} ${user.email || ''} ${user.position || ''}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [orgUsers, search]);

  const selectedUser = selectedUserId ? localUsers[selectedUserId] : null;

  // Save mutation using Supabase
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error('No user selected');

      const { error } = await supabase
        .from('users') // Match your user table name here
        .update({
          allowed_pages_override: selectedUser.allowed_pages_override || [],
          blocked_pages_override: selectedUser.blocked_pages_override || []
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      // Update local storage cache
      const storedOverrides = readStoredUserPageOverrides();
      writeStoredUserPageOverrides({
        ...storedOverrides,
        [selectedUser.id]: {
          allowed_pages_override: selectedUser.allowed_pages_override || [],
          blocked_pages_override: selectedUser.blocked_pages_override || []
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-user-overrides'] });
      toast.success('Individual access override saved and applied');
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  });

  const togglePage = (mode: 'allow' | 'block', page: string) => {
    if (!selectedUser) return;
    const allowed = new Set(selectedUser.allowed_pages_override || []);
    const blocked = new Set(selectedUser.blocked_pages_override || []);

    if (mode === 'allow') {
      allowed.has(page) ? allowed.delete(page) : allowed.add(page);
      blocked.delete(page);
    }

    if (mode === 'block') {
      blocked.has(page) ? blocked.delete(page) : blocked.add(page);
      allowed.delete(page);
    }

    setLocalUsers((prev) => ({
      ...prev,
      [selectedUser.id]: {
        ...prev[selectedUser.id],
        allowed_pages_override: Array.from(allowed),
        blocked_pages_override: Array.from(blocked)
      }
    }));
  };

  const resetOverrides = () => {
    if (!selectedUser) return;
    setLocalUsers((prev) => ({
      ...prev,
      [selectedUser.id]: {
        ...prev[selectedUser.id],
        allowed_pages_override: [],
        blocked_pages_override: []
      }
    }));
  };

  if (!currentUser) {
    return <div className="p-8 text-center text-slate-500">Loading user overrides…</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900"><Users className="h-5 w-5 text-blue-600" /> Individual access</CardTitle>
          <CardDescription>Select a worker or user to give extra access or explicitly block a page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user…" />
          </div>
          <ScrollArea className="h-[520px] pr-3">
            <div className="space-y-2">
              {filteredUsers.map((user: any) => {
                const isSelected = selectedUserId === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                  >
                    <p className="font-medium text-slate-900">{user.full_name || user.email}</p>
                    <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                    <p className="mt-1 text-xs text-slate-500 capitalize">{user.position || user.role}</p>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900"><Shield className="h-5 w-5 text-indigo-600" /> User page overrides</CardTitle>
              <CardDescription>Allow or block individual pages for a specific person without changing their role.</CardDescription>
            </div>
            {selectedUser && <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">{selectedUser.full_name || selectedUser.email}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedUser ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-slate-500">Select a user to manage overrides.</div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={resetOverrides}><RotateCcw className="mr-2 h-4 w-4" /> Reset overrides</Button>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-blue-600 hover:bg-blue-700"><Save className="mr-2 h-4 w-4" /> Save overrides</Button>
              </div>
              <ScrollArea className="h-[520px] pr-3">
                <div className="space-y-5">
                  {ROLE_PAGE_GROUPS.map((group) => (
                    <div key={group.category} className="rounded-xl border p-4">
                      <h4 className="mb-3 font-semibold text-slate-800">{group.category}</h4>
                      <div className="space-y-3">
                        {group.pages.map((page) => {
                          const allowed = selectedUser.allowed_pages_override?.includes(page.page);
                          const blocked = selectedUser.blocked_pages_override?.includes(page.page);
                          return (
                            <div key={page.page} className="rounded-lg bg-slate-50 p-3">
                              <p className="text-sm font-medium text-slate-900">{page.label}</p>
                              <div className="mt-2 flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                  <Checkbox checked={allowed} onCheckedChange={() => togglePage('allow', page.page)} />
                                  <span>Allow individually</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                  <Checkbox checked={blocked} onCheckedChange={() => togglePage('block', page.page)} />
                                  <span>Block individually</span>
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
