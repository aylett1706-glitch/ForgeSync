'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  'Organisation',
  'Authority & RAM',
  'ForgeSync Authorisation',
  'Review',
];

const getStatusFromForm = (formData: any): string => {
  const completed = formData.ram_authorised && formData.provider_portal_authorised && formData.forgesync_authorised;
  if (!formData.provider_name || !formData.abn) return 'not_started';
  return completed ? 'connected' : 'pending_authorisation';
};

interface NDISConnection {
  id?: string;
  provider_name?: string;
  provider_number?: string;
  abn?: string;
  auth_method?: string;
  principal_authority_name?: string;
  principal_authority_email?: string;
  ram_authorised?: boolean;
  provider_portal_authorised?: boolean;
  forgesync_authorised?: boolean;
  migration_deadline_acknowledged?: boolean;
  consent_scope_summary?: string;
  setup_reference?: string;
  notes?: string;
}

interface Organization {
  id: string;
  name?: string;
  abn?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection?: NDISConnection | null;
  organization?: Organization | null;
}

export default function NDISConnectionWizard({
  open,
  onOpenChange,
  connection,
  organization,
}: Props) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    provider_name: '',
    provider_number: '',
    abn: '',
    auth_method: 'myid_ram',
    principal_authority_name: '',
    principal_authority_email: '',
    ram_authorised: false,
    provider_portal_authorised: false,
    forgesync_authorised: false,
    migration_deadline_acknowledged: false,
    consent_scope_summary: '',
    setup_reference: '',
    notes: '',
  });

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setFormData({
      provider_name: connection?.provider_name || organization?.name || '',
      provider_number: connection?.provider_number || '',
      abn: connection?.abn || organization?.abn || '',
      auth_method: connection?.auth_method || 'myid_ram',
      principal_authority_name: connection?.principal_authority_name || organization?.primary_contact_name || '',
      principal_authority_email: connection?.principal_authority_email || organization?.primary_contact_email || '',
      ram_authorised: connection?.ram_authorised || false,
      provider_portal_authorised: connection?.provider_portal_authorised || false,
      forgesync_authorised: connection?.forgesync_authorised || false,
      migration_deadline_acknowledged: connection?.migration_deadline_acknowledged || false,
      consent_scope_summary: connection?.consent_scope_summary || '',
      setup_reference: connection?.setup_reference || '',
      notes: connection?.notes || '',
    });
  }, [open, connection, organization]);

  const completedChecks = useMemo(() => [
    formData.ram_authorised,
    formData.provider_portal_authorised,
    formData.forgesync_authorised,
  ].filter(Boolean).length, [formData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        organization_id: organization?.id,
        ...formData,
        connection_status: getStatusFromForm(formData),
        last_authorized_at: getStatusFromForm(formData) === 'connected' ? new Date().toISOString() : connection?.last_authorized_at || null,
      };

      if (connection?.id) {
        return base44.entities.NDISConnection.update(connection.id, payload);
      }

      return base44.entities.NDISConnection.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ndis-connection'] });
      toast.success('NDIS connection settings saved');
      onOpenChange(false);
    },
  });

  const nextDisabled = (
    (step === 0 && (!formData.provider_name || !formData.abn)) ||
    (step === 1 && (!formData.principal_authority_name || !formData.principal_authority_email)) ||
    (step === 2 && !formData.migration_deadline_acknowledged)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#005B98]" />
            Connect NDIS for {organization?.name || 'Organisation'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {STEPS.map((label, index) => (
              <Badge
                key={label}
                className={
                  index === step
                    ? 'bg-[#005B98] text-white'
                    : index < step
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }
              >
                {index + 1}. {label}
              </Badge>
            ))}
          </div>

          {formData.auth_method === 'proda_transition' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-semibold">PRODA transition warning</p>
                  <p className="mt-1">PRODA is being retired. Use this only**✅ Upgraded: `NDISConnectionWizard`**

Here's the **clean, fully typed** version:

### `components/ndis/NDISConnectionWizard.tsx`

```tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  'Organisation',
  'Authority & RAM',
  'ForgeSync Authorisation',
  'Review',
];

const getStatusFromForm = (formData: any): string => {
  const completed = formData.ram_authorised && formData.provider_portal_authorised && formData.forgesync_authorised;
  if (!formData.provider_name || !formData.abn) return 'not_started';
  return completed ? 'connected' : 'pending_authorisation';
};

interface NDISConnection {
  id?: string;
  provider_name?: string;
  provider_number?: string;
  abn?: string;
  auth_method?: string;
  principal_authority_name?: string;
  principal_authority_email?: string;
  ram_authorised?: boolean;
  provider_portal_authorised?: boolean;
  forgesync_authorised?: boolean;
  migration_deadline_acknowledged?: boolean;
  consent_scope_summary?: string;
  setup_reference?: string;
  notes?: string;
}

interface Organization {
  id: string;
  name?: string;
  abn?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection?: NDISConnection | null;
  organization?: Organization | null;
}

export default function NDISConnectionWizard({
  open,
  onOpenChange,
  connection,
  organization,
}: Props) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    provider_name: '',
    provider_number: '',
    abn: '',
    auth_method: 'myid_ram',
    principal_authority_name: '',
    principal_authority_email: '',
    ram_authorised: false,
    provider_portal_authorised: false,
    forgesync_authorised: false,
    migration_deadline_acknowledged: false,
    consent_scope_summary: '',
    setup_reference: '',
    notes: '',
  });

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setFormData({
      provider_name: connection?.provider_name || organization?.name || '',
      provider_number: connection?.provider_number || '',
      abn: connection?.abn || organization?.abn || '',
      auth_method: connection?.auth_method || 'myid_ram',
      principal_authority_name: connection?.principal_authority_name || organization?.primary_contact_name || '',
      principal_authority_email: connection?.principal_authority_email || organization?.primary_contact_email || '',
      ram_authorised: connection?.ram_authorised || false,
      provider_portal_authorised: connection?.provider_portal_authorised || false,
      forgesync_authorised: connection?.forgesync_authorised || false,
      migration_deadline_acknowledged: connection?.migration_deadline_acknowledged || false,
      consent_scope_summary: connection?.consent_scope_summary || '',
      setup_reference: connection?.setup_reference || '',
      notes: connection?.notes || '',
    });
  }, [open, connection, organization]);

  const completedChecks = useMemo(() => [
    formData.ram_authorised,
    formData.provider_portal_authorised,
    formData.forgesync_authorised,
  ].filter(Boolean).length, [formData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        organization_id: organization?.id,
        ...formData,
        connection_status: getStatusFromForm(formData),
        last_authorized_at: getStatusFromForm(formData) === 'connected' ? new Date().toISOString() : connection?.last_authorized_at || null,
      };

      if (connection?.id) {
        return base44.entities.NDISConnection.update(connection.id, payload);
      }

      return base44.entities.NDISConnection.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ndis-connection'] });
      toast.success('NDIS connection settings saved');
      onOpenChange(false);
    },
  });

  const nextDisabled = (
    (step === 0 && (!formData.provider_name || !formData.abn)) ||
    (step === 1 && (!formData.principal_authority_name || !formData.principal_authority_email)) ||
    (step === 2 && !formData.migration_deadline_acknowledged)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#005B98]" />
            Connect NDIS for {organization?.name || 'Organisation'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {STEPS.map((label, index) => (
              <Badge
                key={label}
                className={
                  index === step
                    ? 'bg-[#005B98] text-white'
                    : index < step
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }
              >
                {index + 1}. {label}
              </Badge>
            ))}
          </div>

          {formData.auth_method === 'proda_transition' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-semibold">PRODA transition warning</p>
                  <p className="mt-1">PRODA is being retired. Use this only as a temporary bridge and migrate this organisation to myID + RAM before 30 September 2026.</p>
                </div>
              </div>
            </div>
          )}

          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Provider Name *</Label>
                  <Input
                    value={formData.provider_name}
                    onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                    placeholder="Devonfield Enterprises"
                  />
                </div>
                <div>
                  <Label>NDIS Provider Number</Label>
                  <Input
                    value={formData.provider_number}
                    onChange={(e) => setFormData({ ...formData, provider_number: e.target.value })}
                    placeholder="4-XXXX-XXXX"
                  />
                </div>
                <div>
                  <Label>ABN *</Label>
                  <Input
                    value={formData.abn}
                    onChange={(e) => setFormData({ ...formData, abn: e.target.value })}
                    placeholder="12 345 678 901"
                  />
                </div>
                <div>
                  <Label>Authentication Method</Label>
                  <Select value={formData.auth_method} onValueChange={(value) => setFormData({ ...formData, auth_method: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="myid_ram">myID + RAM</SelectItem>
                      <SelectItem value="proda_transition">PRODA transition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Consent Scope Summary</Label>
                <Textarea
                  value={formData.consent_scope_summary}
                  onChange={(e) => setFormData({ ...formData, consent_scope_summary: e.target.value })}
                  rows={3}
                  placeholder="e.g. Only participants with active service consent under this ABN should sync into PACE claims and budget screens."
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Principal Authority Name *</Label>
                  <Input
                    value={formData.principal_authority_name}
                    onChange={(e) => setFormData({ ...formData, principal_authority_name: e.target.value })}
                    placeholder="Organisation owner / director"
                  />
                </div>
                <div>
                  <Label>Principal Authority Email *</Label>
                  <Input
                    type="email"
                    value={formData.principal_authority_email}
                    onChange={(e) => setFormData({ ...formData, principal_authority_email: e.target.value })}
                    placeholder="owner@example.com"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-xl border bg-slate-50 p-4">
                <label className="flex items-start gap-3">
                  <Checkbox
                    checked={formData.ram_authorised}
                    onCheckedChange={(checked) => setFormData({ ...formData, ram_authorised: !!checked })}
                  />
                  <span className="text-sm text-slate-700">The principal authority has linked their myID to the organisation ABN in RAM.</span>
                </label>
                <label className="flex items-start gap-3">
                  <Checkbox
                    checked={formData.provider_portal_authorised}
                    onCheckedChange={(checked) => setFormData({ ...formData, provider_portal_authorised: !!checked })}
                  />
                  <span className="text-sm text-slate-700">The organisation has an active RAM authorisation for the NDIS Provider Portal / API access.</span>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Integration Reference / Masked Code</Label>
                <Input
                  value={formData.setup_reference}
                  onChange={(e) => setFormData({ ...formData, setup_reference: e.target.value })}
                  placeholder="e.g. RAM code ending in 4K92"
                />
              </div>
              <label className="flex items-start gap-3 rounded-xl border bg-slate-50 p-4">
                <Checkbox
                  checked={formData.forgesync_authorised}
                  onCheckedChange={(checked) => setFormData({ ...formData, forgesync_authorised: !!checked })}
                />
                <span className="text-sm text-slate-700">ForgeSync has been authorised as the software integration for this organisation.</span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border bg-amber-50 p-4">
                <Checkbox
                  checked={formData.migration_deadline_acknowledged}
                  onCheckedChange={(checked) => setFormData({ ...formData, migration_deadline_acknowledged: !!checked })}
                />
                <span className="text-sm text-amber-900">I understand PRODA must be migrated and that organisation credentials must remain encrypted and organisation-scoped.</span>
              </label>
              <div>
                <Label>Internal Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Migration notes, authorised contact notes, device setup details..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-slate-50 p-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Provider</span>
                  <span className="font-medium text-slate-900">{formData.provider_name || '—'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">ABN</span>
                  <span className="font-medium text-slate-900">{formData.abn || '—'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Auth Method</span>
                  <span className="font-medium text-slate-900">
                    {formData.auth_method === 'myid_ram' ? 'myID + RAM' : 'PRODA transition'}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Checklist Complete</span>
                  <span className="font-medium text-slate-900">{completedChecks}/3</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Resulting Status</span>
                  <Badge
                    className={
                      getStatusFromForm(formData) === 'connected'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }
                  >
                    {getStatusFromForm(formData).replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>

              {getStatusFromForm(formData) === 'connected' && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" />
                  <span>This organisation is ready to use org-scoped NDIS connection settings inside ForgeSync.</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}>
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={nextDisabled}>
              Next
            </Button>
          ) : (
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-[#005B98] hover:bg-[#00487a]"
            >
              {saveMutation.isPending ? 'Saving...' : connection?.id ? 'Save Connection' : 'Create Connection'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
