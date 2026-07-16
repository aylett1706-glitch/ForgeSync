export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'datetime' | 'select' | 'body_map';
  required?: boolean;
  options?: string[];
}

export interface FormTemplate {
  key: string;
  title: string;
  description: string;
  category: string;
  sector: string;
  workflow_mode: 'simple' | 'manager_approval' | 'review_required';
  version: string;
  schema: {
    fields: FormField[];
  };
}

// Reusable field builder
const field = (
  name: string,
  label: string,
  type: FormField['type'],
  required = false,
  options?: string[]
): FormField => ({
  name,
  label,
  type,
  required,
  ...(options ? { options } : {})
});

const text = (name: string, label: string, required = false) =>
  field(name, label, 'text', required);

const area = (name: string, label: string, required = false) =>
  field(name, label, 'textarea', required);

const date = (name: string, label: string, required = false) =>
  field(name, label, 'date', required);

const datetime = (name: string, label: string, required = false) =>
  field(name, label, 'datetime', required);

const select = (name: string, label: string, options: string[], required = false) =>
  field(name, label, 'select', required, options);

const bodyMap = (name: string, label: string, required = false) =>
  field(name, label, 'body_map', required);

// Skin integrity specific fields
const SKIN_INTEGRITY_FIELDS: FormField[] = [
  text('client_name', 'Client / Participant Name', true),
  datetime('assessment_date_time', 'Assessment Date & Time', true),
  bodyMap('model_body_map', 'Live Skin Integrity Model', true),
  select('skin_status', 'Overall Skin Status', [
    'Skin intact',
    'Redness noted',
    'Bruising',
    'Skin tear',
    'Open wound',
    'Pressure injury concern',
    'Rash / irritation',
    'Infection concern',
    'Other'
  ], true),
  area('affected_site_details', 'Affected Site Details', true),
  select('wound_or_area_type', 'Wound / Area Type', [
    'Pressure area',
    'Pressure injury',
    'Skin tear',
    'Bruise',
    'Abrasion',
    'Surgical wound',
    'Moisture lesion',
    'Rash',
    'Burn',
    'Other'
  ], true),
  select('stage_or_grade', 'Stage / Grade if Applicable', [
    'Not applicable',
    'Stage 1',
    'Stage 2',
    'Stage 3',
    'Stage 4',
    'Unstageable',
    'Suspected deep tissue injury',
    'Skin tear category 1',
    'Skin tear category 2',
    'Skin tear category 3'
  ], true),
  text('measurements', 'Measurements / Size'),
  { name: 'pain_level', label: 'Pain Level at Site (0–10)', type: 'number' },
  area('surrounding_skin', 'Surrounding Skin Condition', true),
  area('risk_factors', 'Risk Factors Present'),
  area('immediate_action', 'Immediate Action / Treatment', true),
  select('escalation_required', 'Escalation Required?', [
    'No',
    'RN review',
    'GP review',
    'Wound specialist review',
    'Urgent clinical review'
  ], true),
  area('photos_attached_note', 'Photo / Evidence Notes'),
  date('next_review_date', 'Next Review Date', true),
  text('completed_by', 'Completed By', true),
];

const VARIANTS = [
  { key: 'clinical', category: 'clinical', sector: 'hospital_clinical', title: 'Skin Integrity / Wound Assessment — Clinical' },
  { key: 'medical', category: 'medical', sector: 'aged_care', title: 'Skin Integrity / Wound Assessment — Medical' },
  { key: 'assessment', category: 'assessment', sector: 'ndis', title: 'Skin Integrity / Wound Assessment — Support Assessment' },
];

export const SKIN_INTEGRITY_TEMPLATE_CATALOG: FormTemplate[] = VARIANTS.map((variant) => ({
  key: `skin-integrity-${variant.key}`,
  title: variant.title,
  description: 'Interactive skin integrity form with selectable 2D or 3D body model, affected-site marking, wound/pressure area details, escalation prompts, treatment notes, and next review planning.',
  category: variant.category,
  sector: variant.sector,
  workflow_mode: 'review_required',
  version: '1.0',
  schema: { fields: SKIN_INTEGRITY_FIELDS },
}));
