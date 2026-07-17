'use client';

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import RelatedDocumentUpload from '@/components/incidents/RelatedDocumentUpload';

interface HazardFormData {
  hazard_type: string;
  date_identified: string;
  location: string;
  location_details: string;
  description: string;
  severity: string;
  likelihood: string;
  people_at_risk: string;
  contributing_factors: string;
  immediate_action_taken: string;
  proposed_solution: string;
  requires_maintenance: boolean;
  participant_id?: string;
  priority: string;
  target_completion_date: string;
  photo_urls: string[];
}

interface Props {
  onClose: () => void;
  preSelectedParticipant?: any;
}

export default function HazardReportForm({ onClose, preSelectedParticipant = null }: Props) {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const [formData, setFormData] = useState<HazardFormData>({
    hazard_type: 'other',
    date_identified: '',
    location: '',
    location_details: '',
    description: '',
    severity: 'medium',
    likelihood: 'possible',
    people_at_risk: '',
    contributing_factors: '',
    immediate_action_taken: '',
    proposed_solution: '',
    requires_maintenance: false,
    participant_id: preSelectedParticipant?.id || '',
    priority: 'medium',
    target_completion_date: '',
    photo_urls: [],
  });

  const [uploading, setUploading] = useState(false);
  const [relatedDocuments, setRelatedDocuments] = useState<any[]>([]);

  const calculateRiskLevel = (severity: string, likelihood: string): string => {
    const severityScore: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    const likelihoodScore: Record<string, number> = { rare: 1, unlikely: 2, possible: 3, likely: 4, almost_certain: 5 };
    const score = (severityScore[severity] || 1) * (likelihoodScore[likelihood] || 1);

    if (score >= 15) return 'extreme';
    if (score >= 10) return 'high';
    if (score >= 5) return 'moderate';
    return 'low';
  };

  const createHazardMutation = useMutation({
    mutationFn: async (data: HazardFormData) => {
      const user = await base44.auth.me();
      const riskLevel = calculateRiskLevel(data.severity, data.likelihood);

      const payload = { ...data };
      if (!payload.date_identified) delete payload.date_identified;

      const hazard = await base44.entities.Hazard.create({
        ...payload,
        organization_id: user.organization_id,
        reported_by: user.id,
        reported_date: new Date().toISOString(),
        risk_level: riskLevel,
        status: 'reported',
      });

      const followUpTasks: Promise<any>[] = [];
      let maintenanceCreated = false;

      if (data.requires_maintenance) {
        maintenanceCreated = true;
        followUpTasks.push(
          base44.entities.MaintenanceRequest.create({
            organization_id: user.organization_id,
            title: `Hazard Fix: ${data.hazard_type.replace(/_/g, ' ')}`,
            description: `Generated from Hazard Report: ${data.description}\n\nLocation: ${data.location}\nDetails: ${data.location_details}`,
            category: 'other',
            priority: data.priority === 'urgent' ? 'critical' : data.priority === 'medium' ? 'normal' : data.priority,
            location: data.location,
            reported_by: user.id,
            status: 'open',
            photo_urls: data.photo_urls || [],
          })
        );
      }

      if (relatedDocuments.length > 0) {
        followUpTasks.push(
          ...relatedDocuments.map((document) =>
            base44.entities.Document.create({
              ...document,
              organization_id: user.organization_id,
              entity_type: 'hazard',
              entity_id: hazard.id,
              uploaded_by: user.id,
            })
          )
        );
      }

      if (riskLevel === 'high' || riskLevel === 'extreme' || data.priority === 'urgent') {
        followUpTasks.push(
          base44.functions.invoke('sendUrgentAlert', {
            title: `Hazard Report - ${data.hazard_type.replace(/_/g, ' ')}`,
            message: `${user.full_name} reported a ${riskLevel} risk hazard at ${data.location}.${maintenanceCreated ? ' A maintenance request has also been created.' : ''}`,
            entity_type: 'Hazard',
            entity_id: hazard.id,
            priority: riskLevel === 'extreme' || data.priority === 'urgent' ? 'urgent' : 'high',
          })
        );
      }

      await Promise.allSettled(followUpTasks);

      return { hazard, maintenanceCreated };
    },
    onSuccess: ({ maintenanceCreated }) => {
      queryClient.invalidateQueries({ queryKey: ['hazards'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success(maintenanceCreated ? 'Hazard report saved and sent to maintenance' : 'Hazard report saved and sent for review');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Hazard report could not be saved');
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploading(true);

    try {
      const urls: string[] = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        urls.push(file_url);
      }
      setFormData((prev) => ({
        ...prev,
        photo_urls: [...prev.photo_urls, ...urls],
      }));
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Photo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photo_urls: prev.photo_urls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createHazardMutation.mutate(formData);
  };

  const riskLevel = calculateRiskLevel(formData.severity, formData.likelihood);

  const riskColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800 border-green-300',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    extreme: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            Report Hazard
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Submitted By */}
          {currentUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Submitted By</p>
                <p className="text-sm font-bold text-blue-900">{currentUser.full_name}</p>
                <p className="text-xs text-blue-700 capitalize">{currentUser.position?.replace(/_/g, ' ') || currentUser.role}</p>
              </div>
              <div className="text-right text-xs text-blue-600">
                <p>{new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p>{new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          )}

          {/* Risk Level Indicator */}
          <div className={`p-4 rounded-lg border-2 ${riskColors[riskLevel]}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Calculated Risk Level</p>
                <p className="text-2xl font-bold uppercase">{riskLevel}</p>
              </div>
              <div className="text-right text-sm">
                <p>Severity: <span className="font-semibold capitalize">{formData.severity}</span></p>
                <p>Likelihood: <span className="font-semibold capitalize">{formData.likelihood.replace(/_/g, ' ')}</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Hazard Type *</Label>
              <Select value={formData.hazard_type} onValueChange={(value) => setFormData({ ...formData, hazard_type: value })} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slip_trip_fall_risk">Slip/Trip/Fall Risk</SelectItem>
                  <SelectItem value="electrical_hazard">Electrical Hazard</SelectItem>
                  <SelectItem value="fire_hazard">Fire Hazard</SelectItem>
                  <SelectItem value="chemical_hazard">Chemical Hazard</SelectItem>
                  <SelectItem value="biological_hazard">Biological Hazard</SelectItem>
                  <SelectItem value="manual_handling_risk">Manual Handling Risk</SelectItem>
                  <SelectItem value="environmental_hazard">Environmental Hazard</SelectItem>
                  <SelectItem value="equipment_malfunction">Equipment Malfunction</SelectItem>
                  <SelectItem value="security_risk">Security Risk</SelectItem>
                  <SelectItem value="violence_aggression_risk">Violence/Aggression Risk</SelectItem>
                  <SelectItem value="infection_control">Infection Control</SelectItem>
                  <SelectItem value="structural_damage">Structural Damage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority *</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Severity *</Label>
              <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Minor harm</SelectItem>
                  <SelectItem value="medium">Medium - Moderate harm</SelectItem>
                  <SelectItem value="high">High - Major harm</SelectItem>
                  <SelectItem value="critical">Critical - Death/permanent disability</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Likelihood *</Label>
              <Select value={formData.likelihood} onValueChange={(value) => setFormData({ ...formData, likelihood: value })} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rare">Rare - Unlikely to occur</SelectItem>
                  <SelectItem value="unlikely">Unlikely - Could occur</SelectItem>
                  <SelectItem value="possible">Possible - Might occur</SelectItem>
                  <SelectItem value="likely">Likely - Will probably occur</SelectItem>
                  <SelectItem value="almost_certain">Almost Certain - Expected to occur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date Identified</Label>
              <Input
                type="date"
                value={formData.date_identified}
                onChange={(e) => setFormData({ ...formData, date_identified: e.target.value })}
              />
            </div>

            <div>
              <Label>Location *</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Kitchen, Bathroom, Driveway"
                required
              />
            </div>

            <div>
              <Label>Target Completion Date</Label>
              <Input
                type="date"
                value={formData.target_completion_date}
                onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Location Details</Label>
            <Input
              value={formData.location_details}
              onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
              placeholder="Specific details about the location"
            />
          </div>

          <div>
            <Label>Description of Hazard *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the hazard in detail..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label>Who Could Be Affected?</Label>
            <Input
              value={formData.people_at_risk}
              onChange={(e) => setFormData({ ...formData, people_at_risk: e.target.value })}
              placeholder="e.g., Participants, Staff, Visitors"
            />
          </div>

          <div>
            <Label>Contributing Factors</Label>
            <Textarea
              value={formData.contributing_factors}
              onChange={(e) => setFormData({ ...formData, contributing_factors: e.target.value })}
              placeholder="What caused this hazard? (e.g., poor maintenance, weather)"
              rows={2}
            />
          </div>

          <div>
            <Label>Immediate Action Taken</Label>
            <Textarea
              value={formData.immediate_action_taken}
              onChange={(e) => setFormData({ ...formData, immediate_action_taken: e.target.value })}
              placeholder="What immediate steps were taken to reduce risk?"
              rows={3}
            />
          </div>

          <div>
            <Label>Proposed Solution (Optional)</Label>
            <Textarea
              value={formData.proposed_solution}
              onChange={(e) => setFormData({ ...formData, proposed_solution: e.target.value })}
              placeholder="Suggest a way to permanently fix or manage this hazard"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2 pb-2">
            <Checkbox
              checked={formData.requires_maintenance}
              onCheckedChange={(checked) => setFormData({ ...formData, requires_maintenance: checked })}
            />
            <Label className="font-medium text-orange-700">Requires Maintenance Team to fix</Label>
          </div>

          <div>
            <Label>Add Photos</Label>
            <div className="mt-2">
              <label className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {uploading ? 'Uploading...' : 'Click to upload photos of the hazard'}
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              {formData.photo_urls.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {formData.photo_urls.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt="" className="w-full h-24 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <RelatedDocumentUpload
            documents={relatedDocuments}
            onChange={setRelatedDocuments}
            title="Hazard Related Documents"
          />

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-900">
              <strong>Important:</strong> This hazard report will immediately notify management. 
              Ensure all information is accurate. Take immediate action if the hazard poses an imminent threat.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createHazardMutation.isPending || !formData.description || !formData.location} 
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Submit Hazard Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
