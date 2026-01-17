import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, Clock, BookOpen, Users, Star, Play,
  CheckCircle, Lock, ChevronDown, ChevronRight, Award, GraduationCap
} from 'lucide-react';
import { Language } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import { getELearningCourse, getELearningCourseCurriculum, getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui';
import { LevelBadge, ProgressBar, EnrollButton } from '@/components/elearning';

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;

  const courseRes = await getELearningCourse(slug);
  if (!courseRes.success) {
    return { title: 'Course not found' };
  }

  const course = courseRes.data;
  const title = lang === 'en' && course.title_en ? course.title_en : course.title_fr;
  const description = lang === 'en' && course.description_en
    ? course.description_en
    : course.description_fr;

  return {
    title: `${title} | OH E-Learning`,
    description: description?.substring(0, 160),
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const language = lang as Language;
  const t = getTranslation(language);

  // Fetch course and curriculum
  const courseRes = await getELearningCourse(slug);
  if (!courseRes.success || !courseRes.data) {
    notFound();
  }

  const course = courseRes.data;
  const curriculumRes = await getELearningCourseCurriculum(course.id);
  const modules = curriculumRes.success ? curriculumRes.data.modules : [];

  const title = language === 'en' && course.title_en ? course.title_en : course.title_fr;
  const description = language === 'en' && course.description_en
    ? course.description_en
    : course.description_fr;
  const categoryName = language === 'en' && course.category_name_en
    ? course.category_name_en
    : course.category_name_fr;

  // Calculate total lessons
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);

  // Parse learning objectives
  let objectives: string[] = [];
  if (course.learning_objectives) {
    try {
      objectives = typeof course.learning_objectives === 'string'
        ? JSON.parse(course.learning_objectives)
        : course.learning_objectives;
    } catch {
      objectives = [];
    }
  }

  // Parse prerequisites
  let prerequisites: string[] = [];
  if (course.prerequisites) {
    try {
      prerequisites = typeof course.prerequisites === 'string'
        ? JSON.parse(course.prerequisites)
        : course.prerequisites;
    } catch {
      prerequisites = [];
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="pt-28 pb-12 px-[5%] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <Link
            href={`/${lang}/oh-elearning/courses`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            {t.elearning.allCourses}
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              {/* Category & Level */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {categoryName && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {categoryName}
                  </span>
                )}
                <LevelBadge level={course.level} lang={language} />
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {title}
              </h1>

              {/* Short description */}
              {course.short_description_fr && (
                <p className="text-lg text-white/90 mb-6">
                  {course.short_description_fr}
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-white/80 mb-6">
                <span className="flex items-center gap-2">
                  <Clock size={18} />
                  {course.duration_hours} {t.elearning.hours}
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen size={18} />
                  {modules.length} {t.elearning.modules}
                </span>
                <span className="flex items-center gap-2">
                  <Play size={18} />
                  {totalLessons} {t.elearning.lessons}
                </span>
                {course.enrolled_count > 0 && (
                  <span className="flex items-center gap-2">
                    <Users size={18} />
                    {course.enrolled_count} {t.elearning.students}
                  </span>
                )}
                {course.average_rating > 0 && (
                  <span className="flex items-center gap-2">
                    <Star size={18} className="fill-amber-400 text-amber-400" />
                    {course.average_rating.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Instructor */}
              {course.instructor_name && (
                <div className="flex items-center gap-3">
                  {course.instructor_photo ? (
                    <Image
                      src={getImageUrl(course.instructor_photo)}
                      alt={course.instructor_name}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-white/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-lg font-medium">
                        {course.instructor_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-white/70">{t.elearning.instructor}</p>
                    <p className="font-medium">{course.instructor_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 text-slate-800">
                {/* Thumbnail */}
                {course.thumbnail && (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                    <Image
                      src={getImageUrl(course.thumbnail)}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                    {course.intro_video_url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-blue-600 ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="mb-4">
                  {course.is_free ? (
                    <span className="text-2xl font-bold text-emerald-600">
                      {language === 'fr' ? 'Gratuit' : 'Free'}
                    </span>
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">
                      {course.price.toLocaleString()} FCFA
                    </span>
                  )}
                </div>

                {/* Enroll button */}
                <div className="mb-4">
                  <EnrollButton
                    courseId={course.id}
                    courseSlug={slug}
                    isFree={course.is_free}
                    lang={language}
                  />
                </div>

                {/* Course includes */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-semibold text-slate-800 mb-3">
                    {language === 'fr' ? 'Ce cours comprend' : 'This course includes'}
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <Play size={16} className="text-blue-500" />
                      {course.duration_hours}h {language === 'fr' ? 'de contenu vidéo' : 'of video content'}
                    </li>
                    <li className="flex items-center gap-2">
                      <BookOpen size={16} className="text-blue-500" />
                      {totalLessons} {t.elearning.lessons}
                    </li>
                    <li className="flex items-center gap-2">
                      <Award size={16} className="text-blue-500" />
                      {language === 'fr' ? 'Certificat de fin' : 'Completion certificate'}
                    </li>
                    <li className="flex items-center gap-2">
                      <GraduationCap size={16} className="text-blue-500" />
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
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              {description && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BookOpen size={22} className="text-blue-500" />
                    {t.elearning.about}
                  </h2>
                  <div
                    className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </div>
              )}

              {/* Objectives */}
              {objectives.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle size={22} className="text-emerald-500" />
                    {t.elearning.objectives}
                  </h2>
                  <ul className="space-y-3">
                    {objectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {prerequisites.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">
                    {t.elearning.prerequisites}
                  </h2>
                  <ul className="space-y-2">
                    {prerequisites.map((prereq, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <ChevronRight size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Curriculum */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <BookOpen size={22} className="text-blue-500" />
                  {t.elearning.curriculum}
                </h2>

                {modules.length > 0 ? (
                  <div className="space-y-4">
                    {modules.map((module, moduleIdx) => (
                      <div
                        key={module.id}
                        className="border border-slate-200 rounded-xl overflow-hidden"
                      >
                        {/* Module header */}
                        <div className="bg-slate-50 p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                              {moduleIdx + 1}
                            </span>
                            <div>
                              <h3 className="font-semibold text-slate-800">
                                {language === 'en' && module.title_en
                                  ? module.title_en
                                  : module.title_fr}
                              </h3>
                              <p className="text-xs text-slate-500">
                                {module.lessons?.length || 0} {t.elearning.lessons} •{' '}
                                {module.duration_minutes} min
                              </p>
                            </div>
                          </div>
                          <ChevronDown size={20} className="text-slate-400" />
                        </div>

                        {/* Lessons */}
                        {module.lessons && module.lessons.length > 0 && (
                          <div className="divide-y divide-slate-100">
                            {module.lessons.map((lesson, lessonIdx) => (
                              <div
                                key={lesson.id}
                                className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                              >
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-medium">
                                  {lessonIdx + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-700">
                                    {language === 'en' && lesson.title_en
                                      ? lesson.title_en
                                      : lesson.title_fr}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    {lesson.content_type === 'video' && (
                                      <span className="flex items-center gap-1">
                                        <Play size={12} />
                                        {t.elearning.video}
                                      </span>
                                    )}
                                    {lesson.content_type === 'text' && (
                                      <span>{t.elearning.text}</span>
                                    )}
                                    {lesson.content_type === 'pdf' && (
                                      <span>{t.elearning.pdf}</span>
                                    )}
                                    <span>{lesson.duration_minutes} min</span>
                                  </div>
                                </div>
                                {lesson.is_preview ? (
                                  <span className="text-xs text-blue-600 font-medium">
                                    {language === 'fr' ? 'Aperçu' : 'Preview'}
                                  </span>
                                ) : (
                                  <Lock size={16} className="text-slate-300" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">
                    {language === 'fr'
                      ? 'Le programme sera bientôt disponible'
                      : 'Curriculum coming soon'}
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar - empty on mobile, enrollment card sticky on desktop */}
            <div className="lg:col-span-1">
              {/* This space is for future sidebar content like related courses */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
