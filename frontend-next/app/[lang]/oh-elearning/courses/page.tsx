'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { BookOpen, ArrowLeft, Map, GraduationCap, Users, Award, TrendingUp } from 'lucide-react';
import { Language, ELearningCourse, ELearningCategory } from '@/lib/types';
import { getTranslation, isValidLanguage } from '@/lib/translations';
import { getELearningCourses, getELearningCategories } from '@/lib/api';
import { Button, Spinner } from '@/components/ui';
import { CourseCard, CourseFilters } from '@/components/elearning';

function CoursesContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = (params.lang as string) || 'fr';

  if (!isValidLanguage(lang)) {
    return null;
  }

  const language = lang as Language;
  const t = getTranslation(language);

  const [courses, setCourses] = useState<ELearningCourse[]>([]);
  const [categories, setCategories] = useState<ELearningCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedLevel, setSelectedLevel] = useState('');

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getELearningCourses({
        status: 'published',
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        level: selectedLevel || undefined,
        limit: 50,
      });
      if (res.success) {
        setCourses(res.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedLevel]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getELearningCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCourses();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchCourses]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 pt-24 pb-16">
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
              <BookOpen size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                {t.elearning.allCourses}
              </h1>
              <p className="text-lg text-blue-100 max-w-2xl">
                {language === 'fr'
                  ? 'Explorez notre catalogue de formations en santé publique et approche One Health'
                  : 'Explore our catalog of public health and One Health training courses'}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">{courses.length || '—'}</div>
                <div className="text-sm text-blue-200">{language === 'fr' ? 'Cours' : 'Courses'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">{categories.length}</div>
                <div className="text-sm text-blue-200">{language === 'fr' ? 'Catégories' : 'Categories'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Award size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-blue-200">{language === 'fr' ? 'Gratuit' : 'Free'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="pt-8" />

      {/* Filters */}
      <section className="px-[5%] mb-8">
        <div className="max-w-6xl mx-auto">
          <CourseFilters
            lang={language}
            categories={categories}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedLevel={selectedLevel}
            onSearchChange={setSearchQuery}
            onCategoryChange={setSelectedCategory}
            onLevelChange={setSelectedLevel}
          />
        </div>
      </section>

      {/* Courses Grid */}
      <section className="px-[5%] pb-16">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : courses.length > 0 ? (
            <>
              <p className="text-sm text-slate-500 mb-6">
                {courses.length} {language === 'fr' ? 'cours trouvés' : 'courses found'}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} lang={language} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {t.elearning.noCourses}
              </h3>
              <p className="text-slate-500 mb-6">
                {language === 'fr'
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Try adjusting your search filters'}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedLevel('');
                }}
              >
                {language === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
      <Spinner />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CoursesContent />
    </Suspense>
  );
}
