```javascript
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Car, ShieldCheck } from 'lucide-react';
import { differenceInDays, format, isFuture } from 'date-fns';

function getDueState(date) {
  if (!date) return null;
  const days = differenceInDays(new Date(date), new Date());
  if (days < 0) return { label: 'Overdue', tone: 'bg-red-100 text-red-700' };
  if (days <= 30) return { label: `${days}d left`, tone: 'bg-amber-100 text-amber-700' };
  return { label: `${days}d left`, tone: 'bg-emerald-100 text-emerald-700' };
}

export default function FleetOperationsPanel({ vehicles = [], bookings = [] }) {
  const complianceItems = useMemo(() => {
    return vehicles.flatMap((vehicle) => [
      vehicle.rego_expiry ? { vehicle, label: 'Registration', date: vehicle.rego_expiry } : null,
      vehicle.insurance_expiry ? { vehicle, label: 'Insurance', date: vehicle.insurance_expiry } : null,
      vehicle.roadworthy_expiry ? { vehicle, label: 'Roadworthy', date: vehicle.roadworthy_expiry } : null,
      vehicle.service_due_date ? { vehicle, label: 'Service', date: vehicle.service_due_date } : null,
    ].filter(Boolean));
  }, [vehicles]);

  const urgentCompliance = complianceItems
    .map((item) => ({ ...item, state: getDueState(item.date) }))
    .filter((item) => item.state && item.state.label !== 'Overdue' ? item.state.label.includes('d left') && parseInt(item.state.label, 10) <= 30 : item.state)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  const upcomingBookings = bookings
    .filter((booking) => ['confirmed', 'in_progress'].includes(booking.status) && booking.pickup_time && isFuture(new Date(booking.pickup_time)))
    .sort((a, b) => new Date(a.pickup_time) - new Date(b.pickup_time))
    .slice(0, 5);

  const accessibleVehicles = vehicles.filter((vehicle) => vehicle.vehicle_type === 'wheelchair_accessible' || (vehicle.wheelchair_positions || 0) > 0).length;
  const vehiclesInMaintenance = vehicles.filter((vehicle) => vehicle.status === 'maintenance' || vehicle.status === 'out_of_service').length;
  const bookedVehicleIds = new Set(upcomingBookings.map((booking) => booking.vehicle_id).filter(Boolean));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fleet Depth</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Accessible vehicles</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{accessibleVehicles}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Vehicles in maintenance</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{vehiclesInMaintenance}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Booked vehicles ahead</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{bookedVehicleIds.size}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            Compliance Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {urgentCompliance.length === 0 ? (
            <p className="text-sm text-slate-500">No urgent compliance items in the next 30 days.</p>
          ) : (
            urgentCompliance.map((item) => (
              <div key={`${item.vehicle.id}-${item.label}`} className="rounded-xl border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.vehicle.name}</p>
                    <p className="text-sm text-slate-600">{item.label} due {format(new Date(item.date), 'dd MMM yyyy')}</p>
                  </div>
                  <Badge className={item.state.tone}>{item.state.label}</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-blue-600" />
            Upcoming Allocation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingBookings.length === 0 ? (
            <p className="text-sm text-slate-500">No confirmed vehicle activity is scheduled yet.</p>
          ) : (
            upcomingBookings.map((booking) => (
              <div key={booking.id} className="rounded-xl border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{booking.pickup_address} → {booking.dropoff_address}</p>
                    <p className="text-sm text-slate-600">{format(new Date(booking.pickup_time), 'dd MMM, h:mm a')}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">{booking.status?.replace(/_/g, ' ')}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><Car className="h-3 w-3" /> {booking.vehicle_id ? 'Vehicle allocated' : 'Vehicle needed'}</span>
                  {booking.wheelchair_required && <span className="inline-flex items-center gap-1 text-purple-700"><AlertTriangle className="h-3 w-3" /> Wheelchair access required</span>}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```
