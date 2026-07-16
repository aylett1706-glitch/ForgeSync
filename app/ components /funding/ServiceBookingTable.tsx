'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(Number(value || 0));

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending_approval: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-slate-100 text-slate-500',
};

interface ServiceBooking {
  id: string;
  service_booking_number: string;
  linked_support_item?: string;
  start_date?: string;
  end_date?: string;
  approved_hours?: number;
  used_hours?: number;
  approved_spend?: number;
  used_spend?: number;
  provider_name?: string;
  status?: string;
}

interface Props {
  bookings: ServiceBooking[];
  onEdit?: (booking: ServiceBooking) => void;
  onDelete?: (booking: ServiceBooking) => void;
}

export default function ServiceBookingTable({ bookings = [], onEdit, onDelete }: Props) {
  if (!bookings.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No service bookings yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="pb-3 pr-4">Booking #</th>
            <th className="pb-3 pr-4">Support Item</th>
            <th className="pb-3 pr-4">Dates</th>
            <th className="pb-3 pr-4 text-right">Hours</th>
            <th className="pb-3 pr-4 text-right">Approved $</th>
            <th className="pb-3 pr-4 text-right">Used $</th>
            <th className="pb-3 pr-4">Provider</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 w-20"></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
              <td className="py-3 pr-4 font-mono text-xs font-medium">
                {b.service_booking_number}
              </td>
              <td className="py-3 pr-4 text-xs">
                {b.linked_support_item || '—'}
              </td>
              <td className="py-3 pr-4 text-xs">
                {b.start_date
                  ? format(parseISO(b.start_date), 'dd MMM yy')
                  : '—'}
                {b.end_date
                  ? ` → ${format(parseISO(b.end_date), 'dd MMM yy')}`
                  : ''}
              </td>
              <td className="py-3 pr-4 text-right">
                {b.approved_hours || 0}
                {b.used_hours !== undefined && (
                  <span className="text-slate-400"> / {b.used_hours} used</span>
                )}
              </td>
              <td className="py-3 pr-4 text-right font-medium">
                {formatCurrency(b.approved_spend)}
              </td>
              <td className="py-3 pr-4 text-right">
                {formatCurrency(b.used_spend)}
              </td>
              <td className="py-3 pr-4 max-w-[140px] truncate">
                {b.provider_name || '—'}
              </td>
              <td className="py-3 pr-4">
                <Badge
                  className={
                    STATUS_COLORS[b.status || 'draft'] ||
                    'bg-slate-100 text-slate-700'
                  }
                >
                  {(b.status || 'draft').replace(/_/g, ' ')}
                </Badge>
              </td>
              <td className="py-3">
                <div className="flex gap-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEdit(b)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500"
                      onClick={() => onDelete(b)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
