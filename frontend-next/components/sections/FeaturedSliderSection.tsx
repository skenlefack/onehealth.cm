'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Clock, Eye } from 'lucide-react';
import { Language, Post } from '@/lib/types';
import { Translation } from '@/lib/translations';
import { getImageUrl } from '@/lib/api';

interface FeaturedSliderSectionProps {
  lang: Language;
  t: Translation;
  posts: Post[];
}

export function FeaturedSliderSection({ lang, t, posts }: FeaturedSliderSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const featuredPosts = posts.slice(0, 10);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
  }, [featuredPosts.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
  }, [featuredPosts.length]);

  useEffect(() => {
    if (!isAutoPlaying || featuredPosts.length === 0) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, featuredPosts.length]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (featuredPosts.length === 0) {
    return null;
  }

  const currentPost = featuredPosts[currentSlide];

  // Helper to get localized content
  const getLocalizedTitle = (post: Post) => {
    return lang === 'en' ? (post.title_en || post.title_fr || post.title) : (post.title_fr || post.title);
  };

  const getLocalizedExcerpt = (post: Post) => {
    return lang === 'en' ? (post.excerpt_en || post.excerpt_fr || post.excerpt) : (post.excerpt_fr || post.excerpt);
  };

  const getLocalizedContent = (post: Post) => {
    return lang === 'en' ? (post.content_en || post.content_fr || post.content) : (post.content_fr || post.content);
  };

  return (
    <div
      className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={getImageUrl(currentPost.featured_image)}
          alt={getLocalizedTitle(currentPost)}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        {/* Category Badge */}
        {currentPost.category_name && (
          <span className="inline-block px-4 py-1.5 bg-oh-orange text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
            {currentPost.category_name}
          </span>
        )}

        {/* Title */}
        <Link href={`/${lang}/news/${currentPost.slug}`}>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight hover:text-oh-orange transition-colors line-clamp-2">
            {getLocalizedTitle(currentPost)}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-white/80 text-lg mb-6 line-clamp-2 max-w-3xl">
          {getLocalizedExcerpt(currentPost) || getLocalizedContent(currentPost)?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-6 text-white/70 text-sm">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{formatDate(currentPost.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye size={16} />
            <span>{currentPost.view_count || 0} {t.common.views}</span>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 right-8 flex gap-2">
        {featuredPosts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-oh-orange w-8'
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-4 right-4 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium">
        {currentSlide + 1} / {featuredPosts.length}
      </div>
    </div>
  );
}
