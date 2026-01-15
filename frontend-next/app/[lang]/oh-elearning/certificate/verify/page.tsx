'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Search, ArrowLeft, Award } from 'lucide-react';
import { Language } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function CertificateVerifyLandingPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params.lang as string) || 'fr';

  const language = (isValidLanguage(lang) ? lang : 'fr') as Language;
  const t = getTranslation(language);

  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError(language === 'fr'
        ? 'Veuillez entrer un code de vérification'
        : 'Please enter a verification code');
      return;
    }

    // Navigate to the verification page
    router.push(`/${lang}/oh-elearning/certificate/verify/${encodeURIComponent(trimmedCode)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="pt-28 pb-8 px-[5%] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          {/* Back link */}
          <Link
            href={`/${lang}/oh-elearning`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            {t.common.back}
          </Link>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Shield size={32} />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {language === 'fr' ? 'Vérification de certificat' : 'Certificate Verification'}
          </h1>
          <p className="text-white/80">
            {language === 'fr'
              ? 'Vérifiez l\'authenticité d\'un certificat OH E-Learning'
              : 'Verify the authenticity of an OH E-Learning certificate'}
          </p>
        </div>
      </section>

      {/* Verification Form */}
      <section className="py-12 px-[5%]">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                <Award size={28} className="text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                {language === 'fr' ? 'Entrez le code de vérification' : 'Enter verification code'}
              </h2>
              <p className="text-slate-500 text-sm">
                {language === 'fr'
                  ? 'Le code se trouve sur le certificat ou peut être scanné via le QR code.'
                  : 'The code can be found on the certificate or scanned via the QR code.'}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2">
                  {language === 'fr' ? 'Code de vérification' : 'Verification code'}
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError('');
                    }}
                    placeholder={language === 'fr' ? 'Ex: CERT-2024-XXXX-XXXX' : 'E.g: CERT-2024-XXXX-XXXX'}
                    className={cn(
                      'w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl',
                      'text-slate-700 placeholder-slate-400 font-mono',
                      'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white',
                      'transition-all duration-200',
                      error ? 'border-red-300' : 'border-slate-200'
                    )}
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {language === 'fr' ? 'Vérifier le certificat' : 'Verify certificate'}
              </Button>
            </form>
          </div>

          {/* Help Info */}
          <div className="mt-8 bg-slate-50 rounded-xl p-6">
            <h3 className="font-semibold text-slate-800 mb-3">
              {language === 'fr' ? 'Comment trouver le code ?' : 'How to find the code?'}
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                {language === 'fr'
                  ? 'Le code est imprimé en bas du certificat PDF'
                  : 'The code is printed at the bottom of the PDF certificate'}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                {language === 'fr'
                  ? 'Scannez le QR code sur le certificat pour accéder directement à la vérification'
                  : 'Scan the QR code on the certificate to access verification directly'}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                {language === 'fr'
                  ? 'Le code suit le format: CERT-AAAA-XXXX-XXXX'
                  : 'The code follows the format: CERT-YYYY-XXXX-XXXX'}
              </li>
            </ul>
          </div>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-slate-500">
            <p>
              {language === 'fr'
                ? 'Les certificats OH E-Learning sont émis par One Health Cameroun et peuvent être vérifiés à tout moment.'
                : 'OH E-Learning certificates are issued by One Health Cameroon and can be verified at any time.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
