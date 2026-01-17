'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Play, FileText, File,
  CheckCircle, Lock, Menu, X, Download, LogIn
} from 'lucide-react';
import { Language, ELearningCourse, ELearningModule, ELearningLesson } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import {
  getELearningCourse, getELearningCourseCurriculum, getELearningLesson,
  getImageUrl, completeLesson, updateLessonProgress
} from '@/lib/api';
import { Button, Spinner } from '@/components/ui';
import { ProgressBar, VideoPlayer, VideoProgressData } from '@/components/elearning';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';

export default function LessonViewerPage() {
  const params = useParams();
  const { token, isAuthenticated, user } = useAuth();
  const lang = (params.lang as string) || 'fr';
  const courseSlug = params.courseSlug as string;
  const lessonId = parseInt(params.lessonId as string);

  if (!isValidLanguage(lang)) {
    return null;
  }

  const language = lang as Language;
  const t = getTranslation(language);

  const [course, setCourse] = useState<ELearningCourse | null>(null);
  const [modules, setModules] = useState<ELearningModule[]>([]);
  const [currentLesson, setCurrentLesson] = useState<ELearningLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [isCompleting, setIsCompleting] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Ref pour éviter les sauvegardes multiples
  const lastSavedProgressRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course
        const courseRes = await getELearningCourse(courseSlug);
        if (courseRes.success && courseRes.data) {
          setCourse(courseRes.data);

          // Fetch curriculum
          const curriculumRes = await getELearningCourseCurriculum(courseRes.data.id);
          if (curriculumRes.success) {
            setModules(curriculumRes.data.modules);

            // Find and expand the module containing current lesson
            for (const module of curriculumRes.data.modules) {
              if (module.lessons?.some((l) => l.id === lessonId)) {
                setExpandedModules(new Set([module.id]));
                break;
              }
            }
          }

          // Fetch lesson details with auth token if available
          const lessonRes = await getELearningLesson(lessonId, token || undefined);
          if (lessonRes.success) {
            setCurrentLesson(lessonRes.data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseSlug, lessonId, token]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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

  const getAllLessons = (): ELearningLesson[] => {
    const lessons: ELearningLesson[] = [];
    modules.forEach((m) => {
      if (m.lessons) {
        lessons.push(...m.lessons);
      }
    });
    return lessons;
  };

  const getCurrentLessonIndex = (): number => {
    const lessons = getAllLessons();
    return lessons.findIndex((l) => l.id === lessonId);
  };

  const getPrevLesson = (): ELearningLesson | null => {
    const lessons = getAllLessons();
    const idx = getCurrentLessonIndex();
    return idx > 0 ? lessons[idx - 1] : null;
  };

  const getNextLesson = (): ELearningLesson | null => {
    const lessons = getAllLessons();
    const idx = getCurrentLessonIndex();
    return idx < lessons.length - 1 ? lessons[idx + 1] : null;
  };

  // Sauvegarder la progression vidéo
  const saveVideoProgress = useCallback(async (data: VideoProgressData) => {
    if (!token || !currentLesson) return;

    // Éviter les sauvegardes trop fréquentes (min 5% de différence)
    const progressDiff = Math.abs(data.progressPercent - lastSavedProgressRef.current);
    if (progressDiff < 5 && !data.isComplete) return;

    try {
      await updateLessonProgress(
        lessonId,
        {
          progress_percent: Math.round(data.progressPercent),
          video_position: Math.floor(data.currentTime),
          time_spent: Math.floor(data.watchedTime)
        },
        token
      );
      lastSavedProgressRef.current = data.progressPercent;
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [token, lessonId, currentLesson]);

  // Handler pour la progression vidéo
  const handleVideoProgress = useCallback((data: VideoProgressData) => {
    setVideoProgress(data.progressPercent);

    // Sauvegarder avec debounce
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveVideoProgress(data);
    }, 2000);
  }, [saveVideoProgress]);

  // Handler pour la complétion de la vidéo
  const handleVideoComplete = useCallback(async () => {
    if (!token || !currentLesson || currentLesson.is_completed) return;

    try {
      await completeLesson(lessonId, token);
      setCurrentLesson({ ...currentLesson, is_completed: true });
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  }, [token, lessonId, currentLesson]);

  const handleMarkComplete = async () => {
    if (!currentLesson || currentLesson.is_completed) return;

    if (!token) {
      setShowLoginPrompt(true);
      return;
    }

    setIsCompleting(true);
    try {
      await completeLesson(lessonId, token);
      setCurrentLesson({ ...currentLesson, is_completed: true });
    } catch (error) {
      console.error('Error completing lesson:', error);
    } finally {
      setIsCompleting(false);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Spinner />
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            {language === 'fr' ? 'Leçon non trouvée' : 'Lesson not found'}
          </h2>
          <Link href={`/${lang}/oh-elearning/courses/${courseSlug}`}>
            <Button variant="outline">{t.common.back}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const lessonTitle = language === 'en' && currentLesson.title_en
    ? currentLesson.title_en
    : currentLesson.title_fr;
  const lessonContent = language === 'en' && currentLesson.content_en
    ? currentLesson.content_en
    : currentLesson.content_fr;

  const prevLesson = getPrevLesson();
  const nextLesson = getNextLesson();
  const courseProgress = course.progress_percent || 0;

  // Position initiale pour la reprise de lecture
  const initialVideoPosition = currentLesson.video_last_position || 0;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-3">
              {language === 'fr' ? 'Connexion requise' : 'Login Required'}
            </h3>
            <p className="text-slate-300 mb-6">
              {language === 'fr'
                ? 'Connectez-vous pour sauvegarder votre progression et obtenir un certificat.'
                : 'Log in to save your progress and earn a certificate.'}
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1"
              >
                {language === 'fr' ? 'Plus tard' : 'Later'}
              </Button>
              <Link href={`/${lang}/oh-elearning/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="flex-1">
                <Button variant="primary" className="w-full bg-blue-600 hover:bg-blue-700">
                  <LogIn size={18} className="mr-2" />
                  {language === 'fr' ? 'Se connecter' : 'Log in'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-slate-800 border-b border-slate-700 z-50 flex items-center px-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Toggle sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-300"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Back to course */}
          <Link
            href={`/${lang}/oh-elearning/courses/${courseSlug}`}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline text-sm">{t.common.back}</span>
          </Link>

          {/* Lesson title */}
          <h1 className="font-medium text-white truncate text-sm">
            {lessonTitle}
          </h1>
        </div>

        {/* Progress & User */}
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <span className="text-xs text-slate-400 hidden md:block">
              {user?.username}
            </span>
          )}
          <div className="hidden sm:block w-24">
            <ProgressBar progress={courseProgress} lang={language} size="sm" />
          </div>
          <span className="text-sm font-medium text-slate-400">
            {Math.round(courseProgress)}%
          </span>
        </div>
      </header>

      <div className="pt-14 flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed left-0 top-14 bottom-0 w-72 bg-slate-800 border-r border-slate-700 overflow-y-auto transition-transform duration-300 z-40',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <nav className="p-2">
            {modules.map((module, moduleIdx) => (
              <div key={module.id} className="mb-1">
                {/* Module header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-slate-700 rounded-lg transition-colors text-left"
                >
                  <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {moduleIdx + 1}
                  </span>
                  <p className="font-medium text-white text-sm truncate flex-1">
                    {language === 'en' && module.title_en ? module.title_en : module.title_fr}
                  </p>
                  {expandedModules.has(module.id) ? (
                    <ChevronLeft size={16} className="text-slate-400 rotate-90" />
                  ) : (
                    <ChevronLeft size={16} className="text-slate-400 -rotate-90" />
                  )}
                </button>

                {/* Lessons */}
                {expandedModules.has(module.id) && module.lessons && (
                  <div className="ml-3 pl-3 border-l border-slate-700">
                    {module.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/${lang}/oh-elearning/learn/${courseSlug}/${lesson.id}`}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-lg transition-colors text-sm',
                          lesson.id === lessonId
                            ? 'bg-blue-600 text-white'
                            : lesson.is_completed
                              ? 'text-emerald-400 hover:bg-slate-700'
                              : lesson.is_locked
                                ? 'text-slate-500 cursor-not-allowed'
                                : 'text-slate-300 hover:bg-slate-700'
                        )}
                      >
                        <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {lesson.is_completed ? (
                            <CheckCircle size={14} />
                          ) : lesson.is_locked ? (
                            <Lock size={12} />
                          ) : (
                            getLessonIcon(lesson.content_type)
                          )}
                        </span>
                        <span className="flex-1 truncate">
                          {language === 'en' && lesson.title_en ? lesson.title_en : lesson.title_fr}
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
            'flex-1 transition-all duration-300 min-h-[calc(100vh-3.5rem)]',
            sidebarOpen ? 'ml-72' : 'ml-0'
          )}
        >
          {/* Video content with new VideoPlayer */}
          {currentLesson.content_type === 'video' && currentLesson.video_url && (
            <div className="max-h-[70vh]">
              <VideoPlayer
                src={getImageUrl(currentLesson.video_url)}
                provider={currentLesson.video_provider as any}
                poster={course.thumbnail ? getImageUrl(course.thumbnail) : undefined}
                title={lessonTitle}
                lang={language}
                initialPosition={initialVideoPosition}
                minWatchPercent={currentLesson.min_video_watch_percent || 80}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
                autoSaveInterval={10000}
              />
            </div>
          )}

          {/* PDF content */}
          {currentLesson.content_type === 'pdf' && currentLesson.pdf_url && (
            <div className="bg-slate-800 p-4">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg p-8 text-center">
                  <File size={48} className="mx-auto text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    {language === 'fr' ? 'Document PDF' : 'PDF Document'}
                  </h3>
                  <p className="text-slate-600 mb-4">{lessonTitle}</p>
                  <a
                    href={getImageUrl(currentLesson.pdf_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="primary" className="bg-red-500 hover:bg-red-600">
                      <Download size={18} className="mr-2" />
                      {language === 'fr' ? 'Télécharger le PDF' : 'Download PDF'}
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Text content */}
          <div className="max-w-4xl mx-auto p-6">
            {/* Lesson header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">{lessonTitle}</h2>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>{currentLesson.duration_minutes} min</span>
                {currentLesson.content_type === 'video' && videoProgress > 0 && (
                  <span className="text-blue-400">
                    {language === 'fr' ? 'Vu' : 'Watched'}: {Math.round(videoProgress)}%
                  </span>
                )}
                {currentLesson.is_completed && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle size={16} />
                    {t.elearning.completed}
                  </span>
                )}
              </div>
            </div>

            {/* Auth reminder for non-logged users */}
            {!isAuthenticated && (
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
                <p className="text-blue-200 text-sm">
                  {language === 'fr'
                    ? 'Connectez-vous pour sauvegarder votre progression automatiquement.'
                    : 'Log in to save your progress automatically.'}
                </p>
              </div>
            )}

            {/* Text content */}
            {(currentLesson.content_type === 'text' || currentLesson.content_type === 'mixed') && lessonContent && (
              <div
                className="prose prose-invert max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: lessonContent }}
              />
            )}

            {/* Attachments */}
            {currentLesson.attachments && currentLesson.attachments.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-4 mb-8">
                <h3 className="font-semibold text-white mb-3">
                  {language === 'fr' ? 'Ressources' : 'Resources'}
                </h3>
                <div className="space-y-2">
                  {currentLesson.attachments.map((attachment, idx) => (
                    <a
                      key={idx}
                      href={getImageUrl(attachment.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      <File size={20} className="text-slate-400" />
                      <span className="text-sm text-white flex-1">{attachment.name}</span>
                      <Download size={16} className="text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Mark as complete */}
            {!currentLesson.is_completed && (
              <div className="flex justify-center mb-8">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleMarkComplete}
                  disabled={isCompleting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle size={20} className="mr-2" />
                  {isCompleting
                    ? (language === 'fr' ? 'En cours...' : 'Loading...')
                    : t.elearning.markComplete}
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between py-6 border-t border-slate-700">
              {prevLesson ? (
                <Link href={`/${lang}/oh-elearning/learn/${courseSlug}/${prevLesson.id}`}>
                  <Button variant="ghost" className="text-slate-300 hover:text-white">
                    <ChevronLeft size={20} className="mr-2" />
                    {t.elearning.prevLesson}
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link href={`/${lang}/oh-elearning/learn/${courseSlug}/${nextLesson.id}`}>
                  <Button variant="primary" className="bg-blue-600 hover:bg-blue-700">
                    {t.elearning.nextLesson}
                    <ChevronRight size={20} className="ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/${lang}/oh-elearning/courses/${courseSlug}`}>
                  <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700">
                    {language === 'fr' ? 'Terminer le cours' : 'Finish course'}
                    <CheckCircle size={20} className="ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
