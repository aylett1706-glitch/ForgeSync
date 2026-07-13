'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Edit, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

type AssessmentRow = Database['public']['Tables']['support_assessments']['Row'];
type ParticipantRow = Database['public']['Tables']['participants']['Row'];

interface Props {
  assessment: AssessmentRow;
  onClose: () => void;
  onEdit: () => void;
}

export default function SupportAssessmentView({ assessment, onClose, onEdit }: Props) {
  const supabase = createClientComponentClient<Database>();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  // Fetch participant details directly from Supabase
  const { data: participant } = useQuery<ParticipantRow>({
    queryKey: ['participant', assessment.participant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', assessment.participant_id)
        .single();
      if (error) throw error;
      return data;
    }
  });

  // Update assessment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const updatePayload = {
        status,
        submitted_to_ndis_date: status === 'submitted_to_ndis' 
          ? new Date().toISOString() 
          : assessment.submitted_to_ndis_date,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('support_assessments')
        .update(updatePayload)
        .eq('id', assessment.id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-assessments'] });
      toast.success('Status updated successfully');
      onClose();
    },
    onError: (err) => {
      toast.error(`Failed to update status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  });

  // Generate report using Supabase Edge Function
  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-assessment-report', {
        body: { assessment_id: assessment.id }
      });

      if (error) throw error;

      if (data?.report_url) {
        // Update assessment with report details
        await supabase
          .from('support_assessments')
          .update({
            report_url: data.report_url,
            report_generated: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', assessment.id);

        queryClient.invalidateQueries({ queryKey: ['support-assessments'] });
        window.open(data.report_url, '_blank');
        toast.success('Report generated successfully');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const capacityLabels: Record<number, string> = {
    1: 'Significant Support Needed',
    2: 'Moderate Support Needed',
    3: 'Some Support Needed',
    4: 'Minimal Support Needed',
    5: 'Independent'
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Support Assessment
            </span>
            <div className="flex gap-2">
              {assessment.status !== 'submitted_to_ndis' && (
                <Button size="sm" variant="outline" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={generateReport}
                disabled={generating}
              >
                <Download className="w-4 h-4 mr-1" />
                {generating ? 'Generating...' : 'Export Report'}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Participant Information */}
          <Card>
            <CardHeader>
              <CardTitle>Participant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Participant</p>
                  <p className="font-semibold">
                    {participant ? `${participant.first_name} ${participant.last_name}` : 'Loading...'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Assessment Date</p>
                  <p className="font-semibold">
                    {new Date(assessment.assessment_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Framework</p>
                  <Badge variant="outline">
                    {assessment.assessment_framework?.replace(/_/g, ' ').toUpperCase() || 'I-CAN V6'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge>{assessment.status?.replace(/_/g, ' ') || 'Draft'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participant Voice & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Participant Voice & Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assessment.participant_voice?.goals_aspirations && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Goals & Aspirations</p>
                  <p className="text-gray-600 italic">"{assessment.participant_voice.goals_aspirations}"</p>
                </div>
              )}
              {assessment.participant_voice?.daily_life_preferences && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Daily Life Preferences</p>
                  <p className="text-gray-600">{assessment.participant_voice.daily_life_preferences}</p>
                </div>
              )}
              {assessment.participant_voice?.support_preferences && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Support Preferences</p>
                  <p className="text-gray-600">{assessment.participant_voice.support_preferences}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Capacity Ratings */}
          <Card>
            <CardHeader>
              <CardTitle>Capacity Ratings (I-CAN Framework)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {assessment.capacity_ratings && Object.entries(assessment.capacity_ratings).map(([domain, data]) => (
                  <div key={domain} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium capitalize">{domain.replace(/_/g, ' ')}</p>
                      {data?.notes && <p className="text-sm text-gray-600">{data.notes}</p>}
                    </div>
                    <Badge variant="outline">
                      {capacityLabels[data?.rating as number] || 'Not rated'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support Needs */}
          <Card>
            <CardHeader>
              <CardTitle>Support Needs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assessment.support_needs?.core_supports && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Core Supports</p>
                  <p className="text-gray-600">{assessment.support_needs.core_supports}</p>
                </div>
              )}
              {assessment.support_needs?.capacity_building && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Capacity Building</p>
                  <p className="text-gray-600">{assessment.support_needs.capacity_building}</p>
                </div>
              )}
              {assessment.support_needs?.capital_supports && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Capital Supports</p>
                  <p className="text-gray-600">{assessment.support_needs.capital_supports}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assessment.recommendations?.support_strategies && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Support Strategies</p>
                  <p className="text-gray-600">{assessment.recommendations.support_strategies}</p>
                </div>
              )}
              {assessment.recommendations?.estimated_funding_needs && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Estimated Funding Needs</p>
                  <p className="text-gray-600">{assessment.recommendations.estimated_funding_needs}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consent Status */}
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Consent Status</p>
              <p className="text-xs text-gray-600">
                Participant: {assessment.participant_consent ? '✓ Obtained' : '✗ Not obtained'} | 
                Guardian: {assessment.guardian_consent ? '✓ Obtained' : '✗ Not obtained'}
              </p>
            </div>
          </div>

          {/* Submit to NDIS Button */}
          {assessment.status === 'completed' && !assessment.submitted_to_ndis_date && (
            <Button 
              onClick={() => updateStatusMutation.mutate('submitted_to_ndis')}
              disabled={updateStatusMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
            >
              <Send className="w-4 h-4 mr-2" />
              {updateStatusMutation.isPending ? 'Submitting...' : 'Mark as Submitted to NDIS'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
