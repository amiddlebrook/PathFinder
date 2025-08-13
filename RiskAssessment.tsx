import React, { useState, useCallback } from 'react';
import { Trip, RiskAssessmentData } from '../types';
import { generateRiskAssessment } from '../services/geminiService';
import { ShieldAlertIcon, AlertTriangleIcon, SparklesIcon } from './icons';

interface RiskAssessmentProps {
  trip: Trip;
  onAssessmentUpdate: (assessment: RiskAssessmentData) => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-accent-text)]"></div>
);

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ trip, onAssessmentUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssessRisk = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const assessment = await generateRiskAssessment(trip);
      onAssessmentUpdate(assessment);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [trip, onAssessmentUpdate]);

  if (trip.riskAssessment) {
    const { trailDifficulty, weatherAnalysis, potentialHazards, recommendedGear } = trip.riskAssessment;
    return (
      <div className="space-y-6">
        <div className="p-6 bg-[var(--color-bg-tertiary)]/50 rounded-xl border border-[var(--color-border)]">
          <h3 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
            <ShieldAlertIcon className="w-7 h-7 text-[var(--color-accent)]" />
            AI Risk Assessment
          </h3>
          <p className="text-[var(--color-text-secondary)] mt-2">Analysis based on trip details. Always cross-reference with local authorities and real-time data.</p>
        </div>
        
        {/* Difficulty */}
        <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-5 border border-[var(--color-border-subtle)]">
          <h4 className="font-bold text-lg text-[var(--color-text-primary)]">Trail Difficulty</h4>
          <p className={`text-2xl font-bold mt-2 ${trailDifficulty.rating.toLowerCase() === 'easy' ? 'text-green-400' : trailDifficulty.rating.toLowerCase() === 'moderate' ? 'text-yellow-400' : 'text-red-400'}`}>{trailDifficulty.rating}</p>
          <p className="text-[var(--color-text-secondary)] mt-2">{trailDifficulty.analysis}</p>
        </div>

        {/* Weather */}
        <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-5 border border-[var(--color-border-subtle)]">
          <h4 className="font-bold text-lg text-[var(--color-text-primary)]">Seasonal Weather Analysis</h4>
          <p className="text-[var(--color-text-secondary)] mt-2">{weatherAnalysis.summary}</p>
          <p className="text-amber-300 font-semibold mt-3 bg-amber-900/30 border border-amber-400/20 p-3 rounded-md">{weatherAnalysis.recommendation}</p>
        </div>

        {/* Hazards */}
        <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-5 border border-[var(--color-border-subtle)]">
            <h4 className="font-bold text-lg text-[var(--color-text-primary)] mb-4">Potential Hazards & Mitigations</h4>
            <div className="space-y-4">
            {potentialHazards.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-[var(--color-bg-secondary)]/50 rounded-md">
                    <AlertTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                        <p className="font-semibold text-red-300">{item.hazard}</p>
                        <p className="text-[var(--color-text-secondary)]">{item.mitigation}</p>
                    </div>
                </div>
            ))}
            </div>
        </div>

        {/* Gear */}
        <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-5 border border-[var(--color-border-subtle)]">
          <h4 className="font-bold text-lg text-[var(--color-text-primary)] mb-3">AI-Recommended Gear</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {recommendedGear.map((item, index) => (
              <li key={index} className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full flex-shrink-0"></div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[var(--color-bg-tertiary)]/50 rounded-xl border-2 border-dashed border-[var(--color-border)]">
      <ShieldAlertIcon className="w-16 h-16 text-[var(--color-text-tertiary)] mb-4" />
      <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Ready for a Risk Assessment?</h3>
      <p className="text-[var(--color-text-secondary)] mt-2 max-w-md">
        Use AI to analyze your trip's destination and dates for potential hazards, weather patterns, and trail difficulty.
      </p>
      <button
        onClick={handleAssessRisk}
        disabled={isLoading}
        className="mt-6 inline-flex items-center gap-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--color-accent)]/50"
      >
        {isLoading ? <LoadingSpinner /> : <SparklesIcon className="w-5 h-5" />}
        {isLoading ? 'Analyzing...' : 'Generate AI Assessment'}
      </button>
      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
};

export default RiskAssessment;