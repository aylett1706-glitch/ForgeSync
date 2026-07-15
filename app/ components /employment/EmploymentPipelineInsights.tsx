'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Building2, CalendarClock, Users } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { createClient } from '@/utils/supabase/client';

interface Placement {
  id: string;
  status: string;
  placement_stage?: string;
  participant_id: string;
  employer_id: string;
  support_worker_id?: string;
  job_title: string;
  start_date?: string;
  review_30_date?: string;
  review_60_date?: string;
  review_90_date?: string;
  hours_per_week?: number;
  workplace_adjustments?: string;
  mentor_name?: string;
  subsidy_status?: string;
  subsidy_amount?: number;
  attendance_rate?: number;
  performance_rating?: number;
  led_to_employment?: boolean;
  // ... add more fields as needed
}

interface Employer {
  id: string;
  business_name: string;
  industry?: string;
  placement_capacity?: number;
  willing_to_hire?: boolean;
  support_required?: string;
  open_role_title?: string;
  vacancy_requirements?: string;
  application_deadline?: string;
  primary_contact_name?: string;
  engagement_notes?: string;
  agreement_signed?: boolean;
  last_contact_date?: string;
}

interface Participant {
  id: string;
  first_name?: string;
  last_name?: string;
}

interface Worker {
  id: string;
  full_name?: string;
}

interface Props {
  placements: Placement[];
  employers: Employer[];
  participants: Participant[];
  workers: Worker[];
}

function getReviewStatus(placement: Placement) {
  const explicitDates = [placement.review_30_date, placement.review_60_date, placement.review_90_date]
    .filter(Boolean)
    .map(date => new Date(date));

  if (explicitDates.length > 0) {
    const nextReview = explicitDates.find(date => date >= new Date()) || explicitDates[explicitDates.length - 1];
    return { 
      nextReview, 
      daysAway: differenceInDays(nextReview, new Date()) 
    };
  }

  if (!placement.start_date) return null;

  const start = new Date(placement.start_date);
  const checkpoints = [30, 60, 90].map(days => addDays(start, days));
  const nextReview = checkpoints.find(date => date >= new Date()) || checkpoints[2];
  const daysAway = differenceInDays(nextReview, new Date());

  return { nextReview, daysAway };
}

export default function EmploymentPipelineInsights({
  placements = [],
  employers = [],
  participants = [],
  workers = []
}: Props) {
  const activePlacements = useMemo(() => 
    placements.filter(p => p.status === 'active'), [placements]
  );

  const openVacancies = useMemo(() => {
    return employers
      .filter(emp => emp.willing_to_hire || emp.placement_capacity)
      .map(emp => {
        const activeCount = placements.filter(
          p => p.employer_id === emp.id && p.status === 'active'
        ).length;
        const capacity = Number(emp.placement_capacity || 0);
        return {
          ...emp,
          activeCount,
          openSlots: Math.max(0, capacity - activeCount)
        };
      })
      .filter(emp => emp.openSlots > 0 || emp.willing_to_hire);
  }, [employers, placements]);

  const participantName = (id: string) => {
    const person = participants.find(item => item.id === id);
    return person 
      ? `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unknown'
      : 'Unknown participant';
  };

  const workerName = (id?: string) => 
    workers.find(item => item.id === id)?.full_name || 'Unassigned';

  const employerName = (id: string) => 
    employers.find(item => item.id === id)?.business_name || 'Unknown employer';

  const placementStageSummary = useMemo(() => {
    const stages = ['lead', 'application', 'interview', 'offer', 'onboarding', 'active', 'review', 'completed', 'terminated'];
    return stages.map(status => ({
      status,
      count: placements.filter(item => 
        (item.placement_stage || item.status) === status
      ).length
    }));
  }, [placements]);

  const employerRelationshipCards = useMemo(() => 
    employers
      .filter(item => item.engagement_notes || item.primary_contact_name || item.agreement_signed)
      .slice(0, 6), 
    [employers]
  );

  return (
    <div className="space-y-8">
      {/* Top Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Vacancy Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-teal-600" />
              Vacancy Board
            </CardTitle>
            <CardDescription>Open capacity across employer partners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {openVacancies.slice(0, 8).map(emp => (
              <div key={emp.id} className="rounded-2xl border p-5 hover:shadow-sm transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{emp.business_name}</p>
                    <p className="text-sm text-muted-foreground">{emp.open_role_title || emp.industry}</p>
                  </div>
                  <Badge variant="secondary">
                    {emp.openSlots > 0 ? `${emp.openSlots} open` : 'Actively Hiring'}
                  </Badge>
                </div>
                <div className="mt-4 text-sm text-muted-foreground flex flex-wrap gap-x-6">
                  <span>Active: {emp.activeCount}</span>
                  <span>Capacity: {emp.placement_capacity || '—'}</span>
                  <span>Support: {emp.support_required}</span>
                </div>
              </div>
            ))}

            {openVacancies.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-2xl">
                No current vacancies visible.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CalendarClock className="w-5 h-5 text-blue-600" />
              30/60/90 Day Reviews
            </CardTitle>
            <CardDescription>Upcoming reviews and early intervention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePlacements.slice(0, 8).map(placement => {
              const review = getReviewStatus(placement);
              const urgent = review && review.daysAway <= 7;

              return (
                <div key={placement.id} className="rounded-2xl border p-5">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{participantName(placement.participant_id)}</p>
                      <p className="text-sm text-muted-foreground">
                        {placement.job_title} @ {employerName(placement.employer_id)}
                      </p>
                    </div>
                    {review && (
                      <Badge variant={urgent ? "destructive" : "default"}>
                        {urgent ? 'Due soon!' : `In ${review.daysAway}d`}
                      </Badge>
                    )}
                  </div>
                  {review && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Next review: {format(review.nextReview, 'dd MMM yyyy')}
                    </p>
                  )}
                </div>
              );
            })}

            {activePlacements.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-2xl">
                No active placements requiring review.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Pipeline Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {placementStageSummary.map(({ status, count }) => (
              <div key={status} className="flex justify-between items-center rounded-xl border p-4">
                <span className="font-medium capitalize">{status.replace('_', ' ')}</span>
                <Badge variant="secondary" className="text-base px-4">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Support Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-600" />
              Workplace Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePlacements.slice(0, 6).map(placement => (
              <div key={placement.id} className="rounded-2xl border p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{participantName(placement.participant_id)}</p>
                    <p className="text-sm text-muted-foreground">Coach: {workerName(placement.support_worker_id)}</p>
                  </div>
                  <Badge variant="outline">{placement.hours_per_week || 0}h/week</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {placement.workplace_adjustments || 'No adjustments recorded.'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Employer Relationships */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-amber-600" />
              Employer Relationships
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {employerRelationshipCards.map(employer => (
              <div key={employer.id} className="rounded-2xl border p-5">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{employer.business_name}</p>
                    <p className="text-sm text-muted-foreground">{employer.primary_contact_name}</p>
                  </div>
                  {employer.agreement_signed && <Badge>Agreement Signed</Badge>}
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {employer.engagement_notes || 'No notes yet.'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Wage Subsidy + Outcomes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              Outcomes &amp; Subsidy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {placements
              .filter(p => p.status === 'active' || p.status === 'completed')
              .slice(0, 6)
              .map(placement => {
                const attendance = placement.attendance_rate || 0;
                return (
                  <div key={placement.id} className="rounded-2xl border p-5 space-y-4">
                    <div>
                      <p className="font-semibold">{participantName(placement.participant_id)}</p>
                      <p className="text-sm text-muted-foreground">{placement.job_title}</p>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span>Attendance</span>
                        <span>{attendance}%</span>
                      </div>
                      <Progress value={attendance} className="h-2" />
                    </div>

                    {placement.led_to_employment && (
                      <Badge className="bg-green-600">Led to ongoing employment</Badge>
                    )}
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
