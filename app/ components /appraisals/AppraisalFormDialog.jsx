'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SignatureCanvas from 'react-signature-canvas';
import { Plus, Save, Trash2, PenTool, RotateCcw, X } from 'lucide-react';
import RatingStars from './RatingStars';
import AppraisalDeepDiveSection from './AppraisalDeepDiveSection';

// Types
type Goal = { title: string; description: string; due_date: string; status: string };
type AppraisalStatus = 'draft' | 'scheduled' | 'in_review' | 'completed' | 'follow_up_required';
type StatusMap = Record<'DRAFT' | 'IN_REVIEW' | 'COMPLETED', AppraisalStatus>;

interface User {
  id: string;
  full_name: string;
  role?: string;
  position?: string;
}

interface Appraisal {
  id?: string;
  worker_id?: string;
  reviewer_id?: string;
  team_leader_id?: string;
  review_period?: string;
  review_type?: string;
  status?: AppraisalStatus;
  review_date?: string;
  next_review_date?: string;
  overall_rating?: number;
  care_quality_rating?: number;
  communication_rating?: number;
  reliability_rating?: number;
  documentation_rating?: number;
  teamwork_rating?: number;
  compliance_rating?: number;
  person_centred_rating?: number;
  safeguarding_rating?: number;
  incident_response_rating?: number;
  medication_support_rating?: number;
  privacy_confidentiality_rating?: number;
  cultural_safety_rating?: number;
  initiative_rating?: number;
  attendance_punctuality_rating?: number;
  strengths?: string;
  achievements?: string;
  development_areas?: string;
  worker_feedback?: string;
  manager_comments?: string;
  wellbeing_notes?: string;
  supervision_themes?: string;
  training_gaps?: string;
  performance_concerns?: string;
  career_aspirations?: string;
  compliance_checklist?: string[];
  goals?: Goal[];
  action_plan?: string;
  training_recommendations?: string;
  recognition_outcome?: string;
  agreed_supports?: string;
  follow_up_actions?: string;
  signed_by_worker?: boolean;
  signed_by_reviewer?: boolean;
  worker_signature?: string | null;
  worker_signed_at?: string | null;
  reviewer_signature?: string | null;
  reviewer_signed_at?: string | null;
  admin_signature?: string | null;
  admin_signed_at?: string | null;
  completed_at?: string | null;
}

interface Props {
  open: boolean;
  appraisal?: Appraisal;
  workers: User[];
  currentUser?: User;
  isAdmin: boolean;
  isReviewer: boolean;
  statuses: StatusMap;
  onClose: () => void;
  onSave: (payload: Appraisal) => void;
}

const emptyGoal: Goal = { title: '', description: '', due_date: '', status: 'not_started' };

// Get current timestamp in AEST (Australia/Tasmania, UTC+10)
const getAestTimestamp = () =>
  new Date().toLocaleString('en-AU', {
    timeZone: 'Australia/Tasmania',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
    .replace(/(\d+)\/(\d+)\/(\d+),?/, '$3-$2-$1')
    .replace(/\s/g, 'T') + 'Z';

// Format AEST timestamp for display
const formatAestDate = (isoString?: string | null) => {
  if (!isoString) return 'Not signed yet';
  return new Date(isoString).toLocaleString('en-AU', {
    timeZone: 'Australia/Tasmania',
    dateStyle: 'full',
    timeStyle: 'short'
  });
};

const TextareaBlock = ({
  label,
  value,
  onChange,
  disabled
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => (
  <div>
    <Label>{label}</Label>
    <Textarea
      className="mt-1"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      disabled={disabled}
    />
  </div>
);

export default function AppraisalFormDialog({
  open,
  appraisal,
  workers,
  currentUser,
  isAdmin,
  isReviewer,
  statuses,
  onClose,
  onSave
}: Props) {
  const sigWorkerRef = useRef<SignatureCanvas | null>(null);
  const sigReviewerRef = useRef<SignatureCanvas | null>(null);
  const sigAdminRef = useRef<SignatureCanvas | null>(null);
  const [requiredSignature, setRequiredSignature] = useState<'worker' | 'reviewer' | 'admin' | null>(null);

  const [form, setForm] = useState<Appraisal>(() => appraisal || {
    worker_id: '',
    reviewer_id: currentUser?.id || '',
    review_period: '',
    review_type: 'annual',
    status: 'draft',
    review_date: '',
    next_review_date: '',
    overall_rating: 0,
    care_quality_rating: 0,
    communication_rating: 0,
    reliability_rating: 0,
    documentation_rating: 0,
    teamwork_rating: 0,
    compliance_rating: 0,
    person_centred_rating: 0,
    safeguarding_rating: 0,
    incident_response_rating: 0,
    medication_support_rating: 0,
    privacy_confidentiality_rating: 0,
    cultural_safety_rating: 0,
    initiative_rating: 0,
    attendance_punctuality_rating: 0,
    strengths: '',
    achievements: '',
    development_areas: '',
    worker_feedback: '',
    manager_comments: '',
    wellbeing_notes: '',
    supervision_themes: '',
    training_gaps: '',
    performance_concerns: '',
    career_aspirations: '',
    compliance_checklist: [],
    goals: [],
    action_plan: '',
    training_recommendations: '',
    recognition_outcome: '',
    agreed_supports: '',
    follow_up_actions: '',
    signed_by_worker: false,
    signed_by_reviewer: false,
    worker_signature: null,
    worker_signed_at: null,
    reviewer_signature: null,
    reviewer_signed_at: null,
    admin_signature: null,
    admin_signed_at: null,
    completed_at: null
  });

  // Reset signature pads and detect required signature when dialog opens
  useEffect(() => {
    if (open) {
      sigWorkerRef.current?.clear();
      sigReviewerRef.current?.clear();
      sigAdminRef.current?.clear();

      if (!appraisal) {
        setRequiredSignature(null);
      } else if (currentUser?.id === appraisal.worker_id && appraisal.status === statuses.DRAFT && !appraisal.signed_by_worker) {
        setRequiredSignature('worker');
      } else if (
        (currentUser?.id === appraisal.reviewer_id || currentUser?.id === appraisal.team_leader_id) &&
        appraisal.status === statuses.IN_REVIEW &&
        !appraisal.signed_by_reviewer
      ) {
        setRequiredSignature('reviewer');
      } else if (isAdmin && appraisal.signed_by_reviewer && appraisal.status !== statuses.COMPLETED) {
        setRequiredSignature('admin');
      } else {
        setRequiredSignature(null);
      }
    }
  }, [open, appraisal, currentUser, isAdmin, statuses]);

  const reviewers = useMemo(
    () => workers.filter(worker =>
      worker.role === 'admin' ||
      ['manager', 'coordinator', 'team_leader', 'service_manager', 'house_manager', 'operations_manager', 'hr_officer'].includes(worker.position || '')
    ),
    [workers]
  );

  const set = <K extends keyof Appraisal>(key: K, value: Appraisal[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const updateGoal = (index: number, key: keyof Goal, value: string | number) =>
    set('goals', (form.goals || []).map((goal, goalIndex) =>
      goalIndex === index ? { ...goal, [key]: value } : goal
    ));

  const addGoal = () => set('goals', [...(form.goals || []), emptyGoal]);
  const removeGoal = (index: number) =>
    set('goals', (form.goals || []).filter((_, goalIndex) => goalIndex !== index));

  // Check if current user can edit fields
  const canEditFields = () => {
    if (!appraisal) return isAdmin;
    if (isAdmin) return true;
    if (isReviewer && appraisal.status === statuses.IN_REVIEW) return true;
    return currentUser?.id === appraisal.worker_id && appraisal.status === statuses.DRAFT;
  };

  // Handle save with signature validation
  const handleSubmit = () => {
    const payload = { ...form };

    // Add signature + timestamp if required
    if (requiredSignature === 'worker') {
      if (!sigWorkerRef.current || sigWorkerRef.current.isEmpty()) {
        alert('Please draw your signature before submitting');
        return;
      }
      payload.worker_signature = sigWorkerRef.current.toDataURL('image/png');
      payload.worker_signed_at = getAestTimestamp();
      payload.signed_by_worker = true;
      payload.status = statuses.IN_REVIEW;
    }

    if (requiredSignature === 'reviewer') {
      if (!sigReviewerRef.current || sigReviewerRef.current.isEmpty()) {
        alert('Please draw your signature before submitting');
        return;
      }
      payload.reviewer_signature = sigReviewerRef.current.toDataURL('image/png');
      payload.reviewer_signed_at = getAestTimestamp();
      payload.signed_by_reviewer = true;
    }

    if (requiredSignature === 'admin') {
      if (!sigAdminRef.current || sigAdminRef.current.isEmpty()) {
        alert('Please draw your signature to finalize');
        return;
      }
      payload.admin_signature = sigAdminRef.current.toDataURL('image/png');
      payload.admin_signed_at = getAestTimestamp();
      payload.status = statuses.COMPLETED;
      payload.completed_at = getAestTimestamp();
    }

    onSave(payload);
  };

  const isSubmitDisabled =
    !form.worker_id ||
    !form.review_period ||
    (requiredSignature &&
      ((requiredSignature === 'worker' && sigWorkerRef.current?.isEmpty()) ||
        (requiredSignature === 'reviewer' && sigReviewerRef.current?.isEmpty()) ||
        (requiredSignature === 'admin' && sigAdminRef.current?.isEmpty())));

  return (
    <Dialog open={open} onOpenChange={value => !value && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{appraisal ? 'Edit Staff Appraisal' : 'Create Staff Appraisal'}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[76vh] overflow-y-auto pr-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Staff member *</Label>
              <Select value={form.worker_id} onValueChange={value => set('worker_id', value)} disabled={!canEditFields()}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map(worker => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reviewer</Label>
              <Select
                value={form.reviewer_id || currentUser?.id}
                onValueChange={value => set('reviewer_id', value)}
                disabled={!canEditFields()}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select reviewer" />
                </SelectTrigger>
                <SelectContent>
                  {reviewers.map(worker => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Review period *</Label>
              <Input
                className="mt-1"
                value={form.review_period}
                onChange={e => set('review_period', e.target.value)}
                placeholder="e.g. Jan–Jun 2026"
                disabled={!canEditFields()}
              />
            </div>
            <div>
              <Label>Review type</Label>
              <Select value={form.review_type} onValueChange={value => set('review_type', value)} disabled={!canEditFields()}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="probation">Probation</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="six_monthly">Six-monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="performance_improvement">Performance improvement</SelectItem>
                  <SelectItem value="role_change">Role change</SelectItem>
                  <SelectItem value="exit">Exit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={value => set('status', value as AppraisalStatus)} disabled={!isAdmin}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_review">In review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="follow_up_required">Follow-up required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Review date</Label>
              <Input
                className="mt-1"
                type="date"
                value={form.review_date}
                onChange={e => set('review_date', e.target.value)}
                disabled={!canEditFields()}
              />
            </div>
          </div>

          <div className="rounded-3xl border bg-gradient-to-br from-amber-50 to-white p-4 space-y-4">
            <h3 className="font-bold text-slate-900">Performance Ratings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <RatingStars label="Overall" value={form.overall_rating} onChange={value => set('overall_rating', value)} disabled={!canEditFields()} />
              <RatingStars label="Care quality" value={form.care_quality_rating} onChange={value => set('care_quality_rating', value)} disabled={!canEditFields()} />
              <RatingStars label="Communication" value={form.communication_rating} onChange={value => set('communication_rating', value)} disabled={!canEditFields()} />
              <RatingStars label="Reliability" value={form.reliability_rating} onChange={value => set('reliability_rating', value)} disabled={!canEditFields()} />
              <RatingStars label="Documentation" value={form.documentation_rating} onChange={value => set('documentation_rating', value)} disabled={!canEditFields()} />
              <RatingStars label="Teamwork" value={form.teamwork_rating} onChange={value => set('teamwork_rating', value)} disabled={!canEditFields()} />
              <RatingStars label="Compliance" value={form.compliance_rating} onChange={value => set('compliance_rating', value)} disabled={!canEditFields()} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextareaBlock label="Strengths" value={form.strengths} onChange={value => set('strengths', value)} disabled={!canEditFields()} />
            <TextareaBlock label="Achievements" value={form.achievements} onChange={value => set('achievements', value)} disabled={!canEditFields()} />
            <TextareaBlock label="Development areas" value={form.development_areas} onChange={value => set('development_areas', value)} disabled={!canEditFields()} />
            <TextareaBlock label="Worker feedback" value={form.worker_feedback} onChange={value => set('worker_feedback', value)} disabled={!canEditFields()} />
            <TextareaBlock label="Manager comments" value={form.manager_comments} onChange={value => set('manager_comments', value)} disabled={!canEditFields()} />
            <TextareaBlock label="Wellbeing notes" value={form.wellbeing_notes} onChange={value => set('wellbeing_notes', value)} disabled={!canEditFields()} />
          </div>

          <AppraisalDeepDiveSection form={form} set={set} disabled={!canEditFields()} />

          <div className="rounded-3xl border bg-white p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900">Growth Goals</h3>
              <Button type="button" variant="outline" size="sm" onClick={addGoal} disabled={!canEditFields()}>
                <Plus className="h-4 w-4" /> Add Goal
              </Button>
            </div>
            {(form.goals || []).map((goal, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-2xl border bg-slate-50 p-3">
                <Input
                  className="md:col-span-3"
                  value={goal.title}
                  onChange={e => updateGoal(index, 'title', e.target.value)}
                  placeholder="Goal title"
                  disabled={!canEditFields()}
                />
                <Input
                  className="md:col-span-4"
                  value={goal.description}
                  onChange={e => updateGoal(index, 'description', e.target.value)}
                  placeholder="Goal details"
                  disabled={!canEditFields()}
                />
                <Input
                  className="md:col-span-2"
                  type="date"
                  value={goal.due_date}
                  onChange={e => updateGoal(index, 'due_date', e.target.value)}
                  disabled={!canEditFields()}
                />
                <Select value={goal.status || 'not_started'} onValueChange={value => updateGoal(index, 'status', value)} disabled={!canEditFields()}>
                  <SelectTrigger className="md:col-span-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not started</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeGoal(index)} className="text-red-500" disabled={!canEditFields()}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextareaBlock label="Action plan" value={form.action_plan} onChange={value => set('action_plan', value)} disabled={!canEditFields()} />
            <TextareaBlock label="Training recommendations" value={form.training_recommendations} onChange={value => set('training_recommendations', value)} disabled={!canEditFields()} />
            <TextareaBlock label="Recognition outcome" value={form.recognition_outcome} onChange={value => set('recognition_outcome', value)} disabled={!canEditFields()} />
            <TextareaBlock label="Agreed supports" value={form.agreed_supports} onChange={value => set('agreed_supports', value)} disabled={!canEditFields()} />
            <TextareaBlock label="Follow-up actions" value={form.follow_up_actions} onChange={value => set('follow_up_actions', value)} disabled={!canEditFields()} />
            <div className="rounded-2xl border bg-slate-50 p-4 space-y-3">
              <Label>Next review date</Label>
              <Input type="date" value={form.next_review_date} onChange={e => set('next_review_date', e.target.value)} disabled={!canEditFields()} />
            </div>
          </div>

          {/* ✍️ SIGNATURE SECTION */}
          <div className="rounded-3xl border bg-white p-5 space-y-5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <PenTool className="h-5 w-5" /> Approvals & Signatures
            </h3>

            {/* Required signature pad for current user */}
            {requiredSignature && (
              <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                <p className="text-sm font-medium text-slate-700 mb-3">
                  {requiredSignature === 'worker'
                    ? 'Worker Signature'
                    : requiredSignature === 'reviewer'
                    ? 'Reviewer Signature'
                    : 'Admin Final Signature'}
                </p>
                <div className="bg-white border rounded-lg mb-3">
                  <SignatureCanvas
                    ref={
                      requiredSignature === 'worker'
                        ? sigWorkerRef
                        : requiredSignature === 'reviewer'
                        ? sigReviewerRef
                        : sigAdminRef
                    }
                    penColor="#0f172a"
                    canvasProps={{ className: 'w-full h-40 rounded-lg' }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500">Draw with mouse or touch — saved with AEST timestamp</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (requiredSignature === 'worker') sigWorkerRef.current?.clear();
                      if (requiredSignature === 'reviewer') sigReviewerRef.current?.clear();
                      if (requiredSignature === 'admin') sigAdminRef.current?.clear();
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-1.5" /> Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Display existing signatures & timestamps */}
            {appraisal && (
              <div className="space-y-3">
                {form.signed_by_worker && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm font-medium text-green-800">✅ Worker Signed: {formatAestDate(form.worker_signed_at)}</p>
                    {form.worker_signature && <img src={form.worker_signature} alt="Worker signature" className="h-14 mt-2 bg-white p-2 rounded" />}
                  </div>
                )}
                {form.signed_by_reviewer && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-blue-800">✅ Reviewer Signed: {formatAestDate(form.reviewer_signed_at)}</p>
                    {form.reviewer_signature && <img src={form.reviewer_signature} alt="Reviewer signature" className="h-14 mt-2 bg-white p-2 rounded" />}
                  </div>
                )}
                {form.admin_signed_at && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-sm font-medium text-purple-800">✅ Admin Finalized: {formatAestDate(form.admin_signed_at)}</p>
                    {form.admin_signature && <img src={form.admin_signature} alt="Admin signature" className="h-14 mt-2 bg-white p-2 rounded" />}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 sticky bottom-0 bg-white/95 py-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitDisabled} className="flex-1 bg-slate-900 hover:bg-slate-800">
              <Save className="h-4 w-4 mr-2" /> {requiredSignature ? 'Sign & Submit' : 'Save Appraisal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
