'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import IncidentForm from './IncidentForm';

interface Shift {
  id: string;
  organization_id?: string;
}

interface Participant {
  id: string;
  organization_id?: string;
}

interface Props {
  shift?: Shift | null;
  participant?: Participant | null;
  onClose: () => void;
}

export default function IncidentReportForm({ shift, participant, onClose }: Props) {
  const { data: currentUser } = useQuery({
    queryKey: ['incident-report-wrapper-user'],
    queryFn: () => base44.auth.me(),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" /> Report Incident
          </DialogTitle>
        </DialogHeader>

        <IncidentForm
          participantId={participant?.id}
          organizationId={
            participant?.organization_id ||
            shift?.organization_id ||
            currentUser?.organization_id
          }
          shiftId={shift?.id}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
