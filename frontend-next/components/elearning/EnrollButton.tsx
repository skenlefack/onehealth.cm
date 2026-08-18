'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Play, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { enrollInCourse, enrollInPath, getELearningEnrollments } from '@/lib/api';
import { Language } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EnrollButtonProps {
  courseId?: number;
  courseSlug?: string;
  pathId?: number;
  pathSlug?: string;
  isFree?: boolean;
  lang: Language;
  className?: string;
  enrollableType?: 'course' | 'learning_path';
}

const translations = {
  fr: {
    enrollFree: "S'inscrire gratuitement",
    enroll: "S'inscrire",
    enrolling: 'Inscription...',
    loginToEnroll: 'Connectez-vous pour vous inscrire',
    continue: 'Continuer le cours',
    enrolled: 'Inscrit',
    error: "Erreur lors de l'inscription",
    loading: 'Chargement...',
  },
  en: {
    enrollFree: 'Enroll for free',
    enroll: 'Enroll',
    enrolling: 'Enrolling...',
    loginToEnroll: 'Login to enroll',
    continue: 'Continue course',
    enrolled: 'Enrolled',
    error: 'Error during enrollment',
    loading: 'Loading...',
  },
};

export function EnrollButton({ courseId, courseSlug, pathId, pathSlug, isFree = true, lang, className, enrollableType }: EnrollButtonProps) {
  const t = translations[lang];
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');

  const type = enrollableType || (pathId ? 'learning_path' : 'course');
  const entityId = type === 'learning_path' ? pathId : courseId;
  const entitySlug = type === 'learning_path' ? pathSlug : courseSlug;

  // Check enrollment status on mount
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!isAuthenticated || !token) {
        setIsChecking(false);
        return;
      }

      try {
        const result = await getELearningEnrollments(token);
        if (result.success && result.data) {
          const enrollment = result.data.find(
            (e) => e.enrollable_type === type && e.enrollable_id === entityId
          );
          if (enrollment) {
            setIsEnrolled(true);
          }
        }
      } catch (err) {
        console.error('Error checking enrollment:', err);
      } finally {
        setIsChecking(false);
      }
    };

    checkEnrollment();
  }, [isAuthenticated, token, entityId, type]);

  const handleEnroll = async () => {
    if (!isAuthenticated || !token) {
      const currentUrl = type === 'learning_path'
        ? `/${lang}/oh-elearning/paths/${entitySlug}`
        : `/${lang}/oh-elearning/courses/${entitySlug}`;
      router.push(`/${lang}/auth/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (!entityId) return;

    setIsEnrolling(true);
    setError('');

    try {
      const result = type === 'learning_path'
        ? await enrollInPath(entityId, token)
        : await enrollInCourse(entityId, token);

      if (result.success) {
        setIsEnrolled(true);
        if (type === 'course' && entitySlug) {
          setTimeout(() => {
            router.push(`/${lang}/oh-elearning/learn/${entitySlug}`);
          }, 500);
        }
      } else {
        if (result.message?.includes('already') || result.message?.includes('déjà')) {
          setIsEnrolled(true);
          if (type === 'course' && entitySlug) {
            router.push(`/${lang}/oh-elearning/learn/${entitySlug}`);
          }
        } else {
          setError(result.message || t.error);
        }
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      setError(t.error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleContinue = () => {
    if (type === 'learning_path') {
      router.push(`/${lang}/oh-elearning/paths/${entitySlug}`);
    } else {
      router.push(`/${lang}/oh-elearning/learn/${entitySlug}`);
    }
  };

  // Loading state while checking enrollment
  if (isChecking && isAuthenticated) {
    return (
      <button
        disabled
        className={cn(
          'flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg font-semibold transition-colors',
          'bg-gray-400 text-white cursor-not-allowed',
          className
        )}
      >
        <Loader2 size={20} className="animate-spin" />
        {t.loading}
      </button>
    );
  }

  // Already enrolled state
  if (isEnrolled) {
    return (
      <button
        onClick={handleContinue}
        className={cn(
          'flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg font-semibold transition-colors',
          'bg-green-500 text-white hover:bg-green-600',
          className
        )}
      >
        <CheckCircle size={20} />
        {t.continue}
      </button>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={handleEnroll}
        disabled={isEnrolling}
        className={cn(
          'flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg font-semibold transition-colors',
          'bg-blue-600 text-white hover:bg-blue-700',
          'disabled:opacity-70 disabled:cursor-not-allowed',
          className
        )}
      >
        {isEnrolling ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            {t.enrolling}
          </>
        ) : !isAuthenticated ? (
          <>
            <Lock size={20} />
            {t.loginToEnroll}
          </>
        ) : (
          <>
            <Play size={20} />
            {isFree ? t.enrollFree : t.enroll}
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
