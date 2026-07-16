export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'datetime' | 'number' | 'select';
  required?: boolean;
  options?: string[];
}

export interface FormTemplate {
  key: string;
  title: string;
  description: string;
  category: string;
  sector: string;
  workflow_mode: 'simple' | 'manager_approval' | 'review_required';
  version: string;
  schema: {
    fields: FormField[];
  };
}

const yesNo = ['Yes', 'No', 'N/A'];
const risk = ['Low', 'Medium', 'High', 'Critical'];
const rating = ['1 — Poor', '2 — Needs improvement', '3 — Adequate', '4 — Good', '5 — Excellent'];

export const ELITE_FORM_TEMPLATE_CATALOG: FormTemplate[] = [
  {
    key: 'hospital-transfer-summary-elite',
    title: 'Hospital Transfer Summary — Comprehensive',
    description: 'Full clinical and support handover for ED, ambulance or hospital admission including risks, medication, baseline, decision maker and communication needs.',
    category: 'hospital',
    sector: 'hospital_clinical',
    workflow_mode: 'manager_approval',
    version: '1.0',
    schema: {
      fields: [
        { name: 'person_name', label: 'Person / Client Full Name', type: 'text', required: true },
        { name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
        { name: 'transfer_time', label: 'Transfer Date & Time', type: 'datetime', required: true },
        { name: 'transfer_destination', label: 'Hospital / Service Destination', type: 'text', required: true },
        { 
          name: 'transfer_reason', 
          label: 'Reason for Transfer', 
          type: 'select', 
          options: ['Fall/injury','Chest pain','Breathing difficulty','Seizure','Medication issue','Behaviour/mental health crisis','Infection concern','Unplanned deterioration','Planned admission','Other'], 
          required: true 
        },
        { name: 'presenting_concern', label: 'Presenting Concern and Timeline', type: 'textarea', required: true },
        { name: 'baseline_function', label: 'Usual Baseline Function / Cognition / Mobility', type: 'textarea', required: true },
        { name: 'current_observations', label: 'Current Observations / Vitals / Symptoms', type: 'textarea', required: true },
        { name: 'medical_history', label: 'Relevant Medical History', type: 'textarea', required: true },
        { name: 'current_medications', label: 'Current Medications and Last Administered Times', type: 'textarea', required: true },
        { name: 'allergies_alerts', label: 'Allergies, Alerts and Contraindications', type: 'textarea', required: true },
        { name: 'communication_needs', label: 'Communication Needs / Interpreter / AAC', type: 'textarea', required: true },
        { name: 'behaviour_support', label: 'Behaviour Support, Triggers and De-escalation Strategies', type: 'textarea' },
        { name: 'restrictive_practices', label: 'Restrictive Practices / Authorisations', type: 'textarea' },
        { name: 'decision_maker', label: 'Guardian / Substitute Decision Maker / NOK', type: 'text', required: true },
        { name: 'decision_maker_contact', label: 'Decision Maker Contact Details', type: 'text', required: true },
        { 
          name: 'documents_sent', 
          label: 'Documents Sent With Person', 
          type: 'select', 
          options: ['Medication chart','Health summary','Behaviour plan','Advance care plan','Support plan','Multiple documents','None'], 
          required: true 
        },
        { name: 'worker_handover_notes', label: 'Worker Handover Notes for Hospital Team', type: 'textarea', required: true },
        { name: 'completed_by', label: 'Completed By and Role', type: 'text', required: true }
      ]
    }
  },
  // ... (all other templates can be added in the same clean format)
  // I can expand all of them if you want
];

export const getTemplateByKey = (key: string) => 
  ELITE_FORM_TEMPLATE_CATALOG.find(t => t.key === key);

export const getTemplatesByCategory = (category: string) => 
  ELITE_FORM_TEMPLATE_CATALOG.filter(t => t.category === category);

export const getTemplatesBySector = (sector: string) => 
  ELITE_FORM_TEMPLATE_CATALOG.filter(t => t.sector === sector);
