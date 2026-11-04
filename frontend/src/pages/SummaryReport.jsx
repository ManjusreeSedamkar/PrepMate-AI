import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  Download,
  RotateCcw,
  Sparkles,
  BarChart,
  FileText,
  ListOrdered,
} from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import ScoreBadge from '../components/ScoreBadge';

export default function SummaryReport() {
  const { finalSummary, interviewConfig, questions, answers, evaluations, setActiveTab } = useInterview();

  useEffect(() => {
    // Trigger celebratory confetti on high scores or successful completion!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti optional
    }
  }, []);

  if (!finalSummary) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Interview Summary Available</h2>
        <p className="text-xs text-slate-500">
          Complete a practice session or select a previous interview from your history to view the report.
        </p>
        <button
          onClick={() => setActiveTab('setup')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-sm"
        >
          <span>Start an Interview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const overallScore = Number(finalSummary.overall_score || 0);

  const getScoreColor = (score) => {
    if (score >= 8.0) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 6.5) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    if (score >= 5.0) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const handleExportJSON = () => {
    const reportData = {
      role: interviewConfig.role,
      level: interviewConfig.level,
      interview_type: interviewConfig.interviewType,
      date: new Date().toISOString(),
      summary: finalSummary,
      questions,
      answers,
      evaluations,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PrepMate_${interviewConfig.role.replace(/\s+/g, '_')}_Report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Final Performance Evaluation
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Interview Summary Report
          </h1>
          <p className="text-xs text-slate-500">
            {interviewConfig.role} • {interviewConfig.level} • {interviewConfig.interviewType} Track
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Practice Again</span>
          </button>
        </div>
      </div>

      {/* Hero Scorecard */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-xs font-medium backdrop-blur-md">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Interview Performance Verdict</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Performance Level:{' '}
            <span className="text-amber-300">{finalSummary.performance_level || 'Proficient'}</span>
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-normal">
            {finalSummary.final_verdict}
          </p>
        </div>

        {/* Big Circular Score Badge */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-md">
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            {overallScore.toFixed(1)}
            <span className="text-lg font-medium text-indigo-300">/10</span>
          </div>
          <span className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider mt-1">
            Overall Score
          </span>
          <span className="text-[10px] text-slate-300 mt-1">
            {finalSummary.total_questions_answered} Questions Evaluated
          </span>
        </div>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Strengths */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Key Strengths Demonstrated</h3>
              <p className="text-[11px] text-slate-500">Highlighted areas of proficiency</p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {finalSummary.strengths && finalSummary.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100/70">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Primary Weaknesses */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Weaknesses & Concept Gaps</h3>
              <p className="text-[11px] text-slate-500">Details that need refinement</p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {finalSummary.weaknesses && finalSummary.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/50 border border-amber-100/70">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Personalized Preparation Roadmap */}
      {finalSummary.preparation_roadmap && finalSummary.preparation_roadmap.length > 0 && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Personalized Preparation Roadmap
              </h3>
              <p className="text-[11px] text-slate-500">
                Follow these recommended steps before your real interview
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {finalSummary.preparation_roadmap.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs text-slate-800"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="leading-relaxed mt-0.5 font-medium">{step}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Question Score Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Question-by-Question Breakdown</h3>
            <p className="text-[11px] text-slate-500">Review your individual responses and evaluations</p>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const evalItem = evaluations[q.question_number];
            const answer = answers[q.question_number];
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {q.question_number}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{q.question}</span>
                  </div>
                  {evalItem ? (
                    <ScoreBadge score={evalItem.score} size="sm" />
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Unanswered</span>
                  )}
                </div>

                {answer && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200/70 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-1">Your Answer:</span>
                    <p className="italic leading-relaxed">{answer}</p>
                  </div>
                )}

                {evalItem && evalItem.feedback && (
                  <div className="text-xs text-slate-600 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                    <span className="font-semibold text-indigo-950">AI Feedback: </span>
                    {evalItem.feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
