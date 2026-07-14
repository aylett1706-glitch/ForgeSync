'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Trash2, Send, AlertTriangle, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// --- Types ---
type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];

interface Announcement extends AnnouncementRow {
  audience?: 'all' | 'admins' | 'workers' | 'participants' | 'family';
  priority?: 'normal' | 'high' | 'critical';
  read_by?: string[];
  expires_at?: string | null;
  created_at?: string;
}

interface FormData {
  title: string;
  content: string;
  audience: 'all' | 'admins' | 'workers' | 'participants' | 'family';
  priority: 'normal' | 'high' | 'critical';
  expires_at: string;
}

interface Props {
  organizationId?: string;
}

export default function AnnouncementManager({ organizationId }: Props) {
  const supabase = createClientComponentClient<Database>();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    audience: 'all',
    priority: 'normal',
    expires_at: ''
  });

  // Fetch announcements (newest first)
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', organizationId],
    queryFn: async (): Promise<Announcement[]> => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data;
    },
    enabled: !!organizationId
  });

  // Create new announcement
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      const payload = {
        ...data,
        organization_id: organizationId,
        created_by: user.id,
        is_active: true,
        read_by: [],
        expires_at: data.expires_at || null
      };

      const { error } = await supabase.from('announcements').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', organizationId] });
      setShowForm(false);
      setFormData({ title: '', content: '', audience: 'all', priority: 'normal', expires_at: '' });
    }
  });

  // Delete announcement
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', organizationId] });
    }
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    createMutation.mutate(formData);
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return announcement.title?.toLowerCase().includes(term) || 
           announcement.content?.toLowerCase().includes(term);
  });

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-orange-500" />
          Announcements
        </CardTitle>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-auto w-full bg-orange-500 py-2 text-white hover:bg-orange-600 sm:w-auto">
              <Send className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Important update..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content</label>
                <Textarea 
                  value={formData.content} 
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Details of the announcement..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Audience</label>
                  <Select 
                    value={formData.audience} 
                    onValueChange={(v: FormData['audience']) => setFormData({ ...formData, audience: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Everyone</SelectItem>
                      <SelectItem value="workers">Workers Only</SelectItem>
                      <SelectItem value="participants">Participants Only</SelectItem>
                      <SelectItem value="family">Family Only</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(v: FormData['priority']) => setFormData({ ...formData, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Expires At (Optional)</label>
                <Input 
                  type="datetime-local" 
                  value={formData.expires_at} 
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleSubmit} 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={createMutation.isPending || !formData.title.trim() || !formData.content.trim()}
              >
                {createMutation.isPending ? 'Sending...' : 'Post Announcement'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search announcements..." className="pl-9" />
        </div>
        {filteredAnnouncements.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">No announcements found</p>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map(ann => (
              <div key={ann.id} className="relative rounded-lg border p-4 transition-colors hover:bg-gray-50 group">
                <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      {ann.priority === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {ann.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {format(new Date(ann.created_at || new Date()), 'MMM d, h:mm a')} • to <span className="font-medium capitalize">{ann.audience}</span>
                    </p>
                  </div>
                  <Badge variant={
                    ann.priority === 'critical' ? 'destructive' : 
                    ann.priority === 'high' ? 'secondary' : 'outline'
                  }>
                    {ann.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{ann.content}</p>
                
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-gray-400">
                        Read by {ann.read_by?.length || 0} users
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteMutation.mutate(ann.id)}
                      disabled={deleteMutation.isPending}
                      className="h-8 px-2 text-red-500 hover:bg-red-50 hover:text-red-700 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> 
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
