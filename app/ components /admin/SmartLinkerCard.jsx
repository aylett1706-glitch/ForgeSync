'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle, RefreshCw, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function SmartLinkerCard({ user }: { user?: any }) {
  const supabase = createClientComponentClient<Database>();
  const [result, setResult] = useState<{ notes_linked?: number; tasks_linked?: number } | null>(null);
  const [progress, setProgress] = useState(0);

  const linkMutation = useMutation({
    mutationFn: async () => {
      if (!user?.organization_id) throw new Error('Missing organization ID');

      setProgress(10);
      setResult(null);
      // Simulate smooth progress for UX
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      try {
        // Call Supabase Edge Function instead of base44
        const { data, error } = await supabase.functions.invoke('aiSmartLinker', {
          body: { organization_id: user.organization_id }
        });

        clearInterval(interval);
        if (error) throw error;
        setProgress(100);
        return data;
      } catch (err) {
        clearInterval(interval);
        setProgress(0);
        throw err;
      }
    },
    onSuccess: (data) => {
      setResult(data?.summary || data);
      setTimeout(() => setProgress(0), 3000);
    },
    onError: (err) => {
      toast.error(`Failed to run linker: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  });

  return (
    <Card className="hover:shadow-lg transition-shadow border-blue-100 bg-gradient-to-br from-white to-blue-50/50">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>AI Data Association</CardTitle>
        </div>
        <CardDescription>
          Automatically link orphaned records to participants and workers using AI analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          This tool scans Shift Notes, Tasks, and Incidents for mentions of people and automatically creates the correct database links.
        </p>
        
        {progress > 0 && progress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-blue-600 font-medium">
              <span>Analyzing data...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-2 text-green-700 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Linking Complete</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• {result.notes_linked ?? 0} Shift Notes linked</p>
              <p>• {result.tasks_linked ?? 0} Tasks linked</p>
            </div>
          </div>
        )}

        <Button 
          onClick={() => linkMutation.mutate()} 
          disabled={linkMutation.isPending} 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
        >
          {linkMutation.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4 mr-2" />
              Run Smart Linker
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
