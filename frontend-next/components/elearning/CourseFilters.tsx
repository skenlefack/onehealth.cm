'use client';

import { Search } from 'lucide-react';
import { ELearningCategory, Language } from '@/lib/types';
import { getTranslation } from '@/lib/translations';
import { cn } from '@/lib/utils';

interface CourseFiltersProps {
  lang: Language;
  categories: ELearningCategory[];
  searchQuery: string;
  selectedCategory: string;
  selectedLevel: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onLevelChange: (value: string) => void;
}

export function CourseFilters({
  lang,
  categories,
  searchQuery,
  selectedCategory,
  selectedLevel,
  onSearchChange,
  onCategoryChange,
  onLevelChange,
}: CourseFiltersProps) {
  const t = getTranslation(lang);

  const levels = [
    { value: '', label: t.elearning.allLevels },
    { value: 'beginner', label: t.elearning.beginner },
    { value: 'intermediate', label: t.elearning.intermediate },
    { value: 'advanced', label: t.elearning.advanced },
  ];

  const selectClasses = cn(
    'px-4 py-3 bg-white border border-slate-200 rounded-xl',
    'text-sm text-slate-700 font-medium',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'cursor-pointer transition-all duration-200'
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.elearning.searchPlaceholder}
            className={cn(
              'w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl',
              'text-sm text-slate-700 placeholder-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white',
              'transition-all duration-200'
            )}
          />
        </div>

        {/* Category filter */}
        <div className="md:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={selectClasses}
            style={{ width: '100%' }}
          >
            <option value="">{t.elearning.allCategories}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {lang === 'en' && category.name_en ? category.name_en : category.name_fr}
              </option>
            ))}
          </select>
        </div>

        {/* Level filter */}
        <div className="md:w-48">
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
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
  );
}
