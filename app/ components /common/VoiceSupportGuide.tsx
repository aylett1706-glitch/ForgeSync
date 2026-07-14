'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, WifiOff, Keyboard, Globe, Mic, ExternalLink, CheckCircle2 } from 'lucide-react';

// --- Types ---
interface OptionLink {
  label: string;
  href: string;
}

interface SupportOption {
  key: string;
  title: string;
  description: string;
  pc: string;
  mobile: string;
  offline: string;
  badge: string;
  icon: React.ElementType;
  links?: OptionLink[];
}

const OPTIONS: SupportOption[] = [
  {
    key: 'device',
    title: 'Device keyboard dictation',
    description: 'Windows Voice Typing, Apple Dictation, and Gboard work directly in ForgeSync text fields.',
    pc: 'Excellent',
    mobile: 'Excellent',
    offline: 'Yes',
    badge: 'Best free option',
    icon: Keyboard,
  },
  {
    key: 'browser',
    title: 'Browser mic in ForgeSync',
    description: 'Uses the browser speech engine for recording and live speech-to-text inside the app.',
    pc: 'Excellent',
    mobile: 'Good',
    offline: 'Partial',
    badge: 'Built in',
    icon: Mic,
  },
  {
    key: 'fallback',
    title: 'Fallback web dictation',
    description: 'If browser dictation is blocked, open a free web dictation tool and paste the result back in.',
    pc: 'Excellent',
    mobile: 'Good',
    offline: 'No',
    badge: 'Backup option',
    icon: Globe,
    links: [
      { label: 'Dictation.io', href: 'https://dictation.io/' },
      { label: 'SpeechTexter', href: 'https://www.speechtexter.com/' }
    ]
  }
];

interface Props {
  browserRecordingSupported?: boolean;
  browserTranscriptionSupported?: boolean;
}

export default function VoiceSupportGuide({ 
  browserRecordingSupported = false, 
  browserTranscriptionSupported = false 
}: Props) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
          <div>
            <p className="font-medium">Supported voice options in ForgeSync</p>
            <p className="mt-1 text-xs text-blue-800">
              Works best in Chrome or Edge on desktop and Android. On iPhone, iPad, and Mac, the built-in keyboard mic is usually the easiest option.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isBrowserOption = option.key === 'browser';
          const browserStatus = browserTranscriptionSupported
            ? 'Speech + recording ready'
            : browserRecordingSupported
              ? 'Recording ready'
              : 'Use fallback';

          return (
            <Card key={option.key} className="border-slate-200 shadow-sm">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-slate-100 p-2">
                      <Icon className="h-4 w-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{option.title}</p>
                      <Badge variant="outline" className="mt-1 text-[11px]">{option.badge}</Badge>
                    </div>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-600">{option.description}</p>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1"><Monitor className="h-3.5 w-3.5" /> PC</span>
                    <span className="font-medium text-slate-900">{option.pc}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1"><Smartphone className="h-3.5 w-3.5" /> Mobile</span>
                    <span className="font-medium text-slate-900">{option.mobile}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1"><WifiOff className="h-3.5 w-3.5" /> Offline</span>
                    <span className="font-medium text-slate-900">{option.offline}</span>
                  </div>
                </div>

                {isBrowserOption && (
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    {browserStatus}
                  </div>
                )}

                {option.links?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {option.links.map((link) => (
                      <Button key={link.href} type="button" variant="outline" size="sm" asChild>
                        <a href={link.href} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-1 h-3.5 w-3.5" />
                          {link.label}
                        </a>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
