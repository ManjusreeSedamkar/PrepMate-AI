import React, { useState } from 'react';
import { Sparkles, Brain, KeyRound, History, PlusCircle, LayoutDashboard, Menu, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useInterview } from '../context/InterviewContext';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    serverConfig,
    customApiKey,
    setIsKeyModalOpen,
    questions,
  } = useInterview();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hasKey = serverConfig?.has_server_api_key || Boolean(customApiKey);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'setup', label: 'Start Interview', icon: PlusCircle },
    ...(questions.length > 0 ? [{ id: 'session', label: 'Current Session', icon: Brain }] : []),
    { id: 'history', label: 'History', icon: History },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800 bg-clip-text text-transparent">
                  PrepMate
                </span>
                <span className="text-xs font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200/80 tracking-wide">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-600 hidden sm:block -mt-0.5">
                Interview Preparation Assistant
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: API Status & Key Settings */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all shadow-xs ${
                hasKey
                  ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 animate-pulse'
              }`}
              title="Configure Gemini API Key"
            >
              {hasKey ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Gemini Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Configure API Key</span>
                </>
              )}
              <KeyRound className="w-3.5 h-3.5 ml-0.5 opacity-60" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="p-2 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
              title="API Key"
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
