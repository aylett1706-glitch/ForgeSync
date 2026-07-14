import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crosshair, MapPin, Search, ZoomIn, ZoomOut } from 'lucide-react';

// --- Types ---
interface MapLocation {
  lat: number;
  lng: number;
}

interface JumpTarget {
  lat: number;
  lng: number;
  accuracy: number | null;
  captured_at: string;
  label: string;
}

interface MapEntity {
  id?: string;
  full_name?: string;
  name?: string;
  preferred_name?: string;
  business_name?: string;
  address?: string;
  home_address?: string;
  residential_address?: string;
  location?: string;
  latitude?: string | number;
  longitude?: string | number;
  location_lat?: string | number;
  location_lng?: string | number;
  lat?: string | number;
  lng?: string | number;
  [key: string]: unknown;
}

type MapViewMode = 'street' | 'earth';
type MapZoomLevel = 'wide' | 'street';

interface DuressMapPanelProps {
  location?: MapLocation | null;
  participants?: MapEntity[];
  properties?: MapEntity[];
  mapView: MapViewMode;
  setMapView: (view: MapViewMode) => void;
  mapZoom: MapZoomLevel;
  setMapZoom: (zoom: MapZoomLevel) => void;
  onJumpToLocation: (target: JumpTarget) => void;
  searchLabel?: string;
}

// --- Helper Functions ---
const getEntityName = (item?: MapEntity): string =>
  item?.full_name || item?.name || item?.preferred_name || item?.business_name || 'Record';

const getEntityAddress = (item?: MapEntity): string =>
  item?.address || item?.home_address || item?.residential_address || item?.location || '';

const getEntityLocation = (item?: MapEntity): MapLocation | null => {
  const lat = item?.latitude ?? item?.location_lat ?? item?.lat;
  const lng = item?.longitude ?? item?.location_lng ?? item?.lng;
  return lat != null && lng != null ? { lat: Number(lat), lng: Number(lng) } : null;
};

// --- Main Component ---
export default function DuressMapPanel({
  location,
  participants = [],
  properties = [],
  mapView,
  setMapView,
  mapZoom,
  setMapZoom,
  onJumpToLocation,
  searchLabel,
}: DuressMapPanelProps) {
  const [query, setQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState('');

  if (!location) return null;

  // Map embed parameters
  const zoomLevel = mapZoom === 'street' ? 20 : 15;
  const bboxDelta = mapZoom === 'street' ? 0.0012 : 0.01;
  const streetMapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${
    location.lng - bboxDelta
  },${location.lat - bboxDelta},${location.lng + bboxDelta},${
    location.lat + bboxDelta
  }&layer=mapnik&marker=${location.lat},${location.lng}`;
  const satelliteMapSrc = `https://maps.google.com/maps?q=${location.lat},${location.lng}&t=k&z=${zoomLevel}&output=embed`;

  const jumpToLocalResult = (match: MapEntity, typeLabel: string): boolean => {
    const coords = getEntityLocation(match);
    const entityName = getEntityName(match);
    const label = `${typeLabel}: ${entityName}`;

    if (coords) {
      onJumpToLocation({
        ...coords,
        accuracy: null,
        captured_at: new Date().toISOString(),
        label,
      });
      setSearchStatus(`Showing ${label}`);
      return true;
    }

    const address = getEntityAddress(match);
    if (address) {
      setQuery(address);
      setSearchStatus(`Found ${label}. Press Search again to geocode their address.`);
      return true;
    }

    setSearchStatus(`${label} has no saved map location or address.`);
    return true;
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = query.trim();
    if (!text) return;

    // Direct GPS coordinate match
    const coordMatch = text.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
    if (coordMatch) {
      onJumpToLocation({
        lat: Number(coordMatch[1]),
        lng: Number(coordMatch[2]),
        accuracy: null,
        captured_at: new Date().toISOString(),
        label: 'Typed GPS coordinates',
      });
      setSearchStatus('Showing typed GPS coordinates.');
      return;
    }

    // Local participant match
    const lowerQuery = text.toLowerCase();
    const participantMatch = participants.find((item) =>
      getEntityName(item).toLowerCase().includes(lowerQuery)
    );
    if (participantMatch && jumpToLocalResult(participantMatch, 'Participant')) return;

    // Local property match
    const propertyMatch = properties.find((item) =>
      `${getEntityName(item)} ${getEntityAddress(item)}`.toLowerCase().includes(lowerQuery)
    );
    if (propertyMatch && jumpToLocalResult(propertyMatch, 'Property')) return;

    // Nominatim geocoding fallback
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(text)}`,
        { headers: { Accept: 'application/json' } }
      );
      const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;

      if (data?.[0]) {
        onJumpToLocation({
          lat: Number(data[0].lat),
          lng: Number(data[0].lon),
          accuracy: null,
          captured_at: new Date().toISOString(),
          label: data[0].display_name,
        });
        setSearchStatus('Showing searched address.');
      } else {
        setSearchStatus('No matching address or saved participant was found.');
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
      setSearchStatus('Failed to search address — please try again.');
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search address, GPS, participant or property"
            className="bg-white"
            aria-label="Search duress map location"
          />
          <Button type="submit" size="icon" aria-label="Search location">
            <Search className="w-4 h-4" />
          </Button>
        </div>
        {(searchStatus || searchLabel) && (
          <p className="text-xs text-gray-600">{searchStatus || `Showing ${searchLabel}`}</p>
        )}
      </form>

      {/* Map View Toggle */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-200 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMapView('street')}
          className={`rounded-lg py-2 transition-colors ${
            mapView === 'street' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          }`}
        >
          Street map
        </button>
        <button
          type="button"
          onClick={() => setMapView('earth')}
          className={`rounded-lg py-2 transition-colors ${
            mapView === 'earth' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={mapZoom === 'wide' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMapZoom('wide')}
          className="w-full"
        >
          <ZoomOut className="w-4 h-4 mr-1" /> Wide area
        </Button>
        <Button
          type="button"
          variant={mapZoom === 'street' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMapZoom('street')}
          className="w-full"
        >
          <ZoomIn className="w-4 h-4 mr-1" /> Street level
        </Button>
      </div>

      {/* Map Iframe */}
      <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm relative">
        <div className="absolute left-2 top-2 z-10 rounded-full bg-white/95 px-2 py-1 text-[11px] font-bold text-gray-700 shadow flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-600" /> Pin drop
        </div>
        <iframe
          title="Duress location map"
          width="100%"
          height="210"
          style={{ border: 0 }}
          loading="eager"
          referrerPolicy="no-referrer"
          src={mapView === 'earth' ? satelliteMapSrc : streetMapSrc}
        />
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 flex items-start gap-1 leading-snug">
        <Crosshair className="w-3.5 h-3.5 mt-0.5" />
        Search jumps the review pin only. Saved duress GPS audit data remains unchanged.
      </p>
    </div>
  );
}
