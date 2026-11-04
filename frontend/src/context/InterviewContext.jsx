import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchServerConfig,
  generateQuestions,
  evaluateAnswer,
  streamEvaluateAnswer,
  generateSampleAnswer,
  generateInterviewSummary,
} from '../services/api';

const InterviewContext = createContext(null);

export function InterviewProvider({ children }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'setup', 'session', 'summary', 'history'

  // Server Config State
  const [serverConfig, setServerConfig] = useState(null);

  // Interview Setup State
  const [interviewConfig, setInterviewConfig] = useState({
    role: 'Python Developer',
    level: 'Intermediate',
    interviewType: 'Technical',
    numQuestions: 5,
    topics: '',
  });

  // Active Session State
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [question_number]: string }
  const [evaluations, setEvaluations] = useState({}); // { [question_number]: EvaluateAnswerResponse }
  const [sampleAnswers, setSampleAnswers] = useState({}); // { [question_number]: SampleAnswerResponse }
  const [finalSummary, setFinalSummary] = useState(null);

  // Loading & Stream States
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [streamCommentary, setStreamCommentary] = useState('');
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // Local storage history (only stores candidate past scorecards, never API keys)
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('prepmate_interview_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Check backend server config on mount
  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    try {
      const cfg = await fetchServerConfig();
      setServerConfig(cfg);
    } catch (err) {
      console.warn('Backend not yet reachable:', err.message);
      setServerConfig({ has_server_api_key: false, status: 'offline' });
    }
  };

  /**
   * Starts a new interview: generates questions and navigates to session.
   */
  const startInterview = async (config) => {
    setGlobalError(null);
    setIsGeneratingQuestions(true);
    setInterviewConfig(config);

    try {
      const response = await generateQuestions(config);
      if (!response.questions || response.questions.length === 0) {
        throw new Error('No questions returned by the AI.');
      }
      setQuestions(response.questions);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setEvaluations({});
      setSampleAnswers({});
      setFinalSummary(null);
      setStreamCommentary('');
      setActiveTab('session');
    } catch (err) {
      setGlobalError(err.message);
      throw err;
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  /**
   * Submits the candidate's answer for evaluation.
   */
  const submitAnswer = async (questionNumber, answerText, useStream = false) => {
    if (!answerText || !answerText.trim()) return;

    setGlobalError(null);
    setIsEvaluating(true);
    setStreamCommentary('');

    // Save answer locally
    setAnswers((prev) => ({ ...prev, [questionNumber]: answerText }));

    const currentQ = questions.find((q) => q.question_number === questionNumber);
    const payload = {
      role: interviewConfig.role,
      level: interviewConfig.level,
      question: currentQ ? currentQ.question : '',
      user_answer: answerText,
      category: currentQ ? currentQ.category : 'General',
    };

    try {
      if (useStream) {
        await streamEvaluateAnswer(
          payload,
          (chunk) => {
            setStreamCommentary((prev) => prev + chunk);
          },
          (finalData) => {
            setEvaluations((prev) => ({ ...prev, [questionNumber]: finalData }));
            setIsEvaluating(false);
          },
          (err) => {
            setGlobalError(`Streaming evaluation error: ${err.message}`);
            setIsEvaluating(false);
          }
        );
      } else {
        const evaluation = await evaluateAnswer(payload);
        setEvaluations((prev) => ({ ...prev, [questionNumber]: evaluation }));
        setIsEvaluating(false);
      }
    } catch (err) {
      setGlobalError(err.message);
      setIsEvaluating(false);
    }
  };

  /**
   * Generates model answer on-demand for a given question.
   */
  const getSampleAnswer = async (questionNumber) => {
    if (sampleAnswers[questionNumber]) return sampleAnswers[questionNumber];

    setIsLoadingSample(true);
    const currentQ = questions.find((q) => q.question_number === questionNumber);
    const payload = {
      role: interviewConfig.role,
      level: interviewConfig.level,
      question: currentQ ? currentQ.question : '',
      category: currentQ ? currentQ.category : 'General',
    };

    try {
      const res = await generateSampleAnswer(payload);
      setSampleAnswers((prev) => ({ ...prev, [questionNumber]: res }));
      return res;
    } catch (err) {
      setGlobalError(err.message);
      throw err;
    } finally {
      setIsLoadingSample(false);
    }
  };

  /**
   * Completes interview session and generates comprehensive summary report.
   */
  const finishInterview = async () => {
    setGlobalError(null);
    setIsGeneratingSummary(true);

    // Build review list
    const reviews = questions.map((q) => {
      const evalItem = evaluations[q.question_number];
      return {
        question_number: q.question_number,
        question: q.question,
        user_answer: answers[q.question_number] || 'No answer submitted.',
        score: evalItem ? evalItem.score : 0.0,
        strengths: evalItem ? evalItem.strengths : [],
        missing_concepts: evalItem ? evalItem.missing_concepts : [],
      };
    });

    const resolvedType = interviewConfig.interview_type || interviewConfig.interviewType || 'Technical';
    const payload = {
      role: interviewConfig.role || 'Software Engineer',
      level: interviewConfig.level || 'Intermediate',
      interview_type: resolvedType,
      interviewType: resolvedType,
      reviews: reviews.map((r) => ({
        question_number: Number(r.question_number) || 1,
        question: String(r.question || ''),
        user_answer: String(r.user_answer || ''),
        score: typeof r.score === 'number' ? r.score : parseFloat(r.score) || 0.0,
        strengths: Array.isArray(r.strengths) ? r.strengths : [],
        missing_concepts: Array.isArray(r.missing_concepts) ? r.missing_concepts : [],
      })),
    };

    try {
      const summary = await generateInterviewSummary(payload);
      setFinalSummary(summary);

      // Save to localStorage history
      const historyItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        role: interviewConfig.role,
        level: interviewConfig.level,
        interviewType: interviewConfig.interviewType,
        totalQuestions: questions.length,
        overallScore: summary.overall_score,
        performanceLevel: summary.performance_level,
        summary,
        questions,
        answers,
        evaluations,
      };

      const updatedHistory = [historyItem, ...history.slice(0, 19)]; // Keep latest 20
      setHistory(updatedHistory);
      localStorage.setItem('prepmate_interview_history', JSON.stringify(updatedHistory));

      setActiveTab('summary');
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  /**
   * Restore a past interview from history.
   */
  const viewHistoryItem = (item) => {
    setInterviewConfig({
      role: item.role,
      level: item.level,
      interviewType: item.interviewType,
      numQuestions: item.totalQuestions,
      topics: '',
    });
    setQuestions(item.questions || []);
    setAnswers(item.answers || {});
    setEvaluations(item.evaluations || {});
    setFinalSummary(item.summary);
    setCurrentQuestionIndex(0);
    setActiveTab('summary');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('prepmate_interview_history');
  };

  const value = {
    activeTab,
    setActiveTab,
    serverConfig,
    interviewConfig,
    setInterviewConfig,
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    evaluations,
    sampleAnswers,
    finalSummary,
    isGeneratingQuestions,
    isEvaluating,
    streamCommentary,
    isLoadingSample,
    isGeneratingSummary,
    globalError,
    setGlobalError,
    history,
    startInterview,
    submitAnswer,
    getSampleAnswer,
    finishInterview,
    viewHistoryItem,
    clearHistory,
    checkServer,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
}
