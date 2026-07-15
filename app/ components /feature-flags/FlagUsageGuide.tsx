'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Code, Flag, Shield, Users, Clock, CheckCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FlagUsageGuide({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Feature Flag Usage Guide
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* What are Feature Flags */}
          <section>
            <h3 className="font-semibold text-xl mb-3 flex items-center gap-2">
              <Flag className="w-5 h-5 text-blue-600" />
              What Are Feature Flags?
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Feature flags allow you to enable, disable, or gradually roll out features 
              without deploying new code. Perfect for A/B testing, beta releases, and safe rollouts.
            </p>
          </section>

          {/* How to Use in Code */}
          <section>
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-600" />
              How to Use in Code
            </h3>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <p className="font-medium mb-3">1. Using the Hook (Recommended)</p>
                  <pre className="bg-slate-950 text-slate-100 p-5 rounded-xl text-sm overflow-x-auto font-mono">
{`import { useFeatureFlag } from '@/hooks/useFeatureFlag';

function MyComponent() {
  const isEnabled = useFeatureFlag('beta_ai_insights');
  
  if (!isEnabled) return <LegacyUI />;
  return <NewAIInsightsPanel />;
}`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="font-medium mb-3">2. Using the Gate Component</p>
                  <pre className="bg-slate-950 text-slate-100 p-5 rounded-xl text-sm overflow-x-auto font-mono">
{`import FeatureFlagGate from '@/components/access/FeatureFlagGate';

<FeatureFlagGate 
  flag="beta_ai_insights" 
  fallback={<OldVersion />}
>
  <NewFeature />
</FeatureFlagGate>`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Targeting Options */}
          <section>
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Targeting &amp; Rollout Options
            </h3>

            <div className="grid gap-4">
              {[
                {
                  badge: "Scope",
                  title: "Global vs Organization",
                  desc: "Global flags apply everywhere. Organization-specific flags override global ones."
                },
                {
                  badge: "Roles",
                  title: "Role Targeting",
                  desc: "Restrict to specific roles (admin, coordinator, etc.). Empty = all roles."
                },
                {
                  badge: "Users",
                  title: "Specific Users",
                  desc: "Target individual users by ID for beta testing or internal use."
                },
                {
                  badge: "Percentage",
                  title: "Gradual Rollout",
                  desc: "Roll out to X% of users. Each user gets a consistent experience."
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 border-l-4 border-emerald-500 pl-4">
                  <Badge variant="outline" className="mt-0.5">{item.badge}</Badge>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Lifecycle */}
          <section>
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Feature Flag Lifecycle
            </h3>
            <ol className="space-y-4 text-sm text-muted-foreground">
              {[
                "Create a flag with a clear, unique key",
                "Ask the AI assistant to implement it in the relevant UI/component",
                "Toggle it on/off from the admin dashboard",
                "Adjust rollout percentage, roles, or expiry as needed",
                "Monitor usage and gather feedback",
                "Delete the flag once the feature is fully launched and stable"
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Pro Tip */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Pro Tip</p>
                <p className="text-blue-800 mt-1">
                  Changes are reflected within 1–2 minutes across all clients 
                  (flags are cached for 60 seconds). No code deployment required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
