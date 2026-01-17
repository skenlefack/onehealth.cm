'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight,
  Loader2, Timer, HelpCircle, Check, X
} from 'lucide-react';
import { Language, QuizQuestionForStudent, ELearningQuiz } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import { getQuiz, startQuizAttempt, getQuizAttempt, submitQuizAttempt } from '@/lib/api';
import { Button, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

export default function QuizTakePage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const lang = (params.lang as string) || 'fr';
  const quizId = parseInt(params.quizId as string);

  if (!isValidLanguage(lang)) {
    return null;
  }

  const language = lang as Language;
  const t = getTranslation(language);

  // States
  const [quiz, setQuiz] = useState<ELearningQuiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionForStudent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  // Fetch quiz and start/resume attempt
  useEffect(() => {
    const initQuiz = async () => {
      if (!token) {
        router.push(`/${lang}/auth/login?redirect=/${lang}/oh-elearning/quiz/${quizId}`);
        return;
      }

      setLoading(true);
      try {
        // Get quiz details
        const quizRes = await getQuiz(quizId, token);
        if (!quizRes.success || !quizRes.data) {
          setError(language === 'fr' ? 'Quiz non trouve' : 'Quiz not found');
          setLoading(false);
          return;
        }
        setQuiz(quizRes.data);

        // Start or resume attempt
        const attemptRes = await startQuizAttempt(quizId, token);
        if (attemptRes.success && attemptRes.data) {
          const { attempt, quiz: quizData, questions: quizQuestions } = attemptRes.data;

          setAttemptId(attempt.id);
          setQuestions(quizQuestions);

          // Check if resuming an existing attempt
          if (attempt.time_spent_seconds > 0) {
            setIsResuming(true);
          }

          // Restore saved responses if resuming
          if (attempt.responses) {
            try {
              const savedResponses = JSON.parse(attempt.responses);
              if (savedResponses && typeof savedResponses === 'object') {
                setResponses(savedResponses);
              }
            } catch (e) {
              // Invalid JSON, ignore
            }
          }

          // Calculate remaining time
          if (quizData.time_limit_minutes) {
            const totalSeconds = quizData.time_limit_minutes * 60;
            const elapsedSeconds = attempt.time_spent_seconds || 0;
            const remaining = Math.max(0, totalSeconds - elapsedSeconds);
            setTimeRemaining(remaining);

            // If time already expired, redirect to intro
            if (remaining <= 0) {
              router.push(`/${lang}/oh-elearning/quiz/${quizId}`);
              return;
            }
          }
        } else {
          setError(attemptRes.message || (language === 'fr' ? 'Erreur lors du demarrage' : 'Error starting quiz'));
        }
      } catch (err) {
        setError(language === 'fr' ? 'Erreur de connexion' : 'Connection error');
      }
      setLoading(false);
    };

    initQuiz();
  }, [quizId, token, language, router, lang]);

  // Timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current question
  const currentQuestion = questions[currentIndex];

  // Handle answer change
  const handleAnswerChange = (questionId: number, answer: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Handle MCQ selection
  const handleMCQSelect = (optionIndex: number) => {
    if (!currentQuestion) return;
    handleAnswerChange(currentQuestion.id, optionIndex);
  };

  // Handle multiple select
  const handleMultipleSelect = (optionIndex: number) => {
    if (!currentQuestion) return;
    const current = responses[currentQuestion.id] || [];
    const newAnswer = current.includes(optionIndex)
      ? current.filter((i: number) => i !== optionIndex)
      : [...current, optionIndex];
    handleAnswerChange(currentQuestion.id, newAnswer);
  };

  // Handle true/false
  const handleTrueFalse = (value: boolean) => {
    if (!currentQuestion) return;
    handleAnswerChange(currentQuestion.id, value);
  };

  // Handle short answer
  const handleShortAnswer = (value: string) => {
    if (!currentQuestion) return;
    handleAnswerChange(currentQuestion.id, value);
  };

  // Navigate questions
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  // Submit quiz
  const handleSubmit = async () => {
    if (!attemptId || submitting || !token) return;

    setSubmitting(true);
    try {
      const result = await submitQuizAttempt(attemptId, responses, token);
      if (result.success) {
        router.push(`/${lang}/oh-elearning/quiz/${quizId}/results/${attemptId}`);
      } else {
        setError(result.message || (language === 'fr' ? 'Erreur lors de la soumission' : 'Error submitting quiz'));
      }
    } catch (err) {
      setError(language === 'fr' ? 'Erreur de connexion' : 'Connection error');
    }
    setSubmitting(false);
    setShowConfirmSubmit(false);
  };

  // Count answered questions
  const answeredCount = Object.keys(responses).filter(id => {
    const answer = responses[parseInt(id)];
    if (Array.isArray(answer)) return answer.length > 0;
    if (typeof answer === 'string') return answer.trim().length > 0;
    return answer !== undefined && answer !== null;
  }).length;

  const unansweredCount = questions.length - answeredCount;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-slate-400">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center text-white">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold mb-2">{error || t.common.notFound}</h2>
          <Link href={`/${lang}/oh-elearning`}>
            <Button variant="outline">{t.common.back}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const quizTitle = language === 'en' && quiz.title_en ? quiz.title_en : quiz.title_fr;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Resume Banner */}
      {isResuming && (
        <div className="fixed top-0 left-0 right-0 h-8 bg-yellow-500/20 border-b border-yellow-500/30 z-[60] flex items-center justify-center">
          <span className="text-sm text-yellow-400">
            {language === 'fr' ? 'Reprise de votre tentative precedente' : 'Resuming your previous attempt'}
          </span>
        </div>
      )}

      {/* Header */}
      <header className={cn(
        "fixed left-0 right-0 h-14 bg-slate-800 border-b border-slate-700 z-50 flex items-center justify-between px-4",
        isResuming ? "top-8" : "top-0"
      )}>
        <div className="flex items-center gap-4">
          <Link
            href={`/${lang}/oh-elearning/quiz/${quizId}`}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">{t.common.back}</span>
          </Link>
          <div className="h-6 w-px bg-slate-700" />
          <h1 className="font-medium text-white truncate">{quizTitle}</h1>
        </div>

        {/* Timer */}
        {timeRemaining !== null && (
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-mono',
            timeRemaining <= 60 ? 'bg-red-500/20 text-red-400' :
            timeRemaining <= 300 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-slate-700 text-slate-300'
          )}>
            <Timer size={18} />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        )}
      </header>

      <div className={cn("flex", isResuming ? "pt-[5.5rem]" : "pt-14")}>
        {/* Question Navigation Sidebar */}
        <aside className={cn(
          "fixed left-0 bottom-0 w-64 bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto hidden lg:block",
          isResuming ? "top-[5.5rem]" : "top-14"
        )}>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <HelpCircle size={18} />
            {t.elearning.questionOf
              .replace('{current}', String(currentIndex + 1))
              .replace('{total}', String(questions.length))}
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = responses[q.id] !== undefined && responses[q.id] !== null;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(idx)}
                  className={cn(
                    'w-10 h-10 rounded-lg font-medium text-sm transition-colors',
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isAnswered
                        ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Progress */}
          <div className="mt-6 p-4 bg-slate-700/50 rounded-xl">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">{t.elearning.progress}</span>
              <span className="text-emerald-400">{answeredCount}/{questions.length}</span>
            </div>
            <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-3xl mx-auto">
            {currentQuestion && (
              <>
                {/* Question Card */}
                <div className="bg-slate-800 rounded-2xl p-6 mb-6">
                  {/* Question Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      {currentIndex + 1}
                    </span>
                    <span className="text-sm text-slate-400">
                      {currentQuestion.points} point{currentQuestion.points > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Question Text */}
                  <h2 className="text-xl font-semibold text-white mb-6 leading-relaxed">
                    {language === 'en' && currentQuestion.question_text_en
                      ? currentQuestion.question_text_en
                      : currentQuestion.question_text_fr}
                  </h2>

                  {/* Options based on question type */}
                  <div className="space-y-3">
                    {/* MCQ Options */}
                    {currentQuestion.question_type === 'mcq' && currentQuestion.options?.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleMCQSelect(idx)}
                        className={cn(
                          'w-full p-4 rounded-xl text-left transition-all flex items-center gap-4',
                          responses[currentQuestion.id] === idx
                            ? 'bg-blue-600/20 border-2 border-blue-500'
                            : 'bg-slate-700 hover:bg-slate-600 border-2 border-transparent'
                        )}
                      >
                        <span className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm',
                          responses[currentQuestion.id] === idx
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-600 text-slate-300'
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-white">
                          {language === 'en' && option.text_en ? option.text_en : option.text_fr}
                        </span>
                      </button>
                    ))}

                    {/* Multiple Select Options */}
                    {currentQuestion.question_type === 'multiple_select' && currentQuestion.options?.map((option, idx) => {
                      const isSelected = (responses[currentQuestion.id] || []).includes(idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleMultipleSelect(idx)}
                          className={cn(
                            'w-full p-4 rounded-xl text-left transition-all flex items-center gap-4',
                            isSelected
                              ? 'bg-blue-600/20 border-2 border-blue-500'
                              : 'bg-slate-700 hover:bg-slate-600 border-2 border-transparent'
                          )}
                        >
                          <span className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center',
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-600 text-slate-300'
                          )}>
                            {isSelected ? <Check size={18} /> : <span className="text-sm font-semibold">{String.fromCharCode(65 + idx)}</span>}
                          </span>
                          <span className="text-white">
                            {language === 'en' && option.text_en ? option.text_en : option.text_fr}
                          </span>
                        </button>
                      );
                    })}

                    {/* True/False */}
                    {currentQuestion.question_type === 'true_false' && (
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleTrueFalse(true)}
                          className={cn(
                            'flex-1 p-6 rounded-xl transition-all flex flex-col items-center gap-3',
                            responses[currentQuestion.id] === true
                              ? 'bg-emerald-600/20 border-2 border-emerald-500'
                              : 'bg-slate-700 hover:bg-slate-600 border-2 border-transparent'
                          )}
                        >
                          <CheckCircle size={32} className={responses[currentQuestion.id] === true ? 'text-emerald-400' : 'text-slate-400'} />
                          <span className="text-white font-semibold">{t.elearning.trueOption}</span>
                        </button>
                        <button
                          onClick={() => handleTrueFalse(false)}
                          className={cn(
                            'flex-1 p-6 rounded-xl transition-all flex flex-col items-center gap-3',
                            responses[currentQuestion.id] === false
                              ? 'bg-red-600/20 border-2 border-red-500'
                              : 'bg-slate-700 hover:bg-slate-600 border-2 border-transparent'
                          )}
                        >
                          <X size={32} className={responses[currentQuestion.id] === false ? 'text-red-400' : 'text-slate-400'} />
                          <span className="text-white font-semibold">{t.elearning.falseOption}</span>
                        </button>
                      </div>
                    )}

                    {/* Short Answer */}
                    {currentQuestion.question_type === 'short_answer' && (
                      <div>
                        <input
                          type="text"
                          value={responses[currentQuestion.id] || ''}
                          onChange={(e) => handleShortAnswer(e.target.value)}
                          placeholder={t.elearning.typeAnswer}
                          className="w-full p-4 rounded-xl bg-slate-700 text-white border-2 border-transparent focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                    )}

                    {/* Fill in the Blank */}
                    {currentQuestion.question_type === 'fill_blank' && (
                      <div>
                        <input
                          type="text"
                          value={responses[currentQuestion.id] || ''}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          placeholder={language === 'fr' ? 'Entrez le mot manquant...' : 'Enter the missing word...'}
                          className="w-full p-4 rounded-xl bg-slate-700 text-white border-2 border-transparent focus:border-blue-500 outline-none transition-colors text-center text-lg"
                        />
                        <p className="text-sm text-slate-400 mt-2 text-center">
                          {language === 'fr' ? 'Completez le blanc dans la question ci-dessus' : 'Fill in the blank in the question above'}
                        </p>
                      </div>
                    )}

                    {/* Matching */}
                    {currentQuestion.question_type === 'matching' && currentQuestion.options && (
                      <div className="space-y-4">
                        <p className="text-sm text-slate-400 mb-4">
                          {language === 'fr'
                            ? 'Associez chaque element de gauche avec son correspondant a droite'
                            : 'Match each item on the left with its pair on the right'}
                        </p>
                        {currentQuestion.options.map((option, idx) => {
                          const currentMatch = (responses[currentQuestion.id] || {})[idx];
                          const rightOptions = currentQuestion.options?.filter((_, i) => i !== idx) || [];

                          return (
                            <div key={idx} className="flex items-center gap-4">
                              {/* Left side (fixed) */}
                              <div className="flex-1 p-4 bg-slate-700 rounded-xl text-white">
                                <span className="font-medium text-blue-400 mr-2">{idx + 1}.</span>
                                {language === 'en' && option.text_en ? option.text_en : option.text_fr}
                              </div>

                              {/* Arrow */}
                              <div className="text-slate-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </div>

                              {/* Right side (dropdown) */}
                              <select
                                value={currentMatch ?? ''}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                  const currentResponses = responses[currentQuestion.id] || {};
                                  handleAnswerChange(currentQuestion.id, {
                                    ...currentResponses,
                                    [idx]: value
                                  });
                                }}
                                className="flex-1 p-4 bg-slate-700 rounded-xl text-white border-2 border-transparent focus:border-blue-500 outline-none transition-colors cursor-pointer"
                              >
                                <option value="">{language === 'fr' ? 'Selectionnez...' : 'Select...'}</option>
                                {currentQuestion.options?.map((rightOpt, rightIdx) => (
                                  <option key={rightIdx} value={rightIdx}>
                                    {String.fromCharCode(65 + rightIdx)}. {language === 'en' && rightOpt.text_en ? rightOpt.text_en : rightOpt.text_fr}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => goToQuestion(currentIndex - 1)}
                    disabled={currentIndex === 0}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                      currentIndex === 0
                        ? 'text-slate-500 cursor-not-allowed'
                        : 'text-slate-300 hover:bg-slate-700'
                    )}
                  >
                    <ChevronLeft size={20} />
                    {t.elearning.previousQuestion}
                  </button>

                  {/* Mobile question indicator */}
                  <span className="lg:hidden text-slate-400 text-sm">
                    {currentIndex + 1} / {questions.length}
                  </span>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={() => goToQuestion(currentIndex + 1)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      {t.elearning.nextQuestion}
                      <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      {t.elearning.submitQuiz}
                      <Check size={20} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">{t.elearning.confirmSubmit}</h3>
            {unansweredCount > 0 && (
              <p className="text-yellow-400 mb-4">
                {t.elearning.unansweredQuestions.replace('{count}', String(unansweredCount))}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition-colors"
              >
                {t.common.back}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                {t.elearning.submitQuiz}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
