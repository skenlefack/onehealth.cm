'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Language, ELearningCourse, ELearningCategory } from '@/lib/types';
import { getTranslation, isValidLanguage } from '@/lib/translations';
import { getELearningCourses, getELearningCategories } from '@/lib/api';
import { Button, Spinner } from '@/components/ui';
import { CourseCard, CourseFilters } from '@/components/elearning';

export default function CoursesPage() {
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
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BookOpen size={28} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                {t.elearning.allCourses}
              </h1>
              <p className="text-slate-500">
                {language === 'fr'
                  ? 'Explorez notre catalogue de formations'
                  : 'Explore our training catalog'}
              </p>
            </div>
          </div>
        </div>
      </section>

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
