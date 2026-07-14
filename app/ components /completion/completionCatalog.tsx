// --- Types ---
type CompletionPriority = 'critical' | 'high' | 'medium';

interface CompletionItem {
  title: string;
  description: string;
  target_page: string;
}

interface CompletionPhase {
  key: string;
  title: string;
  priority: CompletionPriority;
  summary: string;
  items: [string, string, string][];
}

interface FlattenedCompletionItem {
  phase_key: string;
  phase_title: string;
  priority: CompletionPriority;
  title: string;
  description: string;
  target_page: string;
}

export const COMPLETION_PHASES: CompletionPhase[] = [
  {
    key: 'safety-security',
    title: 'Safety, security and access',
    priority: 'critical',
    summary: 'Locks down role access, sensitive records, audit trails and compliance-critical workflows.',
    items: [
      ['Role access matrix audit', 'Verify every page against admin, coordinator, worker, family, maintenance, clinical and security roles.', 'AccessPermissionsOverview'],
      ['Entity RLS coverage audit', 'Review sensitive clinical, safeguarding, medication, family and security entities for organisation isolation.', 'DevAPIExplorer'],
      ['Document visibility audit', 'Confirm document access, secure files, versioning, expiry and download history.', 'DocumentManagement'],
      ['Security event workflow test', 'Validate access/CCTV events, patrol logs, post orders, checkpoints and escalation handling.', 'SecurityOperations'],
    ],
  },
  {
    key: 'navigation-routing',
    title: 'Navigation and routing',
    priority: 'critical',
    summary: 'Ensures every visible feature has a working route, sidebar entry and direct hub link.',
    items: [
      ['Route registry audit', 'Check explicit App routes and older pages.config routes for missing or duplicate pages.', 'DevSystemAnalytics'],
      ['Hub click-through audit', 'Test Forms, Resources, Files and module actions across every sector hub.', 'SectorExpansionHub'],
      ['Mobile navigation audit', 'Confirm bottom tabs and mobile menu match each role’s real workflows.', 'WorkerDashboard'],
      ['Broken search/link audit', 'Verify all form/resource/document search links return matching content.', 'ResourceLibrary'],
    ],
  },
  {
    key: 'forms-resources-documents',
    title: 'Forms, resources and documents',
    priority: 'high',
    summary: 'Completes workflow templates, resource packs, evidence exports and document handling.',
    items: [
      ['Workflow template coverage', 'Ensure every hub workflow has an exact form template and approval mode.', 'Forms'],
      ['Resource pack coverage', 'Ensure every hub workflow has matching guidance, policy or procedure resources.', 'ResourceLibrary'],
      ['Document review workflow', 'Add review dates, ownership, expiry reminders and audit-ready document status.', 'DocumentManagement'],
      ['Evidence pack consistency', 'Standardise sector evidence packs for NDIS, aged care, clinical, security and child safety.', 'EvidencePack'],
    ],
  },
  {
    key: 'mobile-offline',
    title: 'Mobile and offline field work',
    priority: 'high',
    summary: 'Makes frontline workflows reliable in low-signal environments and on small screens.',
    items: [
      ['Offline queue visibility', 'Expose queued forms, notes, scans, photos and sync failures clearly to workers.', 'SyncStatus'],
      ['Clock-in/out smoke test', 'Verify geofence, QR/NFC and manual flows across mobile devices.', 'ClockInOutPage'],
      ['Voice/photo upload resilience', 'Confirm voice notes, incident photos and private files retry safely after offline use.', 'ShiftNotes'],
      ['Duress and emergency mobile test', 'Validate duress, first aid, emergency plans and rollcall on mobile.', 'DuressAlarm'],
    ],
  },
  {
    key: 'automation-alerts',
    title: 'Automations and alerts',
    priority: 'high',
    summary: 'Completes reminders, escalations, notifications and scheduled compliance checks.',
    items: [
      ['Credential expiry reminders', 'Alert workers and coordinators before screening, licence and training expiry.', 'WorkerCredentials'],
      ['Incident escalation automation', 'Notify leadership for high-risk incidents, restrictive practices and unresolved reviews.', 'Incidents'],
      ['Maintenance SLA automation', 'Escalate overdue or critical maintenance and safety sign-off items.', 'Maintenance'],
      ['Form and policy reminders', 'Process overdue forms, policy acknowledgements and review-required submissions.', 'Forms'],
    ],
  },
  {
    key: 'reporting-compliance',
    title: 'Reporting and compliance',
    priority: 'medium',
    summary: 'Turns operational records into audit-ready dashboards, exports and governance evidence.',
    items: [
      ['Scheduled report framework', 'Create recurring compliance, board, finance and outcome reports.', 'ReportingAnalytics'],
      ['Compliance evidence exports', 'Standardise NDIS, aged care, clinical, security and safeguarding evidence exports.', 'ComplianceDashboard'],
      ['Executive summary views', 'Validate leadership dashboards and trend reporting across sectors.', 'AdminDashboard'],
      ['Audit log review', 'Confirm sensitive activity is traceable across users, records and exports.', 'AuditLogs'],
    ],
  },
  {
    key: 'integrations-ai',
    title: 'Integrations and AI governance',
    priority: 'medium',
    summary: 'Connects approved services and adds safe review controls for AI-supported work.',
    items: [
      ['Connector readiness review', 'Map registered connectors to real app workflows and user connection screens.', 'IntegrationsHub'],
      ['Google/OneDrive document flow', 'Connect document creation, storage and export workflows to selected providers.', 'DocumentCreator'],
      ['AI permission audit', 'Ensure AI tools only access approved entities, functions and user context.', 'AIDiagnostics'],
      ['AI review workflow', 'Require human review for clinical, compliance, incident and safeguarding AI outputs.', 'ForgeAI'],
    ],
  },
];

export const flattenCompletionItems = (): FlattenedCompletionItem[] => 
  COMPLETION_PHASES.flatMap((phase) =>
    phase.items.map(([title, description, target_page]) => ({
      phase_key: phase.key,
      phase_title: phase.title,
      priority: phase.priority,
      title,
      description,
      target_page,
    }))
  );
