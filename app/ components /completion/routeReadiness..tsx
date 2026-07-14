import { pagesConfig } from '@/pages.config';
import { ROLE_PAGE_GROUPS } from '@/components/access/roleAccessDefaults';
import { COMPLETION_PHASES } from '@/components/completion/completionCatalog';

export const EXPLICIT_ROUTE_PAGES = [
  'TrainingAnalytics', 'TrainingActivityLog', 'TrainingTeams', 'TrainingCertificates', 'TrainingEnrollments',
  'TrainingModuleTracking', 'TrainingAttendance', 'TrainingDebrief', 'MyForgeAI', 'WorkerOnboarding',
  'OnboardingWizard', 'ParticipantProfile', 'RiskAssessments', 'IncidentAnalytics', 'JobAdvertising',
  'StaffAppraisals', 'SecurityComplianceCentre', 'GlobalGovernanceSettings', 'SectorExpansionHub',
  'MentalHealthHub', 'ClinicalAgedCareHub', 'FamilyPortalHub', 'DisabilityNDISHub',
  'SectorExperienceUpgradeHub', 'EducationYouthHub', 'ClinicalHospitalHandoverHub', 'SecurityOperations',
  'PhysicalTags', 'PhysicalTagScan', 'SyncStatus', 'AccessPermissionsOverview', 'GlobalCompletionCentre'
] as const;

type PageName = typeof EXPLICIT_ROUTE_PAGES[number];
type CheckStatus = 'pass' | 'attention' | 'fail';

interface ReadinessCheck {
  key: string;
  title: string;
  status: CheckStatus;
  detail: string;
}

const unique = (items: (string | undefined | null)[]): string[] => 
  [...new Set(items.filter(Boolean) as string[])];

export function getRouteReadinessChecks(): ReadinessCheck[] {
  const configuredPages = Object.keys(pagesConfig.Pages || {}) as PageName[];
  const routedPages = unique([...configuredPages, ...EXPLICIT_ROUTE_PAGES]);
  const rawRolePages = ROLE_PAGE_GROUPS.flatMap((group) => group.pages.map((item) => item.page));
  const rolePages = unique(rawRolePages);
  const completionTargets = unique(COMPLETION_PHASES.flatMap((phase) => phase.items.map((item) => item[2])));
  
  const missingFromRoutes = rolePages.filter((page) => !routedPages.includes(page));
  const completionTargetsMissingRoutes = completionTargets.filter((page) => !routedPages.includes(page));
  const duplicateRolePages = unique(rawRolePages.filter((page, index) => rawRolePages.indexOf(page) !== index));

  return [
    {
      key: 'routes-covered',
      title: 'Role pages have routes',
      status: missingFromRoutes.length === 0 ? 'pass' : 'attention',
      detail: missingFromRoutes.length === 0 
        ? 'All role registry pages are routed.' 
        : `${missingFromRoutes.length} role pages need route review: ${missingFromRoutes.slice(0, 8).join(', ')}`,
    },
    {
      key: 'completion-targets-routed',
      title: 'Completion action links are routed',
      status: completionTargetsMissingRoutes.length === 0 ? 'pass' : 'attention',
      detail: completionTargetsMissingRoutes.length === 0 
        ? 'All Completion Centre action links have matching routes.' 
        : `${completionTargetsMissingRoutes.length} completion links need review: ${completionTargetsMissingRoutes.join(', ')}`,
    },
    {
      key: 'global-completion-routed',
      title: 'Global Completion route installed',
      status: routedPages.includes('GlobalCompletionCentre') ? 'pass' : 'fail',
      detail: routedPages.includes('GlobalCompletionCentre') 
        ? 'Global Completion Centre is reachable from App routing.' 
        : 'Global Completion Centre route is missing.',
    },
    {
      key: 'role-registry-duplicates',
      title: 'Role page registry duplicate check',
      status: duplicateRolePages.length === 0 ? 'pass' : 'attention',
      detail: duplicateRolePages.length === 0 
        ? 'No duplicate role page entries detected.' 
        : `Duplicate registry entries: ${duplicateRolePages.join(', ')}`,
    },
  ];
}
