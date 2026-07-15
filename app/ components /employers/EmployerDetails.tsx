'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Mail, Phone, MapPin, Globe, Users, Edit, ExternalLink, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import EmployerForm from './EmployerForm';

interface Employer {
  id: string;
  business_name: string;
  industry?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  abn?: string;
  primary_contact_name?: string;
  primary_contact_position?: string;
  partnership_status?: string;
  support_required?: string;
  business_type?: string;
  willing_to_hire?: boolean;
  placement_capacity?: number;
  current_placements?: number;
  rating?: number | string;
  accessibility_features?: string;
  engagement_notes?: string;
}

interface Placement {
  id: string;
  job_title: string;
  participant_id: string;
  placement_type?: string;
  status: string;
  start_date?: string;
  end_date?: string;
}

interface Props {
  employer: Employer;
  placements: Placement[];
  onClose: () => void;
}

export default function EmployerDetails({ employer: initialEmployer, placements: initialPlacements, onClose }: Props) {
  const supabase = createClient();
  
  const [employer, setEmployer] = useState(initialEmployer);
  const [placements, setPlacements] = useState(initialPlacements);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time updates
  useEffect(() => {
    if (!employer.id) return;

    const channel = supabase
      .channel(`employer-${employer.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employers', filter: `id=eq.${employer.id}` }, 
        (payload) => {
          setEmployer(payload.new as Employer);
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'placements', filter: `employer_id=eq.${employer.id}` }, 
        () => fetchPlacements()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [employer.id]);

  const fetchPlacements = async () => {
    const { data } = await supabase
      .from('placements')
      .select('*')
      .eq('employer_id', employer.id);
    if (data) setPlacements(data);
  };

  const activePlacements = placements.filter(p => p.status === 'active');
  const completedPlacements = placements.filter(p => p.status === 'completed');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-[#0088A8] to-[#7B3F9E] rounded-2xl">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold">{employer.business_name}</DialogTitle>
                  <p className="text-muted-foreground mt-1">{employer.industry}</p>
                </div>
              </div>

              <Button onClick={() => setShowEditForm(true)} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Employer
              </Button>
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="p-6">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="placements">
                Placements ({placements.length})
              </TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-4xl font-bold text-[#0088A8]">{activePlacements.length}</p>
                    <p className="text-sm text-muted-foreground mt-2">Active Placements</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-4xl font-bold text-[#7B3F9E]">{completedPlacements.length}</p>
                    <p className="text-sm text-muted-foreground mt-2">Completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-4xl font-bold text-[#F7941D]">
                      {(employer.placement_capacity || 0) - (employer.current_placements || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">Capacity Remaining</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-4xl font-bold text-green-600">{employer.rating || '—'}</p>
                    <p className="text-sm text-muted-foreground mt-2">Rating</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Partnership Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge>{employer.partnership_status}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Support Required</span>
                        <Badge variant="outline">{employer.support_required}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Willing to Hire</span>
                        <span className="font-medium">{employer.willing_to_hire ? '✅ Yes' : '❌ No'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {(employer.accessibility_features || employer.engagement_notes) && (
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      {employer.accessibility_features && (
                        <div>
                          <h4 className="font-semibold mb-2">Accessibility Features</h4>
                          <p className="text-sm text-muted-foreground">{employer.accessibility_features}</p>
                        </div>
                      )}
                      {employer.engagement_notes && (
                        <div>
                          <h4 className="font-semibold mb-2">Engagement Notes</h4>
                          <p className="text-sm text-muted-foreground">{employer.engagement_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* PLACEMENTS TAB */}
            <TabsContent value="placements" className="space-y-4">
              {placements.length === 0 ? (
                <Card>
                  <CardContent className="p-16 text-center">
                    <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">No placements recorded yet</p>
                  </CardContent>
                </Card>
              ) : (
                placements.map((placement) => (
                  <Card key={placement.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-lg">{placement.job_title}</h4>
                          <p className="text-muted-foreground">
                            Participant ID: {placement.participant_id}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Badge>{placement.placement_type?.replace(/_/g, ' ')}</Badge>
                            <Badge variant="outline" className="capitalize">{placement.status}</Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">
                            {placement.start_date && format(new Date(placement.start_date), 'dd MMM yyyy')}
                            {placement.end_date && ` — ${format(new Date(placement.end_date), 'dd MMM yyyy')}`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* CONTACT TAB */}
            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  {employer.email && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <a href={`mailto:${employer.email}`} className="font-medium hover:underline">
                            {employer.email}
                          </a>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(employer.email!, 'Email')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {employer.phone && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <a href={`tel:${employer.phone}`} className="font-medium hover:underline">
                            {employer.phone}
                          </a>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(employer.phone!, 'Phone')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {employer.address && (
                    <div className="flex items-start gap-4">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{employer.address}</p>
                      </div>
                    </div>
                  )}

                  {employer.website && (
                    <div className="flex items-center gap-4">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Website</p>
                        <a href={employer.website} target="_blank" rel="noopener noreferrer" className="font-medium text-[#0088A8] hover:underline flex items-center gap-1">
                          {employer.website} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Primary Contact & Business Details */}
              {(employer.primary_contact_name || employer.abn) && (
                <Card>
                  <CardContent className="p-6">
                    {employer.primary_contact_name && (
                      <div className="mb-6">
                        <h3 className="font-semibold mb-4">Primary Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{employer.primary_contact_name}</p>
                          </div>
                          {employer.primary_contact_position && (
                            <div>
                              <p className="text-sm text-muted-foreground">Position</p>
                              <p className="font-medium">{employer.primary_contact_position}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {employer.abn && (
                      <div>
                        <h3 className="font-semibold mb-3">Business Details</h3>
                        <div>
                          <p className="text-sm text-muted-foreground">ABN</p>
                          <p className="font-medium">{employer.abn}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {showEditForm && (
        <EmployerForm 
          employer={employer} 
          onClose={() => {
            setShowEditForm(false);
            onClose?.();
          }} 
        />
      )}
    </>
  );
}
