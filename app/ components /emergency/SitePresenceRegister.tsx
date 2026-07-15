'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LogIn, LogOut, UserPlus, Users, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

type PersonType = 'worker' | 'client' | 'contractor' | 'visitor';

interface SitePresence {
  id: string;
  person_type: PersonType;
  full_name: string;
  company?: string;
  phone?: string;
  purpose?: string;
  notes?: string;
  check_in_at: string;
  check_out_at?: string;
  status: 'onsite' | 'checked_out';
  signed_in_by?: string;
}

interface Props {
  organizationId: string;
  propertyId: string;
  participants?: any[];
  workers?: any[];
  contractors?: any[];
  user: any;
  onOnsiteChange?: (onsite: SitePresence[]) => void;
}

const PERSON_TYPES: { value: PersonType; label: string }[] = [
  { value: 'visitor', label: 'Visitor' },
  { value: 'worker', label: 'Worker' },
  { value: 'client', label: 'Client' },
  { value: 'contractor', label: 'Contractor' },
];

export default function SitePresenceRegister({
  organizationId,
  propertyId,
  participants = [],
  workers = [],
  contractors = [],
  user,
  onOnsiteChange,
}: Props) {
  const supabase = createClient();

  const [form, setForm] = useState({
    person_type: 'visitor' as PersonType,
    person_id: '',
    full_name: '',
    company: '',
    phone: '',
    purpose: '',
    notes: '',
  });

  const [presence, setPresence] = useState<SitePresence[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<PersonType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch presence
  const fetchPresence = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_presence')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('property_id', propertyId)
      .order('check_in_at', { ascending: false });

    if (error) {
      toast.error('Failed to load site register');
    } else {
      setPresence(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!organizationId || !propertyId) return;
    fetchPresence();

    // Realtime subscription
    const channel = supabase
      .channel('site-presence')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'site_presence' }, 
        () => fetchPresence()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [organizationId, propertyId]);

  const onsite = useMemo(() => 
    presence.filter(p => p.status === 'onsite'), [presence]
  );

  useEffect(() => {
    onOnsiteChange?.(onsite);
  }, [onsite, onOnsiteChange]);

  const peopleOptions = useMemo(() => {
    if (form.person_type === 'client') {
      return participants.map(p => ({
        id: p.id,
        label: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email || 'Client',
        phone: p.phone || '',
        company: ''
      }));
    }
    if (form.person_type === 'worker') {
      return workers.map(w => ({
        id: w.id,
        label: w.name || `${w.first_name || ''} ${w.last_name || ''}`.trim() || w.email || 'Worker',
        phone: w.phone || '',
        company: ''
      }));
    }
    if (form.person_type === 'contractor') {
      return contractors.map(c => ({
        id: c.id,
        label: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email || 'Contractor',
        phone: c.phone || '',
        company: c.company || c.contractor_company || ''
      }));
    }
    return [];
  }, [form.person_type, participants, workers, contractors]);

  const filteredOnsite = useMemo(() => {
    return onsite.filter(entry => 
      (entry.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (entry.company || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === 'all' || entry.person_type === filterType)
    );
  }, [onsite, searchTerm, filterType]);

  const checkIn = async () => {
    if (!form.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }

    const { error } = await supabase.from('site_presence').insert({
      organization_id: organizationId,
      property_id: propertyId,
      person_type: form.person_type,
      person_id: form.person_id || null,
      full_name: form.full_name.trim(),
      company: form.company.trim() || null,
      phone: form.phone.trim() || null,
      purpose: form.purpose.trim() || null,
      notes: form.notes.trim() || null,
      status: 'onsite',
      signed_in_by: user?.full_name || user?.email || 'System',
    });

    if (error) {
      toast.error('Failed to check in');
    } else {
      toast.success('Successfully checked in');
      setForm({ person_type: 'visitor', person_id: '', full_name: '', company: '', phone: '', purpose: '', notes: '' });
    }
  };

  const checkOut = async (id: string) => {
    const { error } = await supabase
      .from('site_presence')
      .update({
        status: 'checked_out',
        check_out_at: new Date().toISOString(),
        signed_out_by: user?.full_name || user?.email || 'System',
      })
      .eq('id', id);

    if (error) toast.error('Failed to check out');
    else toast.success('Checked out successfully');
  };

  const bulkCheckout = async () => {
    if (!confirm(`Check out all ${filteredOnsite.length} people?`)) return;

    const ids = filteredOnsite.map(p => p.id);
    const { error } = await supabase
      .from('site_presence')
      .update({
        status: 'checked_out',
        check_out_at: new Date().toISOString(),
        signed_out_by: user?.full_name || user?.email || 'System',
      })
      .in('id', ids);

    if (error) toast.error('Bulk checkout failed');
    else toast.success('All selected checked out');
  };

  const handleKnownPerson = (personId: string) => {
    const selected = peopleOptions.find(p => p.id === personId);
    if (selected) {
      setForm(prev => ({
        ...prev,
        person_id: personId,
        full_name: selected.label,
        company: selected.company || prev.company,
        phone: selected.phone || prev.phone,
      }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            Site Presence Register
          </CardTitle>
          <Badge variant="secondary" className="text-lg px-4 py-1">
            Onsite: {onsite.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Check-in Form */}
        <div className="rounded-2xl border bg-slate-50 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Person Type</Label>
              <Select value={form.person_type} onValueChange={(v: PersonType) => 
                setForm({ ...form, person_type: v, person_id: '', full_name: '', company: '', phone: '' })
              }>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERSON_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.person_type !== 'visitor' && peopleOptions.length > 0 && (
              <div>
                <Label>Select Known Person</Label>
                <Select value={form.person_id} onValueChange={handleKnownPerson}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent>
                    {peopleOptions.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Full Name *</Label>
              <Input
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                placeholder="Full name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="Optional"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Company</Label>
              <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Optional" className="mt-1" />
            </div>
            <div>
              <Label>Purpose</Label>
              <Input value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} placeholder="Visit, repair, meeting..." className="mt-1" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Safety/access notes" className="mt-1" />
            </div>
          </div>

          <Button onClick={checkIn} disabled={!form.full_name.trim()} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            <LogIn className="mr-2 h-4 w-4" /> Check In
          </Button>
        </div>

        {/* Onsite List */}
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search onsite..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(v: PersonType | 'all') => setFilterType(v)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {PERSON_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filteredOnsite.length > 0 && (
              <Button variant="destructive" onClick={bulkCheckout} size="sm">
                Check Out All Visible
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : filteredOnsite.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-12 text-center">
              <UserPlus className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="text-slate-500">No one is currently onsite.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOnsite.map(entry => (
                <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-white p-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{entry.full_name}</p>
                      <Badge className={typeBadge[entry.person_type] || ''}>
                        {entry.person_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(entry.check_in_at).toLocaleString('en-AU')}
                      {entry.company && ` • ${entry.company}`}
                      {entry.purpose && ` • ${entry.purpose}`}
                    </p>
                    {entry.notes && <p className="text-sm text-slate-600 mt-1">{entry.notes}</p>}
                  </div>

                  <Button variant="outline" onClick={() => checkOut(entry.id)}>
                    <LogOut className="mr-2 h-4 w-4" /> Check Out
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const typeBadge: Record<PersonType, string> = {
  worker: 'bg-blue-100 text-blue-700',
  client: 'bg-emerald-100 text-emerald-700',
  contractor: 'bg-amber-100 text-amber-700',
  visitor: 'bg-purple-100 text-purple-700',
};
