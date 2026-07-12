'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Calendar, CheckCircle2, Edit2, HeartPulse, ShieldCheck, Star, Target, User, PenTool } from 'lucide-react';

type AppraisalStatus = 'draft' | 'scheduled' | 'in_review' | 'completed' | 'follow_up_required';

interface Appraisal {
  id?: string;
  status?: AppraisalStatus;
  review_type?: string;
  review_period?: string;
  review_date?: string;
  overall_rating?: number;
  goals?: Array<unknown>;
  compliance_checklist?: Array<unknown>;
  person_centred_rating?: number;
  safeguarding_rating?: number;
  incident_response_rating?: number;
  medication_support_rating?: number;
  privacy_confidentiality_rating?: number;
  cultural_safety_rating?: number;
  initiative_rating?: number;
  attendance_punctuality_rating?: number;
  strengths?: string;
  recognition_outcome?: string;
  supervision_themes?: string;
  training_gaps?: string;
  performance_concerns?: string;
  signed_by_worker?: boolean;
  worker_signed_at?: string;
  signed_by_reviewer?: boolean;
  reviewer_signed_at?: string;
  admin_signed_at?: string;
}

interface UserRef {
  full_name?: string;
}

interface Props {
  appraisal: Appraisal;
  worker?: UserRef;
  reviewer?: UserRef;
  teamLeader?: UserRef;
  currentUser?: UserRef;
  onEdit: (appraisal: Appraisal) => void;
}

const statusStyle: Record<AppraisalStatus | 'default', string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  in_review: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  follow_up_required: 'bg-red-50 text-red-700 border-red-200',
  default: 'bg-slate-100 text-slate-700 border-slate-200'
};

// Format timestamp to AEST/Tasmania time
const formatAestDate = (isoString?: string) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-AU', {
    timeZone: 'Australia/Tasmania',
    dateStyle: 'short',
    timeStyle: 'short'
  });
};

export default function AppraisalCard({ appraisal, worker, reviewer, teamLeader, onEdit }: Props) {
  const goals = appraisal.goals || [];
  const checklist = appraisal.compliance_checklist || [];

  const deepRatings = [
    appraisal.person_centred_rating,
    appraisal.safeguarding_rating,
    appraisal.incident_response_rating,
    appraisal.medication_support_rating,
    appraisal.privacy_confidentiality_rating,
    appraisal.cultural_safety_rating,
    appraisal.initiative_rating,
    appraisal.attendance_punctuality_rating
  ].filter(Boolean) as number[];

  const deepAverage = deepRatings.length
    ? (deepRatings.reduce((sum, item) => sum + Number(item), 0) / deepRatings.length).toFixed(1)
    : '0.0';

  const currentStatus = appraisal.status || 'draft';

  return (
    <Card className="overflow-hidden border-slate-200 bg-white/95 hover:shadow-lg transition-all">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={statusStyle[currentStatus] || statusStyle.default} variant="outline">
                {currentStatus.replace(/_/g, ' ')}
              </Badge>
              {appraisal.review_type && (
                <Badge variant="outline" className="capitalize">
                  {appraisal.review_type.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" /> {worker?.full_name || 'Staff member'}
            </h3>
            <p className="text-sm text-slate-500">
              Reviewer: {reviewer?.full_name || teamLeader?.full_name || 'Not assigned'}
              {appraisal.review_period ? ` · ${appraisal.review_period}` : ''}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(appraisal)}>
            <Edit2 className="h-4 w-4" /> Edit
          </Button>
        </div>

        {/* Signature Status */}
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary" className={appraisal.signed_by_worker ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}>
            <PenTool className="h-3 w-3 mr-1" />
            Worker {appraisal.signed_by_worker ? `Signed ${formatAestDate(appraisal.worker_signed_at)}` : 'Pending'}
          </Badge>
          <Badge variant="secondary" className={appraisal.signed_by_reviewer ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}>
            <PenTool className="h-3 w-3 mr-1" />
            Reviewer {appraisal.signed_by_reviewer ? `Signed ${formatAestDate(appraisal.reviewer_signed_at)}` : 'Pending'}
          </Badge>
          {appraisal.admin_signed_at && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <PenTool className="h-3 w-3 mr-1" />
              Admin Finalized {formatAestDate(appraisal.admin_signed_at)}
            </Badge>
          )}
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-amber-50 p-3 border border-amber-100">
            <p className="text-xs text-amber-700 font-medium">Overall rating</p>
            <p className="text-2xl font-bold text-amber-700 flex items-center gap-1">
              <Star className="h-5 w-5 fill-amber-400" />{appraisal.overall_rating ?? 0}/5
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-3 border border-blue-100">
            <p className="text-xs text-blue-700 font-medium">Review date</p>
            <p className="text-sm font-semibold text-blue-900 flex items-center gap-1">
              <Calendar className="h-4 w-4" />{appraisal.review_date || 'Not set'}
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3 border border-emerald-100">
            <p className="text-xs text-emerald-700 font-medium">Goals</p>
            <p className="text-sm font-semibold text-emerald-900 flex items-center gap-1">
              <Target className="h-4 w-4" />{goals.length} active goal{goals.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="rounded-2xl bg-indigo-50 p-3 border border-indigo-100">
            <p className="text-xs text-indigo-700 font-medium">Deep review avg.</p>
            <p className="text-sm font-semibold text-indigo-900 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />{deepAverage}/5
            </p>
          </div>
        </div>

        {/* Strengths & Recognition */}
        {(appraisal.strengths || appraisal.recognition_outcome) && (
          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-1">
              <Award className="h-3.5 w-3.5" /> Strengths & recognition
            </p>
            <p className="mt-1 text-sm text-slate-700 line-clamp-2">
              {appraisal.recognition_outcome || appraisal.strengths}
            </p>
          </div>
        )}

        {/* Development & Compliance */}
        <div className="grid gap-3 sm:grid-cols-2">
          {(appraisal.supervision_themes || appraisal.training_gaps || appraisal.performance_concerns) && (
            <div className="rounded-2xl bg-purple-50 p-3 border border-purple-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 flex items-center gap-1">
                <HeartPulse className="h-3.5 w-3.5" /> Development focus
              </p>
              <p className="mt-1 text-sm text-purple-900 line-clamp-2">
                {appraisal.training_gaps || appraisal.supervision_themes || appraisal.performance_concerns}
              </p>
            </div>
          )}
          <div className="rounded-2xl bg-emerald-50 p-3 border border-emerald-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Compliance checks
            </p>
            <p className="mt-1 text-sm text-emerald-900">
              {checklist.length} completed checklist item{checklist.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
