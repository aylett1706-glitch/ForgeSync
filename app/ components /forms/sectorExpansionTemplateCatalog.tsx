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

export const SECTOR_EXPANSION_TEMPLATE_CATALOG: FormTemplate[] = [
  {
    key: 'mh-k10-screening-tool',
    title: 'Mental Health — K10 Screening & Trigger Review',
    description: 'Structured psychological distress screen with scoring, trend notes, safety escalation and follow-up triggers.',
    category: 'assessment',
    sector: 'mental_health',
    workflow_mode: 'review_required',
    version: '1.0',
    schema: {
      fields: [
        text('participant_name', 'Participant Name', true),
        date('screening_date', 'Screening Date', true),
        { name: 'k10_total_score', label: 'K10 Total Score', type: 'number', required: true },
        select('risk_level', 'Risk Level', ['Low', 'Moderate', 'High', 'Critical — immediate review'], true),
        select('trend_since_last', 'Trend Since Last Screen', ['Improved', 'Stable', 'Worsened', 'First screen'], true),
        area('current_triggers', 'Current Triggers / Stressors'),
        area('protective_factors', 'Protective Factors', true),
        area('action_required', 'Action Required', true),
        text('reviewed_by', 'Reviewed By', true),
      ]
    }
  },
  {
    key: 'mh-phq9-gad7-screening',
    title: 'Mental Health — PHQ-9 / GAD-7 Screening',
    description: 'Depression and anxiety screening record with score interpretation, safety check and clinical review prompts.',
    category: 'assessment',
    sector: 'mental_health',
    workflow_mode: 'review_required',
    version: '1.0',
    schema: {
      fields: [
        text('participant_name', 'Participant Name', true),
        date('assessment_date', 'Assessment Date', true),
        { name: 'phq9_score', label: 'PHQ-9 Score', type: 'number' },
        { name: 'gad7_score', label: 'GAD-7 Score', type: 'number' },
        select('self_harm_item_response', 'Self-harm / suicide item response', ['None', 'Several days', 'More than half the days', 'Nearly every day'], true),
        area('clinical_interpretation', 'Clinical Interpretation', true),
        area('safety_actions', 'Safety Actions / Escalation'),
        date('next_review_date', 'Next Review Date'),
        text('completed_by', 'Completed By', true),
      ]
    }
  },
  {
    key: 'mh-crisis-safety-plan',
    title: 'Mental Health — Crisis & Safety Plan',
    description: 'Crisis plan covering warning signs, coping strategies, safe contacts, de-escalation and emergency escalation.',
    category: 'safety',
    sector: 'mental_health',
    workflow_mode: 'manager_approval',
    version: '1.0',
    schema: {
      fields: [
        text('participant_name', 'Participant Name', true),
        date('plan_date', 'Plan Date', true),
        area('warning_signs', 'Warning Signs', true),
        area('internal_coping_strategies', 'Internal Coping Strategies', true),
        area('support_contacts', 'Support Contacts', true),
        area('professional_contacts', 'Professional / Crisis Contacts', true),
        area('environment_safety_steps', 'Environment Safety Steps', true),
        area('duress_or_emergency_protocol', 'Duress / Emergency Protocol', true),
        date('review_date', 'Review Date', true),
      ]
    }
  },
  {
    key: 'ndis-assistive-technology-request',
    title: 'NDIS — Assistive Technology Request & Review',
    description: 'AT request lifecycle from need identification through assessment, approval, installation and review.',
    category: 'assessment',
    sector: 'ndis',
    workflow_mode: 'review_required',
    version: '1.0',
    schema: {
      fields: [
        text('participant_name', 'Participant Name', true),
        date('request_date', 'Request Date', true),
        text('technology_requested', 'Assistive technology item', true),
        area('functional_need', 'Functional Need / Goal Link', true),
        select('assessment_required', 'Assessment Required?', ['Yes', 'No', 'Already completed'], true),
        select('approval_status', 'Approval Status', ['Requested', 'Assessment underway', 'Approved', 'Declined', 'Installed', 'Review due'], true),
        area('training_or_setup_needed', 'Training / Setup Needed'),
        date('review_date', 'Review Date'),
      ]
    }
  },
  {
    key: 'education-youth-learning-plan',
    title: 'Education & Youth — Learning / IEP Support Plan',
    description: 'Education support plan linking goals, adjustments, attendance, family consent and provider collaboration.',
    category: 'education',
    sector: 'education',
    workflow_mode: 'review_required',
    version: '1.0',
    schema: {
      fields: [
        text('young_person_name', 'Young Person / Student Name', true),
        date('plan_date', 'Plan Date', true),
        text('education_provider', 'School / Education Provider'),
        area('learning_goals', 'Learning Goals', true),
        area('reasonable_adjustments', 'Reasonable Adjustments and Support Strategies', true),
        area('attendance_engagement', 'Attendance / Engagement Pattern', true),
        area('guardian_school_input', 'Guardian, School and Provider Input'),
        select('consent_confirmed', 'Consent Confirmed?', ['Yes', 'No', 'Limited consent', 'Review required'], true),
        date('review_date', 'Review Date', true),
      ]
    }
  },
  {
    key: 'child-safeguarding-mandatory-reporting',
    title: 'Child & Family — Mandatory Reporting Decision Log',
    description: 'Safeguarding decision log for child safety concerns, objective observations, consultation and escalation.',
    category: 'child_safety',
    sector: 'child_family',
    workflow_mode: 'manager_approval',
    version: '1.0',
    schema: {
      fields: [
        text('child_name', 'Child / Young Person Name', true),
        date('concern_date', 'Concern Date', true),
        area('objective_observations', 'Objective Observations', true),
        area('child_voice', 'Child / Young Person Voice'),
        select('immediate_safety_risk', 'Immediate Safety Risk', ['No immediate risk', 'Possible risk', 'Immediate risk — escalate now'], true),
        area('consultation_completed', 'Consultation Completed With', true),
        select('reporting_decision', 'Reporting Decision', ['Report made', 'Report not required', 'Monitor and review', 'Escalated to manager'], true),
        area('next_actions', 'Next Actions', true),
      ]
    }
  },
  {
    key: 'clinical-hospital-transfer-summary',
    title: 'Clinical — Hospital Transfer / Handover Summary',
    description: 'Hospital transfer and handover template for diagnosis, baseline, risks, medication, allergies and discharge needs.',
    category: 'hospital',
    sector: 'hospital_clinical',
    workflow_mode: 'review_required',
    version: '1.0',
    schema: {
      fields: [
        text('person_name', 'Person Name', true),
        datetime('transfer_date_time', 'Transfer Date & Time', true),
        area('reason_for_transfer', 'Reason for Transfer', true),
        area('baseline_function', 'Baseline Function / Communication', true),
        area('current_observations', 'Current Observations / Acuity', true),
        area('medications_allergies', 'Medications / Allergies', true),
        area('risks_alerts', 'Risks / Alerts'),
        text('handover_to', 'Handover Provided To', true),
        text('completed_by', 'Completed By', true),
      ]
    }
  },
  {
    key: 'aged-care-quality-indicator-review',
    title: 'Aged Care — Quality Indicator Review',
    description: 'Quality indicator review for falls, pressure injuries, medication incidents and improvement actions.',
    category: 'governance',
    sector: 'aged_care',
    workflow_mode: 'review_required',
    version: '1.0',
    schema: {
      fields: [
        text('review_period', 'Review Period', true),
        { name: 'falls_count', label: 'Falls Count', type: 'number' },
        { name: 'pressure_injuries_count', label: 'Pressure Injuries Count', type: 'number' },
        { name: 'medication_incidents_count', label: 'Medication Incidents Count', type: 'number' },
        area('unplanned_weight_loss', 'Unplanned Weight Loss Notes'),
        area('trend_summary', 'Trend Summary', true),
        area('actions_required', 'Actions Required', true),
        text('responsible_lead', 'Responsible Lead', true),
      ]
    }
  },
  {
    key: 'security-access-cctv-event',
    title: 'Security — Access / CCTV Event Log',
    description: 'Security event log for access control, CCTV, alarms, duress, sensors, severity and actions taken.',
    category: 'safety',
    sector: 'security',
    workflow_mode: 'review_required',
    version: '1.0',
    schema: {
      fields: [
        text('site_name', 'Site Name', true),
        datetime('event_date_time', 'Event Date & Time', true),
        select('event_type', 'Event Type', ['Access granted', 'Access denied', 'Door forced', 'Door held', 'CCTV motion', 'CCTV offline', 'Alarm triggered', 'Duress', 'Manual report'], true),
        text('location', 'Location', true),
        select('severity', 'Severity', ['Low', 'Moderate', 'High', 'Critical'], true),
        area('summary', 'Event Summary', true),
        area('actions_taken', 'Actions Taken', true),
        select('escalation_required', 'Escalation Required?', ['No', 'Supervisor', 'Police', 'Emergency services', 'Client contact'], true),
      ]
    }
  },
  {
    key: 'security-post-order-review',
    title: 'Security — Post Order Review',
    description: 'Review site post orders, duties, prohibited actions, escalation steps, equipment and handover requirements.',
    category: 'procedures',
    sector: 'security',
    workflow_mode: 'review_required',
    version: '1.0',
    schema: {
      fields: [
        text('site_name', 'Site Name', true),
        date('review_date', 'Review Date', true),
        select('shift_type', 'Shift Type', ['Static guard', 'Mobile patrol', 'Lockup', 'Unlock', 'Alarm response', 'Concierge', 'Event security'], true),
        area('duties_reviewed', 'Duties Reviewed', true),
        area('escalation_steps', 'Escalation Steps', true),
        area('equipment_required', 'Equipment Required'),
        area('changes_required', 'Changes Required'),
        text('approved_by', 'Approved By', true),
      ]
    }
  }
];
