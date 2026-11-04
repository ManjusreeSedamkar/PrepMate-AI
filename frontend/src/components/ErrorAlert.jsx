import React from 'react';
import { AlertCircle, X, KeyRound } from 'lucide-react';
import { useInterview } from '../context/InterviewContext';

export default function ErrorAlert() {
  const { globalError, setGlobalError, setIsKeyModalOpen } = useInterview();

  if (!globalError) return null;

  const isKeyError = globalError.toLowerCase().includes('api key') || globalError.toLowerCase().includes('gemini');

  return (
    <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-rose-800 shadow-sm backdrop-blur-sm transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-rose-900">An issue occurred</p>
            <p className="mt-1 text-rose-700 leading-relaxed">{globalError}</p>
            {isKeyError && (
              <button
                onClick={() => setIsKeyModalOpen(true)}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-medium text-xs hover:bg-rose-700 transition-colors shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Configure Gemini API Key
              </button>
            )}
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
