import { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle, XCircle, AlertTriangle, Clock,
  Award, User, BookOpen, Calendar, GraduationCap,
  Shield, ArrowLeft
} from 'lucide-react';
import { Language } from '@/lib/types';
import { isValidLanguage, getTranslation } from '@/lib/translations';
import { verifyCertificate } from '@/lib/api';
import { Button } from '@/components/ui';

interface PageProps {
  params: Promise<{ lang: string; code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, code } = await params;

  return {
    title: lang === 'fr'
      ? `Vérification Certificat ${code} | OH E-Learning`
      : `Certificate Verification ${code} | OH E-Learning`,
    description: lang === 'fr'
      ? 'Vérifiez l\'authenticité d\'un certificat OH E-Learning'
      : 'Verify the authenticity of an OH E-Learning certificate',
  };
}

export default async function CertificateVerifyPage({ params }: PageProps) {
  const { lang, code } = await params;

  const language = (isValidLanguage(lang) ? lang : 'fr') as Language;
  const t = getTranslation(language);

  // Verify the certificate
  const result = await verifyCertificate(code);

  const getStatusInfo = () => {
    if (!result.success || !result.data?.valid) {
      return {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: language === 'fr' ? 'Certificat non trouvé' : 'Certificate not found',
        description: language === 'fr'
          ? 'Ce code de vérification ne correspond à aucun certificat valide.'
          : 'This verification code does not match any valid certificate.',
      };
    }

    const cert = result.data.certificate;

    if (cert?.status === 'revoked') {
      return {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: language === 'fr' ? 'Certificat révoqué' : 'Certificate revoked',
        description: language === 'fr'
          ? 'Ce certificat a été révoqué et n\'est plus valide.'
          : 'This certificate has been revoked and is no longer valid.',
      };
    }

    if (cert?.status === 'expired') {
      return {
        icon: AlertTriangle,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        title: language === 'fr' ? 'Certificat expiré' : 'Certificate expired',
        description: language === 'fr'
          ? 'Ce certificat a expiré. Le titulaire doit renouveler sa certification.'
          : 'This certificate has expired. The holder must renew their certification.',
      };
    }

    return {
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      title: language === 'fr' ? 'Certificat valide' : 'Valid certificate',
      description: language === 'fr'
        ? 'Ce certificat est authentique et actuellement valide.'
        : 'This certificate is authentic and currently valid.',
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const cert = result.data?.certificate;

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

      {/* Verification Result */}
      <section className="py-12 px-[5%]">
        <div className="max-w-2xl mx-auto">
          {/* Status Card */}
          <div className={`rounded-2xl border-2 ${statusInfo.borderColor} ${statusInfo.bgColor} p-8 mb-8`}>
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full ${statusInfo.bgColor} flex items-center justify-center mb-4`}>
                <StatusIcon size={48} className={statusInfo.color} />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${statusInfo.color}`}>
                {statusInfo.title}
              </h2>
              <p className="text-slate-600">
                {statusInfo.description}
              </p>
            </div>
          </div>

          {/* Certificate Details (if valid or expired) */}
          {cert && result.data?.valid && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Certificate Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award size={24} />
                    <span className="font-semibold">
                      {language === 'fr' ? 'Détails du certificat' : 'Certificate Details'}
                    </span>
                  </div>
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                    #{cert.certificate_number}
                  </span>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="p-6">
                {/* Recipient */}
                <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <User size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">
                      {language === 'fr' ? 'Décerné à' : 'Awarded to'}
                    </p>
                    <p className="text-xl font-semibold text-slate-800">
                      {cert.recipient_name}
                    </p>
                  </div>
                </div>

                {/* Course/Path */}
                <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    {cert.enrollable_type === 'learning_path' ? (
                      <GraduationCap size={24} className="text-purple-600" />
                    ) : (
                      <BookOpen size={24} className="text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">
                      {cert.enrollable_type === 'learning_path'
                        ? (language === 'fr' ? 'Parcours complété' : 'Completed path')
                        : (language === 'fr' ? 'Cours complété' : 'Completed course')}
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {language === 'en' && cert.title_en ? cert.title_en : cert.title_fr}
                    </p>
                  </div>
                </div>

                {/* Dates and Score */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Issue Date */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Calendar size={16} />
                      <span className="text-sm">
                        {language === 'fr' ? 'Date d\'émission' : 'Issue date'}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800">
                      {new Date(cert.issue_date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Expiry Date (if applicable) */}
                  {cert.expiry_date && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Clock size={16} />
                        <span className="text-sm">
                          {language === 'fr' ? 'Expiration' : 'Expiry'}
                        </span>
                      </div>
                      <p className={`font-semibold ${cert.status === 'expired' ? 'text-amber-600' : 'text-slate-800'}`}>
                        {new Date(cert.expiry_date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}

                  {/* Score */}
                  {cert.final_score !== null && cert.final_score !== undefined && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Award size={16} />
                        <span className="text-sm">
                          {language === 'fr' ? 'Score final' : 'Final score'}
                        </span>
                      </div>
                      <p className="font-semibold text-emerald-600">
                        {cert.final_score}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Certificate Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>
                    {language === 'fr' ? 'Code de vérification:' : 'Verification code:'} <code className="font-mono bg-slate-200 px-2 py-0.5 rounded">{cert.verification_code}</code>
                  </span>
                  <span>
                    {language === 'fr' ? 'Vérifié' : 'Verified'} {cert.verified_count || 0}x
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Invalid Certificate Message */}
          {(!result.success || !result.data?.valid || cert?.status === 'revoked') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
              <p className="text-slate-600 mb-4">
                {language === 'fr'
                  ? 'Si vous pensez qu\'il s\'agit d\'une erreur, veuillez contacter notre support.'
                  : 'If you believe this is an error, please contact our support.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/${lang}/oh-elearning`}>
                  <Button variant="outline">
                    {language === 'fr' ? 'Retour à l\'accueil' : 'Back to home'}
                  </Button>
                </Link>
                <Link href={`/${lang}/contact`}>
                  <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
                    {language === 'fr' ? 'Contacter le support' : 'Contact support'}
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Verification Info */}
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>
              {language === 'fr'
                ? 'Les certificats OH E-Learning sont émis par One Health Cameroun et peuvent être vérifiés à tout moment sur cette page.'
                : 'OH E-Learning certificates are issued by One Health Cameroon and can be verified at any time on this page.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
