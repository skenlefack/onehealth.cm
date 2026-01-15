'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  BookOpen, GraduationCap, Award, ArrowLeft, Play, Clock,
  CheckCircle, ArrowRight
} from 'lucide-react';
import { Language, ELearningEnrollment } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import { getELearningEnrollments, getImageUrl } from '@/lib/api';
import { Button, Spinner } from '@/components/ui';
import { ProgressBar } from '@/components/elearning';
import { cn } from '@/lib/utils';

export default function MyLearningPage() {
  const params = useParams();
  const lang = (params.lang as string) || 'fr';

  if (!isValidLanguage(lang)) {
    return null;
  }

  const language = lang as Language;
  const t = getTranslation(language);

  const [enrollments, setEnrollments] = useState<ELearningEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        // In real implementation, get token from auth context
        // const res = await getELearningEnrollments(token);
        // For now, show empty state
        setEnrollments([]);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const filteredEnrollments = enrollments.filter((e) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in_progress') return e.status === 'in_progress' || e.status === 'enrolled';
    if (activeTab === 'completed') return e.status === 'completed';
    return true;
  });

  const tabs = [
    { key: 'all', label: language === 'fr' ? 'Tous' : 'All' },
    { key: 'in_progress', label: t.elearning.inProgress },
    { key: 'completed', label: t.elearning.completed },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="pt-32 pb-8 px-[5%]">
        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <Link
            href={`/${lang}/oh-elearning`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            {t.common.back}
          </Link>

          {/* Title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <BookOpen size={28} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                {t.elearning.myCourses}
              </h1>
              <p className="text-slate-500">
                {language === 'fr'
                  ? 'Suivez votre progression et continuez votre apprentissage'
                  : 'Track your progress and continue learning'}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-2xl font-bold text-slate-800">{enrollments.length}</div>
              <div className="text-sm text-slate-500">
                {language === 'fr' ? 'Cours inscrits' : 'Enrolled courses'}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {enrollments.filter((e) => e.status === 'in_progress').length}
              </div>
              <div className="text-sm text-slate-500">{t.elearning.inProgress}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {enrollments.filter((e) => e.status === 'completed').length}
              </div>
              <div className="text-sm text-slate-500">{t.elearning.completed}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-[5%] pb-16">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : filteredEnrollments.length > 0 ? (
            <div className="space-y-4">
              {filteredEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    {enrollment.thumbnail && (
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 hidden sm:block">
                        <Image
                          src={getImageUrl(enrollment.thumbnail)}
                          alt={enrollment.course_title || enrollment.path_title || ''}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {enrollment.enrollable_type === 'course' ? (
                          <BookOpen size={16} className="text-blue-500" />
                        ) : (
                          <GraduationCap size={16} className="text-indigo-500" />
                        )}
                        <span className="text-xs text-slate-500 uppercase">
                          {enrollment.enrollable_type === 'course'
                            ? (language === 'fr' ? 'Cours' : 'Course')
                            : (language === 'fr' ? 'Parcours' : 'Path')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-2 truncate">
                        {enrollment.course_title || enrollment.path_title}
                      </h3>
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
                        {enrollment.status === 'completed' && (
                          <span className="flex items-center gap-1 text-sm text-emerald-600">
                            <CheckCircle size={14} />
                            {t.elearning.completed}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      {enrollment.status === 'completed' ? (
                        enrollment.certificate_id ? (
                          <Link href={`/${lang}/oh-elearning/certificates`}>
                            <Button variant="outline" size="sm">
                              <Award size={16} className="mr-2" />
                              {t.elearning.viewCertificate}
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            <CheckCircle size={16} className="mr-2" />
                            {t.elearning.completed}
                          </Button>
                        )
                      ) : (
                        <Link
                          href={
                            enrollment.enrollable_type === 'course'
                              ? `/${lang}/oh-elearning/learn/${enrollment.enrollable_id}`
                              : `/${lang}/oh-elearning/paths/${enrollment.enrollable_id}`
                          }
                        >
                          <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Play size={16} className="mr-2" />
                            {enrollment.progress_percent > 0 ? t.elearning.continue : t.elearning.start}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <BookOpen size={40} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {t.elearning.noEnrollments}
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                {language === 'fr'
                  ? "Explorez notre catalogue et inscrivez-vous à un cours pour commencer votre apprentissage."
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
