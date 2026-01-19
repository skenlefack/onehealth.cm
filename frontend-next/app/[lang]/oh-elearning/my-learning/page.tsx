'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen, GraduationCap, Award, ArrowLeft, Play, Clock,
  CheckCircle, ArrowRight, TrendingUp, Target, Calendar,
  BarChart3, Loader2
} from 'lucide-react';
import { Language, ELearningEnrollment, UserLearningStats } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import { getELearningEnrollments, getUserLearningStats, getImageUrl } from '@/lib/api';
import { Button, Spinner } from '@/components/ui';
import { ProgressBar } from '@/components/elearning';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

export default function MyLearningPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const lang = (params.lang as string) || 'fr';

  if (!isValidLanguage(lang)) {
    return null;
  }

  const language = lang as Language;
  const t = getTranslation(language);

  const [enrollments, setEnrollments] = useState<ELearningEnrollment[]>([]);
  const [stats, setStats] = useState<UserLearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'completed'>('all');

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const [enrollmentsRes, statsRes] = await Promise.all([
        getELearningEnrollments(token),
        getUserLearningStats(token)
      ]);

      if (enrollmentsRes.success && enrollmentsRes.data) {
        setEnrollments(enrollmentsRes.data);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${lang}/auth/login?redirect=/${lang}/oh-elearning/my-learning`);
      return;
    }

    if (token) {
      fetchData();
    }
  }, [authLoading, user, token, lang, router, fetchData]);

  // Get enrollments to continue (in progress, sorted by last accessed)
  const continueLearning = enrollments
    .filter(e => e.status === 'in_progress' || (e.status === 'enrolled' && e.progress_percent > 0))
    .sort((a, b) => {
      const dateA = a.last_accessed_at ? new Date(a.last_accessed_at).getTime() : 0;
      const dateB = b.last_accessed_at ? new Date(b.last_accessed_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  const filteredEnrollments = enrollments.filter((e) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in_progress') return e.status === 'in_progress' || e.status === 'enrolled';
    if (activeTab === 'completed') return e.status === 'completed';
    return true;
  });

  const tabs = [
    { key: 'all', label: language === 'fr' ? 'Tous' : 'All', count: enrollments.length },
    { key: 'in_progress', label: t.elearning.inProgress, count: enrollments.filter(e => e.status === 'in_progress' || e.status === 'enrolled').length },
    { key: 'completed', label: t.elearning.completed, count: enrollments.filter(e => e.status === 'completed').length },
  ];

  // Format time spent
  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Format relative date
  const formatRelativeDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return language === 'fr' ? "Aujourd'hui" : 'Today';
    if (diffDays === 1) return language === 'fr' ? 'Hier' : 'Yesterday';
    if (diffDays < 7) return language === 'fr' ? `Il y a ${diffDays} jours` : `${diffDays} days ago`;
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-emerald-500 pt-24 pb-16">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 right-[10%] w-16 h-16 bg-white/5 rounded-2xl rotate-12 hidden lg:block" />
        <div className="absolute bottom-12 left-[15%] w-12 h-12 bg-white/5 rounded-full hidden lg:block" />

        <div className="relative z-10 max-w-6xl mx-auto px-[5%]">
          {/* Back link */}
          <Link
            href={`/${lang}/oh-elearning`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            {t.common.back}
          </Link>

          {/* Title */}
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-2xl ring-1 ring-white/20">
              <Target size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                {t.elearning.myCourses}
              </h1>
              <p className="text-lg text-blue-100 max-w-2xl">
                {language === 'fr'
                  ? `Bienvenue ${user?.first_name || user?.username || ''} ! Suivez votre progression et continuez votre apprentissage`
                  : `Welcome ${user?.first_name || user?.username || ''}! Track your progress and continue learning`}
              </p>
            </div>
            <Link
              href={`/${lang}/oh-elearning/my-learning/certificates`}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-xl font-medium transition-all border border-white/30 self-start md:self-center"
            >
              <Award size={20} />
              {language === 'fr' ? 'Mes certificats' : 'My certificates'}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800">{stats?.enrolledCourses || 0}</div>
              <div className="text-sm text-slate-500">{language === 'fr' ? 'Cours inscrits' : 'Enrolled courses'}</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <TrendingUp size={20} className="text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800">{stats?.inProgressCourses || 0}</div>
              <div className="text-sm text-slate-500">{t.elearning.inProgress}</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle size={20} className="text-emerald-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800">{stats?.completedCourses || 0}</div>
              <div className="text-sm text-slate-500">{t.elearning.completed}</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Clock size={20} className="text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800">{formatTimeSpent(stats?.totalTimeSpent || 0)}</div>
              <div className="text-sm text-slate-500">{language === 'fr' ? 'Temps total' : 'Total time'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Learning Section */}
      {continueLearning.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pt-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Play size={20} className="text-blue-600" />
              {language === 'fr' ? 'Continuer l\'apprentissage' : 'Continue Learning'}
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {continueLearning.filter(e => e.slug).map((enrollment) => {
                const title = language === 'en' && enrollment.title_en ? enrollment.title_en : enrollment.title_fr;
                const courseUrl = enrollment.enrollable_type === 'course'
                  ? `/${lang}/oh-elearning/learn/${enrollment.slug}`
                  : `/${lang}/oh-elearning/paths/${enrollment.slug}`;

                return (
                  <Link
                    key={enrollment.id}
                    href={courseUrl}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-32 bg-gradient-to-br from-blue-500 to-indigo-600">
                      {enrollment.thumbnail && (
                        <Image
                          src={getImageUrl(enrollment.thumbnail)}
                          alt={title || ''}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <Play size={24} className="text-blue-600 ml-1" />
                        </div>
                      </div>

                      {/* Progress Indicator */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                        <div
                          className="h-full bg-emerald-400"
                          style={{ width: `${enrollment.progress_percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {enrollment.enrollable_type === 'course' ? (
                          <BookOpen size={14} className="text-blue-500" />
                        ) : (
                          <GraduationCap size={14} className="text-indigo-500" />
                        )}
                        <span className="text-xs text-slate-500 uppercase">
                          {enrollment.enrollable_type === 'course'
                            ? (language === 'fr' ? 'Cours' : 'Course')
                            : (language === 'fr' ? 'Parcours' : 'Path')}
                        </span>
                        {enrollment.last_accessed_at && (
                          <span className="text-xs text-slate-400 ml-auto">
                            {formatRelativeDate(enrollment.last_accessed_at)}
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-slate-800 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                        {title}
                      </h3>

                      <div className="flex items-center gap-3">
                        <ProgressBar
                          progress={enrollment.progress_percent}
                          lang={language}
                          size="sm"
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-blue-600">
                          {Math.round(enrollment.progress_percent)}%
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Enrollments Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Section Header with Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={20} className="text-slate-600" />
              {language === 'fr' ? 'Tous mes cours' : 'All my courses'}
            </h2>

            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {tab.label}
                  <span className={cn(
                    'ml-2 px-1.5 py-0.5 rounded-md text-xs',
                    activeTab === tab.key ? 'bg-white/20' : 'bg-slate-100'
                  )}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Enrollments List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : filteredEnrollments.length > 0 ? (
            <div className="space-y-4">
              {filteredEnrollments.map((enrollment) => {
                const title = language === 'en' && enrollment.title_en ? enrollment.title_en : enrollment.title_fr;

                return (
                  <div
                    key={enrollment.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 hidden sm:block bg-gradient-to-br from-blue-100 to-indigo-100">
                        {enrollment.thumbnail ? (
                          <Image
                            src={getImageUrl(enrollment.thumbnail)}
                            alt={title || ''}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {enrollment.enrollable_type === 'course' ? (
                              <BookOpen size={24} className="text-blue-400" />
                            ) : (
                              <GraduationCap size={24} className="text-indigo-400" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {enrollment.enrollable_type === 'course' ? (
                            <BookOpen size={14} className="text-blue-500" />
                          ) : (
                            <GraduationCap size={14} className="text-indigo-500" />
                          )}
                          <span className="text-xs text-slate-500 uppercase font-medium">
                            {enrollment.enrollable_type === 'course'
                              ? (language === 'fr' ? 'Cours' : 'Course')
                              : (language === 'fr' ? 'Parcours' : 'Path')}
                          </span>
                          {enrollment.status === 'completed' && (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle size={12} />
                              {t.elearning.completed}
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-slate-800 mb-2 truncate">{title}</h3>

                        <div className="flex items-center gap-4">
                          <ProgressBar
                            progress={enrollment.progress_percent}
                            lang={language}
                            size="sm"
                            className="w-32"
                          />
                          <span className="text-sm font-medium text-slate-600">
                            {Math.round(enrollment.progress_percent)}%
                          </span>
                          {enrollment.last_accessed_at && enrollment.status !== 'completed' && (
                            <span className="text-xs text-slate-400 hidden md:inline">
                              {language === 'fr' ? 'Dernier acces' : 'Last accessed'}: {formatRelativeDate(enrollment.last_accessed_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex-shrink-0">
                        {enrollment.status === 'completed' ? (
                          enrollment.certificate_id ? (
                            <Link href={`/${lang}/oh-elearning/my-learning/certificates`}>
                              <Button variant="outline" size="sm" className="border-amber-300 text-amber-600 hover:bg-amber-50">
                                <Award size={16} className="mr-2" />
                                {language === 'fr' ? 'Certificat' : 'Certificate'}
                              </Button>
                            </Link>
                          ) : (
                            <Button variant="outline" size="sm" disabled className="text-emerald-600">
                              <CheckCircle size={16} className="mr-2" />
                              {t.elearning.completed}
                            </Button>
                          )
                        ) : enrollment.slug ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              const url = enrollment.enrollable_type === 'course'
                                ? `/${lang}/oh-elearning/learn/${enrollment.slug}`
                                : `/${lang}/oh-elearning/paths/${enrollment.slug}`;
                              console.log('Navigating to:', url);
                              window.location.href = url;
                            }}
                          >
                            <Play size={16} className="mr-2" />
                            {enrollment.progress_percent > 0 ? t.elearning.continue : t.elearning.start}
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            {language === 'fr' ? 'Non disponible' : 'Not available'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <BookOpen size={40} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {activeTab === 'all'
                  ? t.elearning.noEnrollments
                  : activeTab === 'in_progress'
                    ? (language === 'fr' ? 'Aucun cours en cours' : 'No courses in progress')
                    : (language === 'fr' ? 'Aucun cours termine' : 'No completed courses')}
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                {language === 'fr'
                  ? "Explorez notre catalogue et inscrivez-vous a un cours pour commencer votre apprentissage."
                  : 'Explore our catalog and enroll in a course to start learning.'}
              </p>
              <Link href={`/${lang}/oh-elearning/courses`}>
                <Button variant="primary" className="bg-blue-600 hover:bg-blue-700">
                  <BookOpen size={20} className="mr-2" />
                  {t.elearning.allCourses}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
