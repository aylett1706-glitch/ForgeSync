'use client'; // Required for browser APIs like localStorage/sessionStorage in Next.js

import { DEFAULT_ROLE_ACCESS_PROFILES, ROLE_ACCESS_STORAGE_KEY, ROLE_KEY_ALIASES, USER_PAGE_OVERRIDE_STORAGE_KEY, leadershipExecutivePositions, caseManagementPositions, administrativePositions } from '@/components/access/roleAccessDefaults';
import { getIndustryPages, INDUSTRY_RESTRICTED_PAGES, isIndustryPageAllowed } from '@/components/access/industryAccess';
import { isSecurityRole, SECURITY_RESTRICTED_PARTICIPANT_PAGES } from '@/components/access/industryRoleMatrix';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export { leadershipExecutivePositions, caseManagementPositions, administrativePositions };

function getDefaultProfiles() {
  return DEFAULT_ROLE_ACCESS_PROFILES;
}

export function buildRoleAccessProfilesMap(records: any[] = []) {
  return records.reduce((acc, record) => {
    const roleKey = ROLE_KEY_ALIASES[record.role_key] || record.role_key;
    acc[roleKey] = {
      role_name: record.role_name,
      home_dashboard: record.home_dashboard,
      allowed_pages: record.allowed_pages || [],
      allowed_admin_sections: record.allowed_admin_sections || [],
      full_access: !!record.full_access,
      notes: record.notes || ''
    };
    return acc;
  }, {} as Record<string, any>);
}

export function readStoredRoleAccessProfiles() {
  if (typeof window === 'undefined') return getDefaultProfiles();
  try {
    const raw = localStorage.getItem(ROLE_ACCESS_STORAGE_KEY);
    if (!raw) return getDefaultProfiles();
    const parsed = JSON.parse(raw);
    const normalized = Object.entries(parsed || {}).reduce((acc, [key, value]) => {
      acc[ROLE_KEY_ALIASES[key] || key] = value;
      return acc;
    }, {} as Record<string, any>);
    return { ...getDefaultProfiles(), ...normalized };
  } catch {
    return getDefaultProfiles();
  }
}

export function writeStoredRoleAccessProfiles(profiles: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROLE_ACCESS_STORAGE_KEY, JSON.stringify(profiles));
}

export function readStoredUserPageOverrides() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(USER_PAGE_OVERRIDE_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function writeStoredUserPageOverrides(overrides: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_PAGE_OVERRIDE_STORAGE_KEY, JSON.stringify(overrides));
}

/**
 * Sync role access profiles from Supabase (replaces base44 call)
 */
export async function syncRoleAccessProfiles(organizationId: string | null | undefined) {
  if (!organizationId) return readStoredRoleAccessProfiles();
  const supabase = createClientComponentClient<Database>();

  // Use client-side cache if fresh
  if (typeof window !== 'undefined') {
    try {
      const cacheKey = `role-access-sync-${organizationId}`;
      const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
      if (cached?.timestamp && Date.now() - cached.timestamp < 5 * 60 * 1000 && cached?.profiles) {
        writeStoredRoleAccessProfiles(cached.profiles);
        return cached.profiles;
      }
    } catch {}
  }

  // Fetch from Supabase
  const { data: records, error } = await supabase
    .from('RoleAccessProfile')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Failed to sync role access profiles:', error);
    return readStoredRoleAccessProfiles();
  }

  const merged = { ...getDefaultProfiles(), ...buildRoleAccessProfilesMap(records || []) };
  writeStoredRoleAccessProfiles(merged);

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`role-access-sync-${organizationId}`, JSON.stringify({
      timestamp: Date.now(),
      profiles: merged,
    }));
  }

  return merged;
}

export function getEffectiveUser(user: any) {
  if (!user) return user;
  const access = getAccessContext(user);
  return {
    ...user,
    position: access.effectivePosition || user.position,
    role: access.effectiveRole || user.role,
  };
}

export function getAccessContext(user: any) {
  const isDeveloper = !!(user?.is_developer || user?.position === 'app_developer' || user?.email === 'michael.aylett@devonfield.com.au');
  const impersonatedRole = isDeveloper && typeof window !== 'undefined' ? sessionStorage.getItem('dev_impersonate_role') : null;
  const rawPosition = impersonatedRole || user?.position || '';
  const effectivePosition = ROLE_KEY_ALIASES[rawPosition] || rawPosition;
  const effectiveRole = impersonatedRole === 'admin' ? 'admin' : (impersonatedRole ? 'user' : user?.role);
  const isLeadership = leadershipExecutivePositions.includes(effectivePosition);
  const isCoordinator = caseManagementPositions.includes(effectivePosition) || administrativePositions.includes(effectivePosition);
  const isFamily = effectivePosition === 'family_member' || (effectiveRole === 'user' && user?.participant_id && !effectivePosition);
  const isMaintenance = effectivePosition === 'maintenance_worker';
  const hasExplicitRolePosition = !!effectivePosition && effectivePosition !== 'app_developer';
  const hasFullAdminAccess = effectiveRole === 'admin' && !hasExplicitRolePosition && !isLeadership && !isCoordinator && !isMaintenance && !isFamily;

  return {
    isDeveloper,
    impersonatedRole,
    effectivePosition,
    effectiveRole,
    isLeadership,
    isCoordinator,
    isFamily,
    isMaintenance,
    hasExplicitRolePosition,
    hasFullAdminAccess,
  };
}

function getRoleProfileKey(user: any) {
  const access = getAccessContext(user);
  const stored = readStoredRoleAccessProfiles();
  const normalizedPosition = ROLE_KEY_ALIASES[access.effectivePosition] || access.effectivePosition;
  if (normalizedPosition && stored[normalizedPosition]) return normalizedPosition;
  if (access.hasFullAdminAccess) return 'admin';
  if (access.isLeadership) return 'leadership';
  if (access.isCoordinator) return 'coordinator';
  if (access.isFamily) return 'family';
  if (access.isMaintenance) return 'maintenance';
  if (access.effectiveRole === 'user' && stored.user) return 'user';
  return 'worker';
}

function getRoleProfile(user: any) {
  const roleKey = getRoleProfileKey(user);
  const stored = readStoredRoleAccessProfiles();
  return stored[roleKey] || getDefaultProfiles()[roleKey];
}

function getUserAllowedPages(user: any) {
  const storedOverrides = readStoredUserPageOverrides();
  if (user?.id && Array.isArray(storedOverrides[user.id]?.allowed_pages_override)) {
    return storedOverrides[user.id].allowed_pages_override;
  }
  return Array.isArray(user?.allowed_pages_override) ? user.allowed_pages_override : [];
}

function getUserBlockedPages(user: any) {
  const storedOverrides = readStoredUserPageOverrides();
  if (user?.id && Array.isArray(storedOverrides[user.id]?.blocked_pages_override)) {
    return storedOverrides[user.id].blocked_pages_override;
  }
  return Array.isArray(user?.blocked_pages_override) ? user.blocked_pages_override : [];
}

export function getHomeDashboardPage(user: any) {
  const access = getAccessContext(user);
  if (access.isDeveloper && !access.impersonatedRole) return 'AppDeveloperDashboard';
  if (access.isFamily) return 'FamilyDashboard';
  if (access.isMaintenance) return 'MaintenanceDashboard';
  const profile = getRoleProfile(user);
  if (profile?.home_dashboard) return profile.home_dashboard;
  if (access.hasFullAdminAccess || access.isLeadership) return 'AdminDashboard';
  if (access.isCoordinator) return 'CoordinatorDashboard';
  return 'WorkerDashboard';
}

export function canAccessPage(user: any, pageName: string) {
  if (!user) return false;
  const access = getAccessContext(user);
  if (pageName === 'ForgeAI') {
    return (access.isDeveloper && !access.impersonatedRole) || access.hasFullAdminAccess;
  }
  if (pageName === 'MyForgeAI') {
    return access.isMaintenance || access.isFamily || (!access.isLeadership && !access.isCoordinator && !access.hasFullAdminAccess && !(access.isDeveloper && !access.impersonatedRole));
  }
  if (access.isDeveloper && !access.impersonatedRole) return true;
  if (isSecurityRole(access.effectivePosition) && SECURITY_RESTRICTED_PARTICIPANT_PAGES.includes(pageName) && !user?.close_personal_protection_access) return false;
  if (pageName === 'Home') return true;
  if (pageName === getHomeDashboardPage(user)) return true;

  const blockedPages = getUserBlockedPages(user);
  if (blockedPages.includes(pageName)) return false;

  const selectedSectors = user?.operating_sectors || user?.organization_operating_sectors || [];
  const organizationIndustry = user?.organization_industry;
  const enforceIndustry = !!organizationIndustry && organizationIndustry !== 'general';

  if (enforceIndustry && !isIndustryPageAllowed(pageName, organizationIndustry, selectedSectors)) return false;

  const allowedPages = getUserAllowedPages(user);
  if (allowedPages.includes(pageName)) return true;

  const profile = getRoleProfile(user);
  if (profile?.full_access) return true;
  const industryPages = getIndustryPages(organizationIndustry, selectedSectors);
  return !!profile?.allowed_pages?.includes(pageName) && (industryPages.length === 0 || industryPages.includes(pageName) || !INDUSTRY_RESTRICTED_PAGES.includes(pageName));
}

export function canAccessAdminSection(user: any, sectionKey: string) {
  if (!user) return false;
  const access = getAccessContext(user);
  if (access.isDeveloper && !access.impersonatedRole) return true;
  const profile = getRoleProfile(user);
  if (profile?.full_access) return true;
  return !!profile?.allowed_admin_sections?.includes(sectionKey);
}
