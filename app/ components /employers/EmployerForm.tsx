'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { INDUSTRY_OPTIONS } from '@/components/access/industryAccess';

interface EmployerFormData {
  id?: string;
  organization_id: string;
  business_name: string;
  abn?: string;
  industry: string;
  business_type: string;
  primary_contact_name: string;
  primary_contact_position?: string;
  email: string;
  phone: string;
  address?: string;
  website?: string;
  accessibility_features?: string;
  placement_capacity?: number;
  willing_to_hire: boolean;
  partnership_status: string;
  support_required: string;
  engagement_notes?: string;
}

interface Props {
  employer?: EmployerFormData | null;
  organizationId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EmployerForm({ employer = null, organizationId, onClose, onSuccess }: Props) {
  const supabase = createClient();

  const [formData, setFormData] = useState<EmployerFormData>(
    employer || {
      organization_id: organizationId,
      business_name: '',
      abn: '',
      industry: 'supported_employment',
      business_type: 'medium',
      primary_contact_name: '',
      primary_contact_position: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      accessibility_features: '',
      placement_capacity: 0,
      willing_to_hire: false,
      partnership_status: 'prospect',
      support_required: 'medium',
      engagement_notes: '',
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        organization_id: organizationId,
        placement_capacity: Number(formData.placement_capacity) || 0,
      };

      let error;

      if (employer?.id) {
        // Update
        ({ error } = await supabase
          .from('employers')
          .update(payload)
          .eq('id', employer.id));
      } else {
        // Create
        ({ error } = await supabase.from('employers').insert(payload));
      }

      if (error) throw error;

      toast.success(employer ? 'Employer updated successfully' : 'Employer created successfully');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof EmployerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {employer ? 'Edit Employer' : 'Add New Employer'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Business Name <span className="text-red-500">*</span></Label>
              <Input
                value={formData.business_name}
                onChange={(e) => updateField('business_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>ABN</Label>
              <Input
                value={formData.abn || ''}
                onChange={(e) => updateField('abn', e.target.value)}
                placeholder="12 345 678 901"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Industry / Sector</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => updateField('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Business Type</Label>
              <Select 
                value={formData.business_type} 
                onValueChange={(value) => updateField('business_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="non_profit">Non-Profit</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Primary Contact Name <span className="text-red-500">*</span></Label>
              <Input
                value={formData.primary_contact_name}
                onChange={(e) => updateField('primary_contact_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Position / Title</Label>
              <Input
                value={formData.primary_contact_position || ''}
                onChange={(e) => updateField('primary_contact_position', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Phone <span className="text-red-500">*</span></Label>
              <Input
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label>Address</Label>
            <Input
              value={formData.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
            />
          </div>

          <div>
            <Label>Website</Label>
            <Input
              type="url"
              value={formData.website || ''}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Placement Capacity</Label>
              <Input
                type="number"
                value={formData.placement_capacity}
                onChange={(e) => updateField('placement_capacity', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label>Partnership Status</Label>
              <Select 
                value={formData.partnership_status} 
                onValueChange={(value) => updateField('partnership_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="preferred">Preferred</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Support Required</Label>
              <Select 
                value={formData.support_required} 
                onValueChange={(value) => updateField('support_required', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Accessibility Features</Label>
            <Textarea
              value={formData.accessibility_features || ''}
              onChange={(e) => updateField('accessibility_features', e.target.value)}
              placeholder="Wheelchair access, quiet rooms, support worker friendly, etc."
              rows={3}
            />
          </div>

          <div>
            <Label>Engagement Notes</Label>
            <Textarea
              value={formData.engagement_notes || ''}
              onChange={(e) => updateField('engagement_notes', e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              checked={formData.willing_to_hire}
              onCheckedChange={(checked) => updateField('willing_to_hire', checked)}
            />
            <Label className="cursor-pointer">
              Willing to hire participants directly
            </Label>
          </div>

          <div className="flex gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#0088A8] to-[#7B3F9E] hover:brightness-105"
            >
              {isSubmitting ? 'Saving...' : employer ? 'Update Employer' : 'Create Employer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
