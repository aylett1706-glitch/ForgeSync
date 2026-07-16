'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Play, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

const formatCurrency = (amount: number | string) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));

interface ScenarioConfig {
  name: string;
  burnRateAdjustment: number;
  priceGuideIncrease: number;
  serviceHoursChange: number;
  newParticipants: number | string;
  avgNewBudget: number | string;
  weekendRatio: number;
  eveningRatio: number;
  schadsLevelIncrease: number;
}

interface Participant {
  id: string;
  burnRate: number;
  totalSpent: number;
  totalBudget: number;
  daysRemaining: number;
}

interface ScenarioPreview {
  adjusted: any[];
  totalBudget: number;
  totalProjected: number;
  atRisk: number;
  newParticipantBudget: number;
}

interface Props {
  participants: Participant[];
  onRunScenario: (scenario: ScenarioConfig, preview: ScenarioPreview) => void;
  loading?: boolean;
}

export default function ScenarioModeler({ participants, onRunScenario, loading = false }: Props) {
  const [scenario, setScenario] = useState<ScenarioConfig>({
    name: 'Optimistic',
    burnRateAdjustment: 0,
    priceGuideIncrease: 3.19,
    serviceHoursChange: 0,
    newParticipants: 0,
    avgNewBudget: 25000,
    weekendRatio: 15,
    eveningRatio: 10,
    schadsLevelIncrease: 0,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const computeScenario = (): ScenarioPreview => {
    const newParticipants = typeof scenario.newParticipants === 'string' 
      ? (scenario.newParticipants === '' ? 0 : Number(scenario.newParticipants))
      : scenario.newParticipants;

    const avgNewBudget = typeof scenario.avgNewBudget === 'string'
      ? (scenario.avgNewBudget === '' ? 0 : Number(scenario.avgNewBudget))
      : scenario.avgNewBudget;

    // SCHADS Workforce Modeling
    const baseRatio = Math.max(0, 100 - scenario.weekendRatio - scenario.eveningRatio) / 100;
    const weekendMultiplier = (scenario.weekendRatio / 100) * 1.75;
    const eveningMultiplier = (scenario.eveningRatio / 100) * 1.12;
    const baselineIndex = 0.75 + (0.15 * 1.75) + (0.10 * 1.12);
    const wageIndex = baseRatio + weekendMultiplier + eveningMultiplier;
    const wageCostImpact = (wageIndex / baselineIndex) * (1 + (scenario.schadsLevelIncrease / 100));

    const multiplier = (1 + scenario.burnRateAdjustment / 100) * wageCostImpact;
    const priceMultiplier = 1 + scenario.priceGuideIncrease / 100;
    const hoursMultiplier = 1 + scenario.serviceHoursChange / 100;

    const adjusted = participants.map(p => {
      const adjustedBurnRate = p.burnRate * multiplier * hoursMultiplier;
      const adjustedProjected = p.totalSpent + (adjustedBurnRate * p.daysRemaining);
      const adjustedTotal = p.totalBudget * priceMultiplier;

      return {
        ...p,
        scenarioProjected: adjustedProjected,
        scenarioBudget: adjustedTotal,
        scenarioOverrun: adjustedProjected - adjustedTotal,
      };
    });

    // Add new participants
    const newParticipantBudget = newParticipants * avgNewBudget;
    const newParticipantSpend = newParticipantBudget * 0.7; // assume 70% utilisation

    const totalBudget = adjusted.reduce((s, p) => s + p.scenarioBudget, 0) + newParticipantBudget;
    const totalProjected = adjusted.reduce((s, p) => s + p.scenarioProjected, 0) + newParticipantSpend;
    const atRisk = adjusted.filter(p => p.scenarioOverrun > 0).length;

    return { adjusted, totalBudget, totalProjected, atRisk, newParticipantBudget };
  };

  const preview = computeScenario();
  const surplusDeficit = preview.totalBudget - preview.totalProjected;

  const presets = [
    { name: 'Conservative', burnRateAdjustment: 10, priceGuideIncrease: 0, serviceHoursChange: 5, newParticipants: 0, avgNewBudget: 25000, weekendRatio: 15, eveningRatio: 10, schadsLevelIncrease: 2 },
    { name: 'Current', burnRateAdjustment: 0, priceGuideIncrease: 0, serviceHoursChange: 0, newParticipants: 0, avgNewBudget: 25000, weekendRatio: 15, eveningRatio: 10, schadsLevelIncrease: 0 },
    { name: 'Optimistic', burnRateAdjustment: -5, priceGuideIncrease: 3.19, serviceHoursChange: -3, newParticipants: 2, avgNewBudget: 30000, weekendRatio: 10, eveningRatio: 5, schadsLevelIncrease: 0 },
    { name: 'Growth', burnRateAdjustment: 0, priceGuideIncrease: 3.19, serviceHoursChange: 15, newParticipants: 5, avgNewBudget: 28000, weekendRatio: 20, eveningRatio: 15, schadsLevelIncrease: 1.5 },
  ];

  return (
    <Card className="bg-white/80 backdrop-blur border-2 border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Scenario Modeler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Scenarios */}
        <div>
          <Label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.name}
                onClick={() => setScenario({ ...p })}
                className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-all ${
                  scenario.name === p.name
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-sm">Burn Rate Adjustment</Label>
              <span className={`text-sm font-bold ${scenario.burnRateAdjustment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {scenario.burnRateAdjustment > 0 ? '+' : ''}{scenario.burnRateAdjustment}%
              </span>
            </div>
            <Slider
              value={[scenario.burnRateAdjustment]}
              onValueChange={([v]) => setScenario((s) => ({ ...s, burnRateAdjustment: v }))}
              min={-30}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>-30%</span><span>+50%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-sm">NDIS Price Guide Increase</Label>
              <span className="text-sm font-bold text-blue-600">{scenario.priceGuideIncrease}%</span>
            </div>
            <Slider
              value={[scenario.priceGuideIncrease]}
              onValueChange={([v]) => setScenario((s) => ({ ...s, priceGuideIncrease: v }))}
              min={0}
              max={10}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span><span>+10%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-sm">Service Hours Change</Label>
              <span className={`text-sm font-bold ${scenario.serviceHoursChange > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {scenario.serviceHoursChange > 0 ? '+' : ''}{scenario.serviceHoursChange}%
              </span>
            </div>
            <Slider
              value={[scenario.serviceHoursChange]}
              onValueChange={([v]) => setScenario((s) => ({ ...s, serviceHoursChange: v }))}
              min={-50}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm mb-1 block">New Participants</Label>
              <Input
                type="number"
                min={0}
                max={50}
                value={scenario.newParticipants}
                onChange={(e) => {
                  const val = e.target.value;
                  setScenario((s) => ({ ...s, newParticipants: val === '' ? '' : Number(val) }));
                }}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">Avg Budget/Participant</Label>
              <Input
                type="number"
                min={5000}
                step={1000}
                value={scenario.avgNewBudget}
                onChange={(e) => {
                  const val = e.target.value;
                  setScenario((s) => ({ ...s, avgNewBudget: val === '' ? '' : Number(val) }));
                }}
                className="h-9"
              />
            </div>
          </div>

          {/* Advanced SCHADS Modeling */}
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <span>Advanced SCHADS Workforce Modeling</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-5 bg-gray-50 p-5 rounded-xl border border-gray-100">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-xs">Weekend Shift Ratio</Label>
                    <span className="text-xs font-bold text-indigo-600">{scenario.weekendRatio}%</span>
                  </div>
                  <Slider
                    value={[scenario.weekendRatio]}
                    onValueChange={([v]) => setScenario((s) => ({ ...s, weekendRatio: v }))}
                    min={0}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-xs">Evening/Night Ratio</Label>
                    <span className="text-xs font-bold text-indigo-600">{scenario.eveningRatio}%</span>
                  </div>
                  <Slider
                    value={[scenario.eveningRatio]}
                    onValueChange={([v]) => setScenario((s) => ({ ...s, eveningRatio: v }))}
                    min={0}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-xs">SCHADS Level Progression</Label>
                    <span className="text-xs font-bold text-red-600">+{scenario.schadsLevelIncrease}%</span>
                  </div>
                  <Slider
                    value={[scenario.schadsLevelIncrease]}
                    onValueChange={([v]) => setScenario((s) => ({ ...s, schadsLevelIncrease: v }))}
                    min={0}
                    max={15}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <p className="text-xs text-gray-500 leading-tight">
                  Models financial impact of penalty rates (avg 1.75x weekend, 1.12x evening) and automatic wage progressions under SCHADS.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview */}
        <div className={`p-5 rounded-2xl border-2 ${surplusDeficit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Scenario Preview</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Projected Budget</p>
              <p className="font-bold text-gray-900">{formatCurrency(preview.totalBudget)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Projected Spend</p>
              <p className="font-bold text-gray-900">{formatCurrency(preview.totalProjected)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{surplusDeficit >= 0 ? 'Surplus' : 'Deficit'}</p>
              <p className={`font-bold text-lg ${surplusDeficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {surplusDeficit >= 0 ? '+' : ''}{formatCurrency(surplusDeficit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">At-Risk Participants</p>
              <p className={`font-bold text-lg ${preview.atRisk > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {preview.atRisk}
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onRunScenario(scenario, preview)}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          Run AI Analysis
        </Button>
      </CardContent>
    </Card>
  );
}
