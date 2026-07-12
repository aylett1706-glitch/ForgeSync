'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RatingStars from './RatingStars';

const checklistItems = [
  'Mandatory training current',
  'Documentation reviewed',
  'Incident reporting understood',
  'Safeguarding responsibilities reviewed',
  'Privacy and confidentiality reviewed',
  'Participant choice and control discussed'
];

interface TextareaBlockProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TextareaBlock = ({ label, value, onChange, placeholder, disabled }: TextareaBlockProps) => (
  <div>
    <Label>{label}</Label>
    <Textarea
      className="mt-1"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      placeholder={placeholder}
      disabled={disabled}
    />
  </div>
);

interface AppraisalForm {
  compliance_checklist?: string[];
  person_centred_rating?: number;
  safeguarding_rating?: number;
  incident_response_rating?: number;
  medication_support_rating?: number;
  privacy_confidentiality_rating?: number;
  cultural_safety_rating?: number;
  initiative_rating?: number;
  attendance_punctuality_rating?: number;
  supervision_themes?: string;
  training_gaps?: string;
  performance_concerns?: string;
  career_aspirations?: string;
}

interface Props {
  form: AppraisalForm;
  set: (field: keyof AppraisalForm, value: unknown) => void;
  disabled?: boolean;
}

export default function AppraisalDeepDiveSection({ form, set, disabled = false }: Props) {
  const checklist = form.compliance_checklist || [];

  const toggleChecklist = (item: string, checked: boolean | 'indeterminate') => {
    if (disabled) return;
    const isChecked = Boolean(checked);
    set('compliance_checklist', isChecked ? [...checklist, item] : checklist.filter((entry) => entry !== item));
  };

  return (
    <div className="space-y-4 rounded-3xl border bg-gradient-to-br from-indigo-50 to-white p-4">
      <h3 className="font-bold text-slate-900">Deep Review Areas</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RatingStars
          label="Person-centred practice"
          value={form.person_centred_rating}
          onChange={(value) => set('person_centred_rating', value)}
          disabled={disabled}
        />
        <RatingStars
          label="Safeguarding"
          value={form.safeguarding_rating}
          onChange={(value) => set('safeguarding_rating', value)}
          disabled={disabled}
        />
        <RatingStars
          label="Incident response"
          value={form.incident_response_rating}
          onChange={(value) => set('incident_response_rating', value)}
          disabled={disabled}
        />
        <RatingStars
          label="Medication support"
          value={form.medication_support_rating}
          onChange={(value) => set('medication_support_rating', value)}
          disabled={disabled}
        />
        <RatingStars
          label="Privacy"
          value={form.privacy_confidentiality_rating}
          onChange={(value) => set('privacy_confidentiality_rating', value)}
          disabled={disabled}
        />
        <RatingStars
          label="Cultural safety"
          value={form.cultural_safety_rating}
          onChange={(value) => set('cultural_safety_rating', value)}
          disabled={disabled}
        />
        <RatingStars
          label="Initiative"
          value={form.initiative_rating}
          onChange={(value) => set('initiative_rating', value)}
          disabled={disabled}
        />
        <RatingStars
          label="Attendance"
          value={form.attendance_punctuality_rating}
          onChange={(value) => set('attendance_punctuality_rating', value)}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextareaBlock
          label="Supervision themes"
          value={form.supervision_themes}
          onChange={(value) => set('supervision_themes', value)}
          placeholder="Key supervision topics, coaching provided, patterns noticed..."
          disabled={disabled}
        />
        <TextareaBlock
          label="Training gaps"
          value={form.training_gaps}
          onChange={(value) => set('training_gaps', value)}
          placeholder="Training to refresh, mandatory modules, skill-building needs..."
          disabled={disabled}
        />
        <TextareaBlock
          label="Performance concerns"
          value={form.performance_concerns}
          onChange={(value) => set('performance_concerns', value)}
          placeholder="Document concerns factually and respectfully, including agreed supports."
          disabled={disabled}
        />
        <TextareaBlock
          label="Career aspirations"
          value={form.career_aspirations}
          onChange={(value) => set('career_aspirations', value)}
          placeholder="Role interests, leadership pathways, preferred development areas..."
          disabled={disabled}
        />
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <p className="mb-3 text-sm font-bold text-slate-900">Compliance review checklist</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {checklistItems.map((item) => (
            <label
              key={item}
              className={`flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <Checkbox
                checked={checklist.includes(item)}
                onCheckedChange={(checked) => toggleChecklist(item, checked)}
                disabled={disabled}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
