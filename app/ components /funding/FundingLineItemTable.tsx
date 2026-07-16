'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(Number(value || 0));

const CATEGORY_COLORS: Record<string, string> = {
  core_supports: 'bg-blue-100 text-blue-700',
  capacity_building: 'bg-purple-100 text-purple-700',
  capital_supports: 'bg-amber-100 text-amber-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  active: <CheckCircle className="h-3.5 w-3.5 text-green-600" />,
  exhausted: <AlertTriangle className="h-3.5 w-3.5 text-red-600" />,
  suspended: <XCircle className="h-3.5 w-3.5 text-slate-500" />,
  cancelled: <XCircle className="h-3.5 w-3.5 text-slate-400" />,
};

interface FundingLineItem {
  id: string;
  line_item_number: string;
  line_item_name: string;
  support_purpose?: string;
  support_category?: string;
  unit_type?: string;
  rate?: number;
  allocated_budget?: number;
  claimed_to_date?: number;
  gst_applicable?: boolean;
  can_provider_claim?: boolean;
  quote_required?: boolean;
  prior_approval_needed?: boolean;
  travel_claim_allowed?: boolean;
  support_ratio?: string;
  status?: string;
}

interface Props {
  items: FundingLineItem[];
  onEdit?: (item: FundingLineItem) => void;
  onDelete?: (item: FundingLineItem) => void;
}

export default function FundingLineItemTable({ items = [], onEdit, onDelete }: Props) {
  if (!items.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No funding line items yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="pb-3 pr-4">Item #</th>
            <th className="pb-3 pr-4">Description</th>
            <th className="pb-3 pr-4">Category</th>
            <th className="pb-3 pr-4">Unit</th>
            <th className="pb-3 pr-4 text-right">Rate</th>
            <th className="pb-3 pr-4 text-right">Budget</th>
            <th className="pb-3 pr-4 text-right">Claimed</th>
            <th className="pb-3 pr-4 text-right">Remaining</th>
            <th className="pb-3 pr-4">Rules</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 w-20"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const remaining = (item.allocated_budget || 0) - (item.claimed_to_date || 0);
            const utilizationPct = item.allocated_budget
              ? ((item.claimed_to_date || 0) / item.allocated_budget) * 100
              : 0;

            return (
              <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                <td className="py-3 pr-4 font-mono text-xs">{item.line_item_number}</td>
                <td className="py-3 pr-4 max-w-[240px]">
                  <p className="font-medium text-slate-900 truncate">{item.line_item_name}</p>
                  {item.support_purpose && (
                    <p className="text-xs text-slate-500 truncate">{item.support_purpose}</p>
                  )}
                </td>
                <td className="py-3 pr-4">
                  {item.support_category && (
                    <Badge className={CATEGORY_COLORS[item.support_category] || 'bg-slate-100 text-slate-700'}>
                      {(item.support_category || '').replace(/_/g, ' ')}
                    </Badge>
                  )}
                </td>
                <td className="py-3 pr-4 capitalize">{item.unit_type}</td>
                <td className="py-3 pr-4 text-right font-medium">{formatCurrency(item.rate)}</td>
                <td className="py-3 pr-4 text-right font-medium">{formatCurrency(item.allocated_budget)}</td>
                <td className="py-3 pr-4 text-right">
                  <span className={utilizationPct >= 90 ? 'text-red-600 font-semibold' : utilizationPct >= 70 ? 'text-amber-600' : ''}>
                    {formatCurrency(item.claimed_to_date)}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right font-semibold">
                  <span className={remaining <= 0 ? 'text-red-600' : 'text-green-700'}>
                    {formatCurrency(remaining)}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-1">
                    {item.gst_applicable && <MiniTag label="GST" />}
                    {!item.can_provider_claim && <MiniTag label="No Claim" color="red" />}
                    {item.quote_required && <MiniTag label="Quote" color="amber" />}
                    {item.prior_approval_needed && <MiniTag label="Approval" color="purple" />}
                    {item.travel_claim_allowed && <MiniTag label="Travel" color="blue" />}
                    {item.support_ratio && item.support_ratio !== '1:1' && <MiniTag label={item.support_ratio} />}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1">
                    {STATUS_ICONS[item.status || 'active']}
                    <span className="text-xs capitalize">{item.status}</span>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500"
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MiniTag({ label, color = 'slate' }: { label: string; color?: string }) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${colors[color]}`}>
      {label}
    </span>
  );
}
