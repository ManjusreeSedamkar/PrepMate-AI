import React, { useState } from 'react';
import { KeyRound, X, Check, ExternalLink, ShieldCheck, Info } from 'lucide-react';
import { useInterview } from '../context/InterviewContext';

export default function ApiKeyModal() {
  const { isKeyModalOpen, setIsKeyModalOpen, customApiKey, saveCustomApiKey, serverConfig } = useInterview();
  const [inputKey, setInputKey] = useState(customApiKey);
  const [showKey, setShowKey] = useState(false);

  if (!isKeyModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveCustomApiKey(inputKey);
  };

  const hasServerKey = serverConfig?.has_server_api_key;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Gemini API Key Settings</h3>
              <p className="text-xs text-slate-500">Google Gen AI Integration</p>
            </div>
          </div>
          <button
            onClick={() => setIsKeyModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {hasServerKey ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-900">Backend API Key Detected</p>
                <p className="mt-0.5 text-emerald-700">
                  Your backend already has a configured `GEMINI_API_KEY`. You don't need to enter one here unless you want to override it.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900">API Key Required</p>
                <p className="mt-0.5 text-amber-700">
                  Add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> to your backend environment, or enter a temporary personal key below.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500 leading-normal flex items-center justify-between">
              <span>Keys are stored strictly locally in your browser.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
              >
                Get free key <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            {customApiKey && (
              <button
                type="button"
                onClick={() => {
                  setInputKey('');
                  saveCustomApiKey('');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Clear Key
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsKeyModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
