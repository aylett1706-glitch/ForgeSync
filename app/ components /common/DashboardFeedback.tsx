'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  dashboardName: string;
}

export default function DashboardFeedback({ dashboardName }: Props) {
  const supabase = createClientComponentClient<Database>();
  const [submitted, setSubmitted] = useState(false);

  const feedbackMutation = useMutation({
    mutationFn: async (isPositive: boolean) => {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('dashboard_feedback')
        .insert({
          dashboard_name: dashboardName,
          is_positive: isPositive,
          user_id: user?.id || null,
          submitted_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    },
    onError: (err) => {
      console.error('Failed to save feedback:', err);
      toast.error('Could not save feedback — please try again later');
    }
  });

  const handleFeedback = (isPositive: boolean) => {
    feedbackMutation.mutate(isPositive);
  };

  if (submitted) {
    return (
      <div className="mt-8 mb-4 py-4 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
        Thanks for helping us improve ForgeSync!
      </div>
    );
  }

  return (
    <div className="mt-8 mb-4 py-4 px-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
        <MessageSquare className="w-4 h-4 text-indigo-500" />
        Was this dashboard helpful today?
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleFeedback(true)}
          disabled={feedbackMutation.isPending}
          className="gap-1.5 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
        >
          <ThumbsUp className="w-4 h-4" />
          Yes
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleFeedback(false)}
          disabled={feedbackMutation.isPending}
          className="gap-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        >
          <ThumbsDown className="w-4 h-4" />
          No
        </Button>
      </div>
    </div>
  );
}
