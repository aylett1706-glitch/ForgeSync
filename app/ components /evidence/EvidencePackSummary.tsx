```javascript
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BookOpen, FileText, Shield } from 'lucide-react';

export default function EvidencePackSummary({ participant, goals, incidents, progressNotes, outcomes, fundingBuckets, documents }) {
  const totalBudget = fundingBuckets.reduce((sum, bucket) => sum + (bucket.allocated_budget || 0), 0);
  const activeGoals = goals.filter(goal => goal.status === 'in_progress').length;
  const recentEvidence = progressNotes.length + documents.length + outcomes.length;

  const cards = [
    { label: 'Active Goals', value: activeGoals, icon: Shield, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Evidence Items', value: recentEvidence, icon: BookOpen, tone: 'bg-violet-50 text-violet-700' },
    { label: 'Incidents', value: incidents.length, icon: AlertTriangle, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Budget Tracked', value: totalBudget ? `$${totalBudget.toLocaleString()}` : '$0', icon: FileText, tone: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="space-y-4">
      {participant && (
        <div className="rounded-xl border bg-white p-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{participant.first_name} {participant.last_name}</h3>
            <Badge variant="outline">NDIS {participant.ndis_number || 'Not recorded'}</Badge>
            <Badge variant="outline">Plan end {participant.plan_end_date || 'Unknown'}</Badge>
          </div>
          <p className="text-sm text-gray-600">{participant.primary_disability || 'Primary disability not recorded'}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.tone}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```
