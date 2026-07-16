'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Building2, X, Upload } from 'lucide-react';
import AILocationSearch from '@/components/AILocationSearch';
import DocumentManager from '@/components/shared/DocumentManager';
import LinkedPropertyDetails from './LinkedPropertyDetails';
import HubPathwayActions from './HubPathwayActions';

const HUB_TYPES = [
  { value: 'sil', label: 'SIL (Supported Independent Living)' },
  { value: 'sda', label: 'SDA (Specialist Disability Accommodation)' },
  { value: 'ilo', label: 'ILO (Individual Living Options)' },
  { value: 'respite', label: 'Respite' },
  { value: 'community_centre', label: 'Community Centre' },
  { value: 'day_program', label: 'Day Program' },
  { value: 'group_home', label: 'Group Home' },
  { value: 'supported_accommodation', label: 'Supported Accommodation' },
  { value: 'other', label: 'Other' },
];

const ROSTER_MODELS = [
  { value: '24_7_active', label: '24/7 Active' },
  { value: 'sleepover', label: 'Sleepover' },
  { value: 'awake_night', label: 'Awake Night' },
  { value: 'active_night', label: 'Active Night' },
  { value: 'day_only', label: 'Day Only' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'on_call', label: 'On Call' },
];

interface HubFormData {
  name: string;
  hub_type: string;
  description?: string;
  status: string;
  funding_type?: string;
  capacity?: number | string;
  current_occupancy?: number;
  waitlist_count?: number;
  locations?: any[];
  hub_manager_id?: string;
  primary_contact_name?: string;
  primary_contact_phone?: string;
  primary_contact_email?: string;
  team_leader_ids?: string[];
  worker_ids?: string[];
  participant_ids?: string[];
  parent_hub_id?: string;
  hub_level?: string;
  roster_model?: string;
  staffing_ratio?: string;
  shift_coverage_pattern?: string;
  required_training?: string[];
  preferred_worker_attributes?: string;
  staff_notes?: string;
  property_type?: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  accessibility_features?: string;
  vehicle_assigned?: string;
  emergency_evacuation_point?: string;
  key_access_notes?: string;
  neighbourhood_notes?: string;
  sensory_environment?: string;
  smoking_rules?: string;
  pets_policy?: string;
  risk_environment_notes?: string;
  gender_preference?: string;
  age_range?: string;
  compatibility_notes?: string;
  house_dynamic_notes?: string;
  matching_considerations?: string;
  exclusion_mismatch_notes?: string;
  placement_notes?: string;
  shared_living_notes?: string;
  funding_source?: string;
  funding_line_items?: string;
  claiming_model?: string;
  hub_cost_centre?: string;
  budget_category?: string;
  transport_funding_notes?: string;
  consumables_budget?: number | string;
  sda_sil_ilo_notes?: string;
  funding_notes?: string;
  fire_safety_status?: string;
  incident_risk_level?: string;
  medication_support_at_site?: boolean;
  restrictive_practices_in_place?: boolean;
  restrictive_practices_notes?: string;
  property_hazards?: string;
  staff_induction_completed?: boolean;
  mandatory_checks_completed?: boolean;
  audit_status?: string;
  house_rules?: string;
  cleaning_schedule?: string;
  medication_storage_info?: string;
  house_notes?: string;
}

interface Props {
  hub?: any;
  organizationId?: string;
  workers?: any[];
  participants?: any[];
  properties?: any[];
  hubs?: any[];
  onClose: () => void;
}

export default function HubFormDialog({
  hub,
  organizationId,
  workers = [],
  participants = [],
  properties = [],
  hubs = [],
  onClose,
}: Props) {
  const queryClient = useQueryClient();

  const defaults: HubFormData = {
    name: '',
    hub_type: 'sil',
    description: '',
    status: 'active',
    funding_type: 'SIL',
    capacity: '',
    current_occupancy: 0,
    waitlist_count: 0,
    locations: [],
    hub_manager_id: '',
    primary_contact_name: '',
    primary_contact_phone: '',
    primary_contact_email: '',
    team_leader_ids: [],
    worker_ids: [],
    participant_ids: [],
    parent_hub_id: '',
    hub_level: 'site',
    roster_model: '24_7_active',
    staffing_ratio: '',
    shift_coverage_pattern: '',
    required_training: [],
    preferred_worker_attributes: '',
    staff_notes: '',
    property_type: 'house',
    bedrooms: '',
    bathrooms: '',
    accessibility_features: '',
    vehicle_assigned: '',
    emergency_evacuation_point: '',
    key_access_notes: '',
    neighbourhood_notes: '',
    sensory_environment: '',
    smoking_rules: 'no_smoking',
    pets_policy: 'no_pets',
    risk_environment_notes: '',
    gender_preference: 'any',
    age_range: '',
    compatibility_notes: '',
    house_dynamic_notes: '',
    matching_considerations: '',
    exclusion_mismatch_notes: '',
    placement_notes: '',
    shared_living_notes: '',
    funding_source: '',
    funding_line_items: '',
    claiming_model: 'portal',
    hub_cost_centre: '',
    budget_category: '',
    transport_funding_notes: '',
    consumables_budget: '',
    sda_sil_ilo_notes: '',
    funding_notes: '',
    fire_safety_status: 'not_assessed',
    incident_risk_level: 'low',
    medication_support_at_site: false,
    restrictive_practices_in_place: false,
    restrictive_practices_notes: '',
    property_hazards: '',
    staff_induction_completed: false,
    mandatory_checks_completed: false,
    audit_status: 'not_assessed',
    house_rules: '',
    cleaning_schedule: '',
    medication_storage_info: '',
    house_notes: '',
  };

  const initialData = hub
    ? Object.keys(defaults).reduce((acc, key) => {
        const hubVal = hub[key];
        acc[key as keyof HubFormData] = hubVal !== null && hubVal !== undefined ? hubVal : defaults[key as keyof HubFormData];
        return acc;
      }, {} as HubFormData)
    : { ...defaults };

  const [formData, setFormData] = useState<HubFormData>(initialData);
  const [newPropertyId, setNewPropertyId] = useState('');
  const [newCustomAddress, setNewCustomAddress] = useState('');
  const [newTraining, setNewTraining] = useState('');

  const updateField = (key: keyof HubFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (field: keyof HubFormData, id: string) => {
    setFormData(prev => {
      const current = (prev[field] as string[]) || [];
      const exists = current.includes(id);
      return { ...prev, [field]: exists ? current.filter(x => x !== id) : [...current, id] };
    });
  };

  const addPropertyLocation = () => {
    if (!newPropertyId) return;
    const property = properties.find(p => p.id === newPropertyId);
    if (!property) return;
    updateField('locations', [
      ...(formData.locations || []),
      { type: 'property', property_id: property.id, name: property.name, address: property.address }
    ]);
    setNewPropertyId('');
  };

  const addCustomLocation = () => {
    if (!newCustomAddress.trim()) return;
    updateField('locations', [
      ...(formData.locations || []),
      { type: 'custom', address: newCustomAddress.trim() }
    ]);
    setNewCustomAddress('');
  };

  const removeLocation = (idx: number) => {
    updateField('locations', (formData.locations || []).filter((_, i) => i !== idx));
  };

  const addTraining = () => {
    if (!newTraining.trim()) return;
    updateField('required_training', [...(formData.required_training || []), newTraining.trim()]);
    setNewTraining('');
  };

  const saveMutation = useMutation({
    mutationFn: async (data: HubFormData) => {
      const payload = { ...data };
      // Clean numeric fields
      ['capacity', 'bedrooms', 'bathrooms', 'waitlist_count', 'current_occupancy'].forEach(key => {
        if (payload[key as keyof HubFormData] === '' || payload[key as keyof HubFormData] === null || payload[key as keyof HubFormData] === undefined) {
          delete payload[key as keyof HubFormData];
        } else {
          (payload as any)[key] = parseInt(payload[key as keyof HubFormData] as string) || 0;
        }
      });
      if ((payload as any).consumables_budget === '' || (payload as any).consumables_budget === null || (payload as any).consumables_budget === undefined) {
        delete (payload as any).consumables_budget;
      } else {
        (payload as any).consumables_budget = parseFloat((payload as any).consumables_budget) || 0;
      }
      payload.organization_id = organizationId;
      if (hub) return base44.entities.Hub.update(hub.id, payload);
      return base44.entities.Hub.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['hubs']);
      toast.success(hub ? 'Hub updated successfully' : 'Hub created successfully');
      onClose();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to save hub';
      toast.error(msg);
    }
  });

  const SelectField = ({ 
    label, 
    value, 
    onChange, 
    options 
  }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void; 
    options: { value: string; label: string }[]; 
  }) => (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
      <select 
        className="w-full border rounded-md p-2 h-10 text-sm" 
        value={value} 
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl lg:h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0088A8]" />
            {hub ? 'Edit Hub' : 'Create Hub'}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 py-2 flex-1 overflow-y-auto pr-1">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList className="grid h-auto w-full grid-cols-4 lg:grid-cols-8 mb-4">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="people" className="text-xs">People</TabsTrigger>
              <TabsTrigger value="operations" className="text-xs">Operations</TabsTrigger>
              <TabsTrigger value="property" className="text-xs">Property</TabsTrigger>
              <TabsTrigger value="placement" className="text-xs">Placement</TabsTrigger>
              <TabsTrigger value="funding" className="text-xs">Funding</TabsTrigger>
              <TabsTrigger value="safety" className="text-xs">Safety</TabsTrigger>
              <TabsTrigger value="docs" className="text-xs">Docs</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pr-1 space-y-6">
              {/* OVERVIEW */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Hub Name *</label>
                    <Input 
                      value={formData.name} 
                      onChange={e => updateField('name', e.target.value)} 
                      placeholder="e.g. Northside SIL House" 
                    />
                  </div>
                  <SelectField 
                    label="Hub Type" 
                    value={formData.hub_type} 
                    onChange={v => updateField('hub_type', v)} 
                    options={HUB_TYPES} 
                  />
                  <SelectField 
                    label="Status" 
                    value={formData.status} 
                    onChange={v => updateField('status', v)} 
                    options={[
                      { value: 'active', label: 'Active' }, 
                      { value: 'inactive', label: 'Inactive' },
                      { value: 'under_maintenance', label: 'Under Maintenance' }, 
                      { value: 'pending_setup', label: 'Pending Setup' }, 
                      { value: 'closed', label: 'Closed' }
                    ]} 
                  />
                  <SelectField 
                    label="Funding Type" 
                    value={formData.funding_type} 
                    onChange={v => updateField('funding_type', v)} 
                    options={[
                      { value: 'SIL', label: 'SIL' }, 
                      { value: 'SDA', label: 'SDA' }, 
                      { value: 'ILO', label: 'ILO' },
                      { value: 'Community', label: 'Community' }, 
                      { value: 'Mixed', label: 'Mixed' }, 
                      { value: 'Other', label: 'Other' }
                    ]} 
                  />
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Capacity (Beds/Spots)</label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={formData.capacity} 
                      onChange={e => updateField('capacity', e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Waitlist Count</label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={formData.waitlist_count} 
                      onChange={e => updateField('waitlist_count', parseInt(e.target.value) || 0)} 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                  <Textarea 
                    value={formData.description} 
                    onChange={e => updateField('description', e.target.value)} 
                    rows={2} 
                  />
                </div>
                {/* More fields ... */}
              </TabsContent>

              {/* Other tabs would go here */}
              {/* ... */}
            </div>
          </Tabs>
        </div>

        <DialogFooter className="border-t bg-background pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            disabled={!formData.name || saveMutation.isPending} 
            onClick={() => saveMutation.mutate(formData)} 
            className="bg-gradient-to-r from-[#0088A8] to-[#7B3F9E] text-white"
          >
            {saveMutation.isPending ? 'Saving...' : hub ? 'Save Changes' : 'Create Hub'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
