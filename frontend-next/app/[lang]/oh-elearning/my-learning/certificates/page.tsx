'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Award, ArrowLeft, Download, ExternalLink,
  Calendar, BookOpen, GraduationCap, CheckCircle,
  AlertTriangle, XCircle
} from 'lucide-react';
import { Language, ELearningCertificate } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import { getMyCertificates } from '@/lib/api';
import { Button, Spinner } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function MyCertificatesPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params.lang as string) || 'fr';
  const { user, token, loading: authLoading } = useAuth();

  const language = (isValidLanguage(lang) ? lang : 'fr') as Language;
  const t = getTranslation(language);

  const [certificates, setCertificates] = useState<ELearningCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await getMyCertificates(token);
      if (res.success) {
        setCertificates(res.data);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${lang}/login?redirect=/${lang}/oh-elearning/my-learning/certificates`);
      return;
    }

    if (token) {
      fetchCertificates();
    }
  }, [authLoading, user, token, lang, router, fetchCertificates]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle size={12} />
            {language === 'fr' ? 'Actif' : 'Active'}
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <AlertTriangle size={12} />
            {language === 'fr' ? 'Expiré' : 'Expired'}
          </span>
        );
      case 'revoked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle size={12} />
            {language === 'fr' ? 'Révoqué' : 'Revoked'}
          </span>
        );
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="pt-32 pb-8 px-[5%]">
        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <Link
            href={`/${lang}/oh-elearning/my-learning`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            {t.common.back}
          </Link>

          {/* Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Award size={28} className="text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                {language === 'fr' ? 'Mes certificats' : 'My certificates'}
              </h1>
              <p className="text-slate-500">
                {language === 'fr'
                  ? 'Tous vos certificats obtenus sur la plateforme'
                  : 'All your certificates earned on the platform'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certificates List */}
      <section className="px-[5%] pb-16">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : certificates.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Certificate Header */}
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {cert.enrollable_type === 'learning_path' ? (
                          <GraduationCap size={20} />
                        ) : (
                          <BookOpen size={20} />
                        )}
                        <span className="text-sm font-medium">
                          {cert.enrollable_type === 'learning_path'
                            ? (language === 'fr' ? 'Parcours' : 'Path')
                            : (language === 'fr' ? 'Cours' : 'Course')}
                        </span>
                      </div>
                      {getStatusBadge(cert.status)}
                    </div>
                  </div>

                  {/* Certificate Body */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-3">
                      {language === 'en' && cert.title_en ? cert.title_en : cert.title_fr}
                    </h3>

                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        {language === 'fr' ? 'Émis le' : 'Issued on'}{' '}
                        {new Date(cert.issue_date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                      </div>
                      {cert.expiry_date && (
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-slate-400" />
                          {language === 'fr' ? 'Expire le' : 'Expires on'}{' '}
                          {new Date(cert.expiry_date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                        </div>
                      )}
                      {cert.final_score !== null && cert.final_score !== undefined && (
                        <div className="flex items-center gap-2">
                          <Award size={16} className="text-slate-400" />
                          Score: <span className="font-semibold text-emerald-600">{cert.final_score}%</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 mb-4">
                      {language === 'fr' ? 'N°' : '#'} {cert.certificate_number}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {cert.pdf_url && cert.status === 'active' && (
                        <a
                          href={cert.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="primary" size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                            <Download size={16} className="mr-1" />
                            {language === 'fr' ? 'Télécharger' : 'Download'}
                          </Button>
                        </a>
                      )}
                      <Link
                        href={`/${lang}/oh-elearning/certificate/verify/${cert.verification_code}`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink size={16} className="mr-1" />
                          {language === 'fr' ? 'Vérifier' : 'Verify'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Award size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {language === 'fr' ? 'Aucun certificat' : 'No certificates yet'}
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                {language === 'fr'
                  ? 'Complétez des cours ou parcours pour obtenir vos premiers certificats.'
                  : 'Complete courses or learning paths to earn your first certificates.'}
              </p>
              <Link href={`/${lang}/oh-elearning/courses`}>
                <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
                  {language === 'fr' ? 'Explorer les cours' : 'Explore courses'}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
