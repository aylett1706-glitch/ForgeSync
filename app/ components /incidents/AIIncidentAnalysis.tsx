'use client';

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, TrendingUp, BookOpen, Flag, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface Incident {
  id: string;
  incident_type: string;
  severity: string;
  description: string;
  immediate_action_taken?: string;
  emergency_services_contacted?: boolean;
}

interface AnalysisResult {
  suggested_category: string;
  is_recurring_pattern: boolean;
  pattern_reason: string;
  preventative_measures: string[];
  training_recommendations: string[];
  future_risk_prediction: string;
  high_risk_flag: boolean;
  high_risk_reason: string;
}

interface Props {
  incident: Incident;
  allIncidents?: Incident[];
}

export default function AIIncidentAnalysis({ incident, allIncidents = [] }: Props) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    setExpanded(true);

    const recentSimilar = allIncidents
      .filter(i => i.id !== incident.id && i.incident_type === incident.incident_type)
      .slice(0, 10)
      .map(i => ({
        type: i.incident_type,
        severity: i.severity,
        date: i.incident_date,
        description: i.description?.slice(0, 100),
      }));

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a safety analyst for an NDIS disability support organization. Analyze this incident report and provide structured insights.

INCIDENT:
- Type: ${incident.incident_type}
- Severity: ${incident.severity}
- Description: ${incident.description}
- Immediate Action: ${incident.immediate_action_taken || 'None recorded'}
- Emergency Services: ${incident.emergency_services_contacted ? 'Yes' : 'No'}

RECENT SIMILAR INCIDENTS (${recentSimilar.length} found):
${recentSimilar.map(i => `- ${i.type} (${i.severity}) on ${i.date?.slice(0,10)}: ${i.description}`).join('\n') || 'None'}

Provide:
1. Suggested category/sub-type for this incident
2. Whether this appears to be a recurring pattern (yes/no + reason)
3. 2-3 specific preventative measures
4. 1-2 training recommendations
5. Predict potential future incidents based on this data
6. High-risk flag assessment (true/false + reason)`,
      response_json_schema: {
        type: "object",
        properties: {
          suggested_category: { type: "string" },
          is_recurring_pattern: { type: "boolean" },
          pattern_reason: { type: "string" },
          preventative_measures: { type: "array", items: { type: "string" } },
          training_recommendations: { type: "array", items: { type: "string" } },
          future_risk_prediction: { type: "string", description: "Prediction of potential future incidents based on this data" },
          high_risk_flag: { type: "boolean" },
          high_risk_reason: { type: "string" }
        }
      }
    });

    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 cursor-pointer"
        onClick={() => analysis ? setExpanded(!expanded) : runAnalysis()}
      >
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-purple-900">AI Incident Analysis</span>
          {analysis?.high_risk_flag && (
            <Badge className="bg-red-500 text-white text-xs ml-2">
              <Flag className="w-3 h-3 mr-1" /> High Risk
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!analysis && !loading && (
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700 text-white" 
              onClick={(e) => { e.stopPropagation(); runAnalysis(); }}
            >
              Run Analysis
            </Button>
          )}
          {loading && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
          {analysis && (expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />)}
        </div>
      </div>

      {expanded && analysis && (
        <div className="p-4 space-y-4 bg-white">
          {/* Category */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Brain className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">AI Category</p>
              <p className="text-sm text-blue-900">{analysis.suggested_category}</p>
            </div>
          </div>

          {/* High Risk Flag */}
          {analysis.high_risk_flag && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Flag className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-1">⚠ Manager Review Required</p>
                <p className="text-sm text-red-800">{analysis.high_risk_reason}</p>
              </div>
            </div>
          )}

          {/* Recurring Pattern */}
          <div className={`flex items-start gap-3 p-3 rounded-lg ${analysis.is_recurring_pattern ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
            <TrendingUp className={`w-4 h-4 mt-0.5 shrink-0 ${analysis.is_recurring_pattern ? 'text-orange-600' : 'text-gray-500'}`} />
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${analysis.is_recurring_pattern ? 'text-orange-800' : 'text-gray-600'}`}>
                Pattern Detection
              </p>
              <p className={`text-sm ${analysis.is_recurring_pattern ? 'text-orange-900' : 'text-gray-700'}`}>
                {analysis.is_recurring_pattern ? '⚠ Recurring pattern detected: ' : '✓ No recurring pattern: '}{analysis.pattern_reason}
              </p>
            </div>
          </div>

          {/* Future Risk Prediction */}
          {analysis.future_risk_prediction && (
            <div className="flex items-start gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <TrendingUp className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wide mb-1">
                  Future Risk Prediction
                </p>
                <p className="text-sm text-indigo-900">
                  {analysis.future_risk_prediction}
                </p>
              </div>
            </div>
          )}

          {/* Preventative Measures */}
          {analysis.preventative_measures?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Preventative Measures
              </p>
              <ul className="space-y-1">
                {analysis.preventative_measures.map((m, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-500 font-bold mt-0.5">•</span> {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Training */}
          {analysis.training_recommendations?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Training Recommendations
              </p>
              <ul className="space-y-1">
                {analysis.training_recommendations.map((t, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
