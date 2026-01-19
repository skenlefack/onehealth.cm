import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap, BookOpen, Award, Users, ArrowRight, Sparkles, Search, Play, Clock, Star, TrendingUp,
  Heart, PawPrint, Leaf, Globe, Activity, Bug, MessageCircle, Microscope, Shield, Stethoscope,
  Brain, Dna, FlaskConical, Syringe, Pill, HeartPulse, Thermometer, Eye, Ear, Bone,
  LucideIcon
} from 'lucide-react';
import { Language } from '@/lib/types';
import { getTranslation, isValidLanguage } from '@/lib/translations';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui';
import { getELearningCourses, getELearningPaths, getELearningCategories, getELearningStats, getImageUrl } from '@/lib/api';
import { CourseCard, PathCard } from '@/components/elearning';
import { ELearningSearchBar } from '@/components/elearning/ELearningSearchBar';

// Icon mapping for categories
const iconMap: Record<string, LucideIcon> = {
  'heart': Heart,
  'Heart': Heart,
  'paw-print': PawPrint,
  'pawprint': PawPrint,
  'leaf': Leaf,
  'globe': Globe,
  'activity': Activity,
  'users': Users,
  'bug': Bug,
  'message-circle': MessageCircle,
  'microscope': Microscope,
  'shield': Shield,
  'stethoscope': Stethoscope,
  'brain': Brain,
  'dna': Dna,
  'flask': FlaskConical,
  'syringe': Syringe,
  'pill': Pill,
  'heartpulse': HeartPulse,
  'thermometer': Thermometer,
  'eye': Eye,
  'ear': Ear,
  'bone': Bone,
  'book': BookOpen,
  'graduation': GraduationCap,
  'award': Award,
  'default': BookOpen,
};

function getCategoryIcon(iconName?: string): LucideIcon {
  if (!iconName) return BookOpen;
  const normalizedName = iconName.toLowerCase().replace(/[_\s]/g, '-');
  return iconMap[iconName] || iconMap[normalizedName] || BookOpen;
}

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

  // Color palette for categories
  const categoryColors = [
    { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500', light: 'bg-blue-50', ring: 'ring-blue-500/20' },
    { gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500', light: 'bg-emerald-50', ring: 'ring-emerald-500/20' },
    { gradient: 'from-violet-500 to-violet-600', bg: 'bg-violet-500', light: 'bg-violet-50', ring: 'ring-violet-500/20' },
    { gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-500', light: 'bg-amber-50', ring: 'ring-amber-500/20' },
    { gradient: 'from-rose-500 to-rose-600', bg: 'bg-rose-500', light: 'bg-rose-50', ring: 'ring-rose-500/20' },
    { gradient: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-500', light: 'bg-cyan-50', ring: 'ring-cyan-500/20' },
    { gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-500', light: 'bg-indigo-50', ring: 'ring-indigo-500/20' },
    { gradient: 'from-teal-500 to-teal-600', bg: 'bg-teal-500', light: 'bg-teal-50', ring: 'ring-teal-500/20' },
    { gradient: 'from-pink-500 to-pink-600', bg: 'bg-pink-500', light: 'bg-pink-50', ring: 'ring-pink-500/20' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section with Search */}
      <section className="relative pt-20 pb-8 px-[5%] overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Logo / Brand */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/20">
              <Image
                src="/images/one-health.jpg"
                alt="One Health"
                fill
                className="object-cover"
              />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                OH E-Learning
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">ONE HEALTH CAMEROON</p>
            </div>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            {language === 'fr'
              ? 'Formez-vous à l\'approche One Health'
              : 'Train in the One Health Approach'}
          </h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            {language === 'fr'
              ? 'Accédez à des cours certifiants sur les zoonoses, la surveillance sanitaire et la santé publique'
              : 'Access certified courses on zoonoses, health surveillance and public health'}
          </p>

          {/* Search Bar - Google Style */}
          <ELearningSearchBar lang={language} />

          {/* Quick Stats */}
          {stats && (
            <div className="flex items-center justify-center gap-8 mt-8 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <BookOpen size={16} className="text-blue-500" />
                <span><strong className="text-slate-800">{stats.courses.published || 0}</strong> {language === 'fr' ? 'cours' : 'courses'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Users size={16} className="text-emerald-500" />
                <span><strong className="text-slate-800">{stats.enrollments.total || 0}</strong> {language === 'fr' ? 'apprenants' : 'learners'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Award size={16} className="text-amber-500" />
                <span><strong className="text-slate-800">{stats.certificates.total || 0}</strong> {language === 'fr' ? 'certificats' : 'certificates'}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section - Modern Cards */}
      {categories.length > 0 && (
        <section className="py-12 px-[5%]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {language === 'fr' ? 'Explorer par Catégorie' : 'Browse by Category'}
                </h2>
                <p className="text-slate-500 mt-1">
                  {language === 'fr' ? 'Trouvez le domaine qui vous intéresse' : 'Find the area that interests you'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categories.filter(c => c.is_active).map((category, index) => {
                const color = categoryColors[index % categoryColors.length];
                const IconComponent = getCategoryIcon(category.icon);

                return (
                  <Link
                    key={category.id}
                    href={`/${lang}/oh-elearning/courses?category=${category.slug}`}
                    className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-2xl ring-1 ring-slate-100 hover:ring-2 hover:ring-offset-2 transition-all duration-300 hover:-translate-y-1"
                    style={{ '--tw-ring-color': category.color || undefined } as React.CSSProperties}
                  >
                    {/* Gradient overlay on hover */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `linear-gradient(135deg, ${category.color || '#3B82F6'}ee, ${category.color || '#3B82F6'}dd)` }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon with colored background */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:bg-white/20 group-hover:shadow-xl transition-all duration-300"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      >
                        <IconComponent size={26} className="text-white" strokeWidth={1.5} />
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-slate-800 group-hover:text-white transition-colors mb-1.5 line-clamp-2">
                        {language === 'en' && category.name_en ? category.name_en : category.name_fr}
                      </h3>

                      {/* Course count */}
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 group-hover:text-white/80 transition-colors">
                        <BookOpen size={14} />
                        <span>{category.course_count || 0} {language === 'fr' ? 'cours' : 'courses'}</span>
                      </div>

                      {/* Arrow indicator */}
                      <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 group-hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight size={16} className="text-slate-600 group-hover:text-white" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-12 px-[5%] bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {language === 'fr' ? 'Cours Populaires' : 'Popular Courses'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {language === 'fr' ? 'Les plus suivis par nos apprenants' : 'Most followed by our learners'}
                  </p>
                </div>
              </div>
              <Link href={`/${lang}/oh-elearning/courses`}>
                <Button variant="outline" className="hidden md:flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                  {language === 'fr' ? 'Tous les cours' : 'All courses'}
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} lang={language} />
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="mt-8 text-center md:hidden">
              <Link href={`/${lang}/oh-elearning/courses`}>
                <Button variant="outline" className="border-blue-200 text-blue-600">
                  {language === 'fr' ? 'Voir tous les cours' : 'View all courses'}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Learning Paths */}
      {featuredPaths.length > 0 && (
        <section className="py-12 px-[5%]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {language === 'fr' ? 'Parcours Certifiants' : 'Certification Paths'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {language === 'fr' ? 'Obtenez un certificat reconnu' : 'Get a recognized certificate'}
                  </p>
                </div>
              </div>
              <Link href={`/${lang}/oh-elearning/paths`}>
                <Button variant="outline" className="hidden md:flex items-center gap-2 border-violet-200 text-violet-600 hover:bg-violet-50">
                  {language === 'fr' ? 'Tous les parcours' : 'All paths'}
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPaths.map((path) => (
                <PathCard key={path.id} path={path} lang={language} />
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="mt-8 text-center md:hidden">
              <Link href={`/${lang}/oh-elearning/paths`}>
                <Button variant="outline" className="border-violet-200 text-violet-600">
                  {language === 'fr' ? 'Voir tous les parcours' : 'View all paths'}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Full Width */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 py-20 px-[5%]">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.1)_100%)]" />
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-[10%] w-20 h-20 bg-white/5 rounded-2xl rotate-12 hidden lg:block" />
        <div className="absolute bottom-20 right-[15%] w-16 h-16 bg-white/5 rounded-full hidden lg:block" />
        <div className="absolute top-1/2 right-[8%] w-12 h-12 bg-emerald-400/10 rounded-xl -rotate-12 hidden lg:block" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 shadow-2xl ring-1 ring-white/20">
            <Play size={36} className="text-white ml-1" />
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {language === 'fr'
              ? 'Prêt à développer vos compétences ?'
              : 'Ready to develop your skills?'}
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            {language === 'fr'
              ? 'Rejoignez des centaines de professionnels de santé qui se forment à l\'approche One Health'
              : 'Join hundreds of health professionals training in the One Health approach'}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${lang}/oh-elearning/courses`}
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 shadow-2xl shadow-black/20 text-base px-8 py-4 font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5"
            >
              <BookOpen size={22} />
              {language === 'fr' ? 'Commencer maintenant' : 'Start now'}
            </Link>
            <Link
              href={`/${lang}/oh-elearning/paths`}
              className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 border border-white/30 shadow-xl text-base px-8 py-4 font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5"
            >
              <GraduationCap size={22} />
              {language === 'fr' ? 'Voir les parcours' : 'View paths'}
            </Link>
          </div>

          {/* Stats at bottom */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">{stats?.courses?.published || '10'}+</div>
              <div className="text-blue-200 text-sm mt-1">{language === 'fr' ? 'Cours disponibles' : 'Available courses'}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">{stats?.enrollments?.total || '100'}+</div>
              <div className="text-blue-200 text-sm mt-1">{language === 'fr' ? 'Apprenants actifs' : 'Active learners'}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">{stats?.certificates?.total || '50'}+</div>
              <div className="text-blue-200 text-sm mt-1">{language === 'fr' ? 'Certificats délivrés' : 'Certificates issued'}</div>
            </div>
          </div>
        </div>
      </section>

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
