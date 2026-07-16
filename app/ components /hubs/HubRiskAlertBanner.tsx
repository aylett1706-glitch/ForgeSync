'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, Wrench, Flame, ArrowRight } from 'lucide-react';

interface Props {
  incidentCount?: number;
  maintenanceCount?: number;
  complianceAlerts?: number;
  incidentRiskLevel?: string;
  fireSafetyStatus?: string;
  auditStatus?: string;
}

export default function HubRiskAlertBanner({
  incidentCount = 0,
  maintenanceCount = 0,
  complianceAlerts = 0,
  incidentRiskLevel,
  fireSafetyStatus,
  auditStatus,
}: Props) {
  const highRisk = ['high', 'critical'].includes(incidentRiskLevel || '');
  const fireRisk = fireSafetyStatus === 'non_compliant';
  const auditRisk = ['non_compliant', 'overdue'].includes(auditStatus || '');
  const hasAlert = incidentCount > 0 || maintenanceCount > 0 || complianceAlerts > 0 || highRisk || fireRisk || auditRisk;

  if (!hasAlert) return null;

  const items = [
    incidentCount > 0 && { 
      icon: AlertTriangle, 
      label: `${incidentCount} incident${incidentCount === 1 ? '' : 's'} this month`, 
      tone: 'red' 
    },
    complianceAlerts > 0 && { 
      icon: ShieldAlert, 
      label: `${complianceAlerts} compliance alert${complianceAlerts === 1 ? '' : 's'}`, 
      tone: 'red' 
    },
    highRisk && { 
      icon: AlertTriangle, 
      label: `${incidentRiskLevel} incident risk`, 
      tone: incidentRiskLevel === 'critical' ? 'red' : 'amber' 
    },
    fireRisk && { 
      icon: Flame, 
      label: 'Fire safety non-compliant', 
      tone: 'red' 
    },
    auditRisk && { 
      icon: ShieldAlert, 
      label: `Audit ${String(auditStatus).replace(/_/g, ' ')}`, 
      tone: 'red' 
    },
    maintenanceCount > 0 && { 
      icon: Wrench, 
      label: `${maintenanceCount} open maintenance item${maintenanceCount === 1 ? '' : 's'}`, 
      tone: 'amber' 
    },
  ].filter(Boolean);

  return (
    <section 
      className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 shadow-lg shadow-red-100/60" 
      role="status" 
      aria-label="Hub safety alerts"
    >
      <div className="mb-3 flex items-center gap-2 text-red-900">
        <ShieldAlert className="h-5 w-5" />
        <h3 className="text-base font-bold">Safety attention needed</h3>
      </div>

      {maintenanceCount > 0 && (
        <div className="mb-3 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900">
          <p className="font-semibold">Maintenance means a property, asset, equipment, vehicle or safety item needs repair, service or follow-up.</p>
          <p className="mt-1 text-xs text-amber-800">
            Current status: {maintenanceCount} open job{maintenanceCount === 1 ? '' : 's'} waiting to be reviewed, assigned, completed, or safety signed off.
          </p>
          <Link 
            to="/Maintenance" 
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline"
          >
            Open maintenance tools <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          const classes = item.tone === 'red'
            ? 'border-red-300 bg-white text-red-800'
            : 'border-amber-300 bg-amber-50 text-amber-800';
          return (
            <div 
              key={item.label} 
              className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${classes}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
