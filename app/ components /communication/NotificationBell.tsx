'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

// --- Types ---
interface User {
  id?: string;
  organization_id?: string;
}

interface Props {
  user?: User;
}

export default function NotificationBell({ user }: Props) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const userId = user?.id;
  const orgId = user?.organization_id;

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userId, 'bell'],
    queryFn: async () => {
      if (!userId || !orgId) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !data) return [];
      return data;
    },
    enabled: !!userId && !!orgId
  });

  const unreadCount = notifications.length;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-white/80 hover:text-white hover:bg-white/10"
      onClick={() => router.push(createPageUrl('NotificationsCenter'))}
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
