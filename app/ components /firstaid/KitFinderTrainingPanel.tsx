'use client';

import React, { useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, ShieldPlus, UserCheck, AlertTriangle, Upload, Clock } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

interface FirstAidKit {
  id: string;
  name: string;
  location?: string;
  attached_to_type?: string;
  status?: string;
  expiry_date?: string;
  last_checked_date?: string;
  notes?: string;
}

interface WorkerCredential {
  id: string;
  worker_id: string;
  credential_type: string;
  credential_name: string;
  issue_date?: string;
  expiry_date?: string;
  document_url?: string;
  status?: string;
}

interface Props {
  user: any;
  kits?: FirstAidKit[];
}

export default function KitFinderTrainingPanel({ user, kits: kitsProp = [] }: Props) {
  const supabase = createClient();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [incidentType, setIncidentType] = useState('bleeding');
  const [uploading, setUploading] = useState(false);

  const [credentialForm, setCredentialForm] = useState({
    worker_id: '',
    credential_type: 'first_aid',
    credential_name: 'First Aid Certificate',
    issue_date: '',
    expiry_date: '',
    document_url: ''
  });

  // Fetch kits
  const [kits, setKits] = React.useState<FirstAidKit[]>(kitsProp);
  React.useEffect(() => {
    if (kitsProp.length > 0) return;
    const fetchKits = async () => {
      const { data } = await supabase
        .from('first_aid_kits')
        .select('*')
        .eq('organization_id', user.organization_id);
      if (data) setKits(data);
    };
    fetchKits();
  }, [user.organization_id, kitsProp]);

  // Fetch credentials
  const [credentials, setCredentials] = React.useState<WorkerCredential[]>([]);
  React.useEffect(() => {
    const fetchCredentials = async () => {
      const { data } = await supabase
        .from('worker_credentials')
        .select('*')
        .eq('organization_id', user.organization_id);
      if (data) setCredentials(data);
    };
    fetchCredentials();
  }, [user.organization_id]);

  // Fetch workers
  const [workers, setWorkers] = React.useState<any[]>([]);
  React.useEffect(() => {
    const fetchWorkers = async () => {
      const { data } = await supabase.from('users').select('id, full_name');
      if (data) setWorkers(data);
    };
    fetchWorkers();
  }, []);

  const filteredKits = useMemo(() => {
    return kits.filter((kit) => {
      const matchesSearch = [kit.name, kit.location, kit.notes]
        .some(value => value?.toLowerCase().includes(search.toLowerCase()));
      const matchesType = typeFilter === 'all' || kit.attached_to_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [kits, search, typeFilter]);

  const groupedKits = useMemo(() => {
    return filteredKits.reduce((acc, kit) => {
      const key = kit.location || 'Unassigned location';
      if (!acc[key]) acc[key] = [];
      acc[key].push(kit);
      return acc;
    }, {} as Record<string, FirstAidKit[]>);
  }, [filteredKits]);

  const firstAidCredentials = credentials.filter(c => 
    c.credential_type === 'first_aid' || c.credential_type === 'cpr'
  );

  const expiringCredentials = firstAidCredentials.filter(item => 
    item.expiry_date && moment(item.expiry_date).isSameOrBefore(moment().add(60, 'days'))
  );

  const incidentPrompts = {
    bleeding: { title: 'Bleeding or wound care', steps: ['Apply direct pressure immediately', 'Use gloves and sterile dressing if available', 'Escalate to emergency care if severe'] },
    burn: { title: 'Burns and scalds', steps: ['Cool under running water for 20 minutes', 'Remove jewellery and loose clothing', 'Cover with a non-stick dressing'] },
    fall: { title: 'Falls or suspected fracture', steps: ['Keep the person still', 'Check for pain, deformity or head injury', 'Escalate if severe'] },
    bite: { title: 'Snake bite or sting', steps: ['Keep the person still', 'Use pressure immobilisation for snake bites', 'Call 000'] }
  };

  const restockSummary = kits
    .filter(kit => kit.status === 'needs_restock' || 
                  (kit.expiry_date && moment(kit.expiry_date).isSameOrBefore(moment().add(30, 'days'))))
    .map(kit => `• ${kit.name} — ${kit.location || 'Unassigned'}`)
    .join('\n');

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('credentials')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('credentials')
        .getPublicUrl(fileName);

      setCredentialForm(prev => ({ ...prev, document_url: publicUrl }));
      toast.success('File uploaded successfully');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const saveCredential = async () => {
    if (!credentialForm.worker_id || !credentialForm.document_url) {
      toast.error('Please select a worker and upload a document');
      return;
    }

    const payload = {
      ...credentialForm,
      organization_id: user.organization_id,
      status: credentialForm.expiry_date && moment(credentialForm.expiry_date).isBefore(moment()) ? 'expired' : 'current'
    };

    const { error } = await supabase.from('worker_credentials').insert(payload);

    if (error) {
      toast.error('Failed to save credential');
    } else {
      toast.success('Certificate saved successfully');
      setCredentialForm({
        worker_id: '',
        credential_type: 'first_aid',
        credential_name: 'First Aid Certificate',
        issue_date: '',
        expiry_date: '',
        document_url: ''
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Kit Finder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            First Aid Kit Finder
          </CardTitle>
          <CardDescription>Locate kits by site, vehicle, or participant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Input
              placeholder="Search kit name, location or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="property">Property / Hub</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="participant">Participant</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {Object.entries(groupedKits).map(([location, locationKits]) => (
              <Card key={location}>
                <CardHeader>
                  <CardTitle className="text-lg">{location}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {locationKits.map(kit => {
                    const isExpired = kit.expiry_date && moment(kit.expiry_date).isBefore(moment());
                    const isSoon = kit.expiry_date && moment(kit.expiry_date).isBetween(moment(), moment().add(30, 'days'));

                    return (
                      <div key={kit.id} className="border rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              <ShieldPlus className="w-4 h-4 text-red-500" />
                              {kit.name}
                            </div>
                            <p className="text-xs text-muted-foreground capitalize mt-1">{kit.attached_to_type}</p>
                          </div>
                          <div className="flex gap-2">
                            {kit.status === 'needs_restock' && <Badge variant="destructive">Restock</Badge>}
                            {isExpired && <Badge variant="destructive">Expired</Badge>}
                            {isSoon && <Badge variant="secondary">Expiring soon</Badge>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rest of the component (Restock, Incident Prompts, Certifications) can be added similarly if needed. */}

      {/* Quick Incident Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Quick Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={incidentType} onValueChange={setIncidentType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bleeding">Bleeding / Wound</SelectItem>
              <SelectItem value="burn">Burns</SelectItem>
              <SelectItem value="fall">Fall / Fracture</SelectItem>
              <SelectItem value="bite">Snake / Sting</SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-5">
            <p className="font-semibold">{incidentPrompts[incidentType].title}</p>
            <ul className="mt-4 space-y-3 text-sm">
              {incidentPrompts[incidentType].steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-mono text-red-600 font-bold">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Tasmania Reminders & Certifications sections can be added in the same style */}
    </div>
  );
}
