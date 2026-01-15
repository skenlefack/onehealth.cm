import { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap, BookOpen, Award, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Language } from '@/lib/types';
import { getTranslation, isValidLanguage } from '@/lib/translations';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui';
import { getELearningCourses, getELearningPaths, getELearningCategories, getELearningStats } from '@/lib/api';
import { CourseCard, PathCard } from '@/components/elearning';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;

  const titles = {
    fr: 'OH E-Learning | Formation One Health Cameroun',
    en: 'OH E-Learning | One Health Cameroon Training',
  };

  const descriptions = {
    fr: "Plateforme de formation en ligne One Health : cours sur les zoonoses, la surveillance sanitaire et l'approche Une Seule Santé.",
    en: 'One Health online training platform: courses on zoonoses, health surveillance and One Health approach.',
  };

  return {
    title: titles[lang as Language] || titles.fr,
    description: descriptions[lang as Language] || descriptions.fr,
  };
}

export default async function OHElearningPage({ params }: PageProps) {
  const { lang } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const language = lang as Language;
  const t = getTranslation(language);

  // Fetch data
  const [coursesRes, pathsRes, categoriesRes, statsRes] = await Promise.all([
    getELearningCourses({ status: 'published', featured: true, limit: 6 }),
    getELearningPaths({ status: 'published', featured: true, limit: 3 }),
    getELearningCategories(),
    getELearningStats(),
  ]);

  const featuredCourses = coursesRes.success ? coursesRes.data : [];
  const featuredPaths = pathsRes.success ? pathsRes.data : [];
  const categories = categoriesRes.success ? categoriesRes.data : [];
  const stats = statsRes.success ? statsRes.data : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-[5%]">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
            <GraduationCap size={18} />
            {t.elearning.badge}
          </span>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800 mb-4">
            {t.elearning.title}
          </h1>
          <p className="text-2xl text-blue-600 font-semibold mb-6">
            {t.elearning.subtitle}
          </p>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            {t.elearning.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`/${lang}/oh-elearning/courses`}>
              <Button variant="primary" size="lg" className="bg-blue-600 hover:bg-blue-700">
                <BookOpen size={20} className="mr-2" />
                {t.elearning.allCourses}
              </Button>
            </Link>
            <Link href={`/${lang}/oh-elearning/paths`}>
              <Button variant="outline" size="lg">
                <GraduationCap size={20} className="mr-2" />
                {t.elearning.allPaths}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-12 px-[5%] bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 rounded-2xl bg-slate-50">
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={28} className="text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-1">
                  {stats.courses.published || 0}
                </div>
                <div className="text-sm text-slate-500">
                  {language === 'fr' ? 'Cours disponibles' : 'Courses available'}
                </div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-slate-50">
                <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap size={28} className="text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-1">
                  {stats.paths.published || 0}
                </div>
                <div className="text-sm text-slate-500">
                  {language === 'fr' ? 'Parcours diplômants' : 'Learning paths'}
                </div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-slate-50">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <Users size={28} className="text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-1">
                  {stats.enrollments.total || 0}
                </div>
                <div className="text-sm text-slate-500">
                  {language === 'fr' ? 'Inscriptions' : 'Enrollments'}
                </div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-slate-50">
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Award size={28} className="text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-1">
                  {stats.certificates.total || 0}
                </div>
                <div className="text-sm text-slate-500">
                  {language === 'fr' ? 'Certificats délivrés' : 'Certificates issued'}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Learning Paths */}
      {featuredPaths.length > 0 && (
        <section className="py-16 px-[5%]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold mb-3">
                  <Sparkles size={14} />
                  {language === 'fr' ? 'Parcours en vedette' : 'Featured paths'}
                </span>
                <h2 className="text-3xl font-bold text-slate-800">
                  {language === 'fr' ? 'Parcours Diplômants' : 'Learning Paths'}
                </h2>
              </div>
              <Link href={`/${lang}/oh-elearning/paths`}>
                <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
                  {language === 'fr' ? 'Voir tous' : 'View all'}
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPaths.map((path) => (
                <PathCard key={path.id} path={path} lang={language} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-16 px-[5%] bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-3">
                  <Sparkles size={14} />
                  {language === 'fr' ? 'Cours en vedette' : 'Featured courses'}
                </span>
                <h2 className="text-3xl font-bold text-slate-800">
                  {language === 'fr' ? 'Cours Populaires' : 'Popular Courses'}
                </h2>
              </div>
              <Link href={`/${lang}/oh-elearning/courses`}>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                  {language === 'fr' ? 'Voir tous' : 'View all'}
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} lang={language} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 px-[5%]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                {language === 'fr' ? 'Explorez par Catégorie' : 'Explore by Category'}
              </h2>
              <p className="text-slate-600">
                {language === 'fr'
                  ? 'Trouvez des cours adaptés à vos besoins'
                  : 'Find courses tailored to your needs'}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.filter(c => c.is_active).map((category) => (
                <Link
                  key={category.id}
                  href={`/${lang}/oh-elearning/courses?category=${category.slug}`}
                  className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl"
                    style={{ backgroundColor: `${category.color}20` || '#e0e7ff' }}
                  >
                    {category.icon || '📚'}
                  </div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {language === 'en' && category.name_en ? category.name_en : category.name_fr}
                  </h3>
                  {category.course_count !== undefined && (
                    <p className="text-sm text-slate-500 mt-1">
                      {category.course_count} {language === 'fr' ? 'cours' : 'courses'}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State if no content */}
      {featuredCourses.length === 0 && featuredPaths.length === 0 && (
        <section className="py-16 px-[5%]">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
              <BookOpen size={40} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              {language === 'fr' ? 'Bientôt disponible' : 'Coming Soon'}
            </h2>
            <p className="text-slate-600 mb-8">
              {language === 'fr'
                ? 'Notre catalogue de cours est en cours de préparation. Revenez bientôt !'
                : 'Our course catalog is being prepared. Check back soon!'}
            </p>
            <Link href={`/${lang}`}>
              <Button variant="outline">
                {language === 'fr' ? 'Retour à l\'accueil' : 'Back to home'}
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
