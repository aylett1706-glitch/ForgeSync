import { Baby, BriefcaseBusiness, GraduationCap, HeartPulse, Hospital, ShieldCheck, Stethoscope, UsersRound } from 'lucide-react';

export interface SectorOption {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
  controls: string[];
}

export interface GovernanceControl {
  key: string;
  label: string;
  description: string;
}

export const sectorOptions: SectorOption[] = [
  {
    key: 'disability_ndis',
    label: 'Disability / NDIS',
    icon: ShieldCheck,
    description: 'NDIS Practice Standards, participant safeguards, restrictive practices and support plans.',
    controls: ['NDIS safeguards', 'Restrictive practice oversight', 'Participant rights', 'Support plan review'],
  },
  {
    key: 'aged_care',
    label: 'Aged Care',
    icon: HeartPulse,
    description: 'Aged Care Quality Standards, care minutes, clinical escalation and dignity of risk.',
    controls: ['Care plan review', 'Clinical escalation', 'Medication safety', 'Consumer dignity'],
  },
  {
    key: 'youth_children',
    label: 'Youth & Children',
    icon: Baby,
    description: 'Child safe standards, mandatory reporting, guardianship and safeguarding alerts.',
    controls: ['Child safe reporting', 'Guardian consent', 'Mandatory reporting', 'Wellbeing monitoring'],
  },
  {
    key: 'education',
    label: 'Education',
    icon: GraduationCap,
    description: 'School support plans, behaviour observations, learning goals and attendance support.',
    controls: ['School support notes', 'Education goals', 'Behaviour observations', 'Guardian updates'],
  },
  {
    key: 'hospital_clinical',
    label: 'Hospital / Clinical',
    icon: Hospital,
    description: 'Clinical governance, discharge planning, hospital transfers and RN review queues.',
    controls: ['Clinical review', 'Hospital transfer summary', 'Discharge planning', 'RN sign-off'],
  },
  {
    key: 'allied_health',
    label: 'Allied Health',
    icon: Stethoscope,
    description: 'Therapy goals, clinical observations, reports, appointments and progress tracking.',
    controls: ['Therapy outcomes', 'Clinical notes', 'Report tracking', 'Appointment follow-up'],
  },
  {
    key: 'mental_health',
    label: 'Mental Health',
    icon: UsersRound,
    description: 'Psychosocial supports, risk escalation, wellbeing monitoring and safety planning.',
    controls: ['Safety plan', 'Mood monitoring', 'Risk escalation', 'Recovery goals'],
  },
  {
    key: 'supported_employment',
    label: 'Supported Employment',
    icon: BriefcaseBusiness,
    description: 'Employer supports, workplace adjustments, job coaching and placement outcomes.',
    controls: ['Workplace supports', 'Employer notes', 'Placement outcomes', 'Adjustment tracking'],
  },
];

export const globalControls: GovernanceControl[] = [
  { 
    key: 'minimum_necessary_access', 
    label: 'Minimum necessary access', 
    description: 'Limit sensitive information to what each role needs for safe support.' 
  },
  { 
    key: 'safeguarding_alerts', 
    label: 'Safeguarding alerts', 
    description: 'Surface warning signs for abuse, neglect, exploitation, deterioration or unsafe environments.' 
  },
  { 
    key: 'mandatory_reporting', 
    label: 'Mandatory reporting', 
    description: 'Highlight reporting triggers for child safety, restrictive practices and serious incidents.' 
  },
  { 
    key: 'clinical_governance', 
    label: 'Clinical governance', 
    description: 'Support RN review, medication safety, clinical observations and escalation pathways.' 
  },
  { 
    key: 'education_support', 
    label: 'Education support', 
    description: 'Enable school support plans, education goals and classroom behaviour observations.' 
  },
  { 
    key: 'family_portal_governance', 
    label: 'Family portal governance', 
    description: 'Control what families and guardians can see, receive and consent to.' 
  },
  { 
    key: 'ai_quality_checker', 
    label: 'AI quality checker', 
    description: 'Check notes and reports for missing detail, risky wording and suggested follow-up.' 
  },
  { 
    key: 'offline_safety_controls', 
    label: 'Offline safety controls', 
    description: 'Protect queued records, show unsynced risks and prompt secure sync follow-up.' 
  },
];
