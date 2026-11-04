import React from 'react';
import { useInterview } from './context/InterviewContext';
import Navbar from './components/Navbar';
import ErrorAlert from './components/ErrorAlert';
import ApiKeyModal from './components/ApiKeyModal';
import Dashboard from './pages/Dashboard';
import SetupInterview from './pages/SetupInterview';
import InterviewSession from './pages/InterviewSession';
import SummaryReport from './pages/SummaryReport';
import HistoryPage from './pages/HistoryPage';
import { Brain, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const { activeTab } = useInterview();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Sticky Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorAlert />

        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'setup' && <SetupInterview />}
        {activeTab === 'session' && <InterviewSession />}
        {activeTab === 'summary' && <SummaryReport />}
        {activeTab === 'history' && <HistoryPage />}
      </main>

      {/* API Key Modal */}
      <ApiKeyModal />

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              <Brain className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-700">PrepMate AI</span>
            <span>— AI Interview Preparation Assistant</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              Engineered with <Sparkles className="w-3 h-3 text-indigo-500" /> Google Gen AI
            </span>
            <span>•</span>
            <span>FastAPI + React</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
