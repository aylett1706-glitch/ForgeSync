'use client';

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Receipt, Upload, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Expense {
  id?: string;
  job_code?: string;
  asset_id?: string;
  item_name?: string;
  description?: string;
  quantity?: number;
  unit_cost?: number;
  total_cost?: number;
  receipt_url?: string;
  receipt_file_name?: string;
}

interface Asset {
  id: string;
  name: string;
}

interface Request {
  id: string;
  job_code?: string;
  work_order_number?: string;
  asset_id?: string;
  property_id?: string;
}

interface Props {
  request: Request;
  assets?: Asset[];
  expenses?: Expense[];
  onCreate: (expense: any) => void;
}

export default function MaintenanceExpensePanel({
  request,
  assets = [],
  expenses = [],
  onCreate,
}: Props) {
  const [form, setForm] = useState({
    job_code: request.job_code || request.work_order_number || '',
    asset_id: request.asset_id || 'none',
    item_name: '',
    description: '',
    quantity: 1,
    unit_cost: '',
    receipt_url: '',
    receipt_file_name: '',
  });

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadReceipt = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((prev) => ({
        ...prev,
        receipt_url: file_url,
        receipt_file_name: file.name,
      }));
      toast.success('Receipt uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Receipt upload failed');
    }
  };

  const totalCost = Number(form.quantity || 0) * Number(form.unit_cost || 0);

  const submit = () => {
    onCreate({
      ...form,
      asset_id: form.asset_id === 'none' ? '' : form.asset_id,
      quantity: Number(form.quantity || 1),
      unit_cost: Number(form.unit_cost || 0),
      total_cost: totalCost,
      maintenance_request_id: request.id,
      property_id: request.property_id || '',
      expense_date: new Date().toISOString(),
    });

    setForm({
      job_code: request.job_code || request.work_order_number || '',
      asset_id: request.asset_id || 'none',
      item_name: '',
      description: '',
      quantity: 1,
      unit_cost: '',
      receipt_url: '',
      receipt_file_name: '',
    });
  };

  return (
    <div className="rounded-xl border border-green-100 bg-green-50/50 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="flex items-center gap-2 font-semibold text-green-900">
          <Receipt className="h-4 w-4" /> Expenses & materials
        </h4>
        <Badge variant="outline">
          ${expenses.reduce((sum, expense) => sum + Number(expense.total_cost || 0), 0).toLocaleString()}
        </Badge>
      </div>

      {expenses.length > 0 && (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="rounded-lg border border-green-100 bg-white p-3 text-xs text-slate-600"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{expense.item_name}</p>
                  <p>Job code: {expense.job_code}</p>
                </div>
                <strong className="text-green-700">
                  ${Number(expense.total_cost || 0).toLocaleString()}
                </strong>
              </div>
              {expense.receipt_url && (
                <a
                  href={expense.receipt_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-medium text-green-700 underline"
                >
                  <ExternalLink className="h-3 w-3" /> View receipt
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs">Job code</Label>
          <Input
            value={form.job_code}
            onChange={(e) => updateField('job_code', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Inventory item</Label>
          <Select value={form.asset_id} onValueChange={(value) => updateField('asset_id', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No linked item</SelectItem>
              {assets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Item / material</Label>
          <Input
            value={form.item_name}
            onChange={(e) => updateField('item_name', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Total</Label>
          <Input value={`$${totalCost.toFixed(2)}`} readOnly className="mt-1 bg-white" />
        </div>
        <div>
          <Label className="text-xs">Quantity</Label>
          <Input
            type="number"
            value={form.quantity}
            onChange={(e) => updateField('quantity', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Unit cost</Label>
          <Input
            type="number"
            value={form.unit_cost}
            onChange={(e) => updateField('unit_cost', e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs">Receipt</Label>
          <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-green-200 bg-white px-3 py-2 text-sm text-green-700">
            <Upload className="h-4 w-4" /> {form.receipt_file_name || 'Upload receipt'}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
              className="hidden"
              onChange={uploadReceipt}
            />
          </label>
        </div>
        <div className="md:col-span-4">
          <Label className="text-xs">Notes</Label>
          <Textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="mt-1"
            rows={2}
          />
        </div>
      </div>

      <Button
        size="sm"
        onClick={submit}
        disabled={!form.job_code || !form.item_name}
        className="bg-green-700 hover:bg-green-800"
      >
        <Plus className="h-4 w-4" /> Log expense
      </Button>
    </div>
  );
}
