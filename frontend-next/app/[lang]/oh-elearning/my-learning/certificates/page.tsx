'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Award, ArrowLeft, Download, ExternalLink,
  Calendar, BookOpen, GraduationCap, CheckCircle,
  AlertTriangle, XCircle, Loader2
} from 'lucide-react';
import { Language, ELearningCertificate } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import { getMyCertificates, downloadCertificatePDF } from '@/lib/api';
import { Button, Spinner } from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';

export default function MyCertificatesPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params.lang as string) || 'fr';
  const { user, token, isLoading: authLoading } = useAuth();

  const language = (isValidLanguage(lang) ? lang : 'fr') as Language;
  const t = getTranslation(language);

  const [certificates, setCertificates] = useState<ELearningCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // Handle PDF download
  const handleDownload = async (cert: ELearningCertificate) => {
    if (!token) return;

    setDownloadingId(cert.id);
    try {
      await downloadCertificatePDF(cert.id, token, language);
    } catch (error) {
      console.error('Download error:', error);
      alert(language === 'fr' ? 'Erreur lors du telechargement' : 'Download error');
    } finally {
      setDownloadingId(null);
    }
  };

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
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 pt-24 pb-16">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-rose-400/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 right-[10%] w-16 h-16 bg-white/5 rounded-2xl rotate-12 hidden lg:block" />
        <div className="absolute bottom-12 left-[15%] w-12 h-12 bg-white/5 rounded-full hidden lg:block" />

        <div className="relative z-10 max-w-6xl mx-auto px-[5%]">
          {/* Back link */}
          <Link
            href={`/${lang}/oh-elearning/my-learning`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            {t.common.back}
          </Link>

          {/* Title */}
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-2xl ring-1 ring-white/20">
              <Award size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                {language === 'fr' ? 'Mes Certificats' : 'My Certificates'}
              </h1>
              <p className="text-lg text-amber-100 max-w-2xl">
                {language === 'fr'
                  ? 'Tous vos certificats obtenus sur la plateforme One Health E-Learning'
                  : 'All your certificates earned on the One Health E-Learning platform'}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Award size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">{certificates.length || '0'}</div>
                <div className="text-sm text-amber-200">{language === 'fr' ? 'Certificats' : 'Certificates'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">{certificates.filter(c => c.status === 'active').length}</div>
                <div className="text-sm text-amber-200">{language === 'fr' ? 'Actifs' : 'Active'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <GraduationCap size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">{certificates.filter(c => c.enrollable_type === 'learning_path').length}</div>
                <div className="text-sm text-amber-200">{language === 'fr' ? 'Parcours' : 'Paths'}</div>
              </div>
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
                      {cert.status === 'active' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => handleDownload(cert)}
                          disabled={downloadingId === cert.id}
                        >
                          {downloadingId === cert.id ? (
                            <Loader2 size={16} className="mr-1 animate-spin" />
                          ) : (
                            <Download size={16} className="mr-1" />
                          )}
                          {language === 'fr' ? 'Telecharger' : 'Download'}
                        </Button>
                      )}
                      <Link
                        href={`/${lang}/oh-elearning/certificate/verify/${cert.verification_code}`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink size={16} className="mr-1" />
                          {language === 'fr' ? 'Verifier' : 'Verify'}
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
