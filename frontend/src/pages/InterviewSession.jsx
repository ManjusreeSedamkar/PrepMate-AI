import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  HelpCircle,
  Send,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Radio,
  FileCheck2,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import ProgressBar from '../components/ProgressBar';
import EvaluationCard from '../components/EvaluationCard';
import SampleAnswerModal from '../components/SampleAnswerModal';
import SpeechInput from '../components/SpeechInput';

export default function InterviewSession() {
  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    evaluations,
    sampleAnswers,
    submitAnswer,
    getSampleAnswer,
    finishInterview,
    interviewConfig,
    isEvaluating,
    streamCommentary,
    isLoadingSample,
    isGeneratingSummary,
    setActiveTab,
  } = useInterview();

  const [currentText, setCurrentText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  // If no questions are loaded yet, redirect to setup
  useEffect(() => {
    if (!questions || questions.length === 0) {
      setActiveTab('setup');
    }
  }, [questions, setActiveTab]);

  const currentQ = questions[currentQuestionIndex];
  const qNum = currentQ ? currentQ.question_number : 1;
  const currentEvaluation = evaluations[qNum];
  const currentSampleAnswer = sampleAnswers[qNum];

  // Sync answer textarea whenever active question index changes
  useEffect(() => {
    if (currentQ) {
      setCurrentText(answers[qNum] || '');
      setShowHint(false);
    }
  }, [currentQuestionIndex, currentQ, qNum, answers]);

  if (!currentQ) return null;

  const total = questions.length;
  const answeredCount = Object.keys(evaluations).length;
  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;

  const handleTextChange = (e) => {
    setCurrentText(e.target.value);
  };

  const handleVoiceTranscript = (text) => {
    setCurrentText((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentText.trim() || isEvaluating) return;
    await submitAnswer(qNum, currentText.trim(), useStreaming);
  };

  const handleOpenSample = async () => {
    setIsSampleModalOpen(true);
    if (!currentSampleAnswer) {
      await getSampleAnswer(qNum);
    }
  };

  const canGoPrev = currentQuestionIndex > 0;
  const canGoNext = currentQuestionIndex < total - 1;
  const isAllAnswered = answeredCount === total;

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Top Header & Progress */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>{interviewConfig.role}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                {interviewConfig.level}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Track: {interviewConfig.interviewType} Interview
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={finishInterview}
              disabled={isGeneratingSummary}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                answeredCount > 0
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isGeneratingSummary ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Final Report...</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Finish & View Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        <ProgressBar
          current={currentQuestionIndex + 1}
          total={total}
          answeredCount={answeredCount}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Question Metadata & Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              Q{currentQ.question_number}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
              {currentQ.category || interviewConfig.interviewType}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
              {currentQ.difficulty || interviewConfig.level}
            </span>
          </div>

          {currentQ.hint && (
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>{showHint ? 'Hide Hint' : 'View Question Hint'}</span>
            </button>
          )}
        </div>

        {/* Question Text */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {currentQ.question}
          </h2>
        </div>

        {/* Hint Box */}
        {showHint && currentQ.hint && (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 animate-fadeIn">
            <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold block mb-0.5">Conceptual Hint:</span>
              <p className="leading-relaxed">{currentQ.hint}</p>
            </div>
          </div>
        )}

        {/* Candidate Answer Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Your Response
            </label>
            <div className="flex items-center gap-3">
              <SpeechInput
                onTranscript={handleVoiceTranscript}
                isEvaluating={isEvaluating}
              />
              <span className="text-[11px] font-medium text-slate-600">
                {wordCount} words | {currentText.length} chars
              </span>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={6}
              value={currentText}
              onChange={handleTextChange}
              disabled={isEvaluating}
              placeholder="Type your structured answer here. Include core concepts, working mechanism, code or real-world examples, and trade-offs..."
              className="w-full p-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-sans leading-relaxed disabled:bg-slate-50 placeholder:text-slate-400"
            />
          </div>

          {/* Answer Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Left Options */}
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={useStreaming}
                  onChange={(e) => setUseStreaming(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="flex items-center gap-1 font-medium">
                  <Radio className="w-3.5 h-3.5 text-indigo-500" />
                  Live SSE Streaming
                </span>
              </label>

              <button
                type="button"
                onClick={handleOpenSample}
                className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View Model Answer</span>
              </button>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="submit"
                disabled={!currentText.trim() || isEvaluating}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{currentEvaluation ? 'Re-Evaluate Answer' : 'Submit for Evaluation'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* AI Evaluation Display */}
      <EvaluationCard
        evaluation={currentEvaluation}
        liveCommentary={streamCommentary}
        isEvaluating={isEvaluating}
      />

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
        <button
          type="button"
          onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
          disabled={!canGoPrev}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Question</span>
        </button>

        <div className="flex items-center gap-2">
          {canGoNext ? (
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(total - 1, prev + 1))}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-all shadow-sm"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={finishInterview}
              disabled={isGeneratingSummary}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              {isGeneratingSummary ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Finalizing Scorecard...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Interview</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Model Answer Modal */}
      <SampleAnswerModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        sampleAnswer={currentSampleAnswer}
        questionText={currentQ.question}
        role={interviewConfig.role}
        level={interviewConfig.level}
        isLoading={isLoadingSample}
      />
    </div>
  );
}
