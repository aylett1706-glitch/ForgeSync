import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, History, MapPin } from 'lucide-react';

// --- Types ---
interface DuressPinAlert {
  id: string;
  created_at?: string;
  created_date?: string; // Legacy fallback
  location_lat?: string | number;
  location_lng?: string | number;
  location_accuracy_meters?: string | number | null;
  status?: string;
  [key: string]: unknown;
}

interface DuressHistoryPanelProps {
  alerts?: DuressPinAlert[];
  onReview: (alert: DuressPinAlert) => void;
  formatAccuracy: (meters?: string | number | null) => string;
}

export default function DuressHistoryPanel({
  alerts = [],
  onReview,
  formatAccuracy,
}: DuressHistoryPanelProps) {
  // Filter alerts with valid coordinates, limit to 8 most recent
  const pinDrops = alerts
    .filter((alert) => alert.location_lat != null && alert.location_lng != null)
    .slice(0, 8);

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="w-5 h-5 text-blue-600" />
          Recent duress pin drops
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pinDrops.length === 0 ? (
          <p className="text-sm text-gray-500">No recent duress locations recorded yet.</p>
        ) : pinDrops.map((alert) => {
          // Support both Supabase `created_at` and legacy `created_date`
          const alertTime = alert.created_at || alert.created_date;
          const startTime = alertTime ? new Date(alertTime).toLocaleString('en-AU') : 'Unavailable';

          // Safely format coordinates
          const lat = Number(alert.location_lat).toFixed(6);
          const lng = Number(alert.location_lng).toFixed(6);

          return (
            <div key={alert.id} className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-red-600" />
                    {lat}, {lng}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    {startTime}
                  </p>
                </div>
                <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'}>
                  {alert.status?.replace(/_/g, ' ') || 'Unknown'}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-3 text-xs text-gray-600">
                <span>
                  Accuracy: <strong>{formatAccuracy(alert.location_accuracy_meters)}</strong>
                </span>
                <Button type="button" size="sm" variant="outline" onClick={() => onReview(alert)}>
                  Review
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
