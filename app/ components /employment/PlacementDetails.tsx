'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Mail, Phone, Calendar, Clock, User, Building2, Award } from 'lucide-react';
import { toast } from 'sonner';

interface Placement {
  id: string;
  job_title: string;
  placement_type?: string;
  status: string;
  participant_id: string;
  employer_id: string;
  start_date?: string;
  end_date?: string;
  hours_per_week?: number;
  hourly_rate?: number;
  total_hours_completed?: number;
  attendance_rate?: number;
  job_description?: string;
  supervisor_name?: string;
  supervisor_email?: string;
  supervisor_phone?: string;
  // Add more fields as needed
}

interface Participant {
  id: string;
  first_name?: string;
  last_name?: string;
}

interface Employer {
  id: string;
  business_name: string;
}

interface Props {
  placement: Placement;
  participants: Participant[];
  employers: Employer[];
  onClose: () => void;
}

export default function PlacementDetails({
  placement,
  participants,
  employers,
  onClose,
}: Props) {
  const participant = participants.find((p) => p.id === placement.participant_id);
  const employer = employers.find((e) => e.id === placement.employer_id);

  const participantFullName = participant
    ? `${participant.first_name || ''} ${participant.last_name || ''}`.trim()
    : 'Unknown Participant';

  const copyToClipboard = (text: string, label: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            {placement.job_title}
            <Badge variant="outline" className="capitalize">
              {placement.placement_type?.replace(/_/g, ' ') || 'Placement'}
            </Badge>
          </DialogTitle>
          <p className="text-muted-foreground">
            {participantFullName} • {employer?.business_name}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status & Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="mt-1 text-base capitalize">{placement.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Participant</p>
                  <p className="font-semibold mt-1">{participantFullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employer</p>
                  <p className="font-semibold mt-1">{employer?.business_name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Placement Type</p>
                  <p className="font-medium mt-1 capitalize">
                    {placement.placement_type?.replace(/_/g, ' ') || '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          {placement.job_description && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5" /> Job Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {placement.job_description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Placement Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Placement Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                {placement.start_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{format(new Date(placement.start_date), 'dd MMMM yyyy')}</p>
                    </div>
                  </div>
                )}

                {placement.end_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{format(new Date(placement.end_date), 'dd MMMM yyyy')}</p>
                    </div>
                  </div>
                )}

                {placement.hours_per_week && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hours per Week</p>
                      <p className="font-medium">{placement.hours_per_week} hours</p>
                    </div>
                  </div>
                )}

                {placement.hourly_rate && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="text-sm text-muted-foreground">Hourly Rate</p>
                      <p className="font-medium">${placement.hourly_rate.toFixed(2)}</p>
                    </div>
                  </div>
                )}

                {placement.attendance_rate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                    <p className="font-medium text-lg">{placement.attendance_rate}%</p>
                  </div>
                )}

                {placement.total_hours_completed && (
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours Completed</p>
                    <p className="font-medium">{placement.total_hours_completed}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Supervisor Contact */}
          {placement.supervisor_name && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" /> Workplace Supervisor
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{placement.supervisor_name}</p>
                  </div>

                  {placement.supervisor_email && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a 
                          href={`mailto:${placement.supervisor_email}`} 
                          className="font-medium hover:underline text-[#0088A8]"
                        >
                          {placement.supervisor_email}
                        </a>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(placement.supervisor_email!, 'Email')}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {placement.supervisor_phone && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <a 
                          href={`tel:${placement.supervisor_phone}`} 
                          className="font-medium hover:underline text-[#0088A8]"
                        >
                          {placement.supervisor_phone}
                        </a>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(placement.supervisor_phone!, 'Phone')}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
