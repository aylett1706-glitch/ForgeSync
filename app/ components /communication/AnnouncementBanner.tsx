'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Megaphone, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';

// --- Types ---
type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];

interface User {
  id: string;
  organization_id?: string;
  role?: string;
  participant_id?: string | null;
  family_member_id?: string | null;
}

interface Announcement extends AnnouncementRow {
  audience?: 'all' | 'admins' | 'workers' | 'participants' | 'family';
  priority?: 'normal' | 'high' | 'critical';
  read_by?: string[];
  expires_at?: string | null;
}

interface Props {
  user?: User;
}

export default function AnnouncementBanner({ user }: Props) {
  const supabase = createClientComponentClient<Database>();
  const queryClient = useQueryClient();
  const orgId = user?.organization_id;

  const { data: announcements = [] } = useQuery({
    queryKey: ['active-announcements', orgId],
    queryFn: async (): Promise<Announcement[]> => {
      if (!orgId) return [];

      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('organization_id', orgId)
        .eq('is_active', true);

      if (error || !data) return [];

      return data.filter((ann) => {
        // Filter by expiration
        if (ann.expires_at && new Date(ann.expires_at) < new Date()) return false;

        // Filter by read status
        if (ann.read_by?.includes(user.id)) return false;

        // Filter by audience
        if (ann.audience === 'all') return true;
        if (ann.audience === 'admins' && user.role === 'admin') return true;

        // Map user roles to audiences
        const isParticipant = !!user.participant_id;
        const isFamily = !!user.family_member_id;
        const isWorker = !isParticipant && !isFamily && user.role !== 'admin';

        if (ann.audience === 'workers' && isWorker) return true;
        if (ann.audience === 'participants' && isParticipant) return true;
        if (ann.audience === 'family' && isFamily) return true;

        return false;
      });
    },
    enabled: !!orgId,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const ann = announcements.find((a) => a.id === id);
      if (!ann) return;

      const newReadBy = [...(ann.read_by || []), user.id];
      const { error } = await supabase
        .from('announcements')
        .update({ read_by: newReadBy })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-announcements', orgId] });
    },
  });

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      <AnimatePresence>
        {announcements.map((ann) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="relative"
          >
            <Alert
              className={`
                ${ann.priority === 'critical' ? 'bg-red-50 border-red-200 text-red-900' :
                  ann.priority === 'high' ? 'bg-orange-50 border-orange-200 text-orange-900' :
                  'bg-blue-50 border-blue-200 text-blue-900'}
                pr-12 shadow-sm
              `}
            >
              {ann.priority === 'critical' ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <Megaphone className="h-4 w-4 text-blue-600" />
              )}
              <AlertTitle className="font-semibold flex items-center gap-2">
                {ann.title}
                {ann.priority === 'critical' && (
                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Urgent
                  </span>
                )}
              </AlertTitle>
              <AlertDescription className="mt-1 text-sm whitespace-pre-wrap">
                {ann.content}
              </AlertDescription>

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 hover:bg-black/5 rounded-full"
                onClick={() => markReadMutation.mutate(ann.id)}
                disabled={markReadMutation.isPending}
              >
                <X className="h-4 w-4 opacity-50" />
              </Button>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
