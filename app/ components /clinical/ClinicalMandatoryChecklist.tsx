'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { CheckCircle2, FileCheck2, ShieldAlert, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// --- Type Definitions ---
type ParticipantRow = Database['public']['Tables']['participants']['Row'];
type SupportPlanRow = Database['public']['Tables']['support_plans']['Row'];
type DocumentRow = Database['public']['Tables']['documents']['Row'];
type ProgressNoteRow = Database['public']['Tables']['progress_notes']['Row'];

interface ChecklistCheck {
  label: string;
  complete: boolean;
}

interface ChecklistStatus {
  checks: ChecklistCheck[];
  completeCount: number;
  totalCount: number;
  isComplete: boolean;
}

interface Props {
  organizationId?: string;
  participantId?: string;
  compact?: boolean;
}

// --- Constants ---
const REQUIRED_DOCUMENTS = [
  { key: 'care_plan', label: 'Care/support plan', types: ['care_plan', 'support_plan'] },
  { key: 'risk_assessment', label: 'Risk/safety assessment', types: ['risk_assessment', 'emergency_plan'] },
  { key: 'service_agreement', label: 'Service agreement', types: ['service_agreement'] }
];

// --- Helper Functions ---
const getParticipantName = (participant?: ParticipantRow) =>
  [participant?.first_name, participant?.last_name].filter(Boolean).join(' ') || 'Participant';

export function buildClinicalChecklistStatus({
  participant,
  supportPlans = [],
  documents = [],
  notes = []
}: {
  participant: ParticipantRow;
  supportPlans?: SupportPlanRow[];
  documents?: DocumentRow[];
  notes?: ProgressNoteRow[];
}): ChecklistStatus {
  const participantDocuments = documents.filter(
    (doc) => doc.participant_id === participant.id || doc.entity_id === participant.id
  );
  const participantNotes = notes.filter((note) => note.participant_id === participant.id);

  const checks = REQUIRED_DOCUMENTS.map((req) => ({
    label: req.label,
    complete: participantDocuments.some((doc) => req.types.includes(doc.document_type))
  }));

  checks.push({
    label: 'Active plan record',
    complete: supportPlans.some((plan) => plan.participant_id === participant.id && plan.status === 'active')
  });

  checks.push({
    label: 'Recent support note',
    complete: participantNotes.length > 0
  });

  const completeCount = checks.filter((c) => c.complete).length;
  return {
    checks,
    completeCount,
    totalCount: checks.length,
    isComplete: completeCount === checks.length
  };
}

// --- Component ---
export default function ClinicalMandatoryChecklist({
  organizationId,
  participantId,
  compact = false
}: Props) {
  const supabase = createClientComponentClient<Database>();

  // Fetch participants
  const { data: participants = [] } = useQuery({
    queryKey: ['clinical-checklist-participants', organizationId, participantId],
    queryFn: async () => {
      if (participantId) {
        const { data } = await supabase
          .from('participants')
          .select('*')
          .eq('id', participantId);
        return data || [];
      }
      if (organizationId) {
        const { data } = await supabase
          .from('participants')
          .select('*')
          .eq('organization_id', organizationId)
          .order('updated_at', { ascending: false })
          .limit(20);
        return data || [];
      }
      return [];
    },
    enabled: !!organizationId || !!participantId
  });

  // Fetch support plans
  const { data: supportPlans = [] } = useQuery({
    queryKey: ['clinical-checklist-plans', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data } = await supabase
        .from('support_plans')
        .select('*')
        .eq('organization_id', organizationId)
        .order('updated_at', { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: !!organizationId
  });

  // Fetch documents
  const { data: documents = [] } = useQuery({
    queryKey: ['clinical-checklist-documents', organizationId],
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
    queryKey: ['clinical-checklist-notes', organizationId],
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

  // Build checklist rows
  const rows = participants.map((participant) => ({
    participant,
    status: buildClinicalChecklistStatus({ participant, supportPlans, documents, notes })
  }));

  return (
    <Card className="border-emerald-100 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileCheck2 className="h-5 w-5 text-emerald-600" />
          Mandatory NDIS documentation checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.slice(0, compact ? 1 : 8).map(({ participant, status }) => (
          <div
            key={participant.id}
            className={`rounded-2xl border p-3 ${
              status.isComplete ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{getParticipantName(participant)}</p>
                <p className="text-xs text-slate-600">
                  {status.completeCount}/{status.totalCount} requirements complete
                </p>
              </div>
              <Badge
                className={
                  status.isComplete
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }
              >
                {status.isComplete ? 'Ready for shift finish' : 'Action needed'}
              </Badge>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {status.checks.map((check) => (
                <div
                  key={check.label}
                  className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-medium text-slate-700"
                >
                  {check.complete ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-amber-600" />
                  )}
                  {check.label}
                </div>
              ))}
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <p className="rounded-2xl border border-dashed p-5 text-center text-sm text-slate-500">
            No participant documentation records found.
          </p>
        )}

        <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          Shifts should only be marked finished once mandatory participant documentation is complete and signed off.
        </div>
      </CardContent>
    </Card>
  );
}
