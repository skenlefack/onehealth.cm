'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, BookOpen, Award, GraduationCap } from 'lucide-react';
import { ELearningLearningPath, Language } from '@/lib/types';
import { getImageUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { LevelBadge } from './LevelBadge';
import { ProgressBar } from './ProgressBar';

interface PathCardProps {
  path: ELearningLearningPath;
  lang: Language;
  showProgress?: boolean;
}

export function PathCard({ path, lang, showProgress = false }: PathCardProps) {
  const title = lang === 'en' && path.title_en ? path.title_en : path.title_fr;
  const description = lang === 'en' && path.description_en
    ? path.description_en
    : path.description_fr;
  const categoryName = lang === 'en' && path.category_name_fr
    ? path.category_name_fr
    : path.category_name_fr;

  const isEnrolled = !!path.enrollment_id;
  const progressPercent = path.progress_percent || 0;

  return (
    <Link href={`/${lang}/oh-elearning/paths/${path.slug}`}>
      <div className={cn(
        "group relative bg-white rounded-2xl border-2 border-indigo-200 overflow-hidden",
        "hover:shadow-xl hover:-translate-y-1 hover:border-indigo-400 transition-all duration-300"
      )}>
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Thumbnail */}
        <div className="relative aspect-[2/1] bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
          {path.thumbnail ? (
            <Image
              src={getImageUrl(path.thumbnail)}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="w-16 h-16 text-white/30" />
            </div>
          )}

          {/* Overlay with badge */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Path badge */}
          <span className="absolute top-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            {lang === 'fr' ? 'Parcours diplômant' : 'Learning Path'}
          </span>

          {/* Certificate badge */}
          {path.certificate_enabled && (
            <span className="absolute top-3 right-3 px-3 py-1.5 bg-amber-500 text-white rounded-full text-xs font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              {lang === 'fr' ? 'Certificat' : 'Certificate'}
            </span>
          )}

          {/* Course count overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white rounded-full text-sm font-medium">
              {path.course_count || 0} {lang === 'fr' ? 'cours' : 'courses'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Level badge */}
          <div className="mb-3">
            <LevelBadge level={path.level} lang={lang} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
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
              {path.duration_hours}h
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {path.course_count || 0} {lang === 'fr' ? 'cours' : 'courses'}
            </span>
            {path.enrolled_count !== undefined && path.enrolled_count > 0 && (
              <span className="flex items-center gap-1 text-indigo-600">
                {path.enrolled_count} {lang === 'fr' ? 'inscrits' : 'enrolled'}
              </span>
            )}
          </div>

          {/* Instructor */}
          {path.instructor_name && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-600">
                <span className="font-medium">{lang === 'fr' ? 'Dirigé par' : 'Led by'}:</span>{' '}
                {path.instructor_name}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
