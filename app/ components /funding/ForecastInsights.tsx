'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, Lightbulb, TrendingUp, DollarSign, User } from 'lucide-react';

interface InsightRisk {
  risk: string;
  impact: string;
  likelihood: string;
}

interface InsightRecommendation {
  action: string;
  expected_outcome: string;
  estimated_impact?: string;
  priority?: 'immediate' | 'short_term' | 'medium_term';
}

interface ParticipantAlert {
  name: string;
  issue: string;
  action: string;
}

interface ForecastInsightsData {
  overall_health: 'critical' | 'at_risk' | 'stable' | 'strong';
  health_score: number;
  executive_summary: string;
  critical_risks?: InsightRisk[];
  pricing_insights?: string[];
  recommendations?: InsightRecommendation[];
  participant_alerts?: ParticipantAlert[];
}

const HEALTH_CONFIG = {
  critical: { color: 'bg-red-100 text-red-700 border-red-300', label: 'Critical', bar: 'bg-red-500' },
  at_risk: { color: 'bg-orange-100 text-orange-700 border-orange-300', label: 'At Risk', bar: 'bg-orange-500' },
  stable: { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Stable', bar: 'bg-blue-500' },
  strong: { color: 'bg-green-100 text-green-700 border-green-300', label: 'Strong', bar: 'bg-green-500' },
};

const PRIORITY_COLORS = {
  immediate: 'bg-red-100 text-red-700',
  short_term: 'bg-orange-100 text-orange-700',
  medium_term: 'bg-blue-100 text-blue-700',
};

interface Props {
  insights?: ForecastInsightsData | null;
  scenarioName?: string;
}

export default function ForecastInsights({ insights, scenarioName = 'Current' }: Props) {
  if (!insights) return null;

  const health = HEALTH_CONFIG[insights.overall_health] || HEALTH_CONFIG.stable;

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm text-blue-100">Scenario: {scenarioName}</p>
                <h3 className="text-2xl font-bold">AI Forecast Analysis</h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Health Score</p>
              <p className="text-5xl font-black leading-none">{insights.health_score}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full ${health.bar} transition-all duration-700`}
              style={{ width: `${insights.health_score}%` }}
            />
          </div>

          <p className="text-sm text-blue-50 leading-relaxed">
            {insights.executive_summary}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Risks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Critical Risks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.critical_risks?.map((risk, i) => (
              <div key={i} className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="font-medium text-gray-900 text-sm mb-2">{risk.risk}</p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs bg-red-100 text-red-700">
                    Impact: {risk.impact}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">
                    Likelihood: {risk.likelihood}
                  </Badge>
                </div>
              </div>
            )) || <p className="text-sm text-slate-500">No critical risks identified.</p>}
          </CardContent>
        </Card>

        {/* Pricing Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="w-4 h-4 text-green-500" />
              Pricing & Margin Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.pricing_insights?.map((insight, i) => (
              <div key={i} className="flex gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            )) || <p className="text-sm text-slate-500">No pricing insights available.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Strategic Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.recommendations?.map((rec, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-gray-900">{rec.action}</p>
                    {rec.priority && (
                      <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[rec.priority] || 'bg-gray-100 text-gray-600'}`}>
                        {rec.priority.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{rec.expected_outcome}</p>
                  {rec.estimated_impact && (
                    <p className="text-sm font-medium text-green-700 mt-1">💰 {rec.estimated_impact}</p>
                  )}
                </div>
              </div>
            )) || <p className="text-sm text-slate-500">No recommendations available.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Participant Alerts */}
      {insights.participant_alerts && insights.participant_alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4 text-purple-500" />
              Participant-Specific Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.participant_alerts.map((alert, i) => (
                <div key={i} className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                  <p className="font-semibold text-gray-900">{alert.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{alert.issue}</p>
                  <p className="text-sm font-medium text-purple-700 mt-3">→ {alert.action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
