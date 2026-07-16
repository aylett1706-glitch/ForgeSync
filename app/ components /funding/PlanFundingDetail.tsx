'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, FileText, ClipboardList, Shield, AlertTriangle } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import FundingLineItemForm from './FundingLineItemForm';
import FundingLineItemTable from './FundingLineItemTable';
import ServiceBookingForm from './ServiceBookingForm';
import ServiceBookingTable from './ServiceBookingTable';

const fmt = (v: number | string) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(Number(v || 0));

interface Plan {
  id: string;
  total_budget?: number;
  plan_start_date?: string;
  plan_end_date?: string;
  plan_management_type?: string;
  program_name?: string;
  plan_manager_name?: string;
  review_date?: string;
  plan_notes?: string;
}

interface Participant {
  id?: string;
  ndis_number?: string;
}

interface Props {
  plan: Plan;
  participant?: Participant;
  orgId?: string;
}

export default function PlanFundingDetail({ plan, participant, orgId }: Props) {
  const [lineItemDialog, setLineItemDialog] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState<any>(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);

  // TODO: Replace these with Supabase queries in your final app
  const lineItems: any[] = [];
  const bookings: any[] = [];
  const buckets: any[] = [];

  const handleSaveLineItem = (data: any) => {
    // TODO: Supabase mutation
    toast.success('Line item saved');
    setLineItemDialog(false);
    setEditingLineItem(null);
  };

  const handleSaveBooking = (data: any) => {
    // TODO: Supabase mutation
    toast.success('Booking saved');
    setBookingDialog(false);
    setEditingBooking(null);
  };

  // Aggregations
  const totalAllocated = lineItems.reduce((s, li) => s + (li.allocated_budget || 0), 0) || plan.total_budget || 0;
  const totalClaimed = lineItems.reduce((s, li) => s + (li.claimed_to_date || 0), 0);
  const totalRemaining = totalAllocated - totalClaimed;
  const utilPct = totalAllocated > 0 ? (totalClaimed / totalAllocated) * 100 : 0;
  const endDate = plan.plan_end_date ? parseISO(plan.plan_end_date) : null;
  const daysRemaining = endDate ? Math.max(0, differenceInDays(endDate, new Date())) : null;

  const coreItems = lineItems.filter(li => li.support_category === 'core_supports');
  const capacityItems = lineItems.filter(li => li.support_category === 'capacity_building');
  const capitalItems = lineItems.filter(li => li.support_category === 'capital_supports');
  const catTotal = (items: any[]) => items.reduce((s, li) => s + (li.allocated_budget || 0), 0);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="overview">
            <DollarSign className="mr-1.5 h-4 w-4" /> Funding Overview
          </TabsTrigger>
          <TabsTrigger value="line_items">
            <FileText className="mr-1.5 h-4 w-4" /> Line Items ({lineItems.length})
          </TabsTrigger>
          <TabsTrigger value="claiming">
            <Shield className="mr-1.5 h-4 w-4" /> Claiming Rules
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <ClipboardList className="mr-1.5 h-4 w-4" /> Service Bookings ({bookings.length})
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Total Plan Budget" value={fmt(totalAllocated)} />
            <Stat label="Claimed to Date" value={fmt(totalClaimed)} />
            <Stat 
              label="Remaining Balance" 
              value={fmt(totalRemaining)} 
              color={totalRemaining <= 0 ? 'text-red-600' : 'text-green-700'} 
            />
            <Stat label="Days Remaining" value={daysRemaining ?? '—'} />
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Budget Utilisation</span>
                <span className="font-bold">{utilPct.toFixed(1)}%</span>
              </div>
              <Progress value={utilPct} className="h-3" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Plan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Funding Program" value={plan.program_name || 'NDIS'} />
                <Row label="Plan Type" value={(plan.plan_management_type || 'plan_managed').replace(/_/g, ' ')} />
                <Row label="NDIS Number" value={participant?.ndis_number || '—'} />
                <Row label="Plan Start" value={plan.plan_start_date ? format(parseISO(plan.plan_start_date), 'dd MMM yyyy') : '—'} />
                <Row label="Plan End" value={plan.plan_end_date ? format(parseISO(plan.plan_end_date), 'dd MMM yyyy') : '—'} />
                <Row label="Plan Manager" value={plan.plan_manager_name || '—'} />
                <Row label="Review Date" value={plan.review_date || '—'} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CategoryBar label="Core Supports" amount={catTotal(coreItems)} total={totalAllocated} color="bg-blue-500" />
                <CategoryBar label="Capacity Building" amount={catTotal(capacityItems)} total={totalAllocated} color="bg-purple-500" />
                <CategoryBar label="Capital Supports" amount={catTotal(capitalItems)} total={totalAllocated} color="bg-amber-500" />
              </CardContent>
            </Card>
          </div>

          {plan.plan_notes && (
            <Card>
              <CardContent className="p-4">
                <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">Funding Notes</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{plan.plan_notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* LINE ITEMS TAB */}
        <TabsContent value="line_items" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Funding Line Items</CardTitle>
                <CardDescription>NDIS line items with support categories, rates and budgets.</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setEditingLineItem(null); setLineItemDialog(true); }}>
                <Plus className="mr-1.5 h-4 w-4" /> Add Line Item
              </Button>
            </CardHeader>
            <CardContent>
              <FundingLineItemTable
                items={lineItems}
                onEdit={(item) => { setEditingLineItem(item); setLineItemDialog(true); }}
                onDelete={(item) => {
                  // TODO: Supabase delete
                  toast.success('Line item deleted');
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLAIMING RULES TAB */}
        <TabsContent value="claiming" className="mt-4 space-y-4">
          {/* Claiming summary table and transport rules cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Claiming Rules Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {lineItems.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">Add line items to see claiming rules here.</p>
              ) : (
                <div className="overflow-x-auto">
                  {/* Claiming rules table */}
                  {/* ... (you can expand this if needed) */}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SERVICE BOOKINGS TAB */}
        <TabsContent value="bookings" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Service Bookings</CardTitle>
                <CardDescription>Approved service bookings linked to this funding plan.</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setEditingBooking(null); setBookingDialog(true); }}>
                <Plus className="mr-1.5 h-4 w-4" /> Add Booking
              </Button>
            </CardHeader>
            <CardContent>
              <ServiceBookingTable
                bookings={bookings}
                onEdit={(b) => { setEditingBooking(b); setBookingDialog(true); }}
                onDelete={(b) => {
                  // TODO: Supabase delete
                  toast.success('Booking deleted');
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <FundingLineItemForm
        open={lineItemDialog}
        onOpenChange={setLineItemDialog}
        onSave={handleSaveLineItem}
        initial={editingLineItem}
        planId={plan.id}
        participantId={participant?.id}
        orgId={orgId}
      />
      <ServiceBookingForm
        open={bookingDialog}
        onOpenChange={setBookingDialog}
        onSave={handleSaveBooking}
        initial={editingBooking}
        lineItems={lineItems}
        planId={plan.id}
        participantId={participant?.id}
        orgId={orgId}
      />
    </div>
  );
}

/* Helper Components */
function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${color || 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 capitalize text-right">{value}</span>
    </div>
  );
}

function CategoryBar({ label, amount, total, color }: { label: string; amount: number; total: number; color: string }) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-semibold">{fmt(amount)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}
