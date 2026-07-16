'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, MapPin, Shield, Users, UserCheck, Phone, 
  Calendar, AlertTriangle, Wrench, Bed, Home, DollarSign, 
  FileText, CheckCircle, XCircle, Printer, ClipboardList, 
  GraduationCap, Heart, Target, Lock, Flame, Eye, Car, 
  Cigarette, PawPrint, Accessibility, Key, Volume2, TreePine, 
  ShieldAlert 
} from 'lucide-react';
import { format } from 'date-fns';
import HubSnapshotCard from './HubSnapshotCard';
import HubRiskAlertBanner from './HubRiskAlertBanner';
import DocumentManager from '@/components/shared/DocumentManager';
import LinkedPropertyDetails from './LinkedPropertyDetails';
import HubPathwayActions from './HubPathwayActions';

const HUB_TYPE_LABELS: Record<string, string> = { 
  sil: 'SIL', sda: 'SDA', ilo: 'ILO', respite: 'Respite', 
  community_centre: 'Community Centre', day_program: 'Day Program', 
  group_home: 'Group Home', supported_accommodation: 'Supported Accommodation', 
  other: 'Other' 
};

const ROSTER_LABELS: Record<string, string> = { 
  '24_7_active': '24/7 Active', sleepover: 'Sleepover', 
  awake_night: 'Awake Night', active_night: 'Active Night', 
  day_only: 'Day Only', mixed: 'Mixed', on_call: 'On Call' 
};

interface Hub {
  id: string;
  name: string;
  organization_id?: string;
  hub_type?: string;
  funding_type?: string;
  status?: string;
  hub_level?: string;
  description?: string;
  locations?: any[];
  team_leader_ids?: string[];
  worker_ids?: string[];
  hub_manager_id?: string;
  participant_ids?: string[];
  roster_model?: string;
  staffing_ratio?: string;
  shift_coverage_pattern?: string;
  required_training?: string[];
  preferred_worker_attributes?: string;
  staff_notes?: string;
  gender_preference?: string;
  age_range?: string;
  waitlist_count?: number;
  compatibility_notes?: string;
  house_dynamic_notes?: string;
  matching_considerations?: string;
  exclusion_mismatch_notes?: string;
  placement_notes?: string;
  shared_living_notes?: string;
  funding_source?: string;
  claiming_model?: string;
  hub_cost_centre?: string;
  budget_category?: string;
  consumables_budget?: number;
  fire_safety_status?: string;
  audit_status?: string;
  incident_risk_level?: string;
  staff_induction_completed?: boolean;
  mandatory_checks_completed?: boolean;
  medication_support_at_site?: boolean;
  restrictive_practices_in_place?: boolean;
  restrictive_practices_notes?: string;
  property_hazards?: string;
  accessibility_features?: string;
  key_access_notes?: string;
  sensory_environment?: string;
  neighbourhood_notes?: string;
  risk_environment_notes?: string;
  house_rules?: string;
  cleaning_schedule?: string;
  medication_storage_info?: string;
  house_notes?: string;
}

interface Props {
  hub: Hub;
  workers: any[];
  participants: any[];
  organizationId?: string;
  onClose: () => void;
}

export default function HubDetailsDialog({ 
  hub, 
  workers, 
  participants, 
  organizationId, 
  onClose 
}: Props) {
  const safeOrgId = organizationId || hub.organization_id;
  const orgWorkers = workers.filter(w => !safeOrgId || w.organization_id === safeOrgId || w.data?.organization_id === safeOrgId);
  const orgParticipants = participants.filter(p => !safeOrgId || p.organization_id === safeOrgId || p.data?.organization_id === safeOrgId);

  const teamLeaders = orgWorkers.filter(w => hub.team_leader_ids?.includes(w.id));
  const hubWorkers = orgWorkers.filter(w => hub.worker_ids?.includes(w.id));
  const hubManager = orgWorkers.find(w => w.id === hub.hub_manager_id);

  const propertyIds = hub.locations?.filter(l => l.type === 'property').map(l => l.property_id) || [];

  // TODO: Replace with Supabase queries in final app
  const linkedProperties: any[] = [];
  const shifts: any[] = [];
  const incidents: any[] = [];
  const maintenanceReqs: any[] = [];

  const allParticipantIds = React.useMemo(() => {
    const ids = new Set(hub.participant_ids || []);
    linkedProperties.forEach(prop => {
      (prop.current_occupants || []).forEach(id => ids.add(id));
    });
    return [...ids];
  }, [hub.participant_ids, linkedProperties]);

  const hubParticipants = orgParticipants.filter(p => allParticipantIds.includes(p.id));

  const thisMonthIncidents = incidents.filter(i => {
    const d = new Date(i.incident_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const openMaint = maintenanceReqs.filter(r => r.status === 'open' || r.status === 'in_progress');

  const complianceAlerts = [
    hub.fire_safety_status === 'non_compliant',
    hub.audit_status === 'non_compliant' || hub.audit_status === 'overdue',
    !hub.staff_induction_completed,
    !hub.mandatory_checks_completed
  ].filter(Boolean).length;

  const safetyNeedsAttention = 
    thisMonthIncidents.length > 0 || 
    openMaint.length > 0 || 
    complianceAlerts > 0 || 
    ['high', 'critical'].includes(hub.incident_risk_level || '');

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto bg-gray-50">
        <DialogHeader>
          <div className="flex items-center gap-3 flex-wrap">
            <DialogTitle className="text-2xl font-bold">{hub.name}</DialogTitle>
            <Badge variant="outline">{HUB_TYPE_LABELS[hub.hub_type] || hub.hub_type}</Badge>
            <Badge variant="outline">{hub.funding_type}</Badge>
            <Badge className={hub.status === 'active' ? 'bg-green-100 text-green-800' : hub.status === 'under_maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-800'}>
              {hub.status?.replace(/_/g, ' ')}
            </Badge>
            {hub.hub_level && <Badge variant="secondary" className="capitalize">{hub.hub_level}</Badge>}
          </div>

          {hub.locations?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {hub.locations.map((loc, i) => (
                <div key={i} className="flex items-center gap-1.5 text-sm text-gray-600 bg-white border px-2 py-1 rounded-md">
                  <MapPin className="w-3 h-3 text-orange-500" />
                  {loc.name ? `${loc.name} — ${loc.address}` : loc.address}
                </div>
              ))}
            </div>
          )}

          {hubManager && (
            <p className="text-sm text-gray-500 mt-1">
              Manager: <span className="font-medium text-gray-700">{hubManager.full_name}</span>
            </p>
          )}
          {hub.description && <p className="text-gray-600 text-sm mt-1">{hub.description}</p>}
        </DialogHeader>

        {/* Snapshot */}
        <HubSnapshotCard 
          hub={hub} 
          incidentCount={thisMonthIncidents.length} 
          maintenanceCount={openMaint.length} 
          complianceAlerts={complianceAlerts} 
          residentCount={hubParticipants.length} 
        />

        <HubPathwayActions hub={{ ...hub, organization_id: safeOrgId }} />

        <HubRiskAlertBanner
          incidentCount={thisMonthIncidents.length}
          maintenanceCount={openMaint.length}
          complianceAlerts={complianceAlerts}
          incidentRiskLevel={hub.incident_risk_level}
          fireSafetyStatus={hub.fire_safety_status}
          auditStatus={hub.audit_status}
        />

        <Tabs defaultValue="people" className="mt-4">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-white p-2 shadow-sm sm:grid-cols-4 lg:grid-cols-8 mb-4">
            <TabsTrigger value="people" className="flex min-h-14 flex-col gap-1 rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-800">
              <Users className="h-4 w-4" /><span>People</span>
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex min-h-14 flex-col gap-1 rounded-xl data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-800">
              <ClipboardList className="h-4 w-4" /><span>Operations</span>
            </TabsTrigger>
            <TabsTrigger value="property" className="flex min-h-14 flex-col gap-1 rounded-xl data-[state=active]:bg-teal-50 data-[state=active]:text-teal-800">
              <Home className="h-4 w-4" /><span>Property</span>
            </TabsTrigger>
            <TabsTrigger value="placement" className="flex min-h-14 flex-col gap-1 rounded-xl data-[state=active]:bg-violet-50 data-[state=active]:text-violet-800">
              <Target className="h-4 w-4" /><span>Placement</span>
            </TabsTrigger>
            <TabsTrigger value="funding" className="flex min-h-14 flex-col gap-1 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-800">
              <DollarSign className="h-4 w-4" /><span>Funding</span>
            </TabsTrigger>
            <TabsTrigger value="safety" className={`flex min-h-14 flex-col gap-1 rounded-xl data-[state=active]:bg-red-50 data-[state=active]:text-red-800 ${safetyNeedsAttention ? 'bg-red-50 text-red-800 ring-2 ring-red-200' : ''}`}>
              <ShieldAlert className="h-4 w-4" /><span>Safety</span>
              {safetyNeedsAttention && <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Alert</span>}
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex min-h-14 flex-col gap-1 rounded-xl data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
              <FileText className="h-4 w-4" /><span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="rostering" className="flex min-h-14 flex-col gap-1 rounded-xl data-[state=active]:bg-amber-50 data-[state=active]:text-amber-800">
              <Calendar className="h-4 w-4" /><span>Roster</span>
            </TabsTrigger>
          </TabsList>

          {/* Content Tabs go here - you can add them progressively or let me know if you want them all expanded */}

        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
