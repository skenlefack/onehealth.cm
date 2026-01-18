'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, MailX, AlertCircle } from 'lucide-react';
import { Language } from '@/lib/types';

interface UnsubscribePageProps {
  params: Promise<{ lang: Language }>;
}

const translations = {
  fr: {
    title: 'Se desabonner de la newsletter',
    subtitle: 'Nous sommes desoles de vous voir partir.',
    confirmTitle: 'Confirmer le desabonnement',
    confirmMessage: 'Etes-vous sur de vouloir vous desabonner de notre newsletter ?',
    email: 'Votre adresse email',
    reason: 'Raison (optionnel)',
    reasons: {
      too_many: 'Je recois trop d\'emails',
      not_relevant: 'Le contenu n\'est pas pertinent',
      never_signed: 'Je ne me suis jamais inscrit',
      other: 'Autre raison',
    },
    unsubscribe: 'Se desabonner',
    cancel: 'Annuler',
    processing: 'Traitement en cours...',
    success: {
      title: 'Desabonnement confirme',
      message: 'Vous avez ete retire de notre liste de diffusion. Vous ne recevrez plus nos emails.',
      resubscribe: 'Si vous changez d\'avis, vous pouvez vous reinscrire a tout moment.',
      home: 'Retour a l\'accueil',
    },
    error: {
      title: 'Erreur',
      invalidToken: 'Lien de desabonnement invalide.',
      notFound: 'Adresse email non trouvee.',
      serverError: 'Une erreur est survenue. Veuillez reessayer.',
      home: 'Retour a l\'accueil',
    },
    enterEmail: 'Entrez votre adresse email pour vous desabonner',
  },
  en: {
    title: 'Unsubscribe from newsletter',
    subtitle: 'We\'re sorry to see you go.',
    confirmTitle: 'Confirm unsubscribe',
    confirmMessage: 'Are you sure you want to unsubscribe from our newsletter?',
    email: 'Your email address',
    reason: 'Reason (optional)',
    reasons: {
      too_many: 'I receive too many emails',
      not_relevant: 'Content is not relevant',
      never_signed: 'I never signed up',
      other: 'Other reason',
    },
    unsubscribe: 'Unsubscribe',
    cancel: 'Cancel',
    processing: 'Processing...',
    success: {
      title: 'Unsubscribed',
      message: 'You have been removed from our mailing list. You will no longer receive our emails.',
      resubscribe: 'If you change your mind, you can resubscribe at any time.',
      home: 'Back to home',
    },
    error: {
      title: 'Error',
      invalidToken: 'Invalid unsubscribe link.',
      notFound: 'Email address not found.',
      serverError: 'An error occurred. Please try again.',
      home: 'Back to home',
    },
    enterEmail: 'Enter your email address to unsubscribe',
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function UnsubscribeContent({ params }: UnsubscribePageProps) {
  const [lang, setLang] = useState<Language>('fr');
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [status, setStatus] = useState<'form' | 'loading' | 'success' | 'error'>('form');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const t = translations[lang];

  useEffect(() => {
    params.then((p) => setLang(p.lang));
  }, [params]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tokenFromUrl && !email) {
      setErrorMessage(t.enterEmail);
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch(`${API_URL}/newsletter/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenFromUrl || undefined,
          email: email || undefined,
          reason,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.message || t.error.serverError);
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(t.error.serverError);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
      {status === 'form' && (
        <>
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <MailX className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>

          <form onSubmit={handleUnsubscribe} className="space-y-4">
            {!tokenFromUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.email} *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={!tokenFromUrl}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  placeholder="email@example.com"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.reason}
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
              >
                <option value="">-- Selectionnez --</option>
                <option value="too_many">{t.reasons.too_many}</option>
                <option value="not_relevant">{t.reasons.not_relevant}</option>
                <option value="never_signed">{t.reasons.never_signed}</option>
                <option value="other">{t.reasons.other}</option>
              </select>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorMessage}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link
                href={`/${lang}`}
                className="flex-1 py-3 px-4 text-center rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </Link>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                {t.unsubscribe}
              </button>
            </div>
          </form>
        </>
      )}

      {status === 'loading' && (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t.processing}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t.success.title}</h1>
          <p className="text-gray-600 mb-4">{t.success.message}</p>
          <p className="text-sm text-gray-500 mb-6">{t.success.resubscribe}</p>
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            {t.success.home}
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t.error.title}</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setStatus('form'); setErrorMessage(''); }}
              className="py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Reessayer
            </button>
            <Link
              href={`/${lang}`}
              className="py-2 px-4 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
            >
              {t.error.home}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
      <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Chargement...</h1>
    </div>
  );
}

export default function UnsubscribePage({ params }: UnsubscribePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <UnsubscribeContent params={params} />
      </Suspense>
    </div>
  );
}
