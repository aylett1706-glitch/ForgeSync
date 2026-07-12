/**
 * Industry, role, and access configuration
 * Fully compatible with Next.js + Supabase
 * All original values/logic preserved — only improvements added
 */

export const INDUSTRY_OPTIONS = [
  { value: 'general', label: 'General / Multi-service' },
  { value: 'ndis', label: 'NDIS / Disability' },
  { value: 'aged_care', label: 'Aged Care' },
  { value: 'mental_health', label: 'Mental Health' },
  { value: 'child_family', label: 'Child & Family / OOHC' },
  { value: 'allied_health', label: 'Allied Health' },
  { value: 'clinical', label: 'Clinical / Hospital' },
  { value: 'security', label: 'Security Operations' },
  { value: 'education', label: 'Education / Youth' },
  { value: 'community', label: 'Community Services' },
  { value: 'supported_employment', label: 'Supported Employment' },
] as const;

export const INDUSTRY_MODULE_MAP = {
  general: ['core', 'forms', 'documents', 'communications', 'reporting'],
  ndis: ['ndis', 'support_coordination', 'funding', 'goals', 'risk', 'family_portal', 'assistive_technology', 'behaviour_support', 'evidence_exports', 'sector_experience'],
  aged_care: ['aged_care', 'clinical', 'quality_indicators', 'lifestyle', 'medication', 'family_portal', 'palliative_care', 'funding', 'sector_experience'],
  mental_health: ['mental_health', 'safety_plans', 'therapy', 'medication_monitoring', 'risk', 'family_portal', 'screening_tools', 'cohort_analytics', 'sector_experience'],
  child_family: ['child_family', 'safeguarding', 'milestones', 'family_portal', 'education', 'consent_engine', 'sector_experience'],
  allied_health: ['allied_health', 'therapy', 'telehealth', 'goals', 'clinical', 'sector_experience'],
  clinical: ['clinical', 'handover', 'medication', 'wound_care', 'quality_indicators', 'interoperability', 'acuity', 'hospital_transition', 'sector_experience'],
  security: ['security', 'patrols', 'visitors', 'credentials', 'devices', 'continuity', 'floor_plans', 'lockdown', 'access_events', 'post_orders', 'sector_experience'],
  education: ['education', 'youth', 'milestones', 'learning_plans', 'safeguarding', 'consent_engine', 'sector_experience'],
  community: ['community', 'goals', 'family_portal', 'transport', 'sector_experience'],
  supported_employment: ['employment', 'job_placements', 'employers', 'goals', 'ndis', 'sector_experience'],
} as const;

export const INDUSTRY_PAGE_MAP = {
  general: [],
  ndis: ['Forms', 'DisabilityNDISHub', 'Participants', 'FundingTracker', 'FundingForecast', 'NDISPlanManagement', 'ServiceAgreements', 'GoalsTracking', 'OutcomeMeasurement', 'FamilyPortalHub', 'SectorExperienceUpgradeHub'],
  aged_care: ['Forms', 'ClinicalAgedCareHub', 'ClinicalHospitalHandoverHub', 'MedicationManagement', 'FamilyPortalHub', 'EmergencyPlans', 'FirstAidHub', 'SectorExperienceUpgradeHub'],
  mental_health: ['Forms', 'MentalHealthHub', 'RiskEngine', 'RiskAssessments', 'FamilyPortalHub', 'Telehealth', 'EducationYouthHub', 'SectorExperienceUpgradeHub'],
  child_family: ['Forms', 'EducationYouthHub', 'FamilyPortalHub', 'MentalHealthHub', 'DocumentManagement', 'SectorExperienceUpgradeHub'],
  allied_health: ['Forms', 'ClinicalAgedCareHub', 'ClinicalHospitalHandoverHub', 'Telehealth', 'GoalsTracking', 'OutcomeMeasurement', 'SectorExperienceUpgradeHub'],
  clinical: ['Forms', 'ClinicalAgedCareHub', 'ClinicalHospitalHandoverHub', 'MedicationManagement', 'RiskEngine', 'IncidentAnalytics', 'SectorExperienceUpgradeHub'],
  security: ['Forms', 'SecurityOperations', 'DuressAlarm', 'SecurityComplianceCentre', 'SecurityAuditLogs', 'SectorExperienceUpgradeHub'],
  education: ['Forms', 'EducationYouthHub', 'FamilyPortalHub', 'Training', 'ProgramManagement', 'SectorExperienceUpgradeHub'],
  community: ['Forms', 'CommunityAccessPage', 'FamilyPortalHub', 'TransportBookings', 'SectorExperienceUpgradeHub'],
  supported_employment: ['Forms', 'SupportedEmployment', 'Employers', 'JobPlacements', 'JobAdvertising', 'DisabilityNDISHub', 'SectorExperienceUpgradeHub'],
} as const;

export const INDUSTRY_WIDGET_MAP = {
  general: ['participants', 'workers', 'compliance', 'forms', 'documents', 'messages'],
  ndis: ['participants', 'workers', 'revenue', 'compliance', 'timesheets', 'incidents', 'risk', 'maintenance', 'funding', 'forms'],
  aged_care: ['participants', 'workers', 'compliance', 'incidents', 'medication', 'clinical', 'risk', 'forms'],
  mental_health: ['participants', 'workers', 'compliance', 'incidents', 'risk', 'wellbeing', 'forms'],
  child_family: ['participants', 'workers', 'compliance', 'incidents', 'safeguarding', 'family', 'forms'],
  allied_health: ['participants', 'workers', 'revenue', 'compliance', 'clinical', 'telehealth', 'forms'],
  clinical: ['participants', 'workers', 'compliance', 'incidents', 'medication', 'clinical', 'risk', 'forms'],
  security: ['workers', 'compliance', 'incidents', 'security', 'risk', 'forms'],
  education: ['participants', 'workers', 'compliance', 'training', 'safeguarding', 'forms'],
  community: ['participants', 'workers', 'compliance', 'incidents', 'transport', 'forms'],
  supported_employment: ['participants', 'workers', 'compliance', 'employment', 'forms'],
} as const;

export const INDUSTRY_RESTRICTED_PAGES = Array.from(new Set(Object.values(INDUSTRY_PAGE_MAP).flat()));

export const ROLE_INDUSTRY_MAP = {
  support_worker: ['general', 'ndis', 'community'],
  disability_support_worker: ['ndis'],
  aged_care_worker: ['aged_care', 'clinical'],
  aged_home_care_worker: ['aged_care'],
  mental_health_worker: ['mental_health'],
  mental_health_support_worker: ['mental_health'],
  foster_carer: ['child_family'],
  foster_kinship_carer: ['child_family'],
  youth_worker: ['child_family', 'education', 'community'],
  community_support_worker: ['community', 'ndis'],
  personal_care_assistant: ['aged_care', 'ndis'],
  residential_youth_worker: ['child_family'],
  outreach_worker: ['community', 'mental_health', 'child_family'],
  in_home_support_worker: ['aged_care', 'ndis', 'community'],
  behaviour_support_practitioner: ['ndis', 'mental_health'],
  security_guard: ['security'],
  patrol_officer: ['security'],
  site_security_officer: ['security'],
  mental_health_case_manager: ['mental_health'],
  clinical_care_coordinator: ['clinical', 'aged_care'],
  aged_care_coordinator: ['aged_care'],
  hospital_transition_coordinator: ['clinical', 'aged_care'],
  child_protection_worker: ['child_family'],
  oohc_caseworker: ['child_family'],
  allied_health_professional: ['allied_health', 'clinical'],
  physiotherapist: ['allied_health', 'aged_care'],
  occupational_therapist: ['allied_health'],
  speech_pathologist: ['allied_health'],
  registered_nurse: ['clinical', 'aged_care'],
  enrolled_nurse: ['clinical', 'aged_care'],
  counsellor: ['mental_health'],
  psychologist: ['mental_health', 'allied_health'],
  clinical_aged_care_lead: ['clinical', 'aged_care'],
  mental_health_clinical_lead: ['mental_health'],
  family_portal_coordinator: ['child_family', 'aged_care', 'ndis', 'mental_health', 'community'],
  security_operations_lead: ['security'],
  employment_support_worker: ['supported_employment'],
} as const;

export const ROLE_LABELS = {
  support_worker: 'Support Worker',
  disability_support_worker: 'Disability Support Worker',
  aged_care_worker: 'Aged Care Worker',
  aged_home_care_worker: 'Aged/Home Care Worker',
  mental_health_worker: 'Mental Health Worker',
  mental_health_support_worker: 'Mental Health Support Worker',
  foster_carer: 'Foster/Kinship Carer',
  foster_kinship_carer: 'Foster/Kinship Carer',
  youth_worker: 'Youth Worker',
  community_support_worker: 'Community Support Worker',
  personal_care_assistant: 'Personal Care Assistant',
  residential_youth_worker: 'Residential Youth Worker',
  outreach_worker: 'Outreach Worker',
  in_home_support_worker: 'In-Home Support Worker',
  behaviour_support_practitioner: 'Behaviour Support Practitioner',
  security_guard: 'Security Guard',
  patrol_officer: 'Patrol Officer',
  site_security_officer: 'Site Security Officer',
  support_coordinator: 'Support Coordinator',
  case_manager: 'Case Manager',
  social_worker: 'Social Worker',
  youth_case_worker: 'Youth Case Worker',
  mental_health_case_manager: 'Mental Health Case Manager',
  clinical_care_coordinator: 'Clinical Care Coordinator',
  aged_care_coordinator: 'Aged Care Coordinator',
  hospital_transition_coordinator: 'Hospital Transition Coordinator',
  ndis_plan_manager: 'NDIS Plan Manager',
  local_area_coordinator: 'Local Area Coordinator',
  child_protection_worker: 'Child Protection Worker',
  oohc_caseworker: 'Out-of-Home Care Caseworker',
  allied_health_professional: 'Allied Health Professional',
  physiotherapist: 'Physiotherapist',
  occupational_therapist: 'Occupational Therapist',
  speech_pathologist: 'Speech Pathologist',
  registered_nurse: 'Registered Nurse',
  counsellor: 'Counsellor / Mental Health',
  therapist: 'Therapist',
  psychologist: 'Psychologist',
  exercise_physiologist: 'Exercise Physiologist',
  enrolled_nurse: 'Enrolled Nurse',
  clinical_aged_care_lead: 'Clinical & Aged Care Lead',
  mental_health_clinical_lead: 'Mental Health Clinical Lead',
  family_portal_coordinator: 'Family Portal Coordinator',
  security_operations_lead: 'Security Operations Lead',
} as const;

// --- Type helpers for better autocompletion ---
export type Industry = typeof INDUSTRY_OPTIONS[number]['value'];
export type RoleKey = keyof typeof ROLE_INDUSTRY_MAP;

/**
 * Get human-readable label for an industry value
 * @param industry - Industry key to look up
 * @returns Formatted label or fallback
 */
export function getIndustryLabel(industry: string | null | undefined): string {
  return INDUSTRY_OPTIONS.find((item) => item.value === industry)?.label || 'General / Multi-service';
}

/**
 * Get all enabled modules for a given industry + selected sectors
 * @param industry - Primary industry
 * @param selectedSectors - Additional sectors to include
 * @returns Unique list of enabled module IDs
 */
export function getEnabledModulesForIndustry(
  industry: string | null | undefined,
  selectedSectors: string[] = []
): string[] {
  const sectors = [industry || 'general', ...selectedSectors];
  return Array.from(new Set(sectors.flatMap((sector) => INDUSTRY_MODULE_MAP[sector as keyof typeof INDUSTRY_MODULE_MAP] || [])));
}

/**
 * Get all allowed pages for a given industry + selected sectors
 * @param industry - Primary industry
 * @param selectedSectors - Additional sectors to include
 * @returns Unique list of allowed page names
 */
export function getIndustryPages(
  industry: string | null | undefined,
  selectedSectors: string[] = []
): string[] {
  const sectors = [industry || 'general', ...selectedSectors];
  return Array.from(new Set(sectors.flatMap((sector) => INDUSTRY_PAGE_MAP[sector as keyof typeof INDUSTRY_PAGE_MAP] || [])));
}

/**
 * Get all allowed widgets for a given industry + selected sectors
 * @param industry - Primary industry
 * @param selectedSectors - Additional sectors to include
 * @returns Unique list of allowed widget keys
 */
export function getIndustryWidgets(
  industry: string | null | undefined,
  selectedSectors: string[] = []
): string[] {
  const sectors = [industry || 'general', ...selectedSectors];
  return Array.from(new Set(
    sectors.flatMap((sector) => INDUSTRY_WIDGET_MAP[sector as keyof typeof INDUSTRY_WIDGET_MAP] || INDUSTRY_WIDGET_MAP.general)
  ));
}

/**
 * Check if a page is allowed for the current industry/sectors
 * @param pageName - Page name to check
 * @param industry - Primary industry
 * @param selectedSectors - Additional sectors to include
 * @returns True if allowed
 */
export function isIndustryPageAllowed(
  pageName: string,
  industry: string | null | undefined,
  selectedSectors: string[] = []
): boolean {
  if (!INDUSTRY_RESTRICTED_PAGES.includes(pageName)) return true;
  return getIndustryPages(industry, selectedSectors).includes(pageName);
}

/**
 * Check if a widget is allowed for the current industry/sectors
 * @param widgetKey - Widget key to check
 * @param industry - Primary industry
 * @param selectedSectors - Additional sectors to include
 * @returns True if allowed
 */
export function isIndustryWidgetAllowed(
  widgetKey: string,
  industry: string | null | undefined,
  selectedSectors: string[] = []
): boolean {
  return getIndustryWidgets(industry, selectedSectors).includes(widgetKey);
}

/**
 * Check if a role is valid for the current industry/sectors
 * @param roleKey - Role to check
 * @param industry - Primary industry
 * @param selectedSectors - Additional sectors to include
 * @returns True if role matches industry rules
 */
export function roleMatchesIndustry(
  roleKey: string | null | undefined,
  industry: string = 'general',
  selectedSectors: string[] = []
): boolean {
  if (!roleKey || ['admin', 'user', 'app_developer', 'family_member'].includes(roleKey)) return true;
  const allowed = ROLE_INDUSTRY_MAP[roleKey as keyof typeof ROLE_INDUSTRY_MAP];
  if (!allowed) return true;
  const sectors = new Set([industry, ...selectedSectors]);
  return allowed.some((sector) => sectors.has(sector));
}
