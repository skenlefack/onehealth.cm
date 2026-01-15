'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Trophy, XCircle, CheckCircle, Clock, Target,
  AlertCircle, RotateCcw, ChevronDown, ChevronUp, HelpCircle,
  Award, TrendingUp, BookOpen
} from 'lucide-react';
import { Language, QuizAttemptResult, QuizResponse, ELearningQuiz } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import { getQuizAttemptResults, getQuiz } from '@/lib/api';
import { Button, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params.lang as string) || 'fr';
  const quizId = parseInt(params.quizId as string);
  const attemptId = parseInt(params.attemptId as string);

  if (!isValidLanguage(lang)) {
    return null;
  }

  const language = lang as Language;
  const t = getTranslation(language);

  // States
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [quiz, setQuiz] = useState<ELearningQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  // Token
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';

  // Fetch results and quiz
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch results and quiz in parallel
        const [resultsRes, quizRes] = await Promise.all([
          getQuizAttemptResults(attemptId, token),
          getQuiz(quizId, token)
        ]);

        if (resultsRes.success && resultsRes.data) {
          setResult(resultsRes.data);
        } else {
          setError(resultsRes.message || (language === 'fr' ? 'Erreur lors du chargement des resultats' : 'Error loading results'));
        }

        if (quizRes.success && quizRes.data) {
          setQuiz(quizRes.data);
        }
      } catch (err) {
        setError(language === 'fr' ? 'Erreur de connexion' : 'Connection error');
      }
      setLoading(false);
    };

    fetchData();
  }, [attemptId, quizId, token, language]);

  // Toggle question expansion
  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Expand all questions
  const expandAll = () => {
    if (result?.results) {
      setExpandedQuestions(new Set(result.results.map(r => r.question_id)));
    }
  };

  // Collapse all questions
  const collapseAll = () => {
    setExpandedQuestions(new Set());
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Format answer for display
  const formatAnswer = (answer: any, questionType: string, options?: any[]) => {
    if (answer === null || answer === undefined) {
      return language === 'fr' ? 'Pas de reponse' : 'No answer';
    }

    if (questionType === 'true_false') {
      return answer === true ? t.elearning.trueOption : t.elearning.falseOption;
    }

    if (questionType === 'mcq' && options && typeof answer === 'number') {
      const option = options[answer];
      return option ? (language === 'en' && option.text_en ? option.text_en : option.text_fr) : `Option ${answer + 1}`;
    }

    if (questionType === 'multiple_select' && Array.isArray(answer) && options) {
      return answer.map((idx: number) => {
        const option = options[idx];
        return option ? (language === 'en' && option.text_en ? option.text_en : option.text_fr) : `Option ${idx + 1}`;
      }).join(', ');
    }

    if (typeof answer === 'string') {
      return answer;
    }

    if (Array.isArray(answer)) {
      return answer.join(', ');
    }

    return String(answer);
  };

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

  if (error || !result) {
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

  const { attempt, results, summary } = result;
  const quizTitle = language === 'en' && attempt.quiz_title_en ? attempt.quiz_title_en : attempt.quiz_title_fr;
  const passed = summary.passed;
  const scorePercent = summary.score_percent;
  const showCorrectAnswers = quiz?.show_correct_answers ?? true;
  const showExplanation = quiz?.show_explanation ?? true;
  const allowRetake = quiz?.allow_retake ?? true;
  const passingScore = quiz?.passing_score ?? 70;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-slate-800 border-b border-slate-700 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/${lang}/oh-elearning`}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">{t.common.back}</span>
          </Link>
          <div className="h-6 w-px bg-slate-700" />
          <h1 className="font-medium text-white truncate">{t.elearning.viewResults}</h1>
        </div>
      </header>

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Score Card */}
          <div className={cn(
            'rounded-3xl p-8 mb-8 text-center relative overflow-hidden',
            passed
              ? 'bg-gradient-to-br from-emerald-600/30 to-emerald-900/30 border border-emerald-500/30'
              : 'bg-gradient-to-br from-red-600/30 to-red-900/30 border border-red-500/30'
          )}>
            {/* Background decoration */}
            <div className={cn(
              'absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20',
              passed ? 'bg-emerald-500' : 'bg-red-500'
            )} />
            <div className={cn(
              'absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-20',
              passed ? 'bg-emerald-400' : 'bg-red-400'
            )} />

            {/* Icon */}
            <div className={cn(
              'relative inline-flex items-center justify-center w-24 h-24 rounded-full mb-6',
              passed ? 'bg-emerald-500/20' : 'bg-red-500/20'
            )}>
              {passed ? (
                <Trophy size={48} className="text-emerald-400" />
              ) : (
                <XCircle size={48} className="text-red-400" />
              )}
            </div>

            {/* Quiz Title */}
            <h1 className="text-2xl font-bold text-white mb-2">{quizTitle}</h1>
            <p className={cn(
              'text-lg font-semibold mb-6',
              passed ? 'text-emerald-400' : 'text-red-400'
            )}>
              {passed ? t.elearning.passed : t.elearning.failed}
            </p>

            {/* Score Circle */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-700"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${scorePercent * 4.4} 440`}
                  className={passed ? 'text-emerald-500' : 'text-red-500'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{Math.round(scorePercent)}%</span>
                <span className="text-sm text-slate-400">{t.elearning.yourScore}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <CheckCircle size={24} className="mx-auto mb-2 text-emerald-400" />
                <div className="text-2xl font-bold text-white">{summary.correct}</div>
                <div className="text-sm text-slate-400">
                  {language === 'fr' ? 'Bonnes reponses' : 'Correct'}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <XCircle size={24} className="mx-auto mb-2 text-red-400" />
                <div className="text-2xl font-bold text-white">{summary.incorrect}</div>
                <div className="text-sm text-slate-400">
                  {language === 'fr' ? 'Mauvaises reponses' : 'Incorrect'}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <Target size={24} className="mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold text-white">{passingScore}%</div>
                <div className="text-sm text-slate-400">{t.elearning.passingScore}</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <Clock size={24} className="mx-auto mb-2 text-purple-400" />
                <div className="text-2xl font-bold text-white">{formatTime(attempt.time_spent_seconds)}</div>
                <div className="text-sm text-slate-400">
                  {language === 'fr' ? 'Temps' : 'Time'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            {allowRetake && (
              <Link href={`/${lang}/oh-elearning/quiz/${quizId}`} className="flex-1 sm:flex-none">
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  <RotateCcw size={18} className="mr-2" />
                  {t.elearning.retakeQuiz}
                </Button>
              </Link>
            )}
            <Link href={`/${lang}/oh-elearning`} className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto">
                <BookOpen size={18} className="mr-2" />
                {language === 'fr' ? 'Retour aux cours' : 'Back to courses'}
              </Button>
            </Link>
          </div>

          {/* Questions Review Section */}
          {showCorrectAnswers && results && results.length > 0 && (
            <div className="bg-slate-800/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <HelpCircle size={24} />
                  {language === 'fr' ? 'Revue des questions' : 'Question Review'}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={expandAll}
                    className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
                  >
                    {language === 'fr' ? 'Tout ouvrir' : 'Expand all'}
                  </button>
                  <button
                    onClick={collapseAll}
                    className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
                  >
                    {language === 'fr' ? 'Tout fermer' : 'Collapse all'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {results.map((response, index) => {
                  const isExpanded = expandedQuestions.has(response.question_id);
                  const isCorrect = response.is_correct;
                  const questionText = language === 'en' && response.question_text_en
                    ? response.question_text_en
                    : response.question_text_fr;

                  return (
                    <div
                      key={response.question_id}
                      className={cn(
                        'rounded-xl overflow-hidden transition-all',
                        isCorrect
                          ? 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'bg-red-500/10 border border-red-500/30'
                      )}
                    >
                      {/* Question Header */}
                      <button
                        onClick={() => toggleQuestion(response.question_id)}
                        className="w-full p-4 flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center font-bold',
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          )}>
                            {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                          </span>
                          <div>
                            <div className="text-sm text-slate-400 mb-1">
                              Question {index + 1}
                            </div>
                            <div className="text-white font-medium line-clamp-1">
                              {questionText}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            'text-sm font-medium',
                            isCorrect ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {response.points_earned}/{response.points_possible} pts
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={20} className="text-slate-400" />
                          ) : (
                            <ChevronDown size={20} className="text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-slate-700/50 pt-4">
                          {/* Question Text */}
                          <p className="text-white mb-4">
                            {questionText}
                          </p>

                          {/* Question Image */}
                          {response.image_url && (
                            <div className="mb-4">
                              <img
                                src={response.image_url}
                                alt="Question"
                                className="max-w-full h-auto rounded-lg"
                              />
                            </div>
                          )}

                          {/* Your Answer */}
                          <div className={cn(
                            'p-4 rounded-xl mb-4',
                            isCorrect ? 'bg-emerald-500/20' : 'bg-red-500/20'
                          )}>
                            <div className="text-sm text-slate-400 mb-1">{t.elearning.yourAnswer}</div>
                            <div className={cn(
                              'font-medium',
                              isCorrect ? 'text-emerald-300' : 'text-red-300'
                            )}>
                              {formatAnswer(
                                response.user_answer,
                                response.question_type || 'mcq',
                                response.options
                              )}
                            </div>
                          </div>

                          {/* Correct Answer (if wrong) */}
                          {!isCorrect && response.correct_answer !== undefined && (
                            <div className="p-4 rounded-xl mb-4 bg-emerald-500/20">
                              <div className="text-sm text-slate-400 mb-1">{t.elearning.correctAnswer}</div>
                              <div className="font-medium text-emerald-300">
                                {formatAnswer(
                                  response.correct_answer,
                                  response.question_type || 'mcq',
                                  response.options
                                )}
                              </div>
                            </div>
                          )}

                          {/* Explanation */}
                          {showExplanation && (response.explanation_fr || response.explanation_en) && (
                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                              <div className="text-sm text-blue-400 mb-1 flex items-center gap-2">
                                <Award size={16} />
                                {t.elearning.explanation}
                              </div>
                              <div className="text-slate-300">
                                {language === 'en' && response.explanation_en
                                  ? response.explanation_en
                                  : response.explanation_fr}
                              </div>
                            </div>
                          )}

                          {/* Feedback */}
                          {showExplanation && (response.feedback_fr || response.feedback_en) && (
                            <div className={cn(
                              'p-4 rounded-xl mt-4',
                              isCorrect
                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                : 'bg-yellow-500/10 border border-yellow-500/20'
                            )}>
                              <div className={cn(
                                'text-sm mb-1',
                                isCorrect ? 'text-emerald-400' : 'text-yellow-400'
                              )}>
                                {isCorrect
                                  ? (language === 'fr' ? 'Excellent !' : 'Excellent!')
                                  : (language === 'fr' ? 'Conseil' : 'Tip')}
                              </div>
                              <div className="text-slate-300">
                                {language === 'en' && response.feedback_en
                                  ? response.feedback_en
                                  : response.feedback_fr}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Performance Tip */}
          {!passed && (
            <div className="mt-8 p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start gap-4">
                <TrendingUp size={24} className="text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-2">
                    {language === 'fr' ? 'Conseils pour reussir' : 'Tips to succeed'}
                  </h3>
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>
                      {language === 'fr'
                        ? "Revoyez les questions ou vous avez fait des erreurs"
                        : "Review the questions where you made mistakes"}
                    </li>
                    <li>
                      {language === 'fr'
                        ? "Relisez les lecons liees a ce quiz"
                        : "Re-read the lessons related to this quiz"}
                    </li>
                    <li>
                      {language === 'fr'
                        ? `Vous avez besoin de ${passingScore}% pour reussir`
                        : `You need ${passingScore}% to pass`}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
