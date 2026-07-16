```javascript
const INDUSTRIES = [
  { key: 'ndis', label: 'NDIS' },
  { key: 'aged_care', label: 'Aged Care' },
  { key: 'mental_health', label: 'Mental Health' },
  { key: 'child_family', label: 'Child & Family' },
  { key: 'education', label: 'Education & Youth' },
  { key: 'hospital_clinical', label: 'Clinical / Hospital' },
  { key: 'allied_health', label: 'Allied Health' },
  { key: 'community', label: 'Community Services' },
  { key: 'supported_employment', label: 'Supported Employment' },
  { key: 'security', label: 'Security Operations' },
];

const TYPES = [
  { key: 'assessment', label: 'Assessment', mode: 'review_required' },
  { key: 'participant', label: 'Intake & Profile', mode: 'review_required' },
  { key: 'review', label: 'Review', mode: 'review_required' },
  { key: 'safety', label: 'Risk & Safety', mode: 'manager_approval' },
  { key: 'incident', label: 'Incident & Escalation', mode: 'manager_approval' },
  { key: 'meeting', label: 'Meeting & Handover', mode: 'simple' },
  { key: 'governance', label: 'Governance & Audit', mode: 'review_required' },
  { key: 'consent', label: 'Consent & Privacy', mode: 'review_required' },
  { key: 'hr', label: 'Workforce', mode: 'review_required' },
  { key: 'procedures', label: 'Procedure & Checklist', mode: 'review_required' },
];

const VARIANTS = [
  'Initial Record',
  'Monthly Review',
  'Escalation Check',
  'Evidence Summary',
  'Action Plan',
];

const TYPE_FIELDS = {
  assessment: [
    { name: 'person_name', label: 'Person / Client Name', type: 'text', required: true },
    { name: 'assessment_date', label: 'Assessment Date', type: 'date', required: true },
    { name: 'assessment_reason', label: 'Assessment Reason', type: 'textarea', required: true },
    { name: 'strengths', label: 'Strengths and Protective Factors', type: 'textarea', required: true },
    { name: 'needs_identified', label: 'Needs Identified', type: 'textarea', required: true },
    { name: 'risk_rating', label: 'Risk Rating', type: 'select', options: ['Low', 'Moderate', 'High', 'Critical'], required: true },
    { name: 'recommendations', label: 'Recommendations', type: 'textarea', required: true },
    { name: 'assessor_name', label: 'Assessor Name', type: 'text', required: true },
  ],
  participant: [
    { name: 'person_name', label: 'Person / Client Name', type: 'text', required: true },
    { name: 'record_date', label: 'Record Date', type: 'date', required: true },
    { name: 'communication_preferences', label: 'Communication Preferences', type: 'textarea', required: true },
    { name: 'support_preferences', label: 'Support Preferences', type: 'textarea', required: true },
    { name: 'important_relationships', label: 'Important Relationships', type: 'textarea' },
    { name: 'goals_or_outcomes', label: 'Goals / Outcomes', type: 'textarea', required: true },
    { name: 'alerts_or_considerations', label: 'Alerts / Considerations', type: 'textarea' },
    { name: 'completed_by', label: 'Completed By', type: 'text', required: true },
  ],
  review: [
    { name: 'review_subject', label: 'Person / Service Reviewed', type: 'text', required: true },
    { name: 'review_date', label: 'Review Date', type: 'date', required: true },
    { name: 'review_period', label: 'Review Period', type: 'text', required: true },
    { name: 'progress_summary', label: 'Progress Summary', type: 'textarea', required: true },
    { name: 'what_worked_well', label: 'What Worked Well', type: 'textarea', required: true },
    { name: 'barriers_or_concerns', label: 'Barriers / Concerns', type: 'textarea' },
    { name: 'next_actions', label: 'Next Actions', type: 'textarea', required: true },
    { name: 'reviewed_by', label: 'Reviewed By', type: 'text', required: true },
  ],
  safety: [
    { name: 'area_or_activity', label: 'Area / Activity', type: 'text', required: true },
    { name: 'risk_date', label: 'Risk Date', type: 'date', required: true },
    { name: 'hazards_or_risks', label: 'Hazards / Risks Identified', type: 'textarea', required: true },
    { name: 'people_impacted', label: 'People Impacted', type: 'textarea', required: true },
    { name: 'current_controls', label: 'Current Controls', type: 'textarea' },
    { name: 'risk_level', label: 'Risk Level', type: 'select', options: ['Low', 'Moderate', 'High', 'Critical'], required: true },
    { name: 'additional_controls', label: 'Additional Controls Required', type: 'textarea', required: true },
    { name: 'owner', label: 'Responsible Person', type: 'text', required: true },
  ],
  incident: [
    { name: 'event_date_time', label: 'Event Date & Time', type: 'datetime', required: true },
    { name: 'person_or_site', label: 'Person / Site Involved', type: 'text', required: true },
    { name: 'event_location', label: 'Location', type: 'text', required: true },
    { name: 'event_summary', label: 'What Happened?', type: 'textarea', required: true },
    { name: 'impact_or_harm', label: 'Impact / Harm', type: 'textarea' },
    { name: 'immediate_action', label: 'Immediate Action Taken', type: 'textarea', required: true },
    { name: 'notifications_made', label: 'Notifications Made', type: 'textarea' },
    { name: 'reported_by', label: 'Reported By', type: 'text', required: true },
  ],
  meeting: [
    { name: 'meeting_date', label: 'Meeting / Handover Date', type: 'date', required: true },
    { name: 'purpose', label: 'Purpose', type: 'text', required: true },
    { name: 'attendees', label: 'Attendees', type: 'textarea', required: true },
    { name: 'updates_discussed', label: 'Updates Discussed', type: 'textarea', required: true },
    { name: 'decisions', label: 'Decisions', type: 'textarea' },
    { name: 'actions', label: 'Actions — Who / What / When', type: 'textarea', required: true },
    { name: 'next_review', label: 'Next Review / Meeting', type: 'date' },
    { name: 'recorded_by', label: 'Recorded By', type: 'text', required: true },
  ],
  governance: [
    { name: 'audit_date', label: 'Audit / Governance Date', type: 'date', required: true },
    { name: 'area_reviewed', label: 'Area Reviewed', type: 'text', required: true },
    { name: 'standard_or_policy', label: 'Standard / Policy Reference', type: 'text' },
    { name: 'findings', label: 'Findings', type: 'textarea', required: true },
    { name: 'compliance_rating', label: 'Compliance Rating', type: 'select', options: ['Met', 'Partially met', 'Not met', 'Not applicable'], required: true },
    { name: 'corrective_actions', label: 'Corrective Actions', type: 'textarea', required: true },
    { name: 'due_date', label: 'Due Date', type: 'date' },
    { name: 'review_lead', label: 'Review Lead', type: 'text', required: true },
  ],
  consent: [
    { name: 'person_name', label: 'Person Providing Consent', type: 'text', required: true },
    { name: 'consent_date', label: 'Consent Date', type: 'date', required: true },
    { name: 'authority_or_relationship', label: 'Authority / Relationship', type: 'text' },
    { name: 'scope_of_consent', label: 'Scope of Consent', type: 'textarea', required: true },
    { name: 'information_explained', label: 'Information Explained Accessibly?', type: 'select', options: ['Yes', 'No', 'Interpreter/support used'], required: true },
    { name: 'decision', label: 'Decision', type: 'select', options: ['Consent given', 'Consent declined', 'Consent withdrawn', 'Limited consent'], required: true },
    { name: 'review_date', label: 'Review / Expiry Date', type: 'date' },
    { name: 'witness_name', label: 'Witness / Worker Name', type: 'text', required: true },
  ],
  hr: [
    { name: 'worker_name', label: 'Worker Name', type: 'text', required: true },
    { name: 'record_date', label: 'Record Date', type: 'date', required: true },
    { name: 'role_or_team', label: 'Role / Team', type: 'text', required: true },
    { name: 'topic', label: 'Topic / Competency', type: 'text', required: true },
    { name: 'evidence_observed', label: 'Evidence Observed', type: 'textarea', required: true },
    { name: 'support_required', label: 'Support / Training Required', type: 'textarea' },
    { name: 'outcome', label: 'Outcome', type: 'select', options: ['Complete', 'Needs support', 'Further review required', 'Escalate'], required: true },
    { name: 'supervisor_name', label: 'Supervisor Name', type: 'text', required: true },
  ],
  procedures: [
    { name: 'procedure_name', label: 'Procedure / Checklist Name', type: 'text', required: true },
    { name: 'review_date', label: 'Review Date', type: 'date', required: true },
    { name: 'site_or_program', label: 'Site / Program', type: 'text', required: true },
    { name: 'steps_checked', label: 'Steps Checked', type: 'textarea', required: true },
    { name: 'gaps_identified', label: 'Gaps Identified', type: 'textarea' },
    { name: 'risk_level', label: 'Risk Level', type: 'select', options: ['Low', 'Moderate', 'High', 'Critical'], required: true },
    { name: 'updates_required', label: 'Updates Required', type: 'textarea', required: true },
    { name: 'reviewed_by', label: 'Reviewed By', type: 'text', required: true },
  ],
};

const INDUSTRY_PROMPTS = {
  ndis: ['participant choice', 'goals', 'funding evidence', 'safeguarding', 'community participation'],
  aged_care: ['dignity', 'clinical care', 'lifestyle', 'quality indicators', 'family communication'],
  mental_health: ['recovery', 'screening', 'safety planning', 'triggers', 'protective factors'],
  child_family: ['child safety', 'family dynamics', 'guardian consent', 'mandatory reporting', 'wellbeing'],
  education: ['learning adjustments', 'attendance', 'IEP support', 'youth engagement', 'school collaboration'],
  hospital_clinical: ['handover', 'acuity', 'medication reconciliation', 'discharge planning', 'clinical escalation'],
  allied_health: ['therapy goals', 'functional capacity', 'recommendations', 'outcome measures', 'intervention response'],
  community: ['social connection', 'transport', 'participation', 'local supports', 'inclusion'],
  supported_employment: ['work readiness', 'employer engagement', 'placement support', 'reasonable adjustments', 'job coaching'],
  security: ['site safety', 'patrols', 'access events', 'post orders', 'emergency response'],
};

export const INDUSTRY_500_TEMPLATE_CATALOG = INDUSTRIES.flatMap((industry) =>
  TYPES.flatMap((type) =>
    VARIANTS.map((variant, variantIndex) => ({
      key: `industry500-${industry.key}-${type.key}-${variantIndex + 1}`,
      title: `${industry.label} — ${type.label} ${variant}`,
      description: `Unique ${type.label.toLowerCase()} template for ${industry.label.toLowerCase()} services, covering ${INDUSTRY_PROMPTS[industry.key][variantIndex]} with clear evidence, actions, review ownership and compliant documentation.`,
      category: type.key,
      sector: industry.key,
      workflow_mode: type.mode,
      version: '1.0',
      schema: { fields: TYPE_FIELDS[type.key] },
    }))
  )
);
```
