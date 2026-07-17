'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Flame, MapPin } from 'lucide-react';

const TIME_SLOTS = [
  { key: 'overnight', label: '12–5am', start: 0, end: 5 },
  { key: 'early', label: '6–8am', start: 6, end: 8 },
  { key: 'morning', label: '9–11am', start: 9, end: 11 },
  { key: 'midday', label: '12–2pm', start: 12, end: 14 },
  { key: 'afternoon', label: '3–5pm', start: 15, end: 17 },
  { key: 'evening', label: '6–8pm', start: 18, end: 20 },
  { key: 'late', label: '9–11pm', start: 21, end: 23 },
];

interface Incident {
  id: string;
  time_of_incident?: string;
  incident_date?: string;
  location_of_incident?: string;
}

interface Props {
  incidents?: Incident[];
}

export default function IncidentPeakHeatmap({ incidents = [] }: Props) {
  const heatmap = useMemo(() => {
    const locationTotals = new Map<string, number>();
    const matrix = new Map<string, Record<string, number>>();

    incidents.forEach((incident) => {
      const hour = getIncidentHour(incident);
      const slotKey = hour === null ? null : getSlotKey(hour);
      if (!slotKey) return;

      const location = formatLocation(incident.location_of_incident);
      locationTotals.set(location, (locationTotals.get(location) || 0) + 1);

      if (!matrix.has(location)) matrix.set(location, {});
      const row = matrix.get(location)!;
      row[slotKey] = (row[slotKey] || 0) + 1;
    });

    const locations = [...locationTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([location, total]) => ({
        location,
        total,
        slots: matrix.get(location) || {},
      }));

    const maxCount = Math.max(1, ...locations.flatMap((row) => TIME_SLOTS.map((slot) => row.slots[slot.key] || 0)));
    const peakCell = locations
      .flatMap((row) => TIME_SLOTS.map((slot) => ({
        location: row.location,
        time: slot.label,
        count: row.slots[slot.key] || 0,
      })))
      .sort((a, b) => b.count - a.count)[0];

    return { locations, maxCount, peakCell };
  }, [incidents]);

  return (
    <Card className="border-red-100 bg-white/95 shadow-lg shadow-red-100/40">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" /> Incident Peak Time & Location Heatmap
            </CardTitle>
            <p className="mt-1 text-sm text-slate-600">
              Shows where and when incidents are most commonly recorded, to support proactive rostering and prevention planning.
            </p>
          </div>
          {heatmap.peakCell?.count > 0 && (
            <Badge className="bg-red-100 text-red-800">
              Peak: {heatmap.peakCell.location} • {heatmap.peakCell.time}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {heatmap.locations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <MapPin className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No timed location data available for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[220px_repeat(7,1fr)] bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <div className="flex items-center gap-2 p-3">
                  <MapPin className="h-3.5 w-3.5" /> Location
                </div>
                {TIME_SLOTS.map((slot) => (
                  <div key={slot.key} className="flex items-center justify-center gap-1 border-l p-3 text-center">
                    <Clock className="h-3.5 w-3.5" /> {slot.label}
                  </div>
                ))}
              </div>
              {heatmap.locations.map((row) => (
                <div key={row.location} className="grid grid-cols-[220px_repeat(7,1fr)] border-t">
                  <div className="bg-white p-3 text-sm font-semibold text-slate-800">
                    <span className="line-clamp-2">{row.location}</span>
                    <span className="mt-1 block text-xs font-medium text-slate-500">{row.total} total</span>
                  </div>
                  {TIME_SLOTS.map((slot) => {
                    const count = row.slots[slot.key] || 0;
                    const intensity = count / heatmap.maxCount;
                    return (
                      <div key={slot.key} className="border-l bg-white p-2">
                        <div
                          className="flex min-h-14 items-center justify-center rounded-xl text-sm font-bold transition-colors"
                          style={{
                            backgroundColor: count ? `rgba(239, 68, 68, ${0.14 + intensity * 0.68})` : 'rgba(248, 250, 252, 1)',
                            color: intensity > 0.55 ? '#ffffff' : '#991b1b',
                          }}
                          title={`${row.location}, ${slot.label}: ${count} incident${count === 1 ? '' : 's'}`}
                        >
                          {count || '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">Lighter = fewer incidents</span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">Darker = higher concentration</span>
        </div>
      </CardContent>
    </Card>
  );
}

function getIncidentHour(incident: Incident): number | null {
  if (incident.time_of_incident) {
    const hour = Number.parseInt(String(incident.time_of_incident).split(':')[0], 10);
    if (!Number.isNaN(hour)) return hour;
  }

  if (incident.incident_date) {
    const date = new Date(incident.incident_date);
    if (!Number.isNaN(date.getTime())) return date.getHours();
  }

  return null;
}

function getSlotKey(hour: number): string | null {
  return TIME_SLOTS.find((slot) => hour >= slot.start && hour <= slot.end)?.key || null;
}

function formatLocation(location: string | undefined): string {
  const cleaned = String(location || '').trim();
  return cleaned || 'Location not recorded';
}
