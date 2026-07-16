'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Bed, Bath, Users, Shield, Key, AlertTriangle, Phone, Mail, Calendar, DollarSign, Flame, Stethoscope, Zap, Info, Ruler, Car, Hammer, FileText } from 'lucide-react';

const RESIDENTIAL_TYPES = ['sil_home', 'sda_dwelling', 'respite_house', 'group_home'];

const SDA_LABELS: Record<string, string> = {
  basic: 'Basic',
  improved_liveability: 'Improved Liveability',
  fully_accessible: 'Fully Accessible',
  robust: 'Robust',
  high_physical_support: 'High Physical Support',
};

const TYPE_LABELS: Record<string, string> = {
  sil_home: 'SIL Home',
  sda_dwelling: 'SDA Dwelling',
  respite_house: 'Respite House',
  day_program_centre: 'Day Program Centre',
  office: 'Office',
  other: 'Other',
};

interface Property {
  id: string;
  name?: string;
  address?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  max_occupants?: number;
  floor_area_sqm?: number;
  land_area_sqm?: number;
  levels?: number;
  parking_spaces?: number;
  construction_type?: string;
  year_built?: number;
  building_class?: string;
  ownership_type?: string;
  zoning?: string;
  council_area?: string;
  sda_category?: string;
  weekly_rent?: number;
  bond_amount?: number;
  accessibility_features?: string[];
  amenities?: string[];
  accessibility_items?: any[];
  last_inspection_date?: string;
  inspection_due_date?: string;
  blueprint_url?: string;
  photo_urls?: string[];
  notes?: string;
  key_safe_location?: string;
  access_notes?: string;
  alarm_details?: string;
  assembly_point?: string;
  utility_notes?: string;
  fire_evacuation_notes?: string;
  medical_risk_notes?: string;
  emergency_procedures?: string;
  landlord_name?: string;
  landlord_phone?: string;
  landlord_email?: string;
  lease_start_date?: string;
  lease_end_date?: string;
}

interface Props {
  property: Property;
  organizationId?: string;
}

export default function LinkedPropertyDetails({ property, organizationId }: Props) {
  if (!property) return null;

  return (
    <div className="space-y-4 bg-white border rounded-xl p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#0088A8]/10">
            <Building2 className="w-5 h-5 text-[#0088A8]" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{property.name}</h4>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {property.address}
              {property.suburb && `, ${property.suburb}`}
              {property.state && ` ${property.state}`}
              {property.postcode && ` ${property.postcode}`}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            {property.status || 'active'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {TYPE_LABELS[property.property_type] || property.property_type}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Property Details */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Property Details
          </h5>
          {RESIDENTIAL_TYPES.includes(property.property_type || '') && (
            <>
              <DetailRow icon={Bed} label="Bedrooms" value={property.bedrooms} />
              <DetailRow icon={Bath} label="Bathrooms" value={property.bathrooms} />
            </>
          )}
          <DetailRow icon={Users} label="Max Occupants" value={property.max_occupants} />
          <DetailRow icon={Ruler} label="Floor Area" value={property.floor_area_sqm ? `${property.floor_area_sqm} m²` : null} />
          <DetailRow icon={Ruler} label="Land Area" value={property.land_area_sqm ? `${property.land_area_sqm} m²` : null} />
          <DetailRow icon={Building2} label="Levels" value={property.levels} />
          <DetailRow icon={Car} label="Parking" value={property.parking_spaces} />
          <DetailRow icon={Hammer} label="Construction" value={property.construction_type?.replace(/_/g, ' ')} />
          <DetailRow icon={Calendar} label="Year Built" value={property.year_built} />
          <DetailRow icon={FileText} label="Building Class" value={property.building_class} />
          <DetailRow icon={Building2} label="Ownership" value={property.ownership_type?.replace(/_/g, ' ')} />
          <DetailRow icon={Building2} label="Zoning" value={property.zoning} />
          <DetailRow icon={Building2} label="Council" value={property.council_area} />
          {property.sda_category && (
            <DetailRow icon={Shield} label="SDA Category" value={SDA_LABELS[property.sda_category] || property.sda_category} />
          )}
          <DetailRow icon={DollarSign} label="Weekly Rent" value={property.weekly_rent ? `$${property.weekly_rent}` : null} />
          {property.bond_amount > 0 && <DetailRow icon={DollarSign} label="Bond" value={`$${property.bond_amount}`} />}
        </div>

        {/* Lease & Landlord */}
        {(property.landlord_name || property.lease_start_date) && (
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Lease & Landlord
            </h5>
            <DetailRow icon={Users} label="Landlord" value={property.landlord_name} />
            <DetailRow icon={Phone} label="Phone" value={property.landlord_phone} />
            <DetailRow icon={Mail} label="Email" value={property.landlord_email} />
            <DetailRow icon={Calendar} label="Lease Start" value={property.lease_start_date} />
            <DetailRow icon={Calendar} label="Lease End" value={property.lease_end_date} />
          </div>
        )}

        {/* Access & Safety */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" /> Access & Safety
          </h5>
          <DetailRow icon={Key} label="Key Safe" value={property.key_safe_location} />
          <DetailRow icon={Info} label="Access Notes" value={property.access_notes} />
          <DetailRow icon={AlertTriangle} label="Alarm Details" value={property.alarm_details} />
          <DetailRow icon={MapPin} label="Assembly Point" value={property.assembly_point} />
          <DetailRow icon={Zap} label="Utility Notes" value={property.utility_notes} />
        </div>

        {/* Emergency Info */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" /> Emergency Info
          </h5>
          <DetailRow icon={Flame} label="Fire Evacuation" value={property.fire_evacuation_notes} />
          <DetailRow icon={Stethoscope} label="Medical Risks" value={property.medical_risk_notes} />
          <DetailRow icon={AlertTriangle} label="Emergency Procedures" value={property.emergency_procedures} />
        </div>
      </div>

      {/* Accessibility Items */}
      {property.accessibility_items?.length > 0 && (
        <div className="pt-2 border-t">
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Accessibility Aids & Equipment ({property.accessibility_items.length})</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {property.accessibility_items.map((item, i) => {
              const condColor = { 
                good: 'bg-green-100 text-green-700', 
                fair: 'bg-yellow-100 text-yellow-700', 
                poor: 'bg-orange-100 text-orange-700', 
                needs_replacement: 'bg-red-100 text-red-700' 
              }[item.condition] || 'bg-gray-100 text-gray-600';
              return (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md text-xs border">
                  <span className="font-medium text-gray-800">{item.item_name}</span>
                  <Badge variant="outline" className="text-[10px] capitalize">{item.category?.replace(/_/g, ' ')}</Badge>
                  <Badge className={`text-[10px] border-0 ml-auto ${condColor}`}>{item.condition?.replace(/_/g, ' ')}</Badge>
                  {item.location && <span className="text-gray-500 hidden sm:block">📍 {item.location}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Photos */}
      {property.photo_urls?.length > 0 && (
        <div className="pt-2 border-t">
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Photos</h5>
          <div className="flex gap-2 overflow-x-auto">
            {property.photo_urls.map((url, i) => (
              <img 
                key={i} 
                src={url} 
                alt={`Property ${i + 1}`} 
                className="h-24 w-24 rounded-lg border object-cover flex-shrink-0" 
              />
            ))}
          </div>
        </div>
      )}

      {property.notes && (
        <div className="pt-2 border-t">
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Notes</h5>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{property.notes}</p>
        </div>
      )}
    </div>
  );
}

function DetailRow({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon?: React.ElementType; 
  label: string; 
  value: any; 
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      {Icon && <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
      <span className="text-gray-500 min-w-[120px]">{label}:</span>
      <span className="font-medium text-gray-800 break-words">{value}</span>
    </div>
  );
}
