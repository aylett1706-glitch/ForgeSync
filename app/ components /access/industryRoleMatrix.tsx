/**
 * Industry-specific role restrictions & access rules
 * Fully compatible with Next.js + Supabase
 * All original logic/values kept — only improvements added
 */

export const industryRoleMatrix = {
  security: {
    label: 'Security operations',
    roles: {
      security_guard: {
        description: 'Patrols, incident logging, site safety and approved close personal protection only.',
        blocked_pages: ['Participants', 'ParticipantProfile', 'NDISPlanManagement', 'MedicationManagement', 'FundingTracker', 'Billing', 'Payroll'],
        allowed_sensitive_access: ['ForensicFiles when security-cleared']
      },
      site_security_officer: {
        description: 'Site security logs, access events, patrols and approved forensic risk briefs.',
        blocked_pages: ['NDISPlanManagement', 'MedicationManagement', 'FundingTracker', 'Billing', 'Payroll'],
        allowed_sensitive_access: ['ForensicFiles when security-cleared']
      },
      security_operations_manager: {
        description: 'Manages security workforce, forensic risk files and operational safety controls.',
        blocked_pages: ['Payroll'],
        allowed_sensitive_access: ['ForensicFiles', 'SecurityOperations', 'Incidents']
      }
    }
  }
} as const;

export const SECURITY_RESTRICTED_PARTICIPANT_PAGES = ['Participants', 'ParticipantProfile', 'WorkerParticipants'] as const;

// --- Type helpers for better autocompletion & safety ---
export type SecurityRole = keyof typeof industryRoleMatrix.security.roles;
export type SecurityRestrictedPage = typeof SECURITY_RESTRICTED_PARTICIPANT_PAGES[number];

/**
 * Check if a staff position belongs to the security sector
 * @param position - Staff role/position to check
 * @returns True if this is a security role
 */
export function isSecurityRole(position: string | null | undefined): boolean {
  return ['security_guard', 'patrol_officer', 'site_security_officer'].includes(position ?? '');
}

/**
 * Get access rules for a specific security role
 * @param role - Security role key to look up
 * @returns Role rules or undefined if not found
 */
export function getSecurityRoleRules(role: string | null | undefined) {
  if (!role) return undefined;
  return industryRoleMatrix.security.roles[role as SecurityRole];
}

/**
 * Check if a page is blocked for a given security role
 * @param pageName - Page name to verify
 * @param role - Security role to check against
 * @returns True if page is blocked
 */
export function isPageBlockedForSecurityRole(pageName: string, role: string | null | undefined): boolean {
  const rules = getSecurityRoleRules(role);
  return rules?.blocked_pages.includes(pageName) ?? false;
}
