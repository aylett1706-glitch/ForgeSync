import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioTower, ShieldAlert } from 'lucide-react';

// --- Types ---
interface DuressAlert {
  id: string;
  created_at?: string;
  created_date?: string; // Fallback for legacy data
  location_lat?: string | number;
  location_lng?: string | number;
  location_accuracy_meters?: string | number | null;
  [key: string]: unknown;
}

interface ActiveDuressTrackingPanelProps {
  canView: boolean;
  activeAlerts?: DuressAlert[];
  selectedAlertId?: string | null;
  onSelect: (alert: DuressAlert) => void;
  formatAccuracy: (meters?: string | number | null) => string;
}

export default function ActiveDuressTrackingPanel({
  canView,
  activeAlerts = [],
  selectedAlertId,
  onSelect,
  formatAccuracy,
}: ActiveDuressTrackingPanelProps) {
  if (!canView) return null;

  return (
    <Card className="border-red-200 bg-red-50/40 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-red-800">
          <RadioTower className="w-5 h-5" />
          Active shift emergency tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeAlerts.length === 0 ? (
          <p className="text-sm text-gray-600">No active duress alerts are currently broadcasting from shifts.</p>
        ) : activeAlerts.map((alert) => {
          // Support both Supabase `created_at` and legacy `created_date`
          const alertTime = alert.created_at || alert.created_date;
          const startTime = alertTime ? new Date(alertTime).toLocaleString('en-AU') : 'Unavailable';

          return (
            <div
              key={alert.id}
              className={`rounded-xl border p-3 space-y-2 transition-colors ${
                selectedAlertId === alert.id
                  ? 'border-red-500 bg-white shadow-sm'
                  : 'border-red-200 bg-white/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-red-900 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" />
                  Active duress alert
                </p>
                <Badge variant="destructive">Live</Badge>
              </div>

              <p className="text-xs text-gray-600">Started: {startTime}</p>

              <p className="text-xs text-gray-600">
                GPS: {alert.location_lat ? Number(alert.location_lat).toFixed(6) : 'Unavailable'},{' '}
                {alert.location_lng ? Number(alert.location_lng).toFixed(6) : 'Unavailable'} ·{' '}
                {formatAccuracy(alert.location_accuracy_meters)}
              </p>

              <Button
                type="button"
                size="sm"
                className="w-full bg-red-700 hover:bg-red-800"
                onClick={() => onSelect(alert)}
              >
                View on emergency map
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
