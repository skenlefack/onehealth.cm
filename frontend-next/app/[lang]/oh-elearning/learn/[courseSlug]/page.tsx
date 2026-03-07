'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, ChevronDown, ChevronRight, Play, FileText, File,
  CheckCircle, Lock, Menu, X, Clock, Award, ClipboardCheck, Download
} from 'lucide-react';
import { Language, ELearningCourse, ELearningModule, ELearningLesson, ELearningQuiz, QuizAttempt, ELearningCertificate } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import { getELearningCourse, getELearningCourseCurriculum, getImageUrl, API_URL } from '@/lib/api';
import { Button, Spinner } from '@/components/ui';
import { ProgressBar } from '@/components/elearning';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const lang = (params.lang as string) || 'fr';
  const courseSlug = params.courseSlug as string;
  const hasRedirected = useRef(false);

  if (!isValidLanguage(lang)) {
    return null;
  }

  const language = lang as Language;
  const t = getTranslation(language);

  const [course, setCourse] = useState<ELearningCourse | null>(null);
  const [modules, setModules] = useState<ELearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());

  // Quiz-only course state
  const [finalQuiz, setFinalQuiz] = useState<ELearningQuiz | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [certificate, setCertificate] = useState<ELearningCertificate | null>(null);
  const [isQuizOnlyCourse, setIsQuizOnlyCourse] = useState(false);

  // Find the lesson to continue (first incomplete or first lesson)
  const findContinueLesson = (mods: ELearningModule[]): ELearningLesson | null => {
    // First, find the first incomplete lesson
    for (const module of mods) {
      if (module.lessons) {
        for (const lesson of module.lessons) {
          if (!lesson.is_completed && !lesson.is_locked) {
            return lesson;
          }
        }
      }
    }
    // If all completed, return the first lesson
    for (const module of mods) {
      if (module.lessons && module.lessons.length > 0) {
        return module.lessons[0];
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const courseRes = await getELearningCourse(courseSlug);
        if (courseRes.success && courseRes.data) {
          setCourse(courseRes.data);

          // Fetch curriculum with auth token to get progress info
          const curriculumRes = await getELearningCourseCurriculum(courseRes.data.id, token || undefined);
          if (curriculumRes.success) {
            setModules(curriculumRes.data.modules);

            // Check if this is a quiz-only course (no modules but has final quiz)
            const hasNoModules = !curriculumRes.data.modules || curriculumRes.data.modules.length === 0;
            const hasFinalQuiz = !!courseRes.data.final_quiz_id;

            if (hasNoModules && hasFinalQuiz) {
              setIsQuizOnlyCourse(true);

              // Fetch final quiz info
              try {
                const quizRes = await fetch(`${API_URL}/elearning/quizzes/${courseRes.data.final_quiz_id}`, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const quizData = await quizRes.json();
                if (quizData.success) {
                  setFinalQuiz(quizData.data);
                }
              } catch (e) {
                console.error('Error fetching final quiz:', e);
              }

              // Fetch quiz attempts if user is authenticated
              if (token) {
                try {
                  const attemptsRes = await fetch(`${API_URL}/elearning/quizzes/${courseRes.data.final_quiz_id}/my-attempts`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const attemptsData = await attemptsRes.json();
                  if (attemptsData.success) {
                    setQuizAttempts(attemptsData.data || []);

                    // Check if user passed and has certificate
                    const passedAttempt = (attemptsData.data || []).find((a: QuizAttempt) => a.passed);
                    if (passedAttempt) {
                      // Fetch certificate
                      try {
                        const certRes = await fetch(`${API_URL}/elearning/certificates/my?enrollable_type=course&enrollable_id=${courseRes.data.id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        const certData = await certRes.json();
                        if (certData.success && certData.data && certData.data.length > 0) {
                          setCertificate(certData.data[0]);
                        }
                      } catch (e) {
                        console.error('Error fetching certificate:', e);
                      }
                    }
                  }
                } catch (e) {
                  console.error('Error fetching quiz attempts:', e);
                }
              }
            } else {
              // Regular course with modules
              // Auto-redirect to continue lesson if user has progress
              if (!hasRedirected.current && curriculumRes.data.modules.length > 0) {
                const continueLesson = findContinueLesson(curriculumRes.data.modules);
                if (continueLesson) {
                  hasRedirected.current = true;
                  router.replace(`/${lang}/oh-elearning/learn/${courseSlug}/${continueLesson.id}`);
                  return;
                }
              }

              // Expand first module by default
              if (curriculumRes.data.modules.length > 0) {
                setExpandedModules(new Set([curriculumRes.data.modules[0].id]));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseSlug, token, lang, router]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const getFirstLesson = (): ELearningLesson | null => {
    for (const module of modules) {
      if (module.lessons && module.lessons.length > 0) {
        return module.lessons[0];
      }
    }
    return null;
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play size={14} />;
      case 'pdf':
        return <File size={14} />;
      case 'quiz':
        return <FileText size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            {language === 'fr' ? 'Cours non trouvé' : 'Course not found'}
          </h2>
          <Link href={`/${lang}/oh-elearning/courses`}>
            <Button variant="outline">{t.common.back}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = language === 'en' && course.title_en ? course.title_en : course.title_fr;
  const progress = course.progress_percent || 0;
  const firstLesson = getFirstLesson();

  // Render quiz-only course view
  if (isQuizOnlyCourse) {
    const bestAttempt = quizAttempts.length > 0
      ? quizAttempts.reduce((best, current) =>
          (current.score_percent || 0) > (best.score_percent || 0) ? current : best
        )
      : null;
    const hasPassed = bestAttempt?.passed || false;
    const attemptsUsed = quizAttempts.filter(a => a.status === 'completed').length;
    const maxAttempts = finalQuiz?.max_attempts || 3;
    const canRetake = !hasPassed && attemptsUsed < maxAttempts;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white pt-28 pb-12 px-[5%]">
          <div className="max-w-4xl mx-auto">
            <Link
              href={`/${lang}/oh-elearning/courses/${courseSlug}`}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft size={18} />
              {t.common.back}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
            {course.short_description_fr && (
              <p className="text-lg text-white/90">{course.short_description_fr}</p>
            )}
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-[5%] py-12">
          {/* Certificate Section - Show if passed */}
          {hasPassed && certificate && (
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border-2 border-emerald-200 p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Award size={48} className="text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-emerald-800 mb-2">
                    {language === 'fr' ? 'Félicitations !' : 'Congratulations!'}
                  </h2>
                  <p className="text-emerald-700 mb-4">
                    {language === 'fr'
                      ? `Vous avez réussi l'évaluation avec un score de ${bestAttempt?.score_percent?.toFixed(0)}%. Votre certificat est prêt.`
                      : `You passed the assessment with a score of ${bestAttempt?.score_percent?.toFixed(0)}%. Your certificate is ready.`}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Link href={`/${lang}/oh-elearning/certificate/verify/${certificate.verification_code}`}>
                      <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700">
                        <Award size={18} className="mr-2" />
                        {language === 'fr' ? 'Voir le certificat' : 'View certificate'}
                      </Button>
                    </Link>
                    {certificate.pdf_url && (
                      <a href={getImageUrl(certificate.pdf_url)} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                          <Download size={18} className="mr-2" />
                          {language === 'fr' ? 'Télécharger PDF' : 'Download PDF'}
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ClipboardCheck size={28} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {finalQuiz
                      ? (language === 'en' && finalQuiz.title_en ? finalQuiz.title_en : finalQuiz.title_fr)
                      : (language === 'fr' ? 'Évaluation finale' : 'Final Assessment')}
                  </h2>
                  <p className="text-slate-500">
                    {language === 'fr' ? 'Testez vos connaissances' : 'Test your knowledge'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Quiz Info */}
              {finalQuiz && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-bold text-slate-800">
                      {finalQuiz.question_count || finalQuiz.total_questions || '?'}
                    </div>
                    <div className="text-sm text-slate-500">
                      {language === 'fr' ? 'Questions' : 'Questions'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-bold text-slate-800">
                      {finalQuiz.time_limit_minutes || '∞'}
                    </div>
                    <div className="text-sm text-slate-500">
                      {language === 'fr' ? 'Minutes' : 'Minutes'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-bold text-slate-800">
                      {finalQuiz.passing_score}%
                    </div>
                    <div className="text-sm text-slate-500">
                      {language === 'fr' ? 'Score requis' : 'Passing score'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-bold text-slate-800">
                      {attemptsUsed}/{maxAttempts}
                    </div>
                    <div className="text-sm text-slate-500">
                      {language === 'fr' ? 'Tentatives' : 'Attempts'}
                    </div>
                  </div>
                </div>
              )}

              {/* Best Score */}
              {bestAttempt && (
                <div className={cn(
                  'p-4 rounded-xl mb-6',
                  hasPassed ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn('font-medium', hasPassed ? 'text-emerald-800' : 'text-amber-800')}>
                        {language === 'fr' ? 'Meilleur score' : 'Best score'}
                      </p>
                      <p className={cn('text-sm', hasPassed ? 'text-emerald-600' : 'text-amber-600')}>
                        {hasPassed
                          ? (language === 'fr' ? 'Vous avez réussi !' : 'You passed!')
                          : (language === 'fr' ? 'Score insuffisant' : 'Score not sufficient')}
                      </p>
                    </div>
                    <div className={cn(
                      'text-3xl font-bold',
                      hasPassed ? 'text-emerald-600' : 'text-amber-600'
                    )}>
                      {bestAttempt.score_percent?.toFixed(0)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="text-center">
                {!token ? (
                  <div>
                    <p className="text-slate-600 mb-4">
                      {language === 'fr'
                        ? 'Connectez-vous pour passer l\'évaluation'
                        : 'Log in to take the assessment'}
                    </p>
                    <Link href={`/${lang}/auth/login?redirect=${encodeURIComponent(`/${lang}/oh-elearning/learn/${courseSlug}`)}`}>
                      <Button variant="primary" size="lg" className="bg-blue-600 hover:bg-blue-700">
                        {language === 'fr' ? 'Se connecter' : 'Log in'}
                      </Button>
                    </Link>
                  </div>
                ) : hasPassed ? (
                  <div>
                    <p className="text-emerald-600 font-medium mb-4">
                      <CheckCircle size={20} className="inline mr-2" />
                      {language === 'fr'
                        ? 'Évaluation réussie'
                        : 'Assessment passed'}
                    </p>
                    {canRetake && (
                      <Link href={`/${lang}/oh-elearning/quiz/${course.final_quiz_id}`}>
                        <Button variant="outline">
                          {language === 'fr' ? 'Repasser le quiz' : 'Retake quiz'}
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : canRetake ? (
                  <Link href={`/${lang}/oh-elearning/quiz/${course.final_quiz_id}`}>
                    <Button variant="primary" size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Play size={20} className="mr-2" />
                      {attemptsUsed === 0
                        ? (language === 'fr' ? 'Commencer l\'évaluation' : 'Start assessment')
                        : (language === 'fr' ? 'Réessayer' : 'Try again')}
                    </Button>
                  </Link>
                ) : (
                  <div className="text-red-600">
                    <p className="font-medium">
                      {language === 'fr'
                        ? 'Nombre maximum de tentatives atteint'
                        : 'Maximum attempts reached'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Previous Attempts */}
          {quizAttempts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                {language === 'fr' ? 'Historique des tentatives' : 'Attempt history'}
              </h3>
              <div className="space-y-3">
                {quizAttempts
                  .filter(a => a.status === 'completed')
                  .sort((a, b) => new Date(b.completed_at || b.started_at).getTime() - new Date(a.completed_at || a.started_at).getTime())
                  .map((attempt, idx) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                          attempt.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                        )}>
                          {quizAttempts.filter(a => a.status === 'completed').length - idx}
                        </span>
                        <div>
                          <p className="font-medium text-slate-800">
                            {language === 'fr' ? 'Tentative' : 'Attempt'} #{attempt.attempt_number}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(attempt.completed_at || attempt.started_at).toLocaleDateString(language, {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          'text-lg font-bold',
                          attempt.passed ? 'text-emerald-600' : 'text-slate-600'
                        )}>
                          {attempt.score_percent?.toFixed(0)}%
                        </span>
                        {attempt.passed && (
                          <CheckCircle size={20} className="text-emerald-500" />
                        )}
                        <Link href={`/${lang}/oh-elearning/quiz/${course.final_quiz_id}/results/${attempt.id}`}>
                          <Button variant="ghost" size="sm">
                            {language === 'fr' ? 'Détails' : 'Details'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center px-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Toggle sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Back to course */}
          <Link
            href={`/${lang}/oh-elearning/courses/${courseSlug}`}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">{t.common.back}</span>
          </Link>

          {/* Course title */}
          <h1 className="font-semibold text-slate-800 truncate hidden md:block">
            {title}
          </h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block w-32">
            <ProgressBar progress={progress} lang={language} size="sm" />
          </div>
          <span className="text-sm font-medium text-slate-600">
            {Math.round(progress)}%
          </span>
        </div>
      </header>

      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed left-0 top-16 bottom-0 w-80 bg-white border-r border-slate-200 overflow-y-auto transition-transform duration-300 z-40',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Course info */}
          <div className="p-4 border-b border-slate-200">
            {course.thumbnail && (
              <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                <Image
                  src={getImageUrl(course.thumbnail)}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <h2 className="font-semibold text-slate-800 mb-1">{title}</h2>
            <p className="text-sm text-slate-500">
              {modules.length} {t.elearning.modules}
            </p>
          </div>

          {/* Curriculum */}
          <nav className="p-2">
            {modules.map((module, moduleIdx) => (
              <div key={module.id} className="mb-1">
                {/* Module header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                >
                  <span className="w-7 h-7 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {moduleIdx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">
                      {language === 'en' && module.title_en ? module.title_en : module.title_fr}
                    </p>
                    <p className="text-xs text-slate-500">
                      {module.lessons?.length || 0} {t.elearning.lessons}
                    </p>
                  </div>
                  {expandedModules.has(module.id) ? (
                    <ChevronDown size={18} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={18} className="text-slate-400" />
                  )}
                </button>

                {/* Lessons */}
                {expandedModules.has(module.id) && module.lessons && (
                  <div className="ml-4 pl-4 border-l-2 border-slate-100">
                    {module.lessons.map((lesson, lessonIdx) => (
                      <Link
                        key={lesson.id}
                        href={`/${lang}/oh-elearning/learn/${courseSlug}/${lesson.id}`}
                        className={cn(
                          'flex items-center gap-3 p-2 rounded-lg transition-colors text-sm',
                          lesson.is_completed
                            ? 'text-emerald-600 bg-emerald-50'
                            : lesson.is_locked
                              ? 'text-slate-400 cursor-not-allowed'
                              : 'text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {lesson.is_completed ? (
                            <CheckCircle size={16} className="text-emerald-500" />
                          ) : lesson.is_locked ? (
                            <Lock size={14} />
                          ) : (
                            getLessonIcon(lesson.content_type)
                          )}
                        </span>
                        <span className="flex-1 truncate">
                          {language === 'en' && lesson.title_en ? lesson.title_en : lesson.title_fr}
                        </span>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {lesson.duration_minutes}m
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main
          className={cn(
            'flex-1 transition-all duration-300',
            sidebarOpen ? 'ml-80' : 'ml-0'
          )}
        >
          <div className="max-w-4xl mx-auto p-6">
            {/* Welcome message */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                <Play size={32} className="text-blue-600 ml-1" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                {language === 'fr' ? 'Bienvenue dans ce cours !' : 'Welcome to this course!'}
              </h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {language === 'fr'
                  ? 'Sélectionnez une leçon dans le menu à gauche pour commencer votre apprentissage.'
                  : 'Select a lesson from the menu on the left to start learning.'}
              </p>

              {firstLesson && (
                <Link href={`/${lang}/oh-elearning/learn/${courseSlug}/${firstLesson.id}`}>
                  <Button variant="primary" size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Play size={20} className="mr-2" />
                    {t.elearning.start}
                  </Button>
                </Link>
              )}

              {/* Course stats */}
              <div className="flex justify-center gap-8 mt-8 pt-8 border-t border-slate-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">{modules.length}</div>
                  <div className="text-sm text-slate-500">{t.elearning.modules}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">
                    {modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-slate-500">{t.elearning.lessons}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">{course.duration_hours}h</div>
                  <div className="text-sm text-slate-500">{t.elearning.duration}</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
