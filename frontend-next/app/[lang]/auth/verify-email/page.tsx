'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Language } from '@/lib/types';

interface VerifyEmailPageProps {
  params: Promise<{ lang: Language }>;
}

const translations = {
  fr: {
    verifying: 'Vérification en cours...',
    success: {
      title: 'Email vérifié !',
      message: 'Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.',
      login: 'Se connecter',
    },
    error: {
      title: 'Erreur de vérification',
      invalidToken: 'Le lien de vérification est invalide ou a expiré.',
      serverError: 'Une erreur est survenue lors de la vérification.',
      tryAgain: 'Veuillez demander un nouveau lien de vérification.',
      backToLogin: 'Retour à la connexion',
    },
    noToken: {
      title: 'Lien invalide',
      message: 'Aucun token de vérification trouvé dans l\'URL.',
      backToLogin: 'Retour à la connexion',
    },
  },
  en: {
    verifying: 'Verifying...',
    success: {
      title: 'Email verified!',
      message: 'Your account has been activated successfully. You can now log in.',
      login: 'Log in',
    },
    error: {
      title: 'Verification error',
      invalidToken: 'The verification link is invalid or has expired.',
      serverError: 'An error occurred during verification.',
      tryAgain: 'Please request a new verification link.',
      backToLogin: 'Back to login',
    },
    noToken: {
      title: 'Invalid link',
      message: 'No verification token found in the URL.',
      backToLogin: 'Back to login',
    },
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function VerifyEmailContent({ params }: VerifyEmailPageProps) {
  const [lang, setLang] = useState<Language>('fr');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const t = translations[lang];

  useEffect(() => {
    params.then((p) => setLang(p.lang));
  }, [params]);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/verify-email/${token}`);
        const data = await res.json();

        if (data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(data.message || t.error.invalidToken);
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage(t.error.serverError);
      }
    };

    verifyEmail();
  }, [token, t.error.invalidToken, t.error.serverError]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
      {status === 'loading' && (
        <>
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t.verifying}</h1>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t.success.title}</h1>
          <p className="text-gray-600 mb-6">{t.success.message}</p>
          <Link
            href={`/${lang}/auth/login`}
            className="inline-flex items-center gap-2 bg-oh-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-oh-blue/90 transition-colors"
          >
            {t.success.login}
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t.error.title}</h1>
          <p className="text-gray-600 mb-2">{errorMessage || t.error.invalidToken}</p>
          <p className="text-sm text-gray-500 mb-6">{t.error.tryAgain}</p>
          <Link
            href={`/${lang}/auth/login`}
            className="inline-flex items-center gap-2 text-oh-blue hover:text-oh-blue/80 font-semibold"
          >
            {t.error.backToLogin}
          </Link>
        </>
      )}

      {status === 'no-token' && (
        <>
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t.noToken.title}</h1>
          <p className="text-gray-600 mb-6">{t.noToken.message}</p>
          <Link
            href={`/${lang}/auth/login`}
            className="inline-flex items-center gap-2 text-oh-blue hover:text-oh-blue/80 font-semibold"
          >
            {t.noToken.backToLogin}
          </Link>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Chargement...</h1>
    </div>
  );
}

export default function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <VerifyEmailContent params={params} />
      </Suspense>
    </div>
  );
}
