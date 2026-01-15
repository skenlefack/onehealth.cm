'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, ChevronDown, ChevronRight, Play, FileText, File,
  CheckCircle, Lock, Menu, X, Clock
} from 'lucide-react';
import { Language, ELearningCourse, ELearningModule, ELearningLesson } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import { getELearningCourse, getELearningCourseCurriculum, getImageUrl } from '@/lib/api';
import { Button, Spinner } from '@/components/ui';
import { ProgressBar } from '@/components/elearning';
import { cn } from '@/lib/utils';

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params.lang as string) || 'fr';
  const courseSlug = params.courseSlug as string;

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const courseRes = await getELearningCourse(courseSlug);
        if (courseRes.success && courseRes.data) {
          setCourse(courseRes.data);

          const curriculumRes = await getELearningCourseCurriculum(courseRes.data.id);
          if (curriculumRes.success) {
            setModules(curriculumRes.data.modules);
            // Expand first module by default
            if (curriculumRes.data.modules.length > 0) {
              setExpandedModules(new Set([curriculumRes.data.modules[0].id]));
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
  }, [courseSlug]);

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
