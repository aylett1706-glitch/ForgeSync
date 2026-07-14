import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Copy, FileText } from 'lucide-react';

// --- Types ---
interface DuressAlert {
  id: string;
  created_at?: string;
  created_date?: string; // Legacy fallback
  worker_id?: string;
  status?: string;
  location_lat?: string | number | null;
  location_lng?: string | number | null;
  location_accuracy_meters?: string | number | null;
  notes?: string;
  [key: string]: unknown;
}

interface DuressIncidentLogProps {
  alert?: DuressAlert | null;
  workerName?: string;
  formatAccuracy: (meters?: string | number | null) => string;
}

export default function DuressIncidentLog({
  alert,
  workerName,
  formatAccuracy,
}: DuressIncidentLogProps) {
  const [copied, setCopied] = useState(false);

  const report = useMemo(() => {
    if (!alert) return '';

    // Support both Supabase `created_at` and legacy `created_date`
    const alertTime = alert.created_at || alert.created_date;
    const activationTime = alertTime ? new Date(alertTime).toLocaleString('en-AU') : 'Unavailable';

    // Safely format coordinates
    const lat = alert.location_lat != null ? Number(alert.location_lat).toFixed(6) : 'Unavailable';
    const lng = alert.location_lng != null ? Number(alert.location_lng).toFixed(6) : 'Unavailable';
    const mapLink = alert.location_lat && alert.location_lng
      ? `https://www.google.com/maps/place/${lat},${lng}`
      : 'Unavailable';

    return [
      'Emergency Duress Incident Location Log',
      '========================================',
      `Alert ID: ${alert.id}`,
      `Worker: ${workerName || alert.worker_id || 'Unknown'}`,
      `Status: ${alert.status || 'Unknown'}`,
      `Activation timestamp: ${activationTime}`,
      `Exact GPS coordinates: ${lat}, ${lng}`,
      `GPS accuracy radius: ${formatAccuracy(alert.location_accuracy_meters)}`,
      `Pinned map: ${mapLink}`,
      `Notes: ${alert.notes?.trim() || 'No notes recorded'}`,
    ].join('\n');
  }, [alert, workerName, formatAccuracy]);

  const copyReport = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Failed to copy report:', err);
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-gray-700" />
          Emergency incident log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!alert ? (
          <p className="text-sm text-gray-500">
            Select a duress pin drop to generate an audit-ready location log.
          </p>
        ) : (
          <>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-gray-950 p-3 text-xs leading-relaxed text-gray-100 font-mono">
              {report}
            </pre>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={copyReport}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy compliance report'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
