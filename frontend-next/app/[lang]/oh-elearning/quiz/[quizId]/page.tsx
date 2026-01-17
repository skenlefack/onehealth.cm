'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Clock, Target, AlertCircle, Play, RotateCcw,
  CheckCircle, XCircle, Award, History, BookOpen, Timer,
  HelpCircle, ListChecks, Shuffle, Eye, EyeOff
} from 'lucide-react';
import { Language, ELearningQuiz, QuizAttempt } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import { getQuiz, getQuizHistory } from '@/lib/api';
import { Button, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

export default function QuizIntroPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const lang = (params.lang as string) || 'fr';
  const quizId = parseInt(params.quizId as string);

  if (!isValidLanguage(lang)) {
    return null;
  }

  const language = lang as Language;
  const t = getTranslation(language);

  // States
  const [quiz, setQuiz] = useState<ELearningQuiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch quiz and attempts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get quiz details
        const quizRes = await getQuiz(quizId, token || undefined);
        if (!quizRes.success || !quizRes.data) {
          setError(language === 'fr' ? 'Quiz non trouve' : 'Quiz not found');
          setLoading(false);
          return;
        }
        setQuiz(quizRes.data);

        // Get attempts if logged in
        if (token) {
          const attemptsRes = await getQuizHistory(quizId, token);
          if (attemptsRes.success && attemptsRes.data) {
            setAttempts(attemptsRes.data);
          }
        }
      } catch (err) {
        setError(language === 'fr' ? 'Erreur de connexion' : 'Connection error');
      }
      setLoading(false);
    };

    fetchData();
  }, [quizId, token, language]);

  // Find in-progress attempt
  const inProgressAttempt = attempts.find(a => a.status === 'in_progress');
  const completedAttempts = attempts.filter(a => a.status === 'completed');
  const bestAttempt = completedAttempts.reduce((best, curr) =>
    (!best || (curr.score_percent || 0) > (best.score_percent || 0)) ? curr : best,
    null as QuizAttempt | null
  );

  // Calculate remaining attempts
  const maxAttempts = quiz?.max_attempts || 0;
  const usedAttempts = attempts.filter(a => a.status !== 'in_progress').length;
  const canStartNew = maxAttempts === 0 || usedAttempts < maxAttempts;

  // Format time
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Start or resume quiz
  const handleStartQuiz = () => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/${lang}/auth/login?redirect=/${lang}/oh-elearning/quiz/${quizId}`);
      return;
    }
    router.push(`/${lang}/oh-elearning/quiz/${quizId}/take`);
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
  const quizDescription = language === 'en' && quiz.description_en ? quiz.description_en : quiz.description_fr;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-slate-800 border-b border-slate-700 z-50 flex items-center px-4">
        <Link
          href={`/${lang}/oh-elearning`}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">{t.common.back}</span>
        </Link>
      </header>

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Quiz Header Card */}
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl p-8 mb-8 border border-blue-500/20">
            {/* Quiz Type Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                quiz.quiz_type === 'practice' && 'bg-emerald-500/20 text-emerald-400',
                quiz.quiz_type === 'graded' && 'bg-blue-500/20 text-blue-400',
                quiz.quiz_type === 'final_exam' && 'bg-purple-500/20 text-purple-400'
              )}>
                {quiz.quiz_type === 'practice' && (language === 'fr' ? 'Entrainement' : 'Practice')}
                {quiz.quiz_type === 'graded' && (language === 'fr' ? 'Note' : 'Graded')}
                {quiz.quiz_type === 'final_exam' && (language === 'fr' ? 'Examen final' : 'Final Exam')}
              </span>
            </div>

            {/* Quiz Title */}
            <h1 className="text-3xl font-bold text-white mb-4">{quizTitle}</h1>

            {/* Description */}
            {quizDescription && (
              <p className="text-slate-300 mb-6 leading-relaxed">{quizDescription}</p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <HelpCircle size={24} className="mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold text-white">{quiz.question_count || '?'}</div>
                <div className="text-sm text-slate-400">
                  {language === 'fr' ? 'Questions' : 'Questions'}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <Timer size={24} className="mx-auto mb-2 text-orange-400" />
                <div className="text-2xl font-bold text-white">
                  {quiz.time_limit_minutes ? `${quiz.time_limit_minutes}m` : '--'}
                </div>
                <div className="text-sm text-slate-400">
                  {language === 'fr' ? 'Temps limite' : 'Time Limit'}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <Target size={24} className="mx-auto mb-2 text-emerald-400" />
                <div className="text-2xl font-bold text-white">{quiz.passing_score}%</div>
                <div className="text-sm text-slate-400">{t.elearning.passingScore}</div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <RotateCcw size={24} className="mx-auto mb-2 text-purple-400" />
                <div className="text-2xl font-bold text-white">
                  {maxAttempts === 0 ? (language === 'fr' ? 'Illimite' : 'Unlimited') : maxAttempts}
                </div>
                <div className="text-sm text-slate-400">{t.elearning.maxAttempts}</div>
              </div>
            </div>
          </div>

          {/* Quiz Settings Info */}
          <div className="bg-slate-800/50 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ListChecks size={20} />
              {language === 'fr' ? 'Parametres du quiz' : 'Quiz Settings'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Shuffle size={18} className={quiz.shuffle_questions ? 'text-emerald-400' : 'text-slate-500'} />
                <span>
                  {language === 'fr' ? 'Questions melanges' : 'Shuffled questions'}
                  {quiz.shuffle_questions ? (
                    <CheckCircle size={14} className="inline ml-2 text-emerald-400" />
                  ) : (
                    <XCircle size={14} className="inline ml-2 text-slate-500" />
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                {quiz.show_correct_answers ? <Eye size={18} className="text-emerald-400" /> : <EyeOff size={18} className="text-slate-500" />}
                <span>
                  {language === 'fr' ? 'Afficher les reponses' : 'Show correct answers'}
                  {quiz.show_correct_answers ? (
                    <CheckCircle size={14} className="inline ml-2 text-emerald-400" />
                  ) : (
                    <XCircle size={14} className="inline ml-2 text-slate-500" />
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <BookOpen size={18} className={quiz.show_explanation ? 'text-emerald-400' : 'text-slate-500'} />
                <span>
                  {language === 'fr' ? 'Afficher les explications' : 'Show explanations'}
                  {quiz.show_explanation ? (
                    <CheckCircle size={14} className="inline ml-2 text-emerald-400" />
                  ) : (
                    <XCircle size={14} className="inline ml-2 text-slate-500" />
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <RotateCcw size={18} className={quiz.allow_retake ? 'text-emerald-400' : 'text-slate-500'} />
                <span>
                  {language === 'fr' ? 'Reprises autorisees' : 'Retakes allowed'}
                  {quiz.allow_retake ? (
                    <CheckCircle size={14} className="inline ml-2 text-emerald-400" />
                  ) : (
                    <XCircle size={14} className="inline ml-2 text-slate-500" />
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Best Score (if any) */}
          {bestAttempt && (
            <div className={cn(
              'rounded-2xl p-6 mb-8 border',
              bestAttempt.passed
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-yellow-500/10 border-yellow-500/30'
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    bestAttempt.passed ? 'bg-emerald-500/20' : 'bg-yellow-500/20'
                  )}>
                    <Award size={24} className={bestAttempt.passed ? 'text-emerald-400' : 'text-yellow-400'} />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">
                      {language === 'fr' ? 'Meilleur score' : 'Best Score'}
                    </div>
                    <div className={cn(
                      'text-2xl font-bold',
                      bestAttempt.passed ? 'text-emerald-400' : 'text-yellow-400'
                    )}>
                      {Math.round(bestAttempt.score_percent || 0)}%
                    </div>
                  </div>
                </div>
                <div className={cn(
                  'px-4 py-2 rounded-lg font-medium',
                  bestAttempt.passed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                )}>
                  {bestAttempt.passed ? t.elearning.passed : t.elearning.failed}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            {/* Resume In-Progress */}
            {inProgressAttempt && (
              <button
                onClick={handleStartQuiz}
                className="w-full p-6 bg-yellow-500/20 border border-yellow-500/30 rounded-2xl flex items-center justify-between hover:bg-yellow-500/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Play size={24} className="text-yellow-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">{t.elearning.continueQuiz}</div>
                    <div className="text-sm text-slate-400">
                      {language === 'fr' ? 'Tentative en cours' : 'Attempt in progress'} -
                      {' '}{formatDate(inProgressAttempt.started_at)}
                    </div>
                  </div>
                </div>
                <ArrowLeft size={20} className="text-yellow-400 rotate-180" />
              </button>
            )}

            {/* Start New Quiz */}
            {!inProgressAttempt && canStartNew && (
              <button
                onClick={handleStartQuiz}
                className="w-full p-6 bg-blue-600 hover:bg-blue-700 rounded-2xl flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Play size={24} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">{t.elearning.startQuiz}</div>
                    {maxAttempts > 0 && (
                      <div className="text-sm text-blue-200">
                        {t.elearning.attemptsUsed
                          .replace('{used}', String(usedAttempts))
                          .replace('{max}', String(maxAttempts))}
                      </div>
                    )}
                  </div>
                </div>
                <ArrowLeft size={20} className="text-white rotate-180" />
              </button>
            )}

            {/* No more attempts */}
            {!inProgressAttempt && !canStartNew && (
              <div className="w-full p-6 bg-slate-700/50 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <XCircle size={24} className="text-red-400" />
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {language === 'fr' ? 'Plus de tentatives disponibles' : 'No more attempts available'}
                  </div>
                  <div className="text-sm text-slate-400">
                    {t.elearning.attemptsUsed
                      .replace('{used}', String(usedAttempts))
                      .replace('{max}', String(maxAttempts))}
                  </div>
                </div>
              </div>
            )}

            {/* Login prompt for non-authenticated users */}
            {!user && (
              <div className="text-center text-slate-400 text-sm">
                {language === 'fr'
                  ? 'Connectez-vous pour sauvegarder votre progression'
                  : 'Log in to save your progress'}
              </div>
            )}
          </div>

          {/* Attempt History */}
          {completedAttempts.length > 0 && (
            <div className="bg-slate-800/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <History size={20} />
                {t.elearning.quizHistory}
              </h2>

              <div className="space-y-3">
                {completedAttempts.map((attempt) => (
                  <Link
                    key={attempt.id}
                    href={`/${lang}/oh-elearning/quiz/${quizId}/results/${attempt.id}`}
                    className="block p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          attempt.passed ? 'bg-emerald-500/20' : 'bg-red-500/20'
                        )}>
                          {attempt.passed ? (
                            <CheckCircle size={20} className="text-emerald-400" />
                          ) : (
                            <XCircle size={20} className="text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {t.elearning.attempt} #{attempt.attempt_number}
                          </div>
                          <div className="text-sm text-slate-400">
                            {formatDate(attempt.completed_at || attempt.started_at)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={cn(
                          'text-lg font-bold',
                          attempt.passed ? 'text-emerald-400' : 'text-red-400'
                        )}>
                          {Math.round(attempt.score_percent || 0)}%
                        </div>
                        <div className="text-sm text-slate-400">
                          {formatDuration(attempt.time_spent_seconds)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
