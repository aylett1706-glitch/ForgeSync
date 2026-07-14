import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Database, Shield, Users, Trash2, Sparkles } from 'lucide-react';

// --- Types ---
interface RoleOption {
  value: string;
  label: string;
}

interface RoleGroup {
  label: string;
  roles: RoleOption[];
}

// --- Role Groups (unchanged content, typed) ---
const IMPERSONATION_GROUPS: RoleGroup[] = [
  {
    label: 'Core Roles',
    roles: [
      { value: 'user', label: 'User' },
      { value: 'admin', label: 'Admin' }
    ]
  },
  {
    label: 'Frontline',
    roles: [
      { value: 'support_worker', label: 'Disability Support Worker' },
      { value: 'aged_home_care_worker', label: 'Aged/Home Care Worker' },
      { value: 'mental_health_support_worker', label: 'Mental Health Support Worker' },
      { value: 'foster_kinship_carer', label: 'Foster/Kinship Carer' },
      { value: 'youth_worker', label: 'Youth Worker' },
      { value: 'community_support_worker', label: 'Community Support Worker' },
      { value: 'personal_care_assistant', label: 'Personal Care Assistant' },
      { value: 'residential_youth_worker', label: 'Residential Youth Worker' },
      { value: 'outreach_worker', label: 'Outreach Worker' },
      { value: 'in_home_support_worker', label: 'In-Home Support Worker' },
      { value: 'behaviour_support_practitioner', label: 'Behaviour Support Practitioner' },
      { value: 'security_guard', label: 'Security Guard' },
      { value: 'patrol_officer', label: 'Patrol Officer' },
      { value: 'site_security_officer', label: 'Site Security Officer' }
    ]
  },
  {
    label: 'Case Management',
    roles: [
      { value: 'support_coordinator', label: 'Support Coordinator' },
      { value: 'case_manager', label: 'Case Manager' },
      { value: 'social_worker', label: 'Social Worker' },
      { value: 'youth_case_worker', label: 'Youth Case Worker' },
      { value: 'mental_health_case_manager', label: 'Mental Health Case Manager' },
      { value: 'clinical_care_coordinator', label: 'Clinical Care Coordinator' },
      { value: 'aged_care_coordinator', label: 'Aged Care Coordinator' },
      { value: 'hospital_transition_coordinator', label: 'Hospital Transition Coordinator' },
      { value: 'ndis_plan_manager', label: 'NDIS Plan Manager' },
      { value: 'local_area_coordinator', label: 'Local Area Coordinator' },
      { value: 'child_protection_worker', label: 'Child Protection Worker' },
      { value: 'oohc_caseworker', label: 'Out-of-Home Care Caseworker' }
    ]
  },
  {
    label: 'Therapeutic',
    roles: [
      { value: 'allied_health_professional', label: 'Allied Health Professional' },
      { value: 'physiotherapist', label: 'Physiotherapist' },
      { value: 'occupational_therapist', label: 'Occupational Therapist' },
      { value: 'speech_pathologist', label: 'Speech Pathologist' },
      { value: 'registered_nurse', label: 'Registered Nurse' },
      { value: 'counsellor', label: 'Counsellor / Mental Health' },
      { value: 'art_music_recreational_therapist', label: 'Art/Music/Recreational Therapist' },
      { value: 'psychologist', label: 'Psychologist' },
      { value: 'exercise_physiologist', label: 'Exercise Physiologist' },
      { value: 'enrolled_nurse', label: 'Enrolled Nurse' }
    ]
  },
  {
    label: 'Leadership & Executive',
    roles: [
      { value: 'team_leader', label: 'Team Leader / Supervisor' },
      { value: 'service_manager', label: 'Service Manager / Program Coordinator' },
      { value: 'house_manager', label: 'House/Accommodation Manager' },
      { value: 'operations_manager', label: 'Operations Manager' },
      { value: 'manager', label: 'Manager (Legacy)' },
      { value: 'coordinator', label: 'Coordinator (Legacy)' },
      { value: 'ceo', label: 'Chief Executive Officer' },
      { value: 'general_manager', label: 'General Manager' },
      { value: 'board_member', label: 'Board Member' },
      { value: 'clinical_director', label: 'Clinical Director' },
      { value: 'director_of_nursing', label: 'Director of Nursing (DON)' },
      { value: 'clinical_manager', label: 'Clinical Manager' },
      { value: 'practice_coach', label: 'Practice Coach' },
      { value: 'quality_improvement_lead', label: 'Quality Improvement Lead' },
      { value: 'security_operations_manager', label: 'Security Operations Manager' },
      { value: 'security_supervisor', label: 'Security Supervisor' },
      { value: 'program_director', label: 'Program Director' },
      { value: 'sector_lead', label: 'Sector Lead' },
      { value: 'clinical_aged_care_lead', label: 'Clinical & Aged Care Lead' },
      { value: 'mental_health_clinical_lead', label: 'Mental Health Clinical Lead' },
      { value: 'family_portal_coordinator', label: 'Family Portal Coordinator' },
      { value: 'security_operations_lead', label: 'Security Operations Lead' }
    ]
  },
  {
    label: 'Administrative',
    roles: [
      { value: 'admin_officer', label: 'Administration Officer' },
      { value: 'payroll_coordinator', label: 'Rostering & Payroll Coordinator' },
      { value: 'finance_officer', label: 'Finance Officer' },
      { value: 'hr_officer', label: 'Human Resources Officer' },
      { value: 'compliance_officer', label: 'Quality & Compliance Officer' },
      { value: 'intake_coordinator', label: 'Intake / Referral Coordinator' },
      { value: 'training_coordinator', label: 'Training Coordinator' },
      { value: 'rostering_coordinator', label: 'Rostering Coordinator' },
      { value: 'bookings_officer', label: 'Bookings / Intake Officer' }
    ]
  },
  {
    label: 'Specialized & Support',
    roles: [
      { value: 'employment_support_worker', label: 'Employment Support Worker' },
      { value: 'advocacy_worker', label: 'Advocacy Worker' },
      { value: 'family_support_worker', label: 'Family Support Worker' },
      { value: 'indigenous_cald_support_worker', label: 'Indigenous/CALD Support Worker' },
      { value: 'transition_coordinator', label: 'Transition Coordinator' },
      { value: 'maintenance_worker', label: 'Maintenance Worker' },
      { value: 'peer_worker', label: 'Peer Worker' },
      { value: 'consumer_representative', label: 'Consumer Representative' },
      { value: 'volunteer_coordinator', label: 'Volunteer Coordinator' }
    ]
  },
  {
    label: 'External',
    roles: [
      { value: 'family_member', label: 'Family Member' },
      { value: 'app_developer', label: 'App Developer' },
      { value: 'plan_manager_external', label: 'Plan Manager (External)' },
      { value: 'allied_health_external', label: 'Allied Health (External)' }
    ]
  }
];

export default function DeveloperPriorityActions() {
  // Use state for proper reactivity + type safety
  const [impersonatedRole, setImpersonatedRole] = useState<string>('');

  // Load initial value from sessionStorage on mount
  useEffect(() => {
    setImpersonatedRole(sessionStorage.getItem('dev_impersonate_role') || '');
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (newRole) {
      sessionStorage.setItem('dev_impersonate_role', newRole);
    } else {
      sessionStorage.removeItem('dev_impersonate_role');
    }
    // Soft reload to apply role immediately
    window.location.reload();
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">Priority Actions</CardTitle>
        <CardDescription>Fast paths for the controls you asked to make easier to reach.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons Grid */}
        <div className="grid gap-3 md:grid-cols-2">
          <Link to={createPageUrl('DemoDataManager')} className="block min-w-0">
            <Button variant="destructive" className="h-auto min-h-11 w-full justify-start whitespace-normal py-3 text-left">
              <Trash2 className="w-4 h-4 shrink-0" /> Delete Mock Seed Data
            </Button>
          </Link>

          <Link to={createPageUrl('DevFeatureFlags')} className="block min-w-0">
            <Button className="h-auto min-h-11 w-full justify-start whitespace-normal bg-amber-600 py-3 text-left text-white hover:bg-amber-700">
              <Shield className="w-4 h-4 shrink-0" /> Manage Feature Flags
            </Button>
          </Link>

          <Link to={createPageUrl('DevAPIExplorer')} className="block min-w-0">
            <Button variant="outline" className="h-auto min-h-11 w-full justify-start whitespace-normal py-3 text-left">
              <Database className="w-4 h-4 shrink-0" /> Open API Explorer
            </Button>
          </Link>

          <Link to={createPageUrl('DevUserAnalytics')} className="block min-w-0">
            <Button variant="outline" className="h-auto min-h-11 w-full justify-start whitespace-normal py-3 text-left">
              <Users className="w-4 h-4 shrink-0" /> Manage Global Users
            </Button>
          </Link>
        </div>

        {/* Role Impersonation Section */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Role Impersonation
          </div>

          <select
            className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={impersonatedRole}
            onChange={handleRoleChange}
            aria-label="Select role to impersonate"
          >
            <option value="">Normal developer mode</option>
            {IMPERSONATION_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <p className="text-xs text-slate-500">
            Select a role to test permissions and flows without leaving the developer module.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
