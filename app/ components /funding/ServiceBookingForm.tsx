'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ServiceBooking {
  id?: string;
  service_booking_number: string;
  start_date: string;
  end_date: string;
  linked_support_item: string;
  approved_hours: number;
  approved_spend: number;
  provider_name: string;
  provider_abn?: string;
  provider_contact?: string;
  description?: string;
  status: string;
  notes?: string;
  organization_id?: string;
  support_plan_id?: string;
  participant_id?: string;
}

const BLANK_BOOKING: ServiceBooking = {
  service_booking_number: '',
  start_date: '',
  end_date: '',
  linked_support_item: '',
  approved_hours: 0,
  approved_spend: 0,
  provider_name: '',
  provider_abn: '',
  provider_contact: '',
  description: '',
  status: 'draft',
  notes: '',
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ServiceBooking) => void;
  initial?: ServiceBooking | null;
  lineItems?: any[];
  planId?: string;
  participantId?: string;
  orgId?: string;
}

export default function ServiceBookingForm({
  open,
  onOpenChange,
  onSave,
  initial,
  lineItems = [],
  planId,
  participantId,
  orgId,
}: Props) {
  const [form, setForm] = useState<ServiceBooking>(initial || BLANK_BOOKING);

  const updateField = (key: keyof ServiceBooking, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave({
      ...form,
      organization_id: orgId,
      support_plan_id: planId,
      participant_id: participantId,
    });
    setForm(BLANK_BOOKING);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit' : 'Add'} Service Booking</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Service Booking Number">
            <Input
              value={form.service_booking_number}
              onChange={(e) => updateField('service_booking_number', e.target.value)}
              placeholder="e.g. SB-2026-001"
            />
          </Field>

          <Field label="Linked Support Item">
            {lineItems.length > 0 ? (
              <Select
                value={form.linked_support_item}
                onValueChange={(v) => updateField('linked_support_item', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select line item" />
                </SelectTrigger>
                <SelectContent>
                  {lineItems.map((li) => (
                    <SelectItem key={li.id} value={li.line_item_number}>
                      {li.line_item_number} — {li.line_item_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={form.linked_support_item}
                onChange={(e) => updateField('linked_support_item', e.target.value)}
                placeholder="Support item number"
              />
            )}
          </Field>

          <Field label="Start Date">
            <Input
              type="date"
              value={form.start_date}
              onChange={(e) => updateField('start_date', e.target.value)}
            />
          </Field>

          <Field label="End Date">
            <Input
              type="date"
              value={form.end_date}
              onChange={(e) => updateField('end_date', e.target.value)}
            />
          </Field>

          <Field label="Approved Hours">
            <Input
              type="number"
              value={form.approved_hours}
              onChange={(e) => updateField('approved_hours', parseFloat(e.target.value) || 0)}
            />
          </Field>

          <Field label="Approved Spend ($)">
            <Input
              type="number"
              value={form.approved_spend}
              onChange={(e) => updateField('approved_spend', parseFloat(e.target.value) || 0)}
            />
          </Field>

          <Field label="Provider Name">
            <Input
              value={form.provider_name}
              onChange={(e) => updateField('provider_name', e.target.value)}
            />
          </Field>

          <Field label="Provider ABN">
            <Input
              value={form.provider_abn}
              onChange={(e) => updateField('provider_abn', e.target.value)}
            />
          </Field>

          <Field label="Provider Contact">
            <Input
              value={form.provider_contact}
              onChange={(e) => updateField('provider_contact', e.target.value)}
            />
          </Field>

          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => updateField('status', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['draft', 'pending_approval', 'active', 'completed', 'cancelled', 'expired'].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Description">
          <Textarea
            rows={2}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </Field>

        <Field label="Notes">
          <Textarea
            rows={2}
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </Field>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.service_booking_number || !form.start_date}>
            {initial ? 'Update' : 'Add'} Booking
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
