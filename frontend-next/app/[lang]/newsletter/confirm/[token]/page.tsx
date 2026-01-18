'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Language } from '@/lib/types';

interface ConfirmPageProps {
  params: Promise<{ lang: Language; token: string }>;
}

const translations = {
  fr: {
    verifying: 'Confirmation en cours...',
    success: {
      title: 'Inscription confirmee !',
      message: 'Vous etes maintenant inscrit a notre newsletter. Vous recevrez nos actualites directement dans votre boite email.',
      home: 'Retour a l\'accueil',
    },
    error: {
      title: 'Erreur de confirmation',
      invalidToken: 'Le lien de confirmation est invalide ou a expire.',
      alreadyConfirmed: 'Cette adresse email est deja confirmee.',
      serverError: 'Une erreur est survenue lors de la confirmation.',
      home: 'Retour a l\'accueil',
    },
  },
  en: {
    verifying: 'Confirming...',
    success: {
      title: 'Subscription confirmed!',
      message: 'You are now subscribed to our newsletter. You will receive our news directly in your inbox.',
      home: 'Back to home',
    },
    error: {
      title: 'Confirmation error',
      invalidToken: 'The confirmation link is invalid or has expired.',
      alreadyConfirmed: 'This email address is already confirmed.',
      serverError: 'An error occurred during confirmation.',
      home: 'Back to home',
    },
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ConfirmNewsletterPage({ params }: ConfirmPageProps) {
  const [lang, setLang] = useState<Language>('fr');
  const [token, setToken] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');

  const t = translations[lang];

  useEffect(() => {
    params.then((p) => {
      setLang(p.lang);
      setToken(p.token);
    });
  }, [params]);

  useEffect(() => {
    if (!token) return;

    const confirmSubscription = async () => {
      try {
        const res = await fetch(`${API_URL}/newsletter/confirm/${token}`);
        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setEmail(data.email || '');
        } else {
          setStatus('error');
          setErrorMessage(data.message || t.error.invalidToken);
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage(t.error.serverError);
      }
    };

    confirmSubscription();
  }, [token, t.error.invalidToken, t.error.serverError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t.verifying}</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{t.success.title}</h1>
            <p className="text-gray-600 mb-2">{t.success.message}</p>
            {email && (
              <p className="text-sm text-emerald-600 font-medium mb-6">{email}</p>
            )}
            <Link
              href={`/${lang}`}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              {t.success.home}
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{t.error.title}</h1>
            <p className="text-gray-600 mb-6">{errorMessage || t.error.invalidToken}</p>
            <Link
              href={`/${lang}`}
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              {t.error.home}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
