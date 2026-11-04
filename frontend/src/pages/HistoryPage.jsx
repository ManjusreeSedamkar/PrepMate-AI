import React from 'react';
import { History, Award, Trash2, ArrowRight, Calendar, Layers, CheckCircle2 } from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import ScoreBadge from '../components/ScoreBadge';

export default function HistoryPage() {
  const { history, viewHistoryItem, clearHistory, setActiveTab } = useInterview();

  if (history.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <History className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Past Interviews Found</h2>
        <p className="text-xs text-slate-500">
          Once you complete mock interviews, your scorecards, question transcripts, and preparation roadmaps will appear here.
        </p>
        <button
          onClick={() => setActiveTab('setup')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <span>Start Your First Interview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Interview History
          </h1>
          <p className="text-xs text-slate-500">
            Review past evaluations and monitor your skill progression over time.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to clear your entire interview history?')) {
              clearHistory();
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => viewHistoryItem(item)}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.date}</span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-700">{item.interviewType} Track</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {item.role}
              </h3>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="px-2.5 py-0.5 bg-slate-100 rounded-md text-[11px] font-medium text-slate-700">
                  {item.level}
                </span>
                <span className="text-xs text-slate-500">
                  {item.totalQuestions} Questions
                </span>
                <span className="text-xs text-indigo-600 font-semibold">
                  {item.performanceLevel || 'Evaluated'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-center">
              <ScoreBadge score={item.overallScore} size="lg" />
              <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
