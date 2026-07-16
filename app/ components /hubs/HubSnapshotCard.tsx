'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, UserCheck, Shield, Bed, AlertTriangle, Wrench, CheckCircle } from 'lucide-react';

interface Hub {
  capacity?: number;
  participant_ids?: string[];
  worker_ids?: string[];
  team_leader_ids?: string[];
}

interface Props {
  hub: Hub;
  incidentCount?: number;
  maintenanceCount?: number;
  complianceAlerts?: number;
  residentCount?: number;
}

export default function HubSnapshotCard({
  hub,
  incidentCount = 0,
  maintenanceCount = 0,
  complianceAlerts = 0,
  residentCount,
}: Props) {
  const occupancy = residentCount !== undefined ? residentCount : (hub.participant_ids?.length || 0);
  const vacancies = hub.capacity ? Math.max(0, hub.capacity - occupancy) : null;
  const occupancyPct = hub.capacity ? Math.round((occupancy / hub.capacity) * 100) : null;

  const stats = [
    { 
      label: 'Capacity', 
      value: hub.capacity ?? '-', 
      icon: Bed, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Residents', 
      value: occupancy, 
      icon: UserCheck, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
    { 
      label: 'Vacancies', 
      value: vacancies ?? '-', 
      icon: Building2, 
      color: vacancies && vacancies > 0 ? 'text-green-600' : 'text-red-600', 
      bg: vacancies && vacancies > 0 ? 'bg-green-50' : 'bg-red-50' 
    },
    { 
      label: 'Workers', 
      value: hub.worker_ids?.length || 0, 
      icon: Users, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
    { 
      label: 'Leaders', 
      value: hub.team_leader_ids?.length || 0, 
      icon: Shield, 
      color: 'text-cyan-600', 
      bg: 'bg-cyan-50' 
    },
    { 
      label: 'Incidents', 
      value: incidentCount, 
      icon: AlertTriangle, 
      color: incidentCount > 0 ? 'text-red-600' : 'text-gray-400', 
      bg: incidentCount > 0 ? 'bg-red-50' : 'bg-gray-50' 
    },
    { 
      label: 'Maintenance', 
      value: maintenanceCount, 
      icon: Wrench, 
      color: maintenanceCount > 0 ? 'text-amber-600' : 'text-gray-400', 
      bg: maintenanceCount > 0 ? 'bg-amber-50' : 'bg-gray-50' 
    },
    { 
      label: 'Compliance', 
      value: complianceAlerts > 0 ? `${complianceAlerts} alerts` : 'OK', 
      icon: CheckCircle, 
      color: complianceAlerts > 0 ? 'text-red-600' : 'text-green-600', 
      bg: complianceAlerts > 0 ? 'bg-red-50' : 'bg-green-50' 
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card 
            key={s.label} 
            className={`${
              ['Incidents', 'Compliance'].includes(s.label) && 
              s.value !== 'OK' && 
              s.value !== 0 
                ? 'border-2 border-red-200 bg-red-50 shadow-lg shadow-red-100/60' 
                : 'border-gray-100 bg-white shadow-sm'
            }`}
          >
            <CardContent className="p-3 text-center">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-1.5`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wide">{s.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
