'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Play, CheckCircle, Clock } from 'lucide-react';
import { Language } from '@/lib/types';
import { ELearningEnrollment } from '@/lib/types';
import { getImageUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

interface EnrolledCourseCardProps {
  lang: Language;
  enrollment: ELearningEnrollment;
}

const translations = {
  fr: {
    continue: 'Continuer',
    completed: 'Terminé',
    progress: 'Progression',
    lastAccessed: 'Dernier accès',
    viewCertificate: 'Voir certificat',
  },
  en: {
    continue: 'Continue',
    completed: 'Completed',
    progress: 'Progress',
    lastAccessed: 'Last accessed',
    viewCertificate: 'View certificate',
  },
};

export function EnrolledCourseCard({ lang, enrollment }: EnrolledCourseCardProps) {
  const t = translations[lang];

  // Get course info from enrollment
  const course = enrollment.course || {
    slug: '',
    title_fr: enrollment.title_fr || 'Cours',
    title_en: enrollment.title_en || 'Course',
    thumbnail: enrollment.thumbnail,
  };

  const title = (lang === 'fr' ? (course.title_fr || course.title_en) : (course.title_en || course.title_fr)) || 'Course';
  const progress = enrollment.progress_percent || 0;
  const isCompleted = enrollment.status === 'completed' || progress === 100;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group">
      {/* Thumbnail */}
      <div className="relative h-40 bg-gray-100">
        {course.thumbnail ? (
          <Image
            src={getImageUrl(course.thumbnail)}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-oh-blue to-oh-green flex items-center justify-center">
            <span className="text-white text-4xl font-bold opacity-30">
              {title.charAt(0)}
            </span>
          </div>
        )}

        {/* Status badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle size={14} />
            {t.completed}
          </div>
        )}

        {/* Progress overlay */}
        {!isCompleted && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/30 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-white text-sm font-medium">{progress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-oh-blue transition-colors">
          {title}
        </h3>

        {/* Last accessed */}
        {enrollment.last_accessed_at && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
            <Clock size={14} />
            {t.lastAccessed}: {formatDate(enrollment.last_accessed_at)}
          </div>
        )}

        {/* Action button */}
        <Link
          href={`/${lang}/oh-elearning/courses/${course.slug}`}
          className={cn(
            'flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium transition-colors',
            isCompleted
              ? 'bg-green-50 text-green-600 hover:bg-green-100'
              : 'bg-oh-blue text-white hover:bg-oh-blue/90'
          )}
        >
          {isCompleted ? (
            <>
              <CheckCircle size={18} />
              {enrollment.certificate_id ? t.viewCertificate : t.completed}
            </>
          ) : (
            <>
              <Play size={18} />
              {t.continue}
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
