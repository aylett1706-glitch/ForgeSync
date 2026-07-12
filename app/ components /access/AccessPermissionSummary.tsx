import React, { useMemo, useState } from 'react';
import { CheckCircle2, Search, ShieldAlert, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ROLE_OPTIONS, ROLE_PAGE_GROUPS, ADMIN_SECTION_OPTIONS } from '@/components/access/roleAccessDefaults';
import { readStoredRoleAccessProfiles } from '@/components/access/roleAccess';

const allPages = ROLE_PAGE_GROUPS.flatMap((group) => group.pages.map((page) => ({ ...page, category: group.category })));
const pageNameSet = new Set(allPages.map((page) => page.page));
const adminSectionSet = new Set(ADMIN_SECTION_OPTIONS.map((section) => section.key));

export default function AccessPermissionSummary() {
  const [search, setSearch] = useState('');
  const profiles = readStoredRoleAccessProfiles();

  const rows = useMemo(() => ROLE_OPTIONS.map((role) => {
    const profile = profiles[role.key] || profiles.user || {};
    const allowedPages = profile.allowed_pages || [];
    const invalidPages = allowedPages.filter((page) => !pageNameSet.has(page));
    const invalidSections = (profile.allowed_admin_sections || []).filter((section) => !adminSectionSet.has(section));

    return {
      ...role,
      profile,
      allowedPages,
      blockedPages: allPages.filter((page) => !allowedPages.includes(page.page)),
      invalidPages,
      invalidSections,
      valid: invalidPages.length === 0 && invalidSections.length === 0,
    };
  }).filter((row) => {
    const query = search.toLowerCase();
    return !query || row.label.toLowerCase().includes(query) || row.key.toLowerCase().includes(query);
  }), [profiles, search]);

  const invalidCount = rows.filter((row) => !row.valid).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{ROLE_OPTIONS.length}</CardTitle>
            <CardDescription>roles reviewed</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{allPages.length}</CardTitle>
            <CardDescription>pages checked</CardDescription>
          </CardHeader>
        </Card>
        <Card className={invalidCount ? 'border-amber-300' : 'border-emerald-200'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {invalidCount ? <ShieldAlert className="h-5 w-5 text-amber-600" /> : <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              {invalidCount ? `${invalidCount} to review` : 'All valid'}
            </CardTitle>
            <CardDescription>permission references</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Who can access what</CardTitle>
              <CardDescription>Clear role-by-role list of allowed pages, blocked pages, admin areas, and permission issues.</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search roles..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.map((row) => (
            <div key={row.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900">{row.label}</h3>
                    <Badge variant={row.profile.full_access ? 'default' : 'secondary'}>{row.profile.full_access ? 'Full access' : row.group.replace(/_/g, ' ')}</Badge>
                    {row.valid ? <Badge className="bg-emerald-100 text-emerald-800">Valid</Badge> : <Badge className="bg-amber-100 text-amber-800">Review needed</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Home: {row.profile.home_dashboard || 'Not set'} · {row.profile.notes || 'No notes saved'}</p>
                </div>
                <div className="text-sm text-slate-600 lg:text-right">
                  <div>{row.allowedPages.length} allowed</div>
                  <div>{row.blockedPages.length} not accessible</div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700">Can access</p>
                  <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl bg-emerald-50 p-3">
                    {allPages.filter((page) => row.allowedPages.includes(page.page)).map((page) => <Badge key={page.page} className="bg-white text-emerald-800 border border-emerald-200">{page.label}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Cannot access</p>
                  <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl bg-slate-50 p-3">
                    {row.blockedPages.map((page) => <Badge key={page.page} variant="outline" className="text-slate-600">{page.label}</Badge>)}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-700">Admin areas</p>
                  <div className="flex flex-wrap gap-2 rounded-xl bg-indigo-50 p-3">
                    {(row.profile.allowed_admin_sections || []).length ? (row.profile.allowed_admin_sections || []).map((key) => {
                      const section = ADMIN_SECTION_OPTIONS.find((item) => item.key === key);
                      return <Badge key={key} className="bg-white text-indigo-800 border border-indigo-200">{section?.label || key}</Badge>;
                    }) : <span className="text-sm text-slate-500">No admin-only areas</span>}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-700">Validation</p>
                  <div className="rounded-xl bg-amber-50 p-3 text-sm text-slate-700">
                    {row.valid ? (
                      <span className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="h-4 w-4" /> All saved page and admin references are valid.</span>
                    ) : (
                      <div className="space-y-1">
                        {[...row.invalidPages, ...row.invalidSections].map((item) => <div key={item} className="flex items-center gap-2 text-amber-800"><XCircle className="h-4 w-4" /> {item}</div>)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
