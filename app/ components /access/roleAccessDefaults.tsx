/**
 * Default role access profiles, role lists, and page group definitions
 * Fully compatible with Next.js + Supabase
 * All original values/logic kept — only type safety and clarity added
 */

export const leadershipExecutivePositions = ['team_leader', 'service_manager', 'house_manager', 'operations_manager', 'security_operations_manager', 'security_supervisor', 'program_director', 'sector_lead', 'clinical_aged_care_lead', 'mental_health_clinical_lead', 'family_portal_coordinator', 'security_operations_lead', 'manager', 'coordinator', 'ceo', 'general_manager', 'board_member', 'clinical_director', 'director_of_nursing', 'clinical_manager', 'practice_coach', 'quality_improvement_lead'] as const;
export const caseManagementPositions = ['support_coordinator', 'case_manager', 'social_worker', 'youth_case_worker', 'mental_health_case_manager', 'clinical_care_coordinator', 'aged_care_coordinator', 'hospital_transition_coordinator', 'ndis_plan_manager', 'local_area_coordinator', 'child_protection_worker', 'oohc_caseworker', 'external_plan_manager'] as const;
export const administrativePositions = ['admin_officer', 'payroll_coordinator', 'finance_officer', 'hr_officer', 'compliance_officer', 'intake_coordinator', 'training_coordinator', 'rostering_coordinator', 'bookings_officer'] as const;

export const ROLE_ACCESS_STORAGE_KEY = 'forgesync_role_access_profiles';
export const USER_PAGE_OVERRIDE_STORAGE_KEY = 'forgesync_user_page_overrides';

export const ROLE_KEY_ALIASES = {
  support_worker: 'support_worker',
  disability_support_worker: 'support_worker',
  aged_care_worker: 'aged_care_worker',
  aged_home_care_worker: 'aged_care_worker',
  mental_health_worker: 'mental_health_worker',
  mental_health_support_worker: 'mental_health_worker',
  foster_carer: 'foster_carer',
  foster_kinship_carer: 'foster_carer',
  therapist: 'therapist',
  art_music_recreational_therapist: 'therapist',
  indigenous_support_worker: 'indigenous_support_worker',
  indigenous_cald_support_worker: 'indigenous_support_worker',
  external_plan_manager: 'external_plan_manager',
  plan_manager_external: 'external_plan_manager',
  external_allied_health: 'external_allied_health',
  allied_health_external: 'external_allied_health'
} as const;

export const ROLE_GROUPS = [
  { key: 'core', label: 'Core Roles' },
  { key: 'frontline', label: 'Frontline' },
  { key: 'case_management', label: 'Case Management' },
  { key: 'therapeutic', label: 'Therapeutic' },
  { key: 'leadership', label: 'Leadership & Executive' },
  { key: 'administrative', label: 'Administrative' },
  { key: 'specialized', label: 'Specialized & Support' },
  { key: 'external', label: 'External' }
] as const;

export const ROLE_OPTIONS = [
  { key: 'user', label: 'User', group: 'core' },
  { key: 'admin', label: 'Admin', group: 'core' },
  { key: 'support_worker', label: 'Disability Support Worker', group: 'frontline' },
  { key: 'aged_care_worker', label: 'Aged/Home Care Worker', group: 'frontline' },
  { key: 'mental_health_worker', label: 'Mental Health Support Worker', group: 'frontline' },
  { key: 'foster_carer', label: 'Foster/Kinship Carer', group: 'frontline' },
  { key: 'youth_worker', label: 'Youth Worker', group: 'frontline' },
  { key: 'community_support_worker', label: 'Community Support Worker', group: 'frontline' },
  { key: 'personal_care_assistant', label: 'Personal Care Assistant', group: 'frontline' },
  { key: 'residential_youth_worker', label: 'Residential Youth Worker', group: 'frontline' },
  { key: 'outreach_worker', label: 'Outreach Worker', group: 'frontline' },
  { key: 'in_home_support_worker', label: 'In-Home Support Worker', group: 'frontline' },
  { key: 'behaviour_support_practitioner', label: 'Behaviour Support Practitioner', group: 'frontline' },
  { key: 'security_guard', label: 'Security Guard', group: 'frontline' },
  { key: 'patrol_officer', label: 'Patrol Officer', group: 'frontline' },
  { key: 'site_security_officer', label: 'Site Security Officer', group: 'frontline' },
  { key: 'support_coordinator', label: 'Support Coordinator', group: 'case_management' },
  { key: 'case_manager', label: 'Case Manager', group: 'case_management' },
  { key: 'social_worker', label: 'Social Worker', group: 'case_management' },
  { key: 'youth_case_worker', label: 'Youth Case Worker', group: 'case_management' },
  { key: 'mental_health_case_manager', label: 'Mental Health Case Manager', group: 'case_management' },
  { key: 'clinical_care_coordinator', label: 'Clinical Care Coordinator', group: 'case_management' },
  { key: 'aged_care_coordinator', label: 'Aged Care Coordinator', group: 'case_management' },
  { key: 'hospital_transition_coordinator', label: 'Hospital Transition Coordinator', group: 'case_management' },
  { key: 'ndis_plan_manager', label: 'NDIS Plan Manager', group: 'case_management' },
  { key: 'local_area_coordinator', label: 'Local Area Coordinator', group: 'case_management' },
  { key: 'child_protection_worker', label: 'Child Protection Worker', group: 'case_management' },
  { key: 'oohc_caseworker', label: 'Out-of-Home Care Caseworker', group: 'case_management' },
  { key: 'allied_health_professional', label: 'Allied Health Professional', group: 'therapeutic' },
  { key: 'physiotherapist', label: 'Physiotherapist', group: 'therapeutic' },
  { key: 'occupational_therapist', label: 'Occupational Therapist', group: 'therapeutic' },
  { key: 'speech_pathologist', label: 'Speech Pathologist', group: 'therapeutic' },
  { key: 'registered_nurse', label: 'Registered Nurse', group: 'therapeutic' },
  { key: 'counsellor', label: 'Counsellor / Mental Health', group: 'therapeutic' },
  { key: 'therapist', label: 'Art/Music/Recreational Therapist', group: 'therapeutic' },
  { key: 'psychologist', label: 'Psychologist', group: 'therapeutic' },
  { key: 'exercise_physiologist', label: 'Exercise Physiologist', group: 'therapeutic' },
  { key: 'enrolled_nurse', label: 'Enrolled Nurse', group: 'therapeutic' },
  { key: 'team_leader', label: 'Team Leader / Supervisor', group: 'leadership' },
  { key: 'service_manager', label: 'Service Manager / Program Coordinator', group: 'leadership' },
  { key: 'house_manager', label: 'House/Accommodation Manager', group: 'leadership' },
  { key: 'operations_manager', label: 'Operations Manager', group: 'leadership' },
  { key: 'manager', label: 'Manager (Legacy)', group: 'leadership' },
  { key: 'coordinator', label: 'Coordinator (Legacy)', group: 'leadership' },
  { key: 'ceo', label: 'Chief Executive Officer', group: 'leadership' },
  { key: 'general_manager', label: 'General Manager', group: 'leadership' },
  { key: 'board_member', label: 'Board Member', group: 'leadership' },
  { key: 'clinical_director', label: 'Clinical Director', group: 'leadership' },
  { key: 'director_of_nursing', label: 'Director of Nursing (DON)', group: 'leadership' },
  { key: 'clinical_manager', label: 'Clinical Manager', group: 'leadership' },
  { key: 'practice_coach', label: 'Practice Coach', group: 'leadership' },
  { key: 'quality_improvement_lead', label: 'Quality Improvement Lead', group: 'leadership' },
  { key: 'security_operations_manager', label: 'Security Operations Manager', group: 'leadership' },
  { key: 'security_supervisor', label: 'Security Supervisor', group: 'leadership' },
  { key: 'program_director', label: 'Program Director', group: 'leadership' },
  { key: 'sector_lead', label: 'Sector Lead', group: 'leadership' },
  { key: 'clinical_aged_care_lead', label: 'Clinical & Aged Care Lead', group: 'leadership' },
  { key: 'mental_health_clinical_lead', label: 'Mental Health Clinical Lead', group: 'leadership' },
  { key: 'family_portal_coordinator', label: 'Family Portal Coordinator', group: 'leadership' },
  { key: 'security_operations_lead', label: 'Security Operations Lead', group: 'leadership' },
  { key: 'admin_officer', label: 'Administration Officer', group: 'administrative' },
  { key: 'payroll_coordinator', label: 'Rostering & Payroll Coordinator', group: 'administrative' },
  { key: 'finance_officer', label: 'Finance Officer', group: 'administrative' },
  { key: 'hr_officer', label: 'Human Resources Officer', group: 'administrative' },
  { key: 'compliance_officer', label: 'Quality & Compliance Officer', group: 'administrative' },
  { key: 'intake_coordinator', label: 'Intake / Referral Coordinator', group: 'administrative' },
  { key: 'training_coordinator', label: 'Training Coordinator', group: 'administrative' },
  { key: 'rostering_coordinator', label: 'Rostering Coordinator', group: 'administrative' },
  { key: 'bookings_officer', label: 'Bookings / Intake Officer', group: 'administrative' },
  { key: 'employment_support_worker', label: 'Employment Support Worker', group: 'specialized' },
  { key: 'advocacy_worker', label: 'Advocacy Worker', group: 'specialized' },
  { key: 'family_support_worker', label: 'Family Support Worker', group: 'specialized' },
  { key: 'indigenous_support_worker', label: 'Indigenous/CALD Support Worker', group: 'specialized' },
  { key: 'transition_coordinator', label: 'Transition Coordinator', group: 'specialized' },
  { key: 'maintenance_worker', label: 'Maintenance Worker', group: 'specialized' },
  { key: 'peer_worker', label: 'Peer Worker', group: 'specialized' },
  { key: 'consumer_representative', label: 'Consumer Representative', group: 'specialized' },
  { key: 'volunteer_coordinator', label: 'Volunteer Coordinator', group: 'specialized' },
  { key: 'family_member', label: 'Family Member', group: 'external' },
  { key: 'app_developer', label: 'App Developer', group: 'external' },
  { key: 'external_plan_manager', label: 'Plan Manager (External)', group: 'external' },
  { key: 'external_allied_health', label: 'Allied Health (External)', group: 'external' }
] as const;

export const ADMIN_SECTION_OPTIONS = [
  { key: 'reports', label: 'Reports & analytics' },
  { key: 'compliance', label: 'Compliance tools' },
  { key: 'incidents', label: 'Incident oversight' },
  { key: 'timesheets', label: 'Timesheet approvals' },
  { key: 'workforce', label: 'Workforce management' },
  { key: 'finance', label: 'Finance & funding' },
  { key: 'announcements', label: 'Announcements & notices' },
  { key: 'organizationManagement', label: 'Organisation management' },
  { key: 'formAccess', label: 'Organisation form access' },
  { key: 'demoData', label: 'Demo data tools' },
  { key: 'systemAdmin', label: 'System admin controls' },
  { key: 'developerTools', label: 'Developer-only tools' }
] as const;

export const ROLE_PAGE_GROUPS = [
  {
    category: 'Dashboards',
    pages: [
      { page: 'AdminDashboard', label: 'Admin Dashboard' },
      { page: 'CoordinatorDashboard', label: 'Coordinator Dashboard' },
      { page: 'WorkerDashboard', label: 'Worker Dashboard' },
      { page: 'MobilePatrolDashboard', label: 'Mobile Patrol Dashboard' },
      { page: 'FamilyDashboard', label: 'Family Dashboard' },
      { page: 'MaintenanceDashboard', label: 'Maintenance Dashboard' }
    ]
  },
  {
    category: 'People & Workforce',
    pages: [
      { page: 'Participants', label: 'Participants' },
      { page: 'WorkerParticipants', label: 'Worker Participants' },
      { page: 'Workers', label: 'Workers' },
      { page: 'StaffAppraisals', label: 'Staff Appraisals' },
      { page: 'WorkerCredentials', label: 'Worker Credentials' },
      { page: 'WorkerProfile', label: 'Worker Profile' },
      { page: 'MyFamily', label: 'My Family' }
    ]
  },
  {
    category: 'Operations',
    pages: [
      { page: 'MyShifts', label: 'My Shifts' },
      { page: 'ClockInOutPage', label: 'Clock In / Out' },
      { page: 'ShiftNotes', label: 'Shift Notes' },
      { page: 'EnhancedTaskManagement', label: 'Task Management' },
      { page: 'Rostering', label: 'Rostering' },
      { page: 'Timesheets', label: 'Timesheets' },
      { page: 'LeaveRequests', label: 'Leave Requests' },
      { page: 'ShiftSwaps', label: 'Shift Swaps' }
    ]
  },
  {
    category: 'Safety & Clinical',
    pages: [
      { page: 'Incidents', label: 'Incidents' },
      { page: 'WorkerIncidents', label: 'Worker Incidents' },
      { page: 'EmergencyPlans', label: 'Emergency Plans' },
      { page: 'FirstAidHub', label: 'First Aid Hub' },
      { page: 'RiskEngine', label: 'Risk Engine' },
      { page: 'ComplianceDashboard', label: 'Compliance Dashboard' },
      { page: 'DuressAlarm', label: 'Duress Alarm' },
      { page: 'MedicationManagement', label: 'Medication Management' },
      { page: 'SectorExpansionHub', label: 'Sector Expansion Hub' },
      { page: 'DisabilityNDISHub', label: 'Disability & NDIS Hub' },
      { page: 'ClinicalAgedCareHub', label: 'Clinical & Aged Care Hub' },
      { page: 'ClinicalHospitalHandoverHub', label: 'Clinical / Hospital Handover Hub' },
      { page: 'MentalHealthHub', label: 'Mental Health Hub' },
      { page: 'EducationYouthHub', label: 'Education & Youth Hub' },
      { page: 'FamilyPortalHub', label: 'Family Portal Hub' },
      { page: 'SectorExperienceUpgradeHub', label: 'Sector Experience Hub' },
      { page: 'SecurityOperations', label: 'Security Operations' },
      { page: 'ForensicFiles', label: 'Forensic Files' },
      { page: 'ComplianceDraftAssistant', label: 'Compliance AI Drafting' }
    ]
  },
  {
    category: 'Finance & Service Delivery',
    pages: [
      { page: 'FundingTracker', label: 'Funding Tracker' },
      { page: 'FundingForecast', label: 'Funding Forecast' },
      { page: 'NDISPlanManagement', label: 'NDIS & Care Plans' },
      { page: 'ServiceAgreements', label: 'Service Agreements' },
      { page: 'Payroll', label: 'Payroll' },
      { page: 'Billing', label: 'Billing' },
      { page: 'Invoicing', label: 'Invoicing' }
    ]
  },
  {
    category: 'Comms, Forms & Resources',
    pages: [
      { page: 'Messages', label: 'Messages' },
      { page: 'MessagingHub', label: 'Messaging Hub' },
      { page: 'NotificationsCenter', label: 'Notifications' },
      { page: 'Forms', label: 'Forms' },
      { page: 'PhysicalTags', label: 'QR & NFC Tags' },
      { page: 'PhysicalTagScan', label: 'QR & NFC Scan Handler' },
      { page: 'DocumentManagement', label: 'Document Management' },
      { page: 'DocumentCreator', label: 'Document Creator' },
      { page: 'ResourceLibrary', label: 'Resource Library' },
      { page: 'Training', label: 'Training' },
      { page: 'WorkerInduction', label: 'Worker Induction' },
      { page: 'OnboardingWizard', label: 'Onboarding Wizard' }
    ]
  },
  {
    category: 'Advanced & Specialist',
    pages: [
      { page: 'ForgeAI', label: 'Forge AI' },
      { page: 'MyForgeAI', label: 'My Forge AI' },
      { page: 'OutcomeMeasurement', label: 'Outcome Measurement' },
      { page: 'GoalsTracking', label: 'Goals Tracking' },
      { page: 'ReportingAnalytics', label: 'Reporting & Analytics' },
      { page: 'WorkerExperience', label: 'Worker Experience' },
      { page: 'ProgramManagement', label: 'Program Management' },
      { page: 'PropertyManagement', label: 'Property Management' },
      { page: 'Maintenance', label: 'Maintenance' },
      { page: 'IntegrationsHub', label: 'Integrations Hub' },
      { page: 'Telehealth', label: 'Telehealth' }
    ]
  },
  {
    category: 'System & Developer',
    pages: [
      { page: 'Settings', label: 'Settings' },
      { page: 'AdminSettings', label: 'Admin Settings' },
      { page: 'OrganizationManagement', label: 'Organisation Management' },
      { page: 'DevOrgDetails', label: 'Organisation Details' },
      { page: 'DataSecuritySettings', label: 'Data Security Settings' },
      { page: 'SecurityAuditLogs', label: 'Security Audit Logs' },
      { page: 'AuditLogs', label: 'Audit Logs' },
      { page: 'DemoDataManager', label: 'Demo Data Manager' },
      { page: 'AppDeveloperDashboard', label: 'Developer Dashboard' },
      { page: 'DevAPIExplorer', label: 'API Explorer' },
      { page: 'DevFeatureFlags', label: 'Feature Flags' },
      { page: 'DevEventSimulator', label: 'Event Simulator' },
      { page: 'DevUserAnalytics', label: 'User Analytics' },
      { page: 'DevSystemAnalytics', label: 'System Analytics' },
      { page: 'DevComplianceMonitoring', label: 'Compliance Monitoring' },
      { page: 'DevDesignSystem', label: 'Design System' },
      { page: 'DevRolesMatrix', label: 'Roles Matrix' },
      { page: 'AIDiagnostics', label: 'AI Diagnostics' },
      { page: 'AccessPermissionsOverview', label: 'Access Overview' },
      { page: 'GlobalCompletionCentre', label: 'Global Completion Centre' },
      { page: 'GlobalReadiness', label: 'Global Readiness' },
      { page: 'SyncStatus', label: 'Sync Status' }
    ]
  }
] as const;

// --- Base role profiles (unchanged) ---
const BASE_ROLE_ACCESS_PROFILES = {
  admin: {
    role_name: 'Admin',
    home_dashboard: 'AdminDashboard',
    allowed_pages: ROLE_PAGE_GROUPS.flatMap(group => group.pages.map(page => page.page)),
    allowed_admin_sections: ADMIN_SECTION_OPTIONS.map(item => item.key),
    full_access: true,
    notes: 'Default full access profile for organisation admins.'
  },
  leadership: {
    role_name: 'Leadership / Executive',
    home_dashboard: 'AdminDashboard',
    allowed_pages: [
      'AdminDashboard', 'AccessPermissionsOverview', 'GlobalCompletionCentre', 'GlobalReadiness', 'ForensicFiles', 'ComplianceDraftAssistant', 'Participants', 'Workers', 'StaffAppraisals', 'WorkerCredentials', 'JobAdvertising', 'Rostering', 'Timesheets', 'Incidents', 'RestrictivePractices', 'ComplianceDashboard', 'ReportingAnalytics', 'FundingTracker', 'FundingForecast', 'NDISPlanManagement', 'ServiceAgreements', 'PhysicalTags', 'PhysicalTagScan', 'Policies', 'Messages', 'NotificationsCenter', 'ResourceLibrary', 'WorkerExperience', 'OutcomeMeasurement', 'GoalsTracking', 'EmergencyPlans', 'FirstAidHub', 'MedicationManagement', 'SectorExpansionHub', 'DisabilityNDISHub', 'ClinicalAgedCareHub', 'ClinicalHospitalHandoverHub', 'MentalHealthHub', 'EducationYouthHub', 'FamilyPortalHub', 'SectorExperienceUpgradeHub', 'SecurityOperations', 'PropertyManagement', 'Maintenance', 'ProgramManagement', 'IntegrationsHub', 'PredictiveInsights', 'Settings', 'OnboardingWizard', 'EvidencePack', 'PACEIntegration'
    ],
    allowed_admin_sections: ['reports', 'compliance', 'incidents', 'timesheets', 'workforce', 'finance', 'announcements'],
    full_access: false,
    notes: 'Leadership sees operational and reporting tools without sensitive developer or system controls.'
  },
  coordinator: {
    role_name: 'Coordinator / Manager',
    home_dashboard: 'CoordinatorDashboard',
    allowed_pages: [
      'CoordinatorDashboard', 'AccessPermissionsOverview', 'GlobalCompletionCentre', 'GlobalReadiness', 'ForensicFiles', 'ComplianceDraftAssistant', 'Participants', 'Workers', 'StaffAppraisals', 'WorkerCredentials', 'Rostering', 'Timesheets', 'Incidents', 'RestrictivePractices', 'ComplianceDashboard', 'ReportingAnalytics', 'FundingTracker', 'FundingForecast', 'NDISPlanManagement', 'ServiceAgreements', 'Forms', 'PhysicalTags', 'PhysicalTagScan', 'DocumentManagement', 'DocumentCreator', 'Messages', 'NotificationsCenter', 'ResourceLibrary', 'WorkerExperience', 'OutcomeMeasurement', 'GoalsTracking', 'EmergencyPlans', 'FirstAidHub', 'MedicationManagement', 'SectorExpansionHub', 'DisabilityNDISHub', 'ClinicalAgedCareHub', 'ClinicalHospitalHandoverHub', 'MentalHealthHub', 'EducationYouthHub', 'FamilyPortalHub', 'SectorExperienceUpgradeHub', 'SecurityOperations', 'PropertyManagement', 'Maintenance', 'ProgramManagement', 'OnboardingWizard', 'LeaveRequests', 'IntegrationsHub', 'HubManagement', 'EvidencePack', 'PACEIntegration', 'Settings'
    ],
    allowed_admin_sections: [],
    full_access: false,
    notes: 'Coordinator access for service delivery, rostering, compliance, and communication.'
  },
  worker: {
    role_name: 'Support Worker',
    home_dashboard: 'WorkerDashboard',
    allowed_pages: [
      'WorkerDashboard', 'MyImpact', 'MyShifts', 'ClockInOutPage', 'ShiftNotes', 'EnhancedTaskManagement', 'StaffAppraisals', 'WorkerParticipants', 'WorkerIncidents', 'FirstAidHub', 'DuressAlarm', 'Messages', 'NotificationsCenter', 'ResourceLibrary', 'Training', 'WorkerInduction', 'LeaveRequests', 'WorkerProfile', 'ClockInOutPage', 'Forms', 'PhysicalTags', 'PhysicalTagScan', 'DocumentManagement', 'MyForgeAI', 'ShiftSwaps', 'Telehealth', 'OutcomeMeasurement', 'GoalsTracking'
    ],
    allowed_admin_sections: [],
    full_access: false,
    notes: 'Frontline access for assigned work, safety, communication, and required documentation.'
  },
  family: {
    role_name: 'Family Member',
    home_dashboard: 'FamilyDashboard',
    allowed_pages: ['FamilyDashboard', 'MessagingHub', 'NotificationsCenter', 'ResourceLibrary', 'FamilyPortalHub', 'WorkerProfile', 'Telehealth', 'OnboardingWizard', 'MyForgeAI'],
    allowed_admin_sections: [],
    full_access: false,
    notes: 'Family portal access limited to participant-related communication and information.'
  },
  maintenance: {
    role_name: 'Maintenance Worker',
    home_dashboard: 'MaintenanceDashboard',
    allowed_pages: ['MaintenanceDashboard', 'Maintenance', 'Messages', 'NotificationsCenter', 'WorkerProfile', 'MyForgeAI'],
    allowed_admin_sections: [],
    full_access: false,
    notes: 'Maintenance access limited to jobs, alerts, and communication.'
  },
  developer: {
    role_name: 'App Developer',
    home_dashboard: 'AppDeveloperDashboard',
    allowed_pages: ROLE_PAGE_GROUPS.flatMap(group => group.pages.map(page => page.page)),
    allowed_admin_sections: ADMIN_SECTION_OPTIONS.map(item => item.key),
    full_access: true,
    notes: 'Developer full-access profile.'
  }
} as const;

// Helper to clone profiles safely (unchanged logic)
const cloneProfile = (baseKey: keyof typeof BASE_ROLE_ACCESS_PROFILES, roleName: string, overrides: Partial<typeof BASE_ROLE_ACCESS_PROFILES[keyof typeof BASE_ROLE_ACCESS_PROFILES]> = {}) => ({
  ...BASE_ROLE_ACCESS_PROFILES[baseKey],
  role_name: roleName,
  ...overrides,
  allowed_pages: overrides.allowed_pages ? [...overrides.allowed_pages] : [...BASE_ROLE_ACCESS_PROFILES[baseKey].allowed_pages],
  allowed_admin_sections: overrides.allowed_admin_sections ? [...overrides.allowed_admin_sections] : [...BASE_ROLE_ACCESS_PROFILES[baseKey].allowed_admin_sections]
});

export const DEFAULT_ROLE_ACCESS_PROFILES = {
  admin: BASE_ROLE_ACCESS_PROFILES.admin,
  leadership: BASE_ROLE_ACCESS_PROFILES.leadership,
  coordinator: BASE_ROLE_ACCESS_PROFILES.coordinator,
  worker: BASE_ROLE_ACCESS_PROFILES.worker,
  family: BASE_ROLE_ACCESS_PROFILES.family,
  maintenance: BASE_ROLE_ACCESS_PROFILES.maintenance,
  user: cloneProfile('worker', 'User'),
  support_worker: cloneProfile('worker', 'Disability Support Worker'),
  aged_care_worker: cloneProfile('worker', 'Aged/Home Care Worker'),
  mental_health_worker: cloneProfile('worker', 'Mental Health Support Worker', { home_dashboard: 'MentalHealthHub', allowed_pages: [...BASE_ROLE_ACCESS_PROFILES.worker.allowed_pages, 'MentalHealthHub'] }),
  foster_carer: cloneProfile('worker', 'Foster/Kinship Carer'),
  youth_worker: cloneProfile('worker', 'Youth Worker'),
  community_support_worker: cloneProfile('worker', 'Community Support Worker'),
  personal_care_assistant: cloneProfile('worker', 'Personal Care Assistant'),
  residential_youth_worker: cloneProfile('worker', 'Residential Youth Worker'),
  outreach_worker: cloneProfile('worker', 'Outreach Worker'),
  in_home_support_worker: cloneProfile('worker', 'In-Home Support Worker'),
  behaviour_support_practitioner: cloneProfile('worker', 'Behaviour Support Practitioner'),
  security_guard: cloneProfile('worker', 'Security Guard', { home_dashboard: 'MobilePatrolDashboard', allowed_pages: ['MobilePatrolDashboard', 'WorkerDashboard', 'MyShifts', 'ClockInOutPage', 'EnhancedTaskManagement', 'WorkerIncidents', 'DuressAlarm', 'Messages', 'NotificationsCenter', 'ResourceLibrary', 'Training', 'WorkerProfile', 'SecurityOperations', 'PhysicalTagScan', 'ForensicFiles'] }),
  patrol_officer: cloneProfile('worker', 'Patrol Officer', { home_dashboard: 'MobilePatrolDashboard', allowed_pages: ['MobilePatrolDashboard', 'WorkerDashboard', 'MyShifts', 'ClockInOutPage', 'EnhancedTaskManagement', 'WorkerIncidents', 'DuressAlarm', 'Messages', 'NotificationsCenter', 'ResourceLibrary', 'Training', 'WorkerProfile', 'SecurityOperations', 'PhysicalTagScan', 'ForensicFiles'] }),
  site_security_officer: cloneProfile('worker', 'Site Security Officer', { home_dashboard: 'MobilePatrolDashboard', allowed_pages: ['MobilePatrolDashboard', 'WorkerDashboard', 'MyShifts', 'ClockInOutPage', 'EnhancedTaskManagement', 'WorkerIncidents', 'DuressAlarm', 'Messages', 'NotificationsCenter', 'ResourceLibrary', 'Training', 'WorkerProfile', 'SecurityOperations', 'PhysicalTagScan', 'ForensicFiles'] }),
  support_coordinator: cloneProfile('coordinator', 'Support Coordinator'),
  case_manager: cloneProfile('coordinator', 'Case Manager'),
  social_worker: cloneProfile('coordinator', 'Social Worker'),
  youth_case_worker: cloneProfile('coordinator', 'Youth Case Worker'),
  mental_health_case_manager: cloneProfile('coordinator', 'Mental Health Case Manager', { home_dashboard: 'MentalHealthHub', allowed_pages: [...BASE_ROLE_ACCESS_PROFILES.coordinator.allowed_pages, 'MentalHealthHub'] }),
  clinical_care_coordinator: cloneProfile('coordinator', 'Clinical Care Coordinator'),
  aged_care_coordinator: cloneProfile('coordinator', 'Aged Care Coordinator'),
  hospital_transition_coordinator: cloneProfile('coordinator', 'Hospital Transition Coordinator'),
  ndis_plan_manager: cloneProfile('coordinator', 'NDIS Plan Manager'),
  local_area_coordinator: cloneProfile('coordinator', 'Local Area Coordinator'),
  child_protection_worker: cloneProfile('coordinator', 'Child Protection Worker'),
  oohc_caseworker: cloneProfile('coordinator', 'Out-of-Home Care Caseworker'),
  allied_health_professional: cloneProfile('worker', 'Allied Health Professional'),
  physiotherapist: cloneProfile('worker', 'Physiotherapist'),
  occupational_therapist: cloneProfile('worker', 'Occupational Therapist'),
  speech_pathologist: cloneProfile('worker', 'Speech Pathologist'),
  registered_nurse: cloneProfile('worker', 'Registered Nurse'),
  counsellor: cloneProfile('worker', 'Counsellor / Mental Health', { home_dashboard: 'MentalHealthHub', allowed_pages: [...BASE_ROLE_ACCESS_PROFILES.worker.allowed_pages, 'MentalHealthHub'] }),
  therapist: cloneProfile('worker', 'Art/Music/Recreational Therapist'),
  psychologist: cloneProfile('worker', 'Psychologist', { home_dashboard: 'MentalHealthHub', allowed_pages: [...BASE_ROLE_ACCESS_PROFILES.worker.allowed_pages, 'MentalHealthHub'] }),
  exercise_physiologist: cloneProfile('worker', 'Exercise Physiologist'),
  enrolled_nurse: cloneProfile('worker', 'Enrolled Nurse'),
  team_leader: cloneProfile('leadership', 'Team Leader / Supervisor'),
  service_manager: cloneProfile('leadership', 'Service Manager / Program Coordinator'),
  house_manager: cloneProfile('leadership', 'House/Accommodation Manager'),
  operations_manager: cloneProfile('leadership', 'Operations Manager'),
  manager: cloneProfile('leadership', 'Manager (Legacy)'),
  coordinator: cloneProfile('leadership', 'Coordinator (Legacy)'),
  ceo: cloneProfile('leadership', 'Chief Executive Officer'),
  general_manager: cloneProfile('leadership', 'General Manager'),
  board_member: cloneProfile('leadership', 'Board Member'),
  clinical_director: cloneProfile('leadership', 'Clinical Director'),
  director_of_nursing: cloneProfile('leadership', 'Director of Nursing (DON)'),
  clinical_manager: cloneProfile('leadership', 'Clinical Manager'),
  practice_coach: cloneProfile('leadership', 'Practice Coach'),
  quality_improvement_lead: cloneProfile('leadership', 'Quality Improvement Lead'),
  security_operations_manager: cloneProfile('leadership', 'Security Operations Manager'),
  security_supervisor: cloneProfile('leadership', 'Security Supervisor'),
  program_director: cloneProfile('leadership', 'Program Director'),
  sector_lead: cloneProfile('leadership', 'Sector Lead'),
  clinical_aged_care_lead: cloneProfile('leadership', 'Clinical & Aged Care Lead', { home_dashboard: 'ClinicalAgedCareHub', allowed_pages: [...BASE_ROLE_ACCESS_PROFILES.leadership.allowed_pages, 'ClinicalAgedCareHub'] }),
  mental_health_clinical_lead: cloneProfile('leadership', 'Mental Health Clinical Lead', { home_dashboard: 'MentalHealthHub', allowed_pages: [...BASE_ROLE_ACCESS_PROFILES.leadership.allowed_pages, 'MentalHealthHub'] }),
  family_portal_coordinator: cloneProfile('leadership', 'Family Portal Coordinator', { home_dashboard: 'FamilyPortalHub', allowed_pages: [...BASE_ROLE_ACCESS_PROFILES.coordinator.allowed_pages, 'FamilyPortalHub'] }),
  security_operations_lead: cloneProfile('leadership', 'Security Operations Lead', { home_dashboard: 'SecurityOperations', allowed_pages: [...BASE_ROLE_ACCESS_PROFILES.leadership.allowed_pages, 'SecurityOperations'] }),
  admin_officer: cloneProfile('coordinator', 'Administration Officer'),
  payroll_coordinator: cloneProfile('coordinator', 'Rostering & Payroll Coordinator'),
  finance_officer: cloneProfile('coordinator', 'Finance Officer'),
  hr_officer: cloneProfile('coordinator', 'Human Resources Officer'),
  compliance_officer: cloneProfile('coordinator', 'Quality & Compliance Officer'),
  intake_coordinator: cloneProfile('coordinator', 'Intake / Referral Coordinator'),
  training_coordinator: cloneProfile('coordinator', 'Training Coordinator'),
  rostering_coordinator: cloneProfile('coordinator', 'Rostering Coordinator'),
  bookings_officer: cloneProfile('coordinator', 'Bookings / Intake Officer'),
  employment_support_worker: cloneProfile('worker', 'Employment Support Worker'),
  advocacy_worker: cloneProfile('worker', 'Advocacy Worker'),
  family_support_worker: cloneProfile('worker', 'Family Support Worker'),
  indigenous_support_worker: cloneProfile('worker', 'Indigenous/CALD Support Worker'),
  transition_coordinator: cloneProfile('worker', 'Transition Coordinator'),
  maintenance_worker: cloneProfile('maintenance', 'Maintenance Worker'),
  peer_worker: cloneProfile('worker', 'Peer Worker'),
  consumer_representative: cloneProfile('worker', 'Consumer Representative'),
  volunteer_coordinator: cloneProfile('worker', 'Volunteer Coordinator'),
  family_member: cloneProfile('family', 'Family Member'),
  app_developer: BASE_ROLE_ACCESS_PROFILES.developer,
  external_plan_manager: cloneProfile('coordinator', 'Plan Manager (External)'),
  external_allied_health: cloneProfile('worker', 'Allied Health (External)')
} as const;
