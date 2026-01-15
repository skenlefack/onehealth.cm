'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, BookOpen, Users, Star, Play } from 'lucide-react';
import { ELearningCourse, Language } from '@/lib/types';
import { getImageUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { LevelBadge } from './LevelBadge';
import { ProgressBar } from './ProgressBar';

interface CourseCardProps {
  course: ELearningCourse;
  lang: Language;
  showProgress?: boolean;
}

export function CourseCard({ course, lang, showProgress = false }: CourseCardProps) {
  const title = lang === 'en' && course.title_en ? course.title_en : course.title_fr;
  const description = lang === 'en' && course.short_description_fr
    ? course.short_description_fr
    : course.short_description_fr;
  const categoryName = lang === 'en' && course.category_name_en
    ? course.category_name_en
    : course.category_name_fr;

  const isEnrolled = !!course.enrollment_id;
  const progressPercent = course.progress_percent || 0;

  return (
    <Link href={`/${lang}/oh-elearning/courses/${course.slug}`}>
      <div className={cn(
        "group relative bg-white rounded-2xl border border-slate-200 overflow-hidden",
        "hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      )}>
        {/* Thumbnail */}
        <div className="relative aspect-video bg-slate-100 overflow-hidden">
          {course.thumbnail ? (
            <Image
              src={getImageUrl(course.thumbnail)}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
              <BookOpen className="w-12 h-12 text-white/50" />
            </div>
          )}

          {/* Play icon overlay */}
          {course.intro_video_url && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-8 h-8 text-blue-600 ml-1" />
              </div>
            </div>
          )}

          {/* Category badge */}
          {categoryName && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-700">
              {categoryName}
            </span>
          )}

          {/* Featured badge */}
          {course.is_featured && (
            <span className="absolute top-3 right-3 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-semibold">
              {lang === 'fr' ? 'En vedette' : 'Featured'}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Level badge */}
          <div className="mb-3">
            <LevelBadge level={course.level} lang={lang} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">
              {description}
            </p>
          )}

          {/* Progress bar for enrolled users */}
          {showProgress && isEnrolled && (
            <div className="mb-4">
              <ProgressBar progress={progressPercent} lang={lang} showLabel />
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.duration_hours}h
            </span>
            {course.module_count !== undefined && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {course.module_count} {lang === 'fr' ? 'modules' : 'modules'}
              </span>
            )}
            {course.enrolled_count > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {course.enrolled_count}
              </span>
            )}
          </div>

          {/* Rating */}
          {course.average_rating > 0 && (
            <div className="flex items-center gap-1 mt-3">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium text-slate-700">
                {course.average_rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Instructor */}
          {course.instructor_name && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              {course.instructor_photo ? (
                <Image
                  src={getImageUrl(course.instructor_photo)}
                  alt={course.instructor_name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-slate-600">
                    {course.instructor_name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-700">{course.instructor_name}</p>
                {course.instructor_title && (
                  <p className="text-xs text-slate-500">{course.instructor_title}</p>
                )}
              </div>
            </div>
          )}

          {/* Price / Free badge */}
          <div className="mt-4">
            {course.is_free ? (
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                {lang === 'fr' ? 'Gratuit' : 'Free'}
              </span>
            ) : (
              <span className="text-lg font-bold text-blue-600">
                {course.price.toLocaleString()} FCFA
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
