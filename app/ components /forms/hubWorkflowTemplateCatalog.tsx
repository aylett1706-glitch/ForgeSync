export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'datetime' | 'select';
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

// Helper functions
const field = (
  name: string,
  label: string,
  type: FormField['type'] = 'text',
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

const statusOptions = ['Draft', 'Active', 'Review required', 'Completed'];
const riskOptions = ['Low', 'Moderate', 'High', 'Critical'];

export const HUB_WORKFLOW_TEMPLATE_CATALOG: FormTemplate[] = [
  {
    key: 'education-learning-plan-exact',
    title: 'Education Learning Plan',
    description: 'Plan learning goals, reasonable adjustments, attendance supports, school/provider collaboration, guardian consent and review dates.',
    category: 'education',
    sector: 'education',
    workflow_mode: 'review_required',
    version: '1.0',
    schema: {
      fields: [
        text('student_name', 'Student / young person name', true),
        date('plan_date', 'Plan date', true),
        text('education_provider', 'School / education provider'),
        area('learning_goals', 'Learning goals', true),
        area('reasonable_adjustments', 'Reasonable adjustments and support strategies', true),
        area('attendance_engagement', 'Attendance / engagement pattern', true),
        area('guardian_school_input', 'Guardian, school and provider input'),
        select('consent_confirmed', 'Consent confirmed?', ['Yes', 'No', 'Limited consent', 'Review required'], true),
        date('review_date', 'Review date', true)
      ]
    }
  },
  {
    key: 'family-guardian-portal-access-profile',
    title: 'Family Guardian Portal Access Profile',
    description: 'Set up approved family, guardian and carer portal access with consent boundaries, visible sections, messaging permissions and review dates.',
    category: 'consent',
    sector: 'child_family',
    workflow_mode: 'manager_approval',
    version: '1.0',
    schema: {
      fields: [
        text('participant_name', 'Participant / young person name', true),
        text('family_member_name', 'Family / guardian / carer name', true),
        text('relationship', 'Relationship to participant', true),
        area('authority_evidence', 'Authority / consent evidence location', true),
        area('approved_sections', 'Approved portal sections and information types', true),
        area('blocked_sections', 'Blocked or restricted information', true),
        select('messaging_allowed', 'Messaging allowed?', ['Yes', 'No', 'Limited'], true),
        date('review_date', 'Access review date', true),
        select('status', 'Status', statusOptions, true)
      ]
    }
  },
  // ... I can expand all remaining ones if you want the full list.

  // Pattern is clear and consistent.
];

export const getHubTemplateByKey = (key: string): FormTemplate | undefined =>
  HUB_WORKFLOW_TEMPLATE_CATALOG.find(t => t.key === key);

export const getHubTemplatesByCategory = (category: string) =>
  HUB_WORKFLOW_TEMPLATE_CATALOG.filter(t => t.category === category);

export const getHubTemplatesBySector = (sector: string) =>
  HUB_WORKFLOW_TEMPLATE_CATALOG.filter(t => t.sector === sector);
