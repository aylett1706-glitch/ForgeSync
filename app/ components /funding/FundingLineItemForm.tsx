'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface FundingLineItem {
  id?: string;
  support_purpose: string;
  support_category: string;
  registration_group?: string;
  line_item_number: string;
  line_item_name: string;
  unit_type: string;
  rate: number;
  allocated_budget: number;
  claim_type: string;
  gst_applicable: boolean;
  service_frequency?: string;
  can_provider_claim: boolean;
  quote_required: boolean;
  prior_approval_needed: boolean;
  travel_claim_allowed: boolean;
  cancellation_allowed: boolean;
  support_ratio?: string;
  weekend_ph_rules?: string;
  regional_remote_loading?: string;
  transport_rules?: string;
  notes?: string;
  status: string;
  organization_id?: string;
  support_plan_id?: string;
  participant_id?: string;
  remaining_amount?: number;
}

const BLANK_LINE_ITEM: FundingLineItem = {
  support_purpose: '',
  support_category: 'core_supports',
  registration_group: '',
  line_item_number: '',
  line_item_name: '',
  unit_type: 'hour',
  rate: 0,
  allocated_budget: 0,
  claim_type: 'standard',
  gst_applicable: false,
  service_frequency: '',
  can_provider_claim: true,
  quote_required: false,
  prior_approval_needed: false,
  travel_claim_allowed: false,
  cancellation_allowed: true,
  support_ratio: '1:1',
  weekend_ph_rules: '',
  regional_remote_loading: 'none',
  transport_rules: '',
  notes: '',
  status: 'active',
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: FundingLineItem) => void;
  initial?: FundingLineItem | null;
  planId?: string;
  participantId?: string;
  orgId?: string;
}

export default function FundingLineItemForm({
  open,
  onOpenChange,
  onSave,
  initial,
  planId,
  participantId,
  orgId,
}: Props) {
  const [form, setForm] = useState<FundingLineItem>(initial || BLANK_LINE_ITEM);

  const updateField = (key: keyof FundingLineItem, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave({
      ...form,
      organization_id: orgId,
      support_plan_id: planId,
      participant_id: participantId,
      remaining_amount: (form.allocated_budget || 0) - (form.remaining_amount || 0),
    });
    setForm(BLANK_LINE_ITEM);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit' : 'Add'} Funding Line Item</DialogTitle>
        </DialogHeader>

        {/* Line Item Details */}
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Line Item Details</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Support Purpose">
                <Input
                  value={form.support_purpose}
                  onChange={(e) => updateField('support_purpose', e.target.value)}
                  placeholder="What this funding is for"
                />
              </Field>

              <Field label="Support Category">
                <Select value={form.support_category} onValueChange={(v) => updateField('support_category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core_supports">Core Supports</SelectItem>
                    <SelectItem value="capacity_building">Capacity Building</SelectItem>
                    <SelectItem value="capital_supports">Capital Supports</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Registration Group">
                <Input
                  value={form.registration_group}
                  onChange={(e) => updateField('registration_group', e.target.value)}
                  placeholder="e.g. Assistance with Daily Life"
                />
              </Field>

              <Field label="Line Item Number">
                <Input
                  value={form.line_item_number}
                  onChange={(e) => updateField('line_item_number', e.target.value)}
                  placeholder="e.g. 01_011_0107_1_1"
                />
              </Field>

              <Field label="Line Item Name">
                <Input
                  value={form.line_item_name}
                  onChange={(e) => updateField('line_item_name', e.target.value)}
                  placeholder="e.g. Assistance with Self-Care"
                />
              </Field>

              <Field label="Unit Type">
                <Select value={form.unit_type} onValueChange={(v) => updateField('unit_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['hour', 'each', 'km', 'session', 'day', 'week', 'month', 'year', 'item'].map(u => (
                      <SelectItem key={u} value={u}>
                        {u.charAt(0).toUpperCase() + u.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Rate / Price Limit ($)">
                <Input
                  type="number"
                  value={form.rate}
                  onChange={(e) => updateField('rate', parseFloat(e.target.value) || 0)}
                />
              </Field>

              <Field label="Allocated Budget ($)">
                <Input
                  type="number"
                  value={form.allocated_budget}
                  onChange={(e) => updateField('allocated_budget', parseFloat(e.target.value) || 0)}
                />
              </Field>

              <Field label="Claim Type">
                <Select value={form.claim_type} onValueChange={(v) => updateField('claim_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['standard', 'transport', 'cancellation', 'report_writing', 'non_face_to_face', 'provider_travel', 'other'].map(c => (
                      <SelectItem key={c} value={c}>
                        {c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          {/* Claiming Rules */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Claiming Rules</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Toggle label="GST Applicable" value={form.gst_applicable} onChange={v => updateField('gst_applicable', v)} />
              <Toggle label="Can Provider Claim?" value={form.can_provider_claim} onChange={v => updateField('can_provider_claim', v)} />
              <Toggle label="Quote Required?" value={form.quote_required} onChange={v => updateField('quote_required', v)} />
              <Toggle label="Prior Approval Needed?" value={form.prior_approval_needed} onChange={v => updateField('prior_approval_needed', v)} />
              <Toggle label="Travel Claim Allowed?" value={form.travel_claim_allowed} onChange={v => updateField('travel_claim_allowed', v)} />
              <Toggle label="Cancellation Allowed?" value={form.cancellation_allowed} onChange={v => updateField('cancellation_allowed', v)} />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Service Frequency">
              <Input
                value={form.service_frequency}
                onChange={(e) => updateField('service_frequency', e.target.value)}
                placeholder="e.g. 3x per week"
              />
            </Field>

            <Field label="Support Ratio">
              <Select value={form.support_ratio} onValueChange={(v) => updateField('support_ratio', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['1:1', '1:2', '1:3', '1:4', '1:5', 'group', 'other'].map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Weekend/PH Rules">
              <Textarea
                rows={2}
                value={form.weekend_ph_rules}
                onChange={(e) => updateField('weekend_ph_rules', e.target.value)}
                placeholder="e.g. Saturday 125%, Sunday 150%, PH 225%"
              />
            </Field>

            <Field label="Transport Rules">
              <Textarea
                rows={2}
                value={form.transport_rules}
                onChange={(e) => updateField('transport_rules', e.target.value)}
                placeholder="e.g. Provider travel up to 30 mins each way"
              />
            </Field>
          </div>

          <Field label="Notes / Restrictions">
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.line_item_number || !form.line_item_name}>
            {initial ? 'Update' : 'Add'} Line Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-slate-600">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
      <Label className="text-xs text-slate-700">{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
