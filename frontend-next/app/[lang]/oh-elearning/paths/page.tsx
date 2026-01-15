'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GraduationCap, ArrowLeft, Search } from 'lucide-react';
import { Language, ELearningLearningPath, ELearningCategory } from '@/lib/types';
import { getTranslation, isValidLanguage } from '@/lib/translations';
import { getELearningPaths, getELearningCategories } from '@/lib/api';
import { Button, Spinner } from '@/components/ui';
import { PathCard } from '@/components/elearning';
import { cn } from '@/lib/utils';

export default function PathsPage() {
  const params = useParams();
  const lang = (params.lang as string) || 'fr';

  if (!isValidLanguage(lang)) {
    return null;
  }

  const language = lang as Language;
  const t = getTranslation(language);

  const [paths, setPaths] = useState<ELearningLearningPath[]>([]);
  const [categories, setCategories] = useState<ELearningCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const levels = [
    { value: '', label: t.elearning.allLevels },
    { value: 'beginner', label: t.elearning.beginner },
    { value: 'intermediate', label: t.elearning.intermediate },
    { value: 'advanced', label: t.elearning.advanced },
  ];

  const fetchPaths = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getELearningPaths({
        status: 'published',
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        level: selectedLevel || undefined,
        limit: 50,
      });
      if (res.success) {
        setPaths(res.data);
      }
    } catch (error) {
      console.error('Error fetching paths:', error);
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
      fetchPaths();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchPaths]);

  const selectClasses = cn(
    'px-4 py-3 bg-white border border-slate-200 rounded-xl',
    'text-sm text-slate-700 font-medium',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
    'cursor-pointer transition-all duration-200'
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="pt-32 pb-8 px-[5%]">
        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <Link
            href={`/${lang}/oh-elearning`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            {t.common.back}
          </Link>

          {/* Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <GraduationCap size={28} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                {t.elearning.allPaths}
              </h1>
              <p className="text-slate-500">
                {language === 'fr'
                  ? 'Parcours diplômants pour développer vos compétences'
                  : 'Learning paths to develop your skills'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-[5%] mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'fr' ? 'Rechercher un parcours...' : 'Search for a path...'}
                  className={cn(
                    'w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl',
                    'text-sm text-slate-700 placeholder-slate-400',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white',
                    'transition-all duration-200'
                  )}
                />
              </div>

              {/* Category filter */}
              <div className="md:w-56">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={selectClasses}
                  style={{ width: '100%' }}
                >
                  <option value="">{t.elearning.allCategories}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {language === 'en' && category.name_en ? category.name_en : category.name_fr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level filter */}
              <div className="md:w-48">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className={selectClasses}
                  style={{ width: '100%' }}
                >
                  {levels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Paths Grid */}
      <section className="px-[5%] pb-16">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : paths.length > 0 ? (
            <>
              <p className="text-sm text-slate-500 mb-6">
                {paths.length} {language === 'fr' ? 'parcours trouvés' : 'paths found'}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paths.map((path) => (
                  <PathCard key={path.id} path={path} lang={language} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {t.elearning.noPaths}
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
