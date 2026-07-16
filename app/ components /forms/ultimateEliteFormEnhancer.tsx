const field = (name, label, type = 'textarea', required = false, options = undefined, section = 'Core details', guidance = '') => ({
  name,
  label,
  type,
  required,
  section,
  guidance,
  ...(options ? { options } : {}),
});

const normalizeSector = (sector) => ({ clinical: 'hospital_clinical', hospital: 'hospital_clinical' }[sector] || sector || 'general');

const sharedEliteFields = [
  field('elite_record_context', 'Record context, service setting, location and program', 'textarea', true, undefined, 'Core details', 'Include where this form applies, the service context, and any linked participant, worker, property, shift, incident, plan, program or file.'),
  field('elite_person_voice_preferences', 'Person’s voice, preferences and communication needs', 'textarea', true, undefined, 'Person-centred practice', 'Use the person’s own words where possible. Include communication access needs, interpreter needs, cultural safety, consent preferences and decision-making supports.'),
  field('elite_consent_privacy_basis', 'Consent, privacy basis and information-sharing limits', 'textarea', true, undefined, 'Consent and privacy', 'Record consent status, who can receive information, any limits, and the minimum necessary information principle.'),
  field('elite_current_status_summary', 'Current situation and relevant background', 'textarea', true, undefined, 'Assessment detail', 'Summarise relevant history, recent changes, known risks, strengths, supports, previous actions and current presentation.'),
  field('elite_risk_level', 'Current risk / priority level', 'select', true, ['Low', 'Moderate', 'High', 'Critical / immediate escalation'], 'Risk and safeguarding'),
  field('elite_safeguarding_screen', 'Safeguarding, dignity, rights and restrictive practice screen', 'textarea', true, undefined, 'Risk and safeguarding', 'Identify any abuse, neglect, exploitation, dignity, rights, restrictive practice, medication, clinical, environmental or worker safety concerns.'),
  field('elite_actions_taken_now', 'Immediate actions already taken', 'textarea', true, undefined, 'Actions and follow-up'),
  field('elite_people_consulted', 'People consulted / notified and their input', 'textarea', false, undefined, 'Consultation', 'Include participant/client, family/guardian, workers, clinicians, supervisors, external providers, emergency services or regulators where relevant.'),
  field('elite_evidence_attachments_needed', 'Evidence, attachments or records to link', 'textarea', false, undefined, 'Evidence', 'List photos, documents, assessments, notes, messages, medication charts, body maps, plans, invoices, rosters, CCTV, access logs or other evidence needed.'),
  field('elite_outcomes_impact', 'Impact on goals, outcomes, wellbeing, funding, roster or service delivery', 'textarea', false, undefined, 'Outcomes and impact'),
  field('elite_follow_up_plan_owner_due', 'Follow-up plan — action, owner and due date', 'textarea', true, undefined, 'Actions and follow-up'),
  field('elite_review_signoff', 'Reviewer / manager quality check and sign-off notes', 'textarea', false, undefined, 'Review and sign-off'),
];

const sectorFields = {
  ndis: [
    field('elite_ndis_number_plan_link', 'NDIS number, plan dates and linked plan goals', 'textarea', false, undefined, 'NDIS compliance'),
    field('elite_ndis_practice_standard_evidence', 'NDIS Practice Standards evidence captured', 'textarea', true, undefined, 'NDIS compliance'),
    field('elite_support_category_budget_impact', 'Support category, service booking or budget impact', 'textarea', false, undefined, 'NDIS compliance'),
    field('elite_reportable_incident_screen', 'NDIS reportable incident screen and escalation decision', 'textarea', true, undefined, 'NDIS compliance'),
  ],
  aged_care: [
    field('elite_aged_care_program_link', 'Aged care program / package / resident care plan link', 'textarea', false, undefined, 'Aged care standards'),
    field('elite_quality_standard_evidence', 'Aged Care Quality Standards evidence captured', 'textarea', true, undefined, 'Aged care standards'),
    field('elite_clinical_deterioration_screen', 'Clinical deterioration, falls, nutrition, hydration, wounds or medication concerns', 'textarea', true, undefined, 'Clinical safety'),
    field('elite_dignity_choice_culture', 'Dignity of risk, choice, culture and lifestyle preferences', 'textarea', true, undefined, 'Person-centred care'),
  ],
  mental_health: [
    field('elite_mental_health_risk_formulation', 'Risk formulation — suicide, self-harm, violence, vulnerability and protective factors', 'textarea', true, undefined, 'Mental health safety'),
    field('elite_recovery_goals_strengths', 'Recovery goals, strengths, triggers and early warning signs', 'textarea', true, undefined, 'Recovery-oriented practice'),
    field('elite_safety_plan_status', 'Safety plan, crisis contacts and escalation pathway', 'textarea', true, undefined, 'Mental health safety'),
    field('elite_medication_substance_screen', 'Medication, substance use, sleep, appetite and psychosocial stressors', 'textarea', false, undefined, 'Clinical context'),
  ],
  youth: [
    field('elite_youth_voice_rights', 'Young person’s voice, rights, wishes and participation', 'textarea', true, undefined, 'Youth-centred practice'),
    field('elite_family_guardian_school_context', 'Family, guardian, carer, school and service context', 'textarea', false, undefined, 'Care network'),
    field('elite_child_safe_screen', 'Child safe, exploitation, family violence, online safety and mandatory reporting screen', 'textarea', true, undefined, 'Safeguarding'),
    field('elite_education_engagement', 'Education, employment, community connection and developmental progress', 'textarea', false, undefined, 'Outcomes'),
  ],
  child_family: [
    field('elite_child_family_authority', 'Guardian authority, consent boundaries and family access limits', 'textarea', true, undefined, 'Consent and authority'),
    field('elite_child_safe_screen', 'Child safe, exploitation, family violence, online safety and mandatory reporting screen', 'textarea', true, undefined, 'Safeguarding'),
    field('elite_youth_family_voice', 'Child / young person / family voice and preferred outcomes', 'textarea', true, undefined, 'Family-centred practice'),
    field('elite_education_development_context', 'Education, developmental, cultural and family context', 'textarea', false, undefined, 'Context'),
  ],
  hospital_clinical: [
    field('elite_clinical_handover_isbar', 'Clinical handover summary — identify, situation, background, assessment, recommendation', 'textarea', true, undefined, 'Clinical handover'),
    field('elite_medication_reconciliation', 'Medication reconciliation, allergies and adverse reaction risks', 'textarea', true, undefined, 'Clinical safety'),
    field('elite_deterioration_escalation', 'Deterioration signs, acuity, escalation pathway and clinician advice', 'textarea', true, undefined, 'Clinical safety'),
    field('elite_interoperability_referrals', 'External referrals, discharge instructions and information exchange requirements', 'textarea', false, undefined, 'Interoperability'),
  ],
  allied_health: [
    field('elite_clinical_reasoning', 'Clinical reasoning, assessment findings and therapy hypothesis', 'textarea', true, undefined, 'Clinical reasoning'),
    field('elite_functional_capacity', 'Functional capacity, participation barriers and environmental factors', 'textarea', true, undefined, 'Functional outcomes'),
    field('elite_goal_measure_progress', 'Goal measure, baseline, progress and outcome evidence', 'textarea', true, undefined, 'Outcomes'),
    field('elite_recommendations_home_program', 'Recommendations, home program, equipment and next review', 'textarea', true, undefined, 'Therapy plan'),
  ],
  education: [
    field('elite_learning_adjustments', 'Learning goals, reasonable adjustments and support strategies', 'textarea', true, undefined, 'Education planning'),
    field('elite_school_provider_collaboration', 'School, provider, family and student collaboration notes', 'textarea', true, undefined, 'Collaboration'),
    field('elite_developmental_learning_progress', 'Developmental, learning, attendance and engagement progress', 'textarea', true, undefined, 'Progress evidence'),
    field('elite_safeguarding_learning_context', 'Safeguarding, wellbeing, behaviour and inclusion considerations', 'textarea', true, undefined, 'Safeguarding'),
  ],
  supported_employment: [
    field('elite_employment_goal_match', 'Employment goals, role match, preferences and workplace adjustments', 'textarea', true, undefined, 'Employment planning'),
    field('elite_employer_site_risk', 'Employer/site risk, supervision, WHS and accessibility considerations', 'textarea', true, undefined, 'Workplace safety'),
    field('elite_skill_development_progress', 'Skill development, productivity, confidence and independence progress', 'textarea', true, undefined, 'Outcomes'),
    field('elite_job_coach_actions', 'Job coach / employer actions, follow-up and review date', 'textarea', true, undefined, 'Actions'),
  ],
  security: [
    field('elite_security_site_context', 'Site, client, post order, patrol route or access control context', 'textarea', true, undefined, 'Security context'),
    field('elite_threat_risk_assessment', 'Threat, vulnerability, access, CCTV, alarm and escalation risk assessment', 'textarea', true, undefined, 'Risk assessment'),
    field('elite_actions_evidence_chain', 'Actions taken, evidence preserved and chain-of-custody notes', 'textarea', true, undefined, 'Evidence'),
    field('elite_client_police_escalation', 'Client, police, emergency or supervisor escalation details', 'textarea', false, undefined, 'Escalation'),
  ],
  community: [
    field('elite_community_context', 'Community setting, activity, access, transport and participation context', 'textarea', true, undefined, 'Community participation'),
    field('elite_inclusion_barriers', 'Inclusion barriers, strengths, preferences and natural supports', 'textarea', true, undefined, 'Inclusion'),
    field('elite_community_safety', 'Community safety, transport, environmental and public interaction risks', 'textarea', true, undefined, 'Safety'),
  ],
  general: [
    field('elite_governance_context', 'Governance, policy, procedure or business context', 'textarea', true, undefined, 'Governance'),
    field('elite_decision_rationale', 'Decision rationale, alternatives considered and approval pathway', 'textarea', true, undefined, 'Decision record'),
    field('elite_quality_improvement_link', 'Quality improvement, audit, training or policy follow-up required', 'textarea', false, undefined, 'Quality improvement'),
  ],
};

const sectorFramework = {
  ndis: 'NDIS Practice Standards, NDIS Code of Conduct, reportable incidents, restrictive practices and participant rights.',
  aged_care: 'Aged Care Quality Standards, dignity of risk, clinical deterioration, infection prevention and consumer choice.',
  mental_health: 'Recovery-oriented practice, trauma-informed care, risk formulation, safety planning and least restrictive care.',
  youth: 'Child safe practice, youth voice, mandatory reporting, education engagement, family/carer participation and cultural safety.',
  child_family: 'Child safe practice, consent-led family access, guardian authority, safeguarding and youth privacy boundaries.',
  hospital_clinical: 'Clinical handover, medication reconciliation, deterioration escalation, privacy and interoperability readiness.',
  allied_health: 'Clinical reasoning, functional outcomes, goal measurement, evidence-based recommendations and scope of practice.',
  education: 'Reasonable adjustments, learning goals, child safety, family/school collaboration and inclusion evidence.',
  supported_employment: 'Workplace adjustment, WHS, employer collaboration, skill development and participant employment goals.',
  security: 'Post orders, site risk, incident evidence, escalation, access control, patrol verification and chain-of-custody.',
  community: 'Community inclusion, dignity of risk, transport safety, participation outcomes and local support networks.',
  general: 'Governance, privacy, WHS, quality improvement, audit readiness and accountable decision-making.',
};

const dedupeFields = (fields) => {
  const seen = new Set();
  return fields.filter((item) => {
    const key = item?.name || item?.label;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const enhanceTemplateToUltimateElite = (template) => {
  const sector = normalizeSector(template.sector);
  const extraFields = [...sharedEliteFields, ...(sectorFields[sector] || sectorFields.general)];
  const existingFields = template.schema?.fields || [];
  const enhancedFields = dedupeFields([...existingFields, ...extraFields]);

  return {
    ...template,
    title: template.title?.includes('Ultimate Elite') ? template.title : `${template.title} — Ultimate Elite`,
    description: `${template.description || 'Detailed form.'} Includes sector-tailored guidance, deeper evidence capture, safeguarding prompts, consent/privacy checks, follow-up ownership and review-ready detail.`,
    version: template.version?.includes('Elite') ? template.version : `${template.version || '1.0'} Elite`,
    elite_level: 'ultimate',
    schema: {
      ...(template.schema || {}),
      elite: true,
      framework: sectorFramework[sector] || sectorFramework.general,
      guidance: [
        `Use this form as a complete ${sector.replace(/_/g, ' ')} record, not a brief note.`,
        'Capture facts, observations, decisions, evidence, consent, risks, actions, owners and review dates.',
        'Use person-centred, strengths-based and objective language. Avoid judgemental or unsupported statements.',
        'Escalate immediately where critical risk, safeguarding, clinical deterioration, reportable incident or privacy breach indicators are present.',
      ],
      sections: [...new Set(enhancedFields.map((item) => item.section || 'Core details'))],
      fields: enhancedFields,
    },
  };
};

export const enhanceCatalogToUltimateElite = (catalog = []) => catalog.map(enhanceTemplateToUltimateElite);
