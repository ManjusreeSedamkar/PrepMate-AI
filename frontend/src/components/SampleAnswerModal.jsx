import React from 'react';
import { X, BookOpen, Lightbulb, CheckSquare, Sparkles, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function SampleAnswerModal({ isOpen, onClose, sampleAnswer, questionText, role, level, isLoading }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (sampleAnswer?.sample_answer) {
      navigator.clipboard.writeText(sampleAnswer.sample_answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-white border-b border-slate-200/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Ideal Model Answer</h3>
              <p className="text-xs text-slate-500">
                Tailored for {role} ({level})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Question Context */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-700">
            <span className="font-semibold text-slate-900 block mb-1">Question:</span>
            {questionText}
          </div>

          {isLoading ? (
            <div className="space-y-4 py-8 animate-pulse text-center">
              <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-full mb-2">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Generating student-friendly model answer...</p>
              <p className="text-xs text-slate-500">Gemini is structuring explanations, code/real-world examples, and pro tips.</p>
              <div className="h-4 w-3/4 bg-slate-100 rounded mx-auto mt-4"></div>
              <div className="h-4 w-5/6 bg-slate-100 rounded mx-auto"></div>
            </div>
          ) : sampleAnswer ? (
            <>
              {/* Structure Breakdown */}
              {sampleAnswer.structure_breakdown && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs text-indigo-900">
                  <span className="font-semibold block mb-0.5">Recommended Structure Strategy:</span>
                  {sampleAnswer.structure_breakdown}
                </div>
              )}

              {/* Model Answer Body */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Model Response
                  </h4>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Answer'}</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200/80 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                  {sampleAnswer.sample_answer}
                </div>
              </div>

              {/* Key Bullet Points */}
              {sampleAnswer.key_points && sampleAnswer.key_points.length > 0 && (
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/70">
                  <div className="flex items-center gap-2 text-purple-900 font-semibold text-xs mb-2">
                    <CheckSquare className="w-4 h-4 text-purple-600" />
                    <span>Key Takeaway Concepts to Memorize</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-purple-950">
                    {sampleAnswer.key_points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pro Tips */}
              {sampleAnswer.pro_tips && sampleAnswer.pro_tips.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Interviewer Pro Tips</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {sampleAnswer.pro_tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">★</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              Click &quot;View Sample Answer&quot; to fetch the model answer for this question.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
