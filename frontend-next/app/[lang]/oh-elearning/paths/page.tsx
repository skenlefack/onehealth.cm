'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GraduationCap, ArrowLeft, Search, BookOpen, Award, Users } from 'lucide-react';
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
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 pt-24 pb-16">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-400/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
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
              <GraduationCap size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                {t.elearning.allPaths}
              </h1>
              <p className="text-lg text-indigo-100 max-w-2xl">
                {language === 'fr'
                  ? 'Parcours diplômants pour développer vos compétences en santé publique et approche One Health'
                  : 'Learning paths to develop your skills in public health and One Health approach'}
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
                <div className="text-2xl font-bold">{paths.length || '—'}</div>
                <div className="text-sm text-indigo-200">{language === 'fr' ? 'Parcours' : 'Paths'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Award size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-indigo-200">{language === 'fr' ? 'Certifiants' : 'Certified'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">Pro</div>
                <div className="text-sm text-indigo-200">{language === 'fr' ? 'Niveau' : 'Level'}</div>
              </div>
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
