'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const CATEGORIES = ['ui', 'workflow', 'integration', 'experimental', 'compliance', 'performance', 'other'] as const;
const ENVIRONMENTS = ['all', 'production', 'development'] as const;

interface FeatureFlag {
  id?: string;
  key: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  category: string;
  environment: string;
  organization_id?: string;
  rollout_percentage: number;
  target_roles: string[];
  target_user_ids: string[];
  expires_at?: string;
  notes?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flag?: FeatureFlag | null;
  organizations?: any[];
}

const DEFAULT_FLAG: FeatureFlag = {
  key: '',
  name: '',
  description: '',
  is_enabled: false,
  category: 'other',
  environment: 'all',
  organization_id: '',
  rollout_percentage: 100,
  target_roles: [],
  target_user_ids: [],
  expires_at: '',
  notes: '',
};

export default function FlagFormDialog({
  open,
  onOpenChange,
  flag,
  organizations = [],
}: Props) {
  const supabase = createClient();

  const [form, setForm] = useState<FeatureFlag>(DEFAULT_FLAG);
  const [rolesText, setRolesText] = useState('');
  const [userIdsText, setUserIdsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!flag?.id;

  useEffect(() => {
    if (open) {
      if (flag) {
        setForm({
          ...DEFAULT_FLAG,
          ...flag,
          organization_id: flag.organization_id || '',
        });
        setRolesText((flag.target_roles || []).join(', '));
        setUserIdsText((flag.target_user_ids || []).join(', '));
      } else {
        setForm(DEFAULT_FLAG);
        setRolesText('');
        setUserIdsText('');
      }
    }
  }, [open, flag]);

  const update = (field: keyof FeatureFlag, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.key?.trim() || !form.name?.trim()) {
      toast.error('Flag Key and Name are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        organization_id: form.organization_id || null,
        target_roles: rolesText ? rolesText.split(',').map(s => s.trim()).filter(Boolean) : [],
        target_user_ids: userIdsText ? userIdsText.split(',').map(s => s.trim()).filter(Boolean) : [],
        expires_at: form.expires_at || null,
        rollout_percentage: Number(form.rollout_percentage),
      };

      let error;

      if (isEditing && flag?.id) {
        ({ error } = await supabase
          .from('feature_flags')
          .update(payload)
          .eq('id', flag.id));
      } else {
        ({ error } = await supabase.from('feature_flags').insert(payload));
      }

      if (error) throw error;

      toast.success(isEditing ? 'Feature flag updated' : 'Feature flag created');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save feature flag');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? 'Edit Feature Flag' : 'Create New Feature Flag'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Flag Key {isEditing ? '(Locked)' : '*'}</Label>
              <Input
                placeholder="e.g. beta_ai_insights"
                value={form.key}
                onChange={(e) => update('key', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                disabled={isEditing}
              />
              <p className="text-xs text-muted-foreground mt-1">Used in code. Cannot be changed later.</p>
            </div>
            <div>
              <Label>Display Name *</Label>
              <Input
                placeholder="e.g. AI Insights Beta"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="What does this flag control?"
              value={form.description || ''}
              onChange={(e) => update('description', e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => update('category', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Environment</Label>
              <Select value={form.environment} onValueChange={(v) => update('environment', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENVIRONMENTS.map(e => (
                    <SelectItem key={e} value={e}>
                      {e.charAt(0).toUpperCase() + e.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Scope</Label>
              <Select 
                value={form.organization_id || '__global__'} 
                onValueChange={(v) => update('organization_id', v === '__global__' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__global__">Global (All Organizations)</SelectItem>
                  {organizations.map((org: any) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name || org.app_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="flex justify-between">
              Rollout Percentage: <span className="font-mono">{form.rollout_percentage}%</span>
            </Label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[form.rollout_percentage]}
              onValueChange={([val]) => update('rollout_percentage', val)}
              className="mt-3"
            />
            <p className="text-xs text-muted-foreground mt-1">
              100% = full rollout. Lower values = gradual release.
            </p>
          </div>

          <div>
            <Label>Target Roles (comma-separated)</Label>
            <Input
              placeholder="admin, coordinator, support"
              value={rolesText}
              onChange={(e) => setRolesText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Leave empty to target all roles</p>
          </div>

          <div>
            <Label>Target User IDs (comma-separated)</Label>
            <Input
              placeholder="user_123, user_456"
              value={userIdsText}
              onChange={(e) => setUserIdsText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Leave empty to not restrict by user</p>
          </div>

          <div>
            <Label>Expiry Date (Optional)</Label>
            <Input
              type="date"
              value={form.expires_at || ''}
              onChange={(e) => update('expires_at', e.target.value)}
            />
          </div>

          <div>
            <Label>Internal Notes</Label>
            <Textarea
              placeholder="Notes for the team..."
              value={form.notes || ''}
              onChange={(e) => update('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
            <div>
              <p className="font-medium">Enable Flag</p>
              <p className="text-sm text-muted-foreground">Activate immediately</p>
            </div>
            <Switch
              checked={form.is_enabled}
              onCheckedChange={(checked) => update('is_enabled', checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Flag' : 'Create Flag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
