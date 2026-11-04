import React from 'react';

export default function ProgressBar({ current, total, answeredCount }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const answeredPercentage = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
        <span className="flex items-center gap-2 font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          Question {current} of {total}
        </span>
        <div className="flex items-center gap-3">
          <span>{answeredCount} of {total} evaluated</span>
          <span className="text-indigo-600 font-semibold">{percentage}% progress</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
        <div
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
