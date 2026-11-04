import React, { useState } from 'react';
import {
  Sparkles,
  Briefcase,
  Layers,
  HelpCircle,
  Hash,
  FileCode,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useInterview } from '../context/InterviewContext';

export default function SetupInterview() {
  const { startInterview, isGeneratingQuestions, interviewConfig, setInterviewConfig, serverConfig } = useInterview();

  const [role, setRole] = useState(interviewConfig.role || 'Python Developer');
  const [customRole, setCustomRole] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [level, setLevel] = useState(interviewConfig.level || 'Intermediate');
  const [interviewType, setInterviewType] = useState(interviewConfig.interviewType || 'Technical');
  const [numQuestions, setNumQuestions] = useState(interviewConfig.numQuestions || 5);
  const [topics, setTopics] = useState(interviewConfig.topics || '');

  const standardRoles = [
    'Python Developer',
    'Java Developer',
    'Data Analyst',
    'Web Developer',
    'AI / ML Engineer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Cloud Architect',
  ];

  const levels = [
    {
      id: 'Beginner',
      label: 'Beginner',
      sub: '0 - 1 Years',
      desc: 'Fundamental concepts, core syntax, basic algorithms & OOP',
    },
    {
      id: 'Intermediate',
      label: 'Intermediate',
      sub: '1 - 3 Years',
      desc: 'Real-world architecture, trade-offs, debugging & performance',
    },
    {
      id: 'Advanced',
      label: 'Advanced',
      sub: '3+ Years',
      desc: 'Distributed systems, concurrency, scalability & system design',
    },
  ];

  const types = [
    {
      id: 'Technical',
      label: 'Technical Interview',
      desc: 'Core architecture, conceptual depth, syntax, algorithms & coding principles',
    },
    {
      id: 'HR',
      label: 'HR & Behavioral',
      desc: 'STAR method questions, teamwork, workplace conflicts, culture & communication',
    },
    {
      id: 'Mixed',
      label: 'Mixed Interview',
      desc: '60% Technical conceptual challenges + 40% situational behavioral scenarios',
    },
  ];

  const questionCounts = [5, 10, 15];

  const isConfigured = serverConfig?.has_server_api_key;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalRole = isCustomRole ? customRole.trim() || 'Software Engineer' : role;

    const payload = {
      role: finalRole,
      level,
      interview_type: interviewType,
      interviewType: interviewType,
      num_questions: Number(numQuestions),
      numQuestions: Number(numQuestions),
      topics: topics.trim() || null,
    };

    setInterviewConfig(payload);

    try {
      await startInterview(payload);
    } catch {
      // Error handled in context
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Step 1: Configure Your Session</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Customize Your Mock Interview
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Specify your target job role, seniority level, and focus topics. Gemini will craft a fresh set of realistic interview questions.
        </p>
      </div>

      {serverConfig && !isConfigured && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-950">Backend Setup Note</p>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              The backend requires the <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> environment variable in your backend <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> file or Render deployment dashboard to generate questions.
            </p>
          </div>
        </div>
      )}

      {/* Configuration Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-8">
        {/* 1. Job Role Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            1. Select or Enter Job Role
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {standardRoles.map((r) => {
              const selected = !isCustomRole && role === r;
              return (
                <button
                  type="button"
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setIsCustomRole(false);
                  }}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>

          {/* Custom Role Option */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsCustomRole(!isCustomRole)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
            >
              {isCustomRole ? 'Choose standard role' : '+ Or type a custom job title'}
            </button>
            {isCustomRole && (
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Flutter Mobile Developer, Cybersecurity Analyst, Prompt Engineer..."
                className="mt-2 w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required={isCustomRole}
              />
            )}
          </div>
        </div>

        {/* 2. Experience Level */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            2. Experience Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {levels.map((lvl) => {
              const selected = level === lvl.id;
              return (
                <div
                  key={lvl.id}
                  onClick={() => setLevel(lvl.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900">{lvl.label}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {lvl.sub}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{lvl.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Interview Type */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            3. Interview Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {types.map((t) => {
              const selected = interviewType === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setInterviewType(t.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <span className="font-bold text-sm text-slate-900 block mb-1">{t.label}</span>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Number of Questions */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            4. Number of Questions
          </label>
          <div className="flex items-center gap-4">
            {questionCounts.map((count) => {
              const selected = Number(numQuestions) === count;
              return (
                <button
                  type="button"
                  key={count}
                  onClick={() => setNumQuestions(count)}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {count} Questions
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Optional Focus Topics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              5. Specific Topics or Keywords (Optional)
            </label>
            <span className="text-[11px] text-slate-400">e.g. Docker, SQL, AsyncIO</span>
          </div>
          <input
            type="text"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="e.g. Concurrency, FastAPI, REST APIs, Microservices architecture, STAR questions..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder:text-slate-400"
          />
        </div>

        {/* Submit CTA */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isGeneratingQuestions}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGeneratingQuestions ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Interview Questions with Gemini...</span>
              </>
            ) : (
              <>
                <span>Generate Questions & Start Interview</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
