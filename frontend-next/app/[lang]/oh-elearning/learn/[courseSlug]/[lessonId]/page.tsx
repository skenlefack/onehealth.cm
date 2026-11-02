'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Play, FileText, File,
  CheckCircle, Lock, Menu, X, Download, LogIn, StickyNote, Bookmark, ListOrdered, Layers
} from 'lucide-react';
import { Language, ELearningCourse, ELearningModule, ELearningLesson } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import {
  getELearningCourse, getELearningCourseCurriculum, getELearningLesson,
  getImageUrl, completeLesson, updateLessonProgress, saveLessonNotes
} from '@/lib/api';
import { Button, Spinner } from '@/components/ui';
import {
  ProgressBar, VideoPlayer, VideoProgressData, DocumentViewer,
  LessonBlocksRenderer, legacyLessonToBlocks, blockLabel, isTrackableBlock
} from '@/components/elearning';
import { InteractiveContentRenderer } from '@/components/elearning/InteractiveContent';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';

export default function LessonViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated, user, isLoading: authLoading } = useAuth();
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

  // Leçon multi-contenus : parties consultées, notes personnelles, favori
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesStatus, setNotesStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [bookmarked, setBookmarked] = useState(false);
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blocksSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedBlocksRef = useRef<Set<string>>(new Set());
  const mainRef = useRef<HTMLElement>(null);

  // Ref pour éviter les sauvegardes multiples
  const lastSavedProgressRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Attendre la restauration de la session : sinon une réponse anonyme arrivée en retard
    // écraserait la leçon chargée avec le jeton (progression, notes, favori perdus).
    if (authLoading) return;
    let cancelled = false;
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
          if (lessonRes.success && !cancelled) {
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
    return () => { cancelled = true; };
  }, [courseSlug, lessonId, token, authLoading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Blocs de la leçon (les anciennes leçons « Mixte » sont reconstituées à la volée)
  const lessonBlocks = useMemo(() => {
    if (!currentLesson || currentLesson.content_type !== 'mixed') return [];
    if (Array.isArray(currentLesson.content_blocks) && currentLesson.content_blocks.length > 0) {
      return currentLesson.content_blocks;
    }
    const html = language === 'en' && currentLesson.content_en ? currentLesson.content_en : currentLesson.content_fr;
    return legacyLessonToBlocks(currentLesson, html);
  }, [currentLesson, language]);

  const trackableBlocks = useMemo(() => lessonBlocks.filter(isTrackableBlock), [lessonBlocks]);
  const viewedCount = trackableBlocks.filter(b => completedBlocks.has(b.id)).length;
  const allPartsViewed = trackableBlocks.length > 0 && viewedCount === trackableBlocks.length;

  // Initialiser l'état personnel à l'ouverture d'une leçon
  useEffect(() => {
    if (!currentLesson) return;
    const done = new Set<string>(currentLesson.progress?.completed_blocks || []);
    setCompletedBlocks(done);
    savedBlocksRef.current = new Set(done);
    setNotes(currentLesson.progress?.notes || '');
    setBookmarked(!!currentLesson.progress?.bookmarked);
    setNotesStatus('idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson?.id, !!currentLesson?.progress]);

  // Une partie est « consultée » quand elle occupe au moins la moitié de l'écran pendant 1,5 s
  useEffect(() => {
    const root = mainRef.current;
    if (!root || lessonBlocks.length === 0) return;
    const timers = new Map<string, NodeJS.Timeout>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).dataset.blockId;
        if (!id) return;
        const rootHeight = entry.rootBounds?.height || window.innerHeight;
        const visibleEnough = entry.isIntersecting &&
          (entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= rootHeight * 0.5);
        if (visibleEnough && !timers.has(id)) {
          timers.set(id, setTimeout(() => {
            setCompletedBlocks(prev => (prev.has(id) ? prev : new Set(prev).add(id)));
          }, 1500));
        } else if (!visibleEnough && timers.has(id)) {
          clearTimeout(timers.get(id)!);
          timers.delete(id);
        }
      });
    }, { root, threshold: [0, 0.25, 0.5, 0.75, 1] });
    root.querySelectorAll('[data-block-id]').forEach(el => observer.observe(el));
    return () => {
      observer.disconnect();
      timers.forEach(t => clearTimeout(t));
    };
  }, [lessonBlocks]);

  // Enregistrer les parties consultées (regroupé toutes les 3 s)
  useEffect(() => {
    if (!token || !currentLesson || trackableBlocks.length === 0) return;
    const fresh = Array.from(completedBlocks).filter(id => !savedBlocksRef.current.has(id));
    if (fresh.length === 0) return;
    if (blocksSaveTimeoutRef.current) clearTimeout(blocksSaveTimeoutRef.current);
    blocksSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateLessonProgress(currentLesson.id, {
          completed_blocks: Array.from(completedBlocks),
          progress_percent: Math.round((viewedCount / trackableBlocks.length) * 100)
        }, token);
        fresh.forEach(id => savedBlocksRef.current.add(id));
      } catch (error) {
        console.error('Error saving lesson parts:', error);
      }
    }, 3000);
  }, [completedBlocks, token, currentLesson, trackableBlocks.length, viewedCount]);

  useEffect(() => () => {
    if (blocksSaveTimeoutRef.current) clearTimeout(blocksSaveTimeoutRef.current);
    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
  }, []);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (!token || !currentLesson) return;
    setNotesStatus('saving');
    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
    const lessonIdToSave = currentLesson.id;
    notesTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await saveLessonNotes(lessonIdToSave, { notes: value }, token);
        setNotesStatus(res.success ? 'saved' : 'error');
      } catch {
        setNotesStatus('error');
      }
    }, 1200);
  };

  const toggleBookmark = async () => {
    if (!token || !currentLesson) {
      setShowLoginPrompt(true);
      return;
    }
    const next = !bookmarked;
    setBookmarked(next);
    try {
      const res = await saveLessonNotes(currentLesson.id, { bookmarked: next }, token);
      if (!res.success) setBookmarked(!next);
    } catch {
      setBookmarked(!next);
    }
  };

  const scrollToPart = (id: string) => {
    document.getElementById(`part-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  // Navigation clavier : ← / → entre les leçons (sauf pendant la saisie)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'VIDEO' || tag === 'AUDIO' || el?.isContentEditable) return;
      const all: ELearningLesson[] = [];
      modules.forEach(m => { if (m.lessons) all.push(...m.lessons); });
      const idx = all.findIndex(l => l.id === lessonId);
      const target = e.key === 'ArrowRight' ? all[idx + 1] : e.key === 'ArrowLeft' ? all[idx - 1] : undefined;
      if (idx === -1 || !target || target.is_locked) return;
      router.push(`/${lang}/oh-elearning/learn/${courseSlug}/${target.id}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modules, lessonId, router, lang, courseSlug]);

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

  // Helper to update progress after completing a lesson
  const updateProgressAfterComplete = useCallback((courseProgressPercent: number) => {
    // Update course progress
    if (course) {
      setCourse({ ...course, progress_percent: courseProgressPercent });
    }

    // Update current lesson
    if (currentLesson) {
      setCurrentLesson({ ...currentLesson, is_completed: true });
    }

    // Update the lesson in modules list to show checkmark
    setModules(prevModules =>
      prevModules.map(module => ({
        ...module,
        lessons: module.lessons?.map(lesson =>
          lesson.id === lessonId
            ? { ...lesson, is_completed: true }
            : lesson
        )
      }))
    );
  }, [course, currentLesson, lessonId]);

  // Handler pour la complétion de la vidéo
  const handleVideoComplete = useCallback(async () => {
    if (!token || !currentLesson || currentLesson.is_completed) return;

    try {
      const result = await completeLesson(lessonId, token);
      if (result.success && result.data) {
        updateProgressAfterComplete(result.data.course_progress);
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  }, [token, lessonId, currentLesson, updateProgressAfterComplete]);

  const handleMarkComplete = async () => {
    if (!currentLesson || currentLesson.is_completed) return;

    if (!token) {
      setShowLoginPrompt(true);
      return;
    }

    setIsCompleting(true);
    try {
      const result = await completeLesson(lessonId, token);
      if (result.success && result.data) {
        updateProgressAfterComplete(result.data.course_progress);
      }
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
      case 'powerpoint':
        return <FileText size={14} />;
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
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col">
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/70 z-[110] flex items-center justify-center p-4">
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
              <Link href={`/${lang}/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="flex-1">
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
      <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
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
          <h1 className="font-medium text-white truncate text-sm min-w-0">
            {lessonTitle}
          </h1>
        </div>

        {/* Progress & User */}
        <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
          <button
            onClick={toggleBookmark}
            title={language === 'fr' ? (bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris') : (bookmarked ? 'Remove bookmark' : 'Bookmark')}
            className={cn('p-2 rounded-lg transition-colors', bookmarked ? 'text-amber-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-700 hover:text-white')}
          >
            <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => setNotesOpen(o => !o)}
            title={language === 'fr' ? 'Mes notes' : 'My notes'}
            className={cn('p-2 rounded-lg transition-colors flex items-center gap-1.5 text-sm', notesOpen ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white')}
          >
            <StickyNote size={18} />
            <span className="hidden lg:inline">{language === 'fr' ? 'Notes' : 'Notes'}</span>
          </button>
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            'w-72 bg-slate-800 border-r border-slate-700 overflow-y-auto transition-all duration-300 flex-shrink-0',
            sidebarOpen ? 'ml-0' : '-ml-72'
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
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          {/* Video content with new VideoPlayer */}
          {currentLesson.content_type === 'video' && currentLesson.video_url && (
            <div className="bg-slate-900">
              <VideoPlayer
                src={
                  currentLesson.video_provider === 'youtube' || currentLesson.video_provider === 'vimeo'
                    ? currentLesson.video_url
                    : getImageUrl(currentLesson.video_url)
                }
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
              <div className="max-w-5xl mx-auto">
                <DocumentViewer
                  url={getImageUrl(currentLesson.pdf_url)}
                  type="pdf"
                  title={lessonTitle}
                  lang={language}
                />
              </div>
            </div>
          )}

          {/* PowerPoint content */}
          {currentLesson.content_type === 'powerpoint' && currentLesson.pptx_url && (
            <div className="bg-slate-800 p-4">
              <div className="max-w-5xl mx-auto">
                <DocumentViewer
                  url={getImageUrl(currentLesson.pptx_url)}
                  type="powerpoint"
                  title={lessonTitle}
                  lang={language}
                />
              </div>
            </div>
          )}

          {/* Word content */}
          {currentLesson.content_type === 'word' && currentLesson.docx_url && (
            <div className="bg-slate-800 p-4">
              <div className="max-w-5xl mx-auto">
                <DocumentViewer
                  url={getImageUrl(currentLesson.docx_url)}
                  type="word"
                  title={lessonTitle}
                  lang={language}
                />
              </div>
            </div>
          )}

          {/* Excel content */}
          {currentLesson.content_type === 'excel' && currentLesson.xlsx_url && (
            <div className="bg-slate-800 p-4">
              <div className="max-w-5xl mx-auto">
                <DocumentViewer
                  url={getImageUrl(currentLesson.xlsx_url)}
                  type="excel"
                  title={lessonTitle}
                  lang={language}
                />
              </div>
            </div>
          )}

          {/* Text content */}
          <div className={cn('mx-auto p-6', trackableBlocks.length > 1 ? 'max-w-6xl xl:flex xl:gap-8' : 'max-w-4xl')}>
          <div className="flex-1 min-w-0 max-w-4xl mx-auto xl:mx-0 w-full">
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
                {trackableBlocks.length > 1 && (
                  <span className="flex items-center gap-1">
                    <Layers size={14} />
                    {viewedCount}/{trackableBlocks.length} {language === 'fr' ? 'parties consultées' : 'parts viewed'}
                  </span>
                )}
              </div>
            </div>

            {/* Lesson outline (mobile / tablet) */}
            {trackableBlocks.length > 1 && (
              <details className="xl:hidden bg-slate-800 rounded-xl mb-6 group">
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer list-none text-white text-sm font-medium select-none">
                  <ListOrdered size={16} className="text-blue-400" />
                  {language === 'fr' ? 'Plan de la leçon' : 'Lesson outline'}
                  <span className="ml-auto text-xs text-slate-400">{viewedCount}/{trackableBlocks.length}</span>
                </summary>
                <ol className="px-2 pb-3">
                  {trackableBlocks.map((b, i) => (
                    <li key={b.id}>
                      <button onClick={() => scrollToPart(b.id)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm hover:bg-slate-700">
                        {completedBlocks.has(b.id)
                          ? <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                          : <span className="w-3.5 text-center text-xs text-slate-500 flex-shrink-0">{i + 1}</span>}
                        <span className={cn('truncate', completedBlocks.has(b.id) ? 'text-slate-400' : 'text-slate-200')}>{blockLabel(b, language)}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </details>
            )}

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

            {/* Multi-content lesson: ordered blocks */}
            {lessonBlocks.length > 0 && (
              <div className="mb-8">
                <LessonBlocksRenderer
                  blocks={lessonBlocks}
                  lang={language}
                  lessonTitle={lessonTitle}
                  poster={course.thumbnail ? getImageUrl(course.thumbnail) : undefined}
                  completedBlocks={completedBlocks}
                  videoTracking={{
                    initialPosition: initialVideoPosition,
                    minWatchPercent: currentLesson.min_video_watch_percent || 80,
                    onProgress: handleVideoProgress,
                    onComplete: handleVideoComplete
                  }}
                />
              </div>
            )}

            {/* Text content */}
            {currentLesson.content_type === 'text' && lessonContent && (
              <div className="bg-white rounded-xl p-6 md:p-8 mb-8 shadow-lg">
                <div
                  className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-a:text-blue-600 prose-strong:text-slate-800 prose-ul:text-slate-700 prose-ol:text-slate-700 prose-li:text-slate-700"
                  dangerouslySetInnerHTML={{ __html: lessonContent }}
                />
              </div>
            )}

            {/* Interactive content */}
            {currentLesson.content_type === 'interactive' && lessonContent && (() => {
              try {
                const interactiveConfig = JSON.parse(lessonContent);
                return (
                  <div className="mb-8">
                    <InteractiveContentRenderer config={interactiveConfig} lang={language} />
                  </div>
                );
              } catch {
                return null;
              }
            })()}

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
              <div className="flex flex-col items-center gap-2 mb-8">
                {allPartsViewed && trackableBlocks.length > 1 && (
                  <p className="text-sm text-emerald-300">
                    {language === 'fr' ? 'Vous avez parcouru toutes les parties de cette leçon.' : 'You have gone through every part of this lesson.'}
                  </p>
                )}
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

            {/* Next Lesson CTA */}
            {nextLesson && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">
                      {language === 'fr' ? 'Leçon suivante' : 'Next lesson'}
                    </p>
                    <h4 className="text-white text-lg font-bold">
                      {language === 'en' && nextLesson.title_en ? nextLesson.title_en : nextLesson.title_fr}
                    </h4>
                  </div>
                  <Link href={`/${lang}/oh-elearning/learn/${courseSlug}/${nextLesson.id}`}>
                    <Button variant="primary" size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-md px-6">
                      {language === 'fr' ? 'Continuer' : 'Continue'}
                      <ChevronRight size={22} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {!nextLesson && (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-8 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium mb-1">
                      {language === 'fr' ? 'Félicitations !' : 'Congratulations!'}
                    </p>
                    <h4 className="text-white text-lg font-bold">
                      {language === 'fr' ? 'Vous avez terminé toutes les leçons' : 'You completed all lessons'}
                    </h4>
                  </div>
                  <Link href={`/${lang}/oh-elearning/courses/${courseSlug}`}>
                    <Button variant="primary" size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-md px-6">
                      {language === 'fr' ? 'Terminer le cours' : 'Finish course'}
                      <CheckCircle size={22} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between py-4 border-t border-slate-700">
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
                  <Button variant="ghost" className="text-slate-300 hover:text-white">
                    {t.elearning.nextLesson}
                    <ChevronRight size={20} className="ml-2" />
                  </Button>
                </Link>
              ) : (
                <div />
              )}
            </div>
            <p className="hidden md:block text-center text-xs text-slate-500 pb-4">
              {language === 'fr' ? 'Astuce : utilisez les flèches ← → du clavier pour changer de leçon.' : 'Tip: use the ← → arrow keys to switch lessons.'}
            </p>
          </div>

          {/* Lesson outline (desktop) */}
          {trackableBlocks.length > 1 && (
            <aside className="hidden xl:block w-64 flex-shrink-0">
              <div className="sticky top-6 bg-slate-800 rounded-xl p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-white mb-1">
                  <ListOrdered size={16} className="text-blue-400" />
                  {language === 'fr' ? 'Plan de la leçon' : 'Lesson outline'}
                </p>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden my-3">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(viewedCount / trackableBlocks.length) * 100}%` }} />
                </div>
                <ol className="space-y-0.5 max-h-[60vh] overflow-y-auto">
                  {trackableBlocks.map((b, i) => (
                    <li key={b.id}>
                      <button onClick={() => scrollToPart(b.id)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm hover:bg-slate-700 transition-colors">
                        {completedBlocks.has(b.id)
                          ? <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                          : <span className="w-3.5 text-center text-xs text-slate-500 flex-shrink-0">{i + 1}</span>}
                        <span className={cn('truncate', completedBlocks.has(b.id) ? 'text-slate-400' : 'text-slate-200')}>{blockLabel(b, language)}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          )}
          </div>
        </main>

        {/* Personal notes panel */}
        {notesOpen && (
          <aside className="w-full sm:w-80 bg-slate-800 border-l border-slate-700 flex flex-col flex-shrink-0 absolute sm:static inset-y-0 right-0 top-14 z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <StickyNote size={16} className="text-amber-400" />
                {language === 'fr' ? 'Mes notes' : 'My notes'}
              </p>
              <button onClick={() => setNotesOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white">
                <X size={16} />
              </button>
            </div>
            {isAuthenticated ? (
              <>
                <textarea
                  value={notes}
                  onChange={e => handleNotesChange(e.target.value)}
                  placeholder={language === 'fr' ? 'Prenez des notes sur cette leçon… Elles sont privées et enregistrées automatiquement.' : 'Take notes on this lesson… They are private and saved automatically.'}
                  className="flex-1 m-3 p-3 rounded-lg bg-slate-900 text-slate-100 text-sm leading-relaxed border border-slate-700 focus:border-blue-500 focus:outline-none resize-none"
                />
                <p className="px-4 pb-3 text-xs text-slate-500 h-6">
                  {notesStatus === 'saving' && (language === 'fr' ? 'Enregistrement…' : 'Saving…')}
                  {notesStatus === 'saved' && (language === 'fr' ? '✓ Enregistré' : '✓ Saved')}
                  {notesStatus === 'error' && <span className="text-red-400">{language === 'fr' ? 'Erreur d\'enregistrement' : 'Could not save'}</span>}
                </p>
              </>
            ) : (
              <div className="p-4 text-sm text-slate-300">
                {language === 'fr' ? 'Connectez-vous pour prendre des notes.' : 'Log in to take notes.'}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
