'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, CheckCircle2, Plus, Receipt, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// --- Types ---
type ShoppingListRow = Database['public']['Tables']['shopping_lists']['Row'];
type CommunityAccessLogRow = Database['public']['Tables']['community_access_logs']['Row'];

interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
  estimated_cost: number;
  actual_cost: number;
  purchased: boolean;
  substituted: boolean;
  notes: string;
}

interface ShoppingListForm {
  store_name: string;
  status: 'draft' | 'in_progress' | 'completed';
  budget_tracking_mode: 'forgesync' | 'external' | 'none';
  items: ShoppingItem[];
  notes: string;
  receipt_photo_url: string;
}

interface AccessLogForm {
  activity_type: 'shopping' | 'appointment' | 'social' | 'recreation' | 'other';
  destination: string;
  depart_time: string;
  return_time: string;
  participant_engagement: string;
  goals_text: string;
  notes: string;
}

interface Participant {
  id: string;
  organization_id: string;
  [key: string]: any;
}

interface Shift {
  id: string;
  [key: string]: any;
}

interface Props {
  participant: Participant;
  shift?: Shift | null;
}

const blankItem = (): ShoppingItem => ({
  name: '',
  quantity: 1,
  unit: '',
  estimated_cost: 0,
  actual_cost: 0,
  purchased: false,
  substituted: false,
  notes: ''
});

const blankLog = (): AccessLogForm => ({
  activity_type: 'shopping',
  destination: '',
  depart_time: '',
  return_time: '',
  participant_engagement: '3',
  goals_text: '',
  notes: ''
});

export default function CommunityAccessModule({ participant, shift = null }: Props) {
  const supabase = createClientComponentClient<Database>();
  const queryClient = useQueryClient();
  const [shoppingForm, setShoppingForm] = useState<ShoppingListForm>({
    store_name: '',
    status: 'draft',
    budget_tracking_mode: 'external',
    items: [blankItem()],
    notes: '',
    receipt_photo_url: ''
  });
  const [accessForm, setAccessForm] = useState<AccessLogForm>(blankLog());
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['community-access-user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw error;
      return user;
    }
  });

  const { data: shoppingLists = [] } = useQuery<ShoppingListRow[]>({
    queryKey: ['shopping-lists', participant?.id],
    queryFn: async () => {
      if (!participant?.id) return [];
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('participant_id', participant.id)
        .order('updated_at', { ascending: false })
        .limit(20);
      if (error) return [];
      return data;
    },
    enabled: !!participant?.id
  });

  const { data: accessLogs = [] } = useQuery<CommunityAccessLogRow[]>({
    queryKey: ['community-access-logs', participant?.id],
    queryFn: async () => {
      if (!participant?.id) return [];
      const { data, error } = await supabase
        .from('community_access_logs')
        .select('*')
        .eq('participant_id', participant.id)
        .order('updated_at', { ascending: false })
        .limit(20);
      if (error) return [];
      return data;
    },
    enabled: !!participant?.id
  });

  const activeShoppingList = useMemo(() => {
    if (!shift) return shoppingLists[0] || null;
    return shoppingLists.find(list => list.shift_id === shift.id)
      || shoppingLists.find(list => !list.shift_id && list.status === 'draft')
      || null;
  }, [shoppingLists, shift]);

  const activeAccessLog = useMemo(() => {
    if (!shift) return accessLogs[0] || null;
    return accessLogs.find(log => log.shift_id === shift.id) || null;
  }, [accessLogs, shift]);

  useEffect(() => {
    if (activeShoppingList) {
      setShoppingForm({
        store_name: activeShoppingList.store_name || '',
        status: (activeShoppingList.status as ShoppingListForm['status']) || 'draft',
        budget_tracking_mode: (activeShoppingList.budget_tracking_mode as ShoppingListForm['budget_tracking_mode']) || 'external',
        items: activeShoppingList.items?.length ? (activeShoppingList.items as ShoppingItem[]) : [blankItem()],
        notes: activeShoppingList.notes || '',
        receipt_photo_url: activeShoppingList.receipt_photo_url || ''
      });
    }
  }, [activeShoppingList?.id]);

  useEffect(() => {
    if (activeAccessLog) {
      setAccessForm({
        activity_type: (activeAccessLog.activity_type as AccessLogForm['activity_type']) || 'shopping',
        destination: activeAccessLog.destination || '',
        depart_time: activeAccessLog.depart_time ? activeAccessLog.depart_time.slice(0, 16) : '',
        return_time: activeAccessLog.return_time ? activeAccessLog.return_time.slice(0, 16) : '',
        participant_engagement: String(activeAccessLog.participant_engagement || 3),
        goals_text: (activeAccessLog.goals_addressed || []).join(', '),
        notes: activeAccessLog.notes || ''
      });
    }
  }, [activeAccessLog?.id]);

  const totalEstimated = shoppingForm.items.reduce((sum, item) => sum + (Number(item.estimated_cost) || 0), 0);
  const totalActual = shoppingForm.items.reduce((sum, item) => sum + (Number(item.actual_cost) || 0), 0);

  const roleLabel = currentUser?.user_metadata?.position === 'family_member'
    ? 'participant'
    : currentUser?.role === 'admin'
      ? 'coordinator'
      : 'worker';

  const saveShoppingMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        organization_id: participant.organization_id,
        participant_id: participant.id,
        shift_id: shift?.id || activeShoppingList?.shift_id || null,
        worker_id: currentUser?.id || null,
        store_name: shoppingForm.store_name,
        status: shoppingForm.status,
        created_by_role: roleLabel,
        budget_tracking_mode: shoppingForm.budget_tracking_mode,
        items: shoppingForm.items,
        total_estimated: totalEstimated,
        total_actual: totalActual,
        receipt_photo_url: shoppingForm.receipt_photo_url,
        notes: shoppingForm.notes
      };

      if (activeShoppingList?.id) {
        const { error } = await supabase
          .from('shopping_lists')
          .update(payload)
          .eq('id', activeShoppingList.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shopping_lists')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', participant.id] });
      toast.success('Shopping list saved');
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  });

  const saveAccessMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        organization_id: participant.organization_id,
        participant_id: participant.id,
        shift_id: shift?.id || activeAccessLog?.shift_id || null,
        worker_id: currentUser?.id || null,
        shopping_list_id: activeShoppingList?.id || null,
        activity_type: accessForm.activity_type,
        destination: accessForm.destination,
        depart_time: accessForm.depart_time ? new Date(accessForm.depart_time).toISOString() : null,
        return_time: accessForm.return_time ? new Date(accessForm.return_time).toISOString() : null,
        participant_engagement: Number(accessForm.participant_engagement || 3),
        goals_addressed: accessForm.goals_text.split(',').map(text => text.trim()).filter(Boolean),
        notes: accessForm.notes
      };

      if (activeAccessLog?.id) {
        const { error } = await supabase
          .from('community_access_logs')
          .update(payload)
          .eq('id', activeAccessLog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_access_logs')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-access-logs', participant.id] });
      toast.success('Community access log saved');
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  });

  const uploadReceipt = async (file: File) => {
    setUploadingReceipt(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `receipts/${participant.id}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      setShoppingForm(prev => ({ ...prev, receipt_photo_url: publicUrl }));
      toast.success('Receipt uploaded');
    } catch (err) {
      toast.error('Failed to upload receipt');
      console.error(err);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const updateItem = (index: number, patch: Partial<ShoppingItem>) => {
    setShoppingForm(prev => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-[#0088A8]" /> Shopping List / Errands</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input value={shoppingForm.store_name} onChange={(e) => setShoppingForm(prev => ({ ...prev, store_name: e.target.value }))} placeholder="Store name" />
            <Select value={shoppingForm.status} onValueChange={(value: ShoppingListForm['status']) => setShoppingForm(prev => ({ ...prev, status: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={shoppingForm.budget_tracking_mode} onValueChange={(value: ShoppingListForm['budget_tracking_mode']) => setShoppingForm(prev => ({ ...prev, budget_tracking_mode: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="forgesync">Tracked in ForgeSync</SelectItem>
                <SelectItem value="external">External / Plan Manager</SelectItem>
                <SelectItem value="none">No Budget Tracking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {shoppingForm.items.map((item, index) => (
              <div key={index} className="rounded-xl border p-3 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox checked={item.purchased} onCheckedChange={(checked) => updateItem(index, { purchased: !!checked })} className="mt-2" />
                  <div className="grid flex-1 grid-cols-1 md:grid-cols-5 gap-3">
                    <Input value={item.name} onChange={(e) => updateItem(index, { name: e.target.value })} placeholder="Item" className="md:col-span-2" />
                    <Input type="number" value={item.quantity} onChange={(e) => updateItem(index, { quantity: Number(e.target.value) || 0 })} placeholder="Qty" />
                    <Input value={item.unit} onChange={(e) => updateItem(index, { unit: e.target.value })} placeholder="Unit" />
                    <div className="flex gap-2">
                      <Input type="number" value={item.estimated_cost} onChange={(e) => updateItem(index, { estimated_cost: Number(e.target.value) || 0 })} placeholder="Est" />
                      <Input type="number" value={item.actual_cost} onChange={(e) => updateItem(index, { actual_cost: Number(e.target.value) || 0 })} placeholder="Actual" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-9">
                  <label className="flex items-center gap-2 text-xs text-gray-600">
                    <Checkbox checked={item.substituted} onCheckedChange={(checked) => updateItem(index, { substituted: !!checked })} />
                    Substituted
                  </label>
                  <Input value={item.notes} onChange={(e) => updateItem(index, { notes: e.target.value })} placeholder="Substitution / item note" className="max-w-md" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => setShoppingForm(prev => ({ ...prev, items: [...prev.items, blankItem()] }))}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
            <label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer">
              <Camera className="w-4 h-4" />
              {uploadingReceipt ? 'Uploading...' : 'Upload Receipt'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadReceipt(e.target.files[0])} />
            </label>
          </div>

          {shoppingForm.receipt_photo_url && (
            <div className="rounded-xl border p-3 flex items-center gap-3 text-sm text-gray-700">
              <Receipt className="w-4 h-4 text-[#0088A8]" />
              <a href={shoppingForm.receipt_photo_url} target="_blank" rel="noopener noreferrer" className="underline">View uploaded receipt</a>
            </div>
          )}

          <Textarea value={shoppingForm.notes} onChange={(e) => setShoppingForm(prev => ({ ...prev, notes: e.target.value }))} rows={3} placeholder="Shopping notes, substitutions, spend comments..." />

          <div className="flex items-center justify-between rounded-xl bg-slate-50 border p-4 text-sm">
            <div className="space-y-1">
              <p>Total estimated: <span className="font-semibold">${totalEstimated.toFixed(2)}</span></p>
              <p>Total actual: <span className="font-semibold">${totalActual.toFixed(2)}</span></p>
            </div>
            <Button onClick={() => saveShoppingMutation.mutate()} disabled={saveShoppingMutation.isPending} className="bg-[#0088A8] hover:bg-[#006a82]">
              {saveShoppingMutation.isPending ? 'Saving...' : 'Save Shopping List'}
            </Button>
          </div>

          {shoppingLists.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Recent lists</p>
              {shoppingLists.slice(0, 3).map(list => (
                <div key={list.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{list.store_name || 'Shopping list'}</p>
                    <p className="text-xs text-gray-500">{list.created_at ? format(new Date(list.created_at), 'PPp') : ''}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">{list.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-[#7B3F9E]" /> Community Access Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={accessForm.activity_type} onValueChange={(value: AccessLogForm['activity_type']) => setAccessForm(prev => ({ ...prev, activity_type: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="recreation">Recreation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input value={accessForm.destination} onChange={(e) => setAccessForm(prev => ({ ...prev, destination: e.target.value }))} placeholder="Destination" />
            <Input type="datetime-local" value={accessForm.depart_time} onChange={(e) => setAccessForm(prev => ({ ...prev, depart_time: e.target.value }))} />
            <Input type="datetime-local" value={accessForm.return_time} onChange={(e) => setAccessForm(prev => ({ ...prev, return_time: e.target.value }))} />
            <Select value={accessForm.participant_engagement} onValueChange={(value) => setAccessForm(prev => ({ ...prev, participant_engagement: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Low</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5 - High</SelectItem>
              </SelectContent>
            </Select>
            <Input value={accessForm.goals_text} onChange={(e) => setAccessForm(prev => ({ ...prev, goals_text: e.target.value }))} placeholder="Goals addressed (comma separated)" />
          </div>

          <Textarea value={accessForm.notes} onChange={(e) => setAccessForm(prev => ({ ...prev, notes: e.target.value }))} rows={4} placeholder="Destination, what was done, engagement, any incidents or outcomes..." />

          <div className="flex items-center justify-between rounded-xl bg-slate-50 border p-4 text-sm">
            <div className="text-gray-600">Linked shopping list: <span className="font-medium text-gray-900">{activeShoppingList?.store_name || 'Not linked yet'}</span></div>
            <Button onClick={() => saveAccessMutation.mutate()} disabled={saveAccessMutation.isPending} className="bg-[#7B3F9E] hover:bg-[#643281]">
              {saveAccessMutation.isPending ? 'Saving...' : 'Save Activity Log'}
            </Button>
          </div>

          {accessLogs.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Recent activity logs</p>
              {accessLogs.slice(0, 4).map(log => (
                <div key={log.id} className="rounded-lg border px-3 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-medium text-gray-900 capitalize">{log.activity_type}</p>
                    <Badge variant="outline">{log.participant_engagement || 0}/5</Badge>
                  </div>
                  <p className="text-gray-600">{log.destination || 'No destination recorded'}</p>
                  <p className="text-xs text-gray-500 mt-1">{log.created_at ? format(new Date(log.created_at), 'PPp') : ''}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
