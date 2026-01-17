'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BookOpen,
  FileText,
  Award,
  ArrowRight,
  Loader2,
  GraduationCap,
  Map,
} from 'lucide-react';
import { Language } from '@/lib/types';
import { ELearningEnrollment, ELearningCertificate } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { AuthGuard } from '@/components/auth';
import { DashboardStats, EnrolledCourseCard } from '@/components/dashboard';
import { getELearningEnrollments, getELearningCertificates } from '@/lib/api';

const translations = {
  fr: {
    title: 'Tableau de bord',
    welcome: 'Bienvenue',
    subtitle: 'Suivez votre progression et accédez à vos ressources',
    recentCourses: 'Cours récents',
    viewAllCourses: 'Voir tous mes cours',
    quickActions: 'Actions rapides',
    exploreCatalog: 'Explorer le catalogue',
    myResources: 'Mes ressources',
    myCertificates: 'Mes certificats',
    noCourses: "Vous n'êtes inscrit à aucun cours",
    startLearning: 'Commencer à apprendre',
    loading: 'Chargement...',
  },
  en: {
    title: 'Dashboard',
    welcome: 'Welcome',
    subtitle: 'Track your progress and access your resources',
    recentCourses: 'Recent Courses',
    viewAllCourses: 'View all my courses',
    quickActions: 'Quick Actions',
    exploreCatalog: 'Explore catalog',
    myResources: 'My resources',
    myCertificates: 'My certificates',
    noCourses: 'You are not enrolled in any course',
    startLearning: 'Start learning',
    loading: 'Loading...',
  },
};

export default function DashboardPage() {
  const params = useParams();
  const lang = (params.lang as Language) || 'fr';
  const t = translations[lang];

  const { user, token } = useAuth();
  const [enrollments, setEnrollments] = useState<ELearningEnrollment[]>([]);
  const [certificates, setCertificates] = useState<ELearningCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;

      try {
        const [enrollmentsRes, certificatesRes] = await Promise.all([
          getELearningEnrollments(token),
          getELearningCertificates(token),
        ]);

        if (enrollmentsRes.success && enrollmentsRes.data) {
          setEnrollments(Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : []);
        }
        if (certificatesRes.success && certificatesRes.data) {
          setCertificates(Array.isArray(certificatesRes.data) ? certificatesRes.data : []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [token]);

  // Calculate stats
  const completedCourses = enrollments.filter(
    (e) => e.status === 'completed' || e.progress_percent === 100
  ).length;

  const totalHours = enrollments.reduce((acc, e) => {
    return acc + (e.total_time_spent_seconds || 0);
  }, 0) / 3600;

  const averageProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((acc, e) => acc + (e.progress_percent || 0), 0) /
            enrollments.length
        )
      : 0;

  const stats = {
    enrolledCourses: enrollments.length,
    completedCourses,
    certificatesEarned: certificates.length,
    totalHours: Math.round(totalHours),
    averageProgress,
  };

  // Get recent courses (last 4)
  const recentEnrollments = [...enrollments]
    .sort((a, b) => {
      const dateA = new Date(a.last_accessed_at || a.enrolled_at || 0);
      const dateB = new Date(b.last_accessed_at || b.enrolled_at || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 4);

  const displayName = user?.first_name || user?.username || '';

  return (
    <AuthGuard lang={lang}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-oh-blue to-oh-green">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {t.welcome}, {displayName}!
                </h1>
                <p className="mt-2 text-white/80">{t.subtitle}</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-oh-blue" />
              <span className="ml-2 text-gray-600">{t.loading}</span>
            </div>
          ) : (
            <>
              {/* Stats */}
              <DashboardStats lang={lang} stats={stats} />

              {/* Quick Actions */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t.quickActions}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link
                    href={`/${lang}/oh-elearning/courses`}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                  >
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-oh-blue transition-colors">
                        {t.exploreCatalog}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-oh-blue transition-colors" />
                  </Link>

                  <Link
                    href={`/${lang}/dashboard/resources`}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                  >
                    <div className="p-3 bg-green-50 rounded-lg">
                      <FileText className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-oh-blue transition-colors">
                        {t.myResources}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-oh-blue transition-colors" />
                  </Link>

                  <Link
                    href={`/${lang}/oh-elearning/certificates`}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                  >
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <Award className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-oh-blue transition-colors">
                        {t.myCertificates}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-oh-blue transition-colors" />
                  </Link>
                </div>
              </div>

              {/* Recent Courses */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t.recentCourses}
                  </h2>
                  {enrollments.length > 0 && (
                    <Link
                      href={`/${lang}/dashboard/courses`}
                      className="text-sm font-medium text-oh-blue hover:text-oh-blue/80 flex items-center gap-1"
                    >
                      {t.viewAllCourses}
                      <ArrowRight size={16} />
                    </Link>
                  )}
                </div>

                {recentEnrollments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recentEnrollments.map((enrollment) => (
                      <EnrolledCourseCard
                        key={enrollment.id}
                        lang={lang}
                        enrollment={enrollment}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">{t.noCourses}</p>
                    <Link
                      href={`/${lang}/oh-elearning/courses`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-oh-blue text-white rounded-lg font-medium hover:bg-oh-blue/90 transition-colors"
                    >
                      <GraduationCap size={18} />
                      {t.startLearning}
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
