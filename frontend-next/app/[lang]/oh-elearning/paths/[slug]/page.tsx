import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, Clock, BookOpen, Users, Award,
  CheckCircle, GraduationCap, ChevronRight
} from 'lucide-react';
import { Language } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import { getELearningPath, getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui';
import { LevelBadge, CourseCard } from '@/components/elearning';

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;

  const pathRes = await getELearningPath(slug);
  if (!pathRes.success) {
    return { title: 'Learning path not found' };
  }

  const path = pathRes.data;
  const title = lang === 'en' && path.title_en ? path.title_en : path.title_fr;
  const description = lang === 'en' && path.description_en
    ? path.description_en
    : path.description_fr;

  return {
    title: `${title} | OH E-Learning`,
    description: description?.substring(0, 160),
  };
}

export default async function PathDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const language = lang as Language;
  const t = getTranslation(language);

  // Fetch path
  const pathRes = await getELearningPath(slug);
  if (!pathRes.success || !pathRes.data) {
    notFound();
  }

  const path = pathRes.data;

  const title = language === 'en' && path.title_en ? path.title_en : path.title_fr;
  const description = language === 'en' && path.description_en
    ? path.description_en
    : path.description_fr;
  const categoryName = language === 'en' && path.category_name_fr
    ? path.category_name_fr
    : path.category_name_fr;

  const courses = path.courses || [];
  const totalDuration = courses.reduce((sum, c) => sum + c.duration_hours, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="pt-28 pb-12 px-[5%] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <Link
            href={`/${lang}/oh-elearning/paths`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            {t.elearning.allPaths}
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Path Info */}
            <div className="lg:col-span-2">
              {/* Badge */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold flex items-center gap-1.5">
                  <GraduationCap size={16} />
                  {language === 'fr' ? 'Parcours diplômant' : 'Learning Path'}
                </span>
                {categoryName && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {categoryName}
                  </span>
                )}
                <LevelBadge level={path.level} lang={language} />
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {title}
              </h1>

              {/* Description preview */}
              {description && (
                <p className="text-lg text-white/90 mb-6 line-clamp-3">
                  {description.replace(/<[^>]*>/g, '').substring(0, 200)}...
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-white/80 mb-6">
                <span className="flex items-center gap-2">
                  <Clock size={18} />
                  {path.duration_hours || totalDuration} {t.elearning.hours}
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen size={18} />
                  {courses.length} {language === 'fr' ? 'cours' : 'courses'}
                </span>
                {path.enrolled_count !== undefined && path.enrolled_count > 0 && (
                  <span className="flex items-center gap-2">
                    <Users size={18} />
                    {path.enrolled_count} {t.elearning.students}
                  </span>
                )}
                {path.certificate_enabled && (
                  <span className="flex items-center gap-2 text-amber-300">
                    <Award size={18} />
                    {language === 'fr' ? 'Certificat inclus' : 'Certificate included'}
                  </span>
                )}
              </div>

              {/* Instructor */}
              {path.instructor_name && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-lg font-medium">
                      {path.instructor_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">
                      {language === 'fr' ? 'Dirigé par' : 'Led by'}
                    </p>
                    <p className="font-medium">{path.instructor_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 text-slate-800">
                {/* Thumbnail */}
                {path.thumbnail && (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                    <Image
                      src={getImageUrl(path.thumbnail)}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Course count */}
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-indigo-600 mb-1">
                    {courses.length}
                  </div>
                  <div className="text-slate-500">
                    {language === 'fr' ? 'cours inclus' : 'courses included'}
                  </div>
                </div>

                {/* Enroll button */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 mb-4"
                >
                  {t.elearning.enroll}
                </Button>

                {/* Path includes */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-semibold text-slate-800 mb-3">
                    {language === 'fr' ? 'Ce parcours comprend' : 'This path includes'}
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <BookOpen size={16} className="text-indigo-500" />
                      {courses.length} {language === 'fr' ? 'cours complets' : 'complete courses'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock size={16} className="text-indigo-500" />
                      {path.duration_hours || totalDuration}h {language === 'fr' ? 'de formation' : 'of training'}
                    </li>
                    {path.certificate_enabled && (
                      <li className="flex items-center gap-2">
                        <Award size={16} className="text-indigo-500" />
                        {language === 'fr' ? 'Certificat de parcours' : 'Path certificate'}
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <GraduationCap size={16} className="text-indigo-500" />
                      {language === 'fr' ? 'Accès à vie' : 'Lifetime access'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-[5%]">
        <div className="max-w-6xl mx-auto">
          {/* About */}
          {description && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen size={22} className="text-indigo-500" />
                {t.elearning.pathDescription}
              </h2>
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          )}

          {/* Requirements to complete */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle size={22} className="text-emerald-500" />
              {language === 'fr' ? 'Pour obtenir le certificat' : 'To earn the certificate'}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-600">
                  {path.require_all_courses
                    ? (language === 'fr' ? 'Compléter tous les cours du parcours' : 'Complete all courses in the path')
                    : (language === 'fr' ? 'Compléter les cours obligatoires' : 'Complete required courses')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-600">
                  {language === 'fr'
                    ? `Obtenir au moins ${path.min_passing_score}% à chaque évaluation`
                    : `Score at least ${path.min_passing_score}% on each assessment`}
                </span>
              </li>
              {path.require_final_exam && (
                <li className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">
                    {language === 'fr' ? "Réussir l'examen final" : 'Pass the final exam'}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Path Courses */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-500" />
              {t.elearning.pathCourses}
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({courses.length} {language === 'fr' ? 'cours' : 'courses'})
              </span>
            </h2>

            {courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course, idx) => (
                  <Link
                    key={course.id}
                    href={`/${lang}/oh-elearning/courses/${course.slug}`}
                    className="block"
                  >
                    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-4">
                      {/* Order number */}
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {idx + 1}
                      </div>

                      {/* Thumbnail */}
                      {course.thumbnail && (
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 hidden sm:block">
                          <Image
                            src={getImageUrl(course.thumbnail)}
                            alt={course.title_fr}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 mb-1 truncate">
                          {language === 'en' && course.title_en ? course.title_en : course.title_fr}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {course.duration_hours}h
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen size={14} />
                            {course.module_count || 0} {t.elearning.modules}
                          </span>
                          <LevelBadge level={course.level} lang={language} size="sm" />
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight size={20} className="text-slate-400 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-500">
                  {language === 'fr'
                    ? 'Les cours de ce parcours seront bientôt disponibles'
                    : 'Courses for this path will be available soon'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
