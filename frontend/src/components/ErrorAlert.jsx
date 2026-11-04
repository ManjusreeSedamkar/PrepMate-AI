import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useInterview } from '../context/InterviewContext';

export default function ErrorAlert() {
  const { globalError, setGlobalError } = useInterview();

  if (!globalError) return null;

  return (
    <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/95 p-4 text-rose-800 shadow-sm backdrop-blur-sm transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-rose-950">Notice</p>
            <p className="mt-1 text-rose-800 leading-relaxed font-normal">{globalError}</p>
          </div>
        </div>
        <button
          onClick={() => setGlobalError(null)}
          className="text-rose-400 hover:text-rose-700 rounded-lg p-1 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
