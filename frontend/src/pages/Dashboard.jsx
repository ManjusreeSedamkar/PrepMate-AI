import React from 'react';
import {
  Sparkles,
  Brain,
  Code2,
  Users,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  BookOpen,
  Award,
  Zap,
} from 'lucide-react';
import { useInterview } from '../context/InterviewContext';

export default function Dashboard() {
  const { setActiveTab, history, viewHistoryItem } = useInterview();

  const features = [
    {
      icon: Code2,
      title: 'Role-Specific Technical Questions',
      description:
        'Generate realistic, non-repetitive conceptual and scenario-based interview questions tailored to your exact stack and experience level.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Sparkles,
      title: 'Instant Multi-Dimensional Evaluation',
      description:
        'Submit answers and get scored on Technical Correctness, Clarity, Depth, and Completeness out of 10 with actionable feedback.',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      icon: BookOpen,
      title: 'Student-Friendly Model Answers',
      description:
        'Learn the ideal structured interview answer with key takeaway bullet points, real-world examples, and interviewer pro tips.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Readiness Report',
      description:
        'Receive a holistic final scorecard, strengths, weaknesses, and a personalized step-by-step preparation roadmap.',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const popularRoles = [
    'Python Developer',
    'Java Developer',
    'Web Developer (React/Node)',
    'Data Analyst',
    'AI / ML Engineer',
    'DevOps & Cloud Engineer',
    'Full Stack Engineer',
    'HR & Behavioral',
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-indigo-700/50">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Powered by Google Gemini 2.5 & Google Gen AI SDK</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Master Your Next Job Interview with{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              AI Precision
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            PrepMate AI is your personal, real-time interview coach. Practice realistic technical & HR questions, 
            receive instant scores out of 10 with deep constructive feedback, and explore ideal model answers.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveTab('setup')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Start Interview Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-colors"
            >
              <span>View Past Sessions</span>
            </button>
          </div>

          {/* Quick trust metrics */}
          <div className="pt-6 border-t border-indigo-700/60 flex flex-wrap items-center gap-6 text-xs text-indigo-200 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Technical & HR Mode
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Real-time SSE Streaming
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Detailed Scorecards
            </span>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Comprehensive Interview Preparation Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Designed to build practical confidence for college students, freshers, and experienced engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Roles Pill Cloud */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/70 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Popular Interview Tracks</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pick a standard role or enter your own custom job title.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('setup')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
          >
            Configure Custom Role <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {popularRoles.map((role, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab('setup')}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-xs font-medium text-slate-700 hover:text-indigo-700 transition-all shadow-xs"
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Practice History Preview */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">Recent Practice Sessions</h3>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View All ({history.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {history.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => viewHistoryItem(item)}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-white cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                  <span>{item.date}</span>
                  <span className="text-indigo-600 font-bold">{item.overallScore}/10</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{item.role}</h4>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                  <span className="px-2 py-0.5 bg-slate-200/70 rounded text-[10px] font-medium">
                    {item.level}
                  </span>
                  <span>{item.totalQuestions} Questions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
