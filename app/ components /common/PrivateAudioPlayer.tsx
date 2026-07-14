'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

interface Props {
  fileUri: string;
  className?: string;
}

export default function PrivateAudioPlayer({ fileUri, className = '' }: Props) {
  const supabase = createClientComponentClient<Database>();
  const [audioUrl, setAudioUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const loadSignedUrl = async () => {
      if (!fileUri) {
        setAudioUrl('');
        return;
      }

      try {
        // Generate signed URL for private Supabase Storage file
        const { data, error } = await supabase
          .storage
          .from('documents') // Update bucket name if yours differs
          .createSignedUrl(fileUri, 3600); // Matches original 1-hour expiry

        if (error) throw error;

        if (!cancelled && data?.signedUrl) {
          setAudioUrl(data.signedUrl);
        }
      } catch (err) {
        console.error('Failed to load audio:', err);
        if (!cancelled) {
          setAudioUrl('');
        }
      }
    };

    loadSignedUrl();
    return () => {
      cancelled = true;
    };
  }, [fileUri, supabase]);

  if (!audioUrl) return null;

  return (
    <audio
      controls
      src={audioUrl}
      className={className || 'w-full mt-2'}
    />
  );
}
