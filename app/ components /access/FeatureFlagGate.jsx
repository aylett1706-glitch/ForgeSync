import React from 'react';
import useFeatureFlag from '@/hooks/useFeatureFlag';

/**
 * Conditionally render children based on a feature flag.
 * 
 * Usage:
 *   <FeatureFlagGate flag="beta_ai_insights">
 *     <NewAIPanel />
 *   </FeatureFlagGate>
 * 
 *   <FeatureFlagGate flag="beta_ai_insights" fallback={<OldPanel />}>
 *     <NewAIPanel />
 *   </FeatureFlagGate>
 */
export default function FeatureFlagGate({ flag, children, fallback = null }) {
  const isEnabled = useFeatureFlag(flag);
  return isEnabled ? children : fallback;
}
