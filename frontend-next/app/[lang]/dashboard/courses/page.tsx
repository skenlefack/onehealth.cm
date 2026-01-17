'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpen, Filter, Loader2, GraduationCap, ArrowLeft, Map } from 'lucide-react';
import { Language } from '@/lib/types';
import { ELearningEnrollment } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { AuthGuard } from '@/components/auth';
import { EnrolledCourseCard } from '@/components/dashboard';
import { getELearningEnrollments } from '@/lib/api';
import { cn } from '@/lib/utils';

const translations = {
  fr: {
    title: 'Mes cours',
    subtitle: 'Gérez vos inscriptions et suivez votre progression',
    back: 'Retour au dashboard',
    all: 'Tous',
    inProgress: 'En cours',
    completed: 'Terminés',
    noCourses: "Vous n'êtes inscrit à aucun cours",
    noCoursesFiltered: 'Aucun cours dans cette catégorie',
    startLearning: 'Découvrir les cours',
    loading: 'Chargement...',
    courses: 'cours',
  },
  en: {
    title: 'My Courses',
    subtitle: 'Manage your enrollments and track your progress',
    back: 'Back to dashboard',
    all: 'All',
    inProgress: 'In Progress',
    completed: 'Completed',
    noCourses: 'You are not enrolled in any course',
    noCoursesFiltered: 'No courses in this category',
    startLearning: 'Discover courses',
    loading: 'Loading...',
    courses: 'courses',
  },
};

type FilterType = 'all' | 'in_progress' | 'completed';

export default function DashboardCoursesPage() {
  const params = useParams();
  const lang = (params.lang as Language) || 'fr';
  const t = translations[lang];

  const { token } = useAuth();
  const [enrollments, setEnrollments] = useState<ELearningEnrollment[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEnrollments() {
      if (!token) return;

      try {
        const res = await getELearningEnrollments(token);
        if (res.success && res.data) {
          setEnrollments(Array.isArray(res.data) ? res.data : []);
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEnrollments();
  }, [token]);

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'completed') {
      return e.status === 'completed' || e.progress_percent === 100;
    }
    if (filter === 'in_progress') {
      return e.status !== 'completed' && (e.progress_percent || 0) < 100;
    }
    return true;
  });

  // Count by status
  const counts = {
    all: enrollments.length,
    in_progress: enrollments.filter(
      (e) => e.status !== 'completed' && (e.progress_percent || 0) < 100
    ).length,
    completed: enrollments.filter(
      (e) => e.status === 'completed' || e.progress_percent === 100
    ).length,
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: t.all },
    { key: 'in_progress', label: t.inProgress },
    { key: 'completed', label: t.completed },
  ];

  return (
    <AuthGuard lang={lang}>
      <div className="min-h-screen bg-gray-50">
        {/* Gradient Header Banner */}
        <div className="bg-gradient-to-r from-oh-blue to-oh-green">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Link
                  href={`/${lang}/dashboard`}
                  className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-2"
                >
                  <ArrowLeft size={16} />
                  {t.back}
                </Link>
                <h1 className="text-2xl font-bold text-white">{t.title}</h1>
                <p className="text-sm text-white/80 mt-0.5">{t.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/${lang}/ohwr-mapping`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-semibold transition-all border border-white/30 hover:border-white/50"
                >
                  <Map size={18} />
                  OHWR-Map
                </Link>
                <Link
                  href={`/${lang}/oh-elearning`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-oh-blue rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg"
                >
                  <GraduationCap size={18} />
                  OH E-learning
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-oh-blue" />
              <span className="ml-2 text-gray-600">{t.loading}</span>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t.noCourses}
              </h2>
              <p className="text-gray-500 mb-6">
                {lang === 'fr'
                  ? 'Explorez notre catalogue pour trouver des formations adaptées.'
                  : 'Explore our catalog to find suitable courses.'}
              </p>
              <Link
                href={`/${lang}/oh-elearning/courses`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-oh-blue text-white rounded-lg font-medium hover:bg-oh-blue/90 transition-colors"
              >
                <GraduationCap size={20} />
                {t.startLearning}
              </Link>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex items-center gap-2 mb-6">
                <Filter size={18} className="text-gray-400" />
                {filters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      filter === f.key
                        ? 'bg-oh-blue text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    )}
                  >
                    {f.label} ({counts[f.key]})
                  </button>
                ))}
              </div>

              {/* Courses Grid */}
              {filteredEnrollments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredEnrollments.map((enrollment) => (
                    <EnrolledCourseCard
                      key={enrollment.id}
                      lang={lang}
                      enrollment={enrollment}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                  <p className="text-gray-500">{t.noCoursesFiltered}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
