'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClinicalMandatoryChecklist, { buildClinicalChecklistStatus } from './ClinicalMandatoryChecklist';

// --- Type Definitions ---
type ShiftRow = Database['public']['Tables']['shifts']['Row'];
type ParticipantRow = Database['public']['Tables']['participants']['Row'];

interface Props {
  shift: ShiftRow;
  participant?: ParticipantRow;
}

export default function ShiftCompletionChecklist({ shift, participant }: Props) {
  const supabase = createClientComponentClient<Database>();
  const queryClient = useQueryClient();
  const organizationId = shift?.organization_id;

  // Fetch support plans
  const { data: supportPlans = [] } = useQuery({
    queryKey: ['shift-completion-plans', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data } = await supabase
        .from('support_plans')
        .select('*')
        .eq('organization_id', organizationId);
      return data || [];
    },
    enabled: !!organizationId
  });

  // Fetch documents
  const { data: documents = [] } = useQuery({
    queryKey: ['shift-completion-documents', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('organization_id', organizationId)
        .order('updated_at', { ascending: false })
        .limit(500);
      return data || [];
    },
    enabled: !!organizationId
  });

  // Fetch progress notes
  const { data: notes = [] } = useQuery({
    queryKey: ['shift-completion-notes', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data } = await supabase
        .from('progress_notes')
        .select('*')
        .eq('organization_id', organizationId)
        .order('note_date', { ascending: false })
        .limit(500);
      return data || [];
    },
    enabled: !!organizationId
  });

  // Calculate checklist status
  const status = participant
    ? buildClinicalChecklistStatus({ participant, supportPlans, documents, notes })
    : { isComplete: false as const };

  // Update shift status mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('shifts')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', shift.id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift', shift.id] });
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    }
  });

  return (
    <div className="space-y-3">
      <ClinicalMandatoryChecklist
        organizationId={organizationId}
        participantId={participant?.id}
        compact
      />

      <Button
        type="button"
        disabled={!status.isComplete || shift?.status === 'completed' || completeMutation.isPending}
        onClick={() => completeMutation.mutate()}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300"
      >
        {status.isComplete ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
        {shift?.status === 'completed'
          ? 'Shift already finished'
          : status.isComplete
            ? completeMutation.isPending
              ? 'Marking as finished...'
              : 'Mark shift as finished'
            : 'Complete checklist before finishing shift'}
      </Button>
    </div>
  );
}
