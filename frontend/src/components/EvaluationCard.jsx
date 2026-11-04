import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, TrendingUp, Sparkles, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import ScoreBadge from './ScoreBadge';

export default function EvaluationCard({ evaluation, liveCommentary, isEvaluating }) {
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(true);

  if (isEvaluating && !evaluation) {
    return (
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 w-36 bg-indigo-100 rounded-lg"></div>
          <div className="h-8 w-20 bg-indigo-100 rounded-lg"></div>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded"></div>
        <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
        <div className="h-4 w-4/6 bg-slate-100 rounded"></div>
        {liveCommentary && (
          <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs font-mono text-indigo-900 whitespace-pre-wrap">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-ping mr-2"></span>
            {liveCommentary}
          </div>
        )}
      </div>
    );
  }

  if (!evaluation) return null;

  const metrics = evaluation.metrics || {};
  const metricItems = [
    { label: 'Technical Correctness', value: metrics.correctness ?? evaluation.score, color: 'bg-emerald-500' },
    { label: 'Clarity & Delivery', value: metrics.clarity ?? evaluation.score, color: 'bg-indigo-500' },
    { label: 'Technical Depth', value: metrics.technical_depth ?? evaluation.score, color: 'bg-purple-500' },
    { label: 'Completeness', value: metrics.completeness ?? evaluation.score, color: 'bg-blue-500' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-indigo-50/40 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">AI Evaluation & Feedback</h3>
            <p className="text-xs text-slate-500">Gemini Multi-dimensional Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ScoreBadge score={evaluation.score} size="md" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* General Feedback */}
        {evaluation.feedback && (
          <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
            <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <span>Overall Assessment</span>
            </p>
            {evaluation.feedback}
          </div>
        )}

        {/* Evaluation Metrics Breakdown */}
        <div className="border border-slate-200/70 rounded-xl p-4 bg-white shadow-xs">
          <button
            type="button"
            onClick={() => setShowDetailedMetrics(!showDetailedMetrics)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Dimension Breakdown (Out of 10)
            </span>
            {showDetailedMetrics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetailedMetrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3 pt-3 border-t border-slate-100">
              {metricItems.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span className="font-medium">{item.label}</span>
                    <span className="font-semibold text-slate-900">{Number(item.value).toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(0, Number(item.value) * 10))}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Strengths & Missing Concepts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Strengths Demonstrated</span>
            </div>
            {evaluation.strengths && evaluation.strengths.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-emerald-800">
                {evaluation.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-700 italic">No specific strengths captured.</p>
            )}
          </div>

          {/* Missing Concepts */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm mb-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Missing Concepts or Nuances</span>
            </div>
            {evaluation.missing_concepts && evaluation.missing_concepts.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-amber-800">
                {evaluation.missing_concepts.map((miss, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{miss}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-amber-700 italic">Great job! No major concepts were missed.</p>
            )}
          </div>
        </div>

        {/* Actionable Improvements */}
        {evaluation.improvements && evaluation.improvements.length > 0 && (
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/70">
            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm mb-2.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Recommendations to Elevate Your Answer</span>
            </div>
            <ul className="space-y-1.5 text-xs text-indigo-900">
              {evaluation.improvements.map((imp, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-indigo-200/80 text-indigo-700 text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
