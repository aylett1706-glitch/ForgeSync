'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Command, PlusCircle, Calendar, AlertTriangle, FileText, Users, Wrench, ListChecks, BarChart3 } from 'lucide-react';

interface NavItem {
  name: string;
  page: string;
  icon?: React.ElementType;
}

interface Record {
  id: string;
  type: string;
  title: string;
  page: string;
}

const getRecordTitle = (record: any, type: string): string => {
  if (type === 'Participant') {
    return [record.first_name, record.last_name].filter(Boolean).join(' ') || record.name || 'Participant';
  }
  if (type === 'Shift') {
    return `${record.start_time ? new Date(record.start_time).toLocaleString() : 'Shift'}${record.status ? ` • ${record.status}` : ''}`;
  }
  return record.title || record.name || record.subject || record.case_reference || record.job_code || record.id;
};

const pagePath = (page: string, orgId?: string | null): string => 
  orgId ? `/${page}?org_id=${orgId}` : `/${page}`;

interface Props {
  navItems?: NavItem[];
  managedOrgId?: string | null;
  organizationId?: string | null;
}

export default function GlobalCommandCenter({
  navItems = [],
  managedOrgId,
  organizationId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState<Record[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const quickActions = [
    { label: 'New Shift', page: 'Rostering', icon: Calendar, description: 'Open rostering to create or publish shifts' },
    { label: 'New Incident', page: 'Incidents', icon: AlertTriangle, description: 'Report or review a safety event' },
    { label: 'New Task', page: 'EnhancedTaskManagement', icon: ListChecks, description: 'Create and manage operational tasks' },
    { label: 'New Participant', page: 'Participants', icon: Users, description: 'Add or review client records' },
    { label: 'New Form', page: 'Forms', icon: FileText, description: 'Create forms and review submissions' },
    { label: 'Maintenance Job', page: 'Maintenance', icon: Wrench, description: 'Log property, asset, or repair work' },
    { label: 'Run Report', page: 'ReportingAnalytics', icon: BarChart3, description: 'Open analytics and reporting tools' },
  ].filter((action) =>
    navItems.some((item) => item.page === action.page)
  );

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Record search
  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setRecords([]);
      setLoadingRecords(false);
      return;
    }

    let active = true;
    const loadRecords = async () => {
      setLoadingRecords(true);

      const searchableEntities = [
        { entity: 'Participant', page: 'Participants' },
        { entity: 'Shift', page: 'Rostering' },
        { entity: 'Incident', page: 'Incidents' },
        { entity: 'Task', page: 'EnhancedTaskManagement' },
        { entity: 'Document', page: 'DocumentManagement' },
        { entity: 'MaintenanceRequest', page: 'Maintenance' },
      ];

      const allowedEntities = searchableEntities.filter((item) =>
        navItems.some((nav) => nav.page === item.page)
      );

      // TODO: Replace with real Supabase queries
      const results = await Promise.allSettled(
        allowedEntities.map(async ({ entity, page }) => {
          // Placeholder - replace with actual data fetching
          return [];
        })
      );

      if (!active) return;

      const term = query.toLowerCase();
      const flattened = results
        .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
        .filter((record) => JSON.stringify(record).toLowerCase().includes(term))
        .slice(0, 12);

      setRecords(flattened);
      setLoadingRecords(false);
    };

    const timer = setTimeout(loadRecords, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, query, navItems, organizationId]);

  const pageResults = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return navItems.slice(0, 8);
    return navItems.filter((item) => item.name.toLowerCase().includes(term)).slice(0, 8);
  }, [navItems, query]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 text-white/80 hover:bg-white/20 hover:text-white md:inline-flex"
        aria-label="Open global command centre"
      >
        <Command className="h-4 w-4" />
        <span className="text-sm">Command</span>
        <kbd className="rounded bg-white/15 px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-white/80 hover:bg-white/10 hover:text-white md:hidden"
        aria-label="Open global command centre"
      >
        <Search className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Command className="h-5 w-5 text-cyan-700" /> Global Command Centre
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, participants, shifts, incidents, tasks, documents…"
                className="pl-10"
                autoFocus
              />
            </div>

            {/* Quick Actions */}
            <section aria-labelledby="quick-actions-title">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 id="quick-actions-title" className="text-sm font-semibold text-slate-900">Quick Actions</h3>
                <Badge variant="outline">{quickActions.length} available</Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.page}
                      to={pagePath(action.page, managedOrgId)}
                      onClick={() => setOpen(false)}
                      className="flex min-h-16 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                    >
                      <span className="rounded-xl bg-cyan-50 p-2 text-cyan-700">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block font-semibold text-slate-900">
                          <PlusCircle className="mr-1 inline h-3.5 w-3.5" />{action.label}
                        </span>
                        <span className="block text-xs text-slate-600">{action.description}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Pages */}
            <section aria-labelledby="pages-title">
              <h3 id="pages-title" className="mb-2 text-sm font-semibold text-slate-900">Pages</h3>
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                {pageResults.map((item) => {
                  const Icon = item.icon || FileText;
                  return (
                    <Link
                      key={item.page}
                      to={pagePath(item.page, managedOrgId)}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                    >
                      <Icon className="h-4 w-4 text-cyan-700" />
                      <span className="font-medium text-slate-900">{item.name}</span>
                    </Link>
                  );
                })}
                {pageResults.length === 0 && (
                  <p className="px-4 py-5 text-sm text-slate-600">No matching pages found.</p>
                )}
              </div>
            </section>

            {/* Records */}
            <section aria-labelledby="records-title">
              <h3 id="records-title" className="mb-2 text-sm font-semibold text-slate-900">Records</h3>
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                {loadingRecords && (
                  <p className="px-4 py-5 text-sm text-slate-600">Searching records…</p>
                )}
                {!loadingRecords && records.map((record) => (
                  <Link
                    key={`${record.type}-${record.id}`}
                    to={pagePath(record.page, managedOrgId)}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-slate-900">{record.title}</span>
                      <span className="block text-xs text-slate-600">{record.type}</span>
                    </span>
                    <Badge variant="outline">Open</Badge>
                  </Link>
                ))}
                {!loadingRecords && query.trim().length >= 2 && records.length === 0 && (
                  <p className="px-4 py-5 text-sm text-slate-600">No matching records found.</p>
                )}
                {query.trim().length < 2 && (
                  <p className="px-4 py-5 text-sm text-slate-600">Type at least 2 characters to search records.</p>
                )}
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
