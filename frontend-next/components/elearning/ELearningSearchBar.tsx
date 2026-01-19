'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Sparkles, BookOpen, GraduationCap, Clock, ArrowRight } from 'lucide-react';
import { Language } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ELearningSearchBarProps {
  lang: Language;
  className?: string;
}

export function ELearningSearchBar({ lang, className }: ELearningSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const placeholders = {
    fr: 'Rechercher un cours, un parcours...',
    en: 'Search for a course, a path...',
  };

  const suggestions = {
    fr: [
      { type: 'course', text: 'Zoonoses prioritaires', icon: BookOpen },
      { type: 'course', text: 'Surveillance sanitaire', icon: BookOpen },
      { type: 'path', text: 'Certification One Health', icon: GraduationCap },
      { type: 'recent', text: 'Épidémiologie', icon: Clock },
    ],
    en: [
      { type: 'course', text: 'Priority Zoonoses', icon: BookOpen },
      { type: 'course', text: 'Health Surveillance', icon: BookOpen },
      { type: 'path', text: 'One Health Certification', icon: GraduationCap },
      { type: 'recent', text: 'Epidemiology', icon: Clock },
    ],
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (searchTerm.trim()) {
      router.push(`/${lang}/oh-elearning/courses?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    handleSearch(text);
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-2xl mx-auto', className)}>
      {/* Search Input Container */}
      <div
        className={cn(
          'relative flex items-center bg-white rounded-full border-2 transition-all duration-300',
          isFocused
            ? 'border-blue-500 shadow-lg shadow-blue-500/10'
            : 'border-slate-200 hover:border-slate-300 shadow-md hover:shadow-lg'
        )}
      >
        {/* Search Icon */}
        <div className="pl-5 pr-2">
          <Search
            size={22}
            className={cn(
              'transition-colors duration-200',
              isFocused ? 'text-blue-500' : 'text-slate-400'
            )}
          />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholders[lang]}
          className={cn(
            'flex-1 py-4 px-2 text-base text-slate-700 placeholder-slate-400',
            'bg-transparent outline-none'
          )}
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={clearSearch}
            className="p-2 mr-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={() => handleSearch()}
          className={cn(
            'flex items-center gap-2 px-6 py-3 mr-1.5 rounded-full font-medium transition-all duration-200',
            'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600',
            'text-white shadow-md hover:shadow-lg'
          )}
        >
          <Search size={18} />
          <span className="hidden sm:inline">
            {lang === 'fr' ? 'Rechercher' : 'Search'}
          </span>
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && !query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
          {/* Quick suggestions header */}
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Sparkles size={14} className="text-amber-500" />
              {lang === 'fr' ? 'Suggestions populaires' : 'Popular suggestions'}
            </div>
          </div>

          {/* Suggestions list */}
          <div className="py-2">
            {suggestions[lang].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left group"
              >
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                  suggestion.type === 'course' && 'bg-blue-100 text-blue-600',
                  suggestion.type === 'path' && 'bg-violet-100 text-violet-600',
                  suggestion.type === 'recent' && 'bg-slate-100 text-slate-500'
                )}>
                  <suggestion.icon size={18} />
                </div>
                <span className="flex-1 text-slate-700 group-hover:text-slate-900">
                  {suggestion.text}
                </span>
                <ArrowRight
                  size={16}
                  className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"
                />
              </button>
            ))}
          </div>

          {/* Browse all */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
            <button
              onClick={() => router.push(`/${lang}/oh-elearning/courses`)}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <BookOpen size={16} />
              {lang === 'fr' ? 'Parcourir tous les cours' : 'Browse all courses'}
            </button>
          </div>
        </div>
      )}

      {/* Search results preview when typing */}
      {showSuggestions && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
          <div className="py-2">
            {/* Search for query option */}
            <button
              onClick={() => handleSearch()}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Search size={18} />
              </div>
              <span className="flex-1">
                <span className="text-slate-500">
                  {lang === 'fr' ? 'Rechercher ' : 'Search for '}
                </span>
                <span className="font-medium text-slate-800">"{query}"</span>
              </span>
              <ArrowRight
                size={16}
                className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all"
              />
            </button>

            {/* Filtered suggestions based on query */}
            {suggestions[lang]
              .filter(s => s.text.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 3)
              .map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center',
                    suggestion.type === 'course' && 'bg-blue-100 text-blue-600',
                    suggestion.type === 'path' && 'bg-violet-100 text-violet-600',
                    suggestion.type === 'recent' && 'bg-slate-100 text-slate-500'
                  )}>
                    <suggestion.icon size={18} />
                  </div>
                  <span className="flex-1 text-slate-700">{suggestion.text}</span>
                  <ArrowRight
                    size={16}
                    className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"
                  />
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
