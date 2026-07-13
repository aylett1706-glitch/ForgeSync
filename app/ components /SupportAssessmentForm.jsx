'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Save } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

// --- Type Definitions ---
interface CapacityDomain {
  rating: number;
  notes: string;
}

interface ParticipantVoice {
  goals_aspirations: string;
  daily_life_preferences: string;
  support_preferences: string;
  cultural_considerations: string;
  communication_preferences: string;
}

interface CapacityRatings {
  self_care: CapacityDomain;
  mobility: CapacityDomain;
  communication: CapacityDomain;
  social_community: CapacityDomain;
  learning_development: CapacityDomain;
  work_education: CapacityDomain;
}

interface SupportNeeds {
  core_supports: string;
  capacity_building: string;
  capital_supports: string;
}

interface EnvironmentalFactors {
  home_environment: string;
  community_access: string;
  support_network: string;
  barriers_identified: string[];
}

interface Recommendations {
  immediate_priorities: string[];
  medium_term_goals: string[];
  support_strategies: string;
  estimated_funding_needs: string;
}

interface FormData {
  participant_id: string;
  case_id: string;
  assessment_framework: string;
  assessment_date: string;
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  participant_voice: ParticipantVoice;
  capacity_ratings: CapacityRatings;
  support_needs: SupportNeeds;
  environmental_factors: EnvironmentalFactors;
  recommendations: Recommendations;
  linked_goal_ids: string[];
  participant_consent: boolean;
  guardian_consent: boolean;
  next_review_due: string;
  organization_id?: string;
  assessor_id?: string;
}

interface Props {
  assessment?: Database['public']['Tables']['support_assessments']['Row'];
  onClose: () => void;
}

const initialFormData: FormData = {
  participant_id: '',
  case_id: '',
  assessment_framework: 'i_can_v6',
  assessment_date: new Date().toISOString().split('T')[0],
  status: 'draft',
  participant_voice: {
    goals_aspirations: '',
    daily_life_preferences: '',
    support_preferences: '',
    cultural_considerations: '',
    communication_preferences: ''
  },
  capacity_ratings: {
    self_care: { rating: 3, notes: '' },
    mobility: { rating: 3, notes: '' },
    communication: { rating: 3, notes: '' },
    social_community: { rating: 3, notes: '' },
    learning_development: { rating: 3, notes: '' },
    work_education: { rating: 3, notes: '' }
  },
  support_needs: {
    core_supports: '',
    capacity_building: '',
    capital_supports: ''
  },
  environmental_factors: {
    home_environment: '',
    community_access: '',
    support_network: '',
    barriers_identified: []
  },
  recommendations: {
    immediate_priorities: [],
    medium_term_goals: [],
    support_strategies: '',
    estimated_funding_needs: ''
  },
  linked_goal_ids: [],
  participant_consent: false,
  guardian_consent: false,
  next_review_due: ''
};

// --- Component ---
export default function SupportAssessmentForm({ assessment, onClose }: Props) {
  const supabase = createClientComponentClient<Database>();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Get authenticated user and organization
  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Get organization ID from your profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
      setOrgId(profile?.organization_id || null);
    };
    getSession();
  }, [supabase]);

  // Load existing assessment data
  useEffect(() => {
    if (assessment) {
      setFormData({
        ...initialFormData,
        ...assessment,
        participant_voice: assessment.participant_voice || initialFormData.participant_voice,
        capacity_ratings: assessment.capacity_ratings || initialFormData.capacity_ratings,
        support_needs: assessment.support_needs || initialFormData.support_needs,
        environmental_factors: assessment.environmental_factors || initialFormData.environmental_factors,
        recommendations: assessment.recommendations || initialFormData.recommendations
      });
    }
  }, [assessment]);

  // Fetch participants for current organization
  const { data: participants = [] } = useQuery({
    queryKey: ['participants', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('participants')
        .select('id, first_name, last_name')
        .eq('organization_id', orgId)
        .order('last_name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId
  });

  // Create / Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!userId || !orgId) throw new Error('Missing user or organization details');

      const payload = {
        ...data,
        assessor_id: userId,
        organization_id: orgId,
        updated_at: new Date().toISOString()
      };

      if (assessment) {
        const { error } = await supabase
          .from('support_assessments')
          .update(payload)
          .eq('id', assessment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('support_assessments')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-assessments'] });
      toast.success(assessment ? 'Assessment updated successfully' : 'Assessment created successfully');
      onClose();
    },
    onError: (err) => {
      toast.error(`Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const capacityLabels: Record<number, string> = {
    1: 'Significant Support Needed',
    2: 'Moderate Support Needed',
    3: 'Some Support Needed',
    4: 'Minimal Support Needed',
    5: 'Independent'
  };

  const updateCapacityRating = (domain: keyof CapacityRatings, rating: number) => {
    setFormData(prev => ({
      ...prev,
      capacity_ratings: {
        ...prev.capacity_ratings,
        [domain]: { ...prev.capacity_ratings[domain], rating }
      }
    }));
  };

  const updateCapacityNotes = (domain: keyof CapacityRatings, notes: string) => {
    setFormData(prev => ({
      ...prev,
      capacity_ratings: {
        ...prev.capacity_ratings,
        [domain]: { ...prev.capacity_ratings[domain], notes }
      }
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {assessment ? 'Edit Support Assessment' : 'New Support Assessment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Participant *</Label>
              <Select
                value={formData.participant_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, participant_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select participant" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.first_name} {p.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Assessment Date *</Label>
              <Input
                type="date"
                value={formData.assessment_date}
                onChange={(e) => setFormData(prev => ({ ...prev, assessment_date: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="voice" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="voice">Voice</TabsTrigger>
              <TabsTrigger value="capacity">Capacity</TabsTrigger>
              <TabsTrigger value="support">Support Needs</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            {/* Voice Tab */}
            <TabsContent value="voice" className="space-y-4">
              <div>
                <Label>What matters most to you? (Goals & Aspirations) *</Label>
                <Textarea
                  value={formData.participant_voice.goals_aspirations}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    participant_voice: { ...prev.participant_voice, goals_aspirations: e.target.value }
                  }))}
                  placeholder="What are your hopes, dreams, and goals for your life?"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Daily Life Preferences</Label>
                <Textarea
                  value={formData.participant_voice.daily_life_preferences}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    participant_voice: { ...prev.participant_voice, daily_life_preferences: e.target.value }
                  }))}
                  placeholder="How do you like to spend your day? What routines are important?"
                  rows={3}
                />
              </div>

              <div>
                <Label>Support Preferences</Label>
                <Textarea
                  value={formData.participant_voice.support_preferences}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    participant_voice: { ...prev.participant_voice, support_preferences: e.target.value }
                  }))}
                  placeholder="What type of support works best for you? Who do you prefer to support you?"
                  rows={3}
                />
              </div>

              <div>
                <Label>Cultural Considerations</Label>
                <Textarea
                  value={formData.participant_voice.cultural_considerations}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    participant_voice: { ...prev.participant_voice, cultural_considerations: e.target.value }
                  }))}
                  placeholder="Cultural, spiritual, or religious considerations..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Communication Preferences</Label>
                <Textarea
                  value={formData.participant_voice.communication_preferences}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    participant_voice: { ...prev.participant_voice, communication_preferences: e.target.value }
                  }))}
                  placeholder="How do you prefer to communicate?"
                  rows={2}
                />
              </div>
            </TabsContent>

            {/* Capacity Tab */}
            <TabsContent value="capacity" className="space-y-6">
              {(Object.keys(formData.capacity_ratings) as Array<keyof CapacityRatings>).map((domain) => (
                <div key={domain} className="border rounded-lg p-4 space-y-3">
                  <Label className="text-base font-semibold capitalize">
                    {domain.replace(/_/g, ' ')}
                  </Label>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Support Level</span>
                      <span className="font-medium text-blue-600">
                        {capacityLabels[formData.capacity_ratings[domain].rating]}
                      </span>
                    </div>
                    <Slider
                      value={[formData.capacity_ratings[domain].rating]}
                      onValueChange={(value) => updateCapacityRating(domain, value[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>High Support</span>
                      <span>Independent</span>
                    </div>
                  </div>

                  <Textarea
                    value={formData.capacity_ratings[domain].notes}
                    onChange={(e) => updateCapacityNotes(domain, e.target.value)}
                    placeholder="Notes and observations..."
                    rows={2}
                  />
                </div>
              ))}
            </TabsContent>

            {/* Support Needs Tab */}
            <TabsContent value="support" className="space-y-4">
              <div>
                <Label>Core Supports (Daily Living, Transport, Consumables)</Label>
                <Textarea
                  value={formData.support_needs.core_supports}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    support_needs: { ...prev.support_needs, core_supports: e.target.value }
                  }))}
                  placeholder="What core daily supports are needed?"
                  rows={4}
                />
              </div>

              <div>
                <Label>Capacity Building (Skills, Coordination)</Label>
                <Textarea
                  value={formData.support_needs.capacity_building}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    support_needs: { ...prev.support_needs, capacity_building: e.target.value }
                  }))}
                  placeholder="What skills and capacity building supports are needed?"
                  rows={4}
                />
              </div>

              <div>
                <Label>Capital Supports (Equipment, Modifications)</Label>
                <Textarea
                  value={formData.support_needs.capital_supports}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    support_needs: { ...prev.support_needs, capital_supports: e.target.value }
                  }))}
                  placeholder="What equipment or home modifications are needed?"
                  rows={4}
                />
              </div>
            </TabsContent>

            {/* Environment Tab */}
            <TabsContent value="environment" className="space-y-4">
              <div>
                <Label>Home Environment</Label>
                <Textarea
                  value={formData.environmental_factors.home_environment}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    environmental_factors: { ...prev.environmental_factors, home_environment: e.target.value }
                  }))}
                  placeholder="Describe the home environment..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Community Access</Label>
                <Textarea
                  value={formData.environmental_factors.community_access}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    environmental_factors: { ...prev.environmental_factors, community_access: e.target.value }
                  }))}
                  placeholder="Access to community, transport, services..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Support Network</Label>
                <Textarea
                  value={formData.environmental_factors.support_network}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    environmental_factors: { ...prev.environmental_factors, support_network: e.target.value }
                  }))}
                  placeholder="Family, friends, natural supports..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              <div>
                <Label>Support Strategies</Label>
                <Textarea
                  value={formData.recommendations.support_strategies}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    recommendations: { ...prev.recommendations, support_strategies: e.target.value }
                  }))}
                  placeholder="Recommended approaches and strategies..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Estimated Funding Needs</Label>
                <Textarea
                  value={formData.recommendations.estimated_funding_needs}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    recommendations: { ...prev.recommendations, estimated_funding_needs: e.target.value }
                  }))}
                  placeholder="Estimated budget requirements by category..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Next Review Due</Label>
                <Input
                  type="date"
                  value={formData.next_review_due}
                  onChange={(e) => setFormData(prev => ({ ...prev, next_review_due: e.target.value }))}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Consent Section */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.participant_consent}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, participant_consent: Boolean(checked) }))}
              />
              <Label>Participant consent obtained</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.guardian_consent}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, guardian_consent: Boolean(checked) }))}
              />
              <Label>Guardian/nominee consent obtained (if applicable)</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending || !formData.participant_id || !formData.participant_voice.goals_aspirations}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Assessment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
