import { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, AlertTriangle, Shield, Bell, MapPin, Clock, ArrowLeft, Send, CheckCircle, Activity } from 'lucide-react';
import { Language } from '@/lib/types';
import { getTranslation, isValidLanguage } from '@/lib/translations';
import { notFound } from 'next/navigation';
import { Button, Card } from '@/components/ui';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;

  const titles = {
    fr: 'COHRM-SYSTEM | Gestion des Rumeurs One Health Cameroun',
    en: 'COHRM-SYSTEM | One Health Cameroon Rumor Management',
  };

  const descriptions = {
    fr: "Système de gestion des rumeurs sanitaires One Health Cameroun. Signalement et vérification des alertes de santé publique.",
    en: "One Health Cameroon health rumor management system. Reporting and verification of public health alerts.",
  };

  return {
    title: titles[lang as Language] || titles.fr,
    description: descriptions[lang as Language] || descriptions.fr,
  };
}

const stats = {
  fr: [
    { icon: AlertCircle, value: '1,200+', label: 'Rumeurs signalées' },
    { icon: CheckCircle, value: '95%', label: 'Taux de vérification' },
    { icon: Clock, value: '<24h', label: 'Temps de réponse' },
    { icon: MapPin, value: '10', label: 'Régions couvertes' },
  ],
  en: [
    { icon: AlertCircle, value: '1,200+', label: 'Rumors reported' },
    { icon: CheckCircle, value: '95%', label: 'Verification rate' },
    { icon: Clock, value: '<24h', label: 'Response time' },
    { icon: MapPin, value: '10', label: 'Regions covered' },
  ],
};

const process = {
  fr: [
    { step: '1', title: 'Signalement', description: 'Un citoyen ou professionnel signale une rumeur sanitaire via notre plateforme.' },
    { step: '2', title: 'Réception', description: 'L\'équipe COHRM reçoit et enregistre le signalement dans le système.' },
    { step: '3', title: 'Vérification', description: 'Les experts One Health enquêtent et vérifient les informations.' },
    { step: '4', title: 'Réponse', description: 'Une réponse appropriée est communiquée et des actions sont prises si nécessaire.' },
  ],
  en: [
    { step: '1', title: 'Report', description: 'A citizen or professional reports a health rumor via our platform.' },
    { step: '2', title: 'Reception', description: 'The COHRM team receives and records the report in the system.' },
    { step: '3', title: 'Verification', description: 'One Health experts investigate and verify the information.' },
    { step: '4', title: 'Response', description: 'An appropriate response is communicated and actions are taken if necessary.' },
  ],
};

const rumorTypes = {
  fr: [
    { icon: '🦠', title: 'Maladies infectieuses', description: 'Épidémies, foyers de maladies' },
    { icon: '🐕', title: 'Zoonoses', description: 'Maladies transmises par les animaux' },
    { icon: '🍽️', title: 'Sécurité alimentaire', description: 'Intoxications, contaminations' },
    { icon: '💧', title: 'Qualité de l\'eau', description: 'Pollution, maladies hydriques' },
    { icon: '☣️', title: 'Risques environnementaux', description: 'Déversements, contaminations' },
    { icon: '💉', title: 'Vaccination', description: 'Effets secondaires, campagnes' },
  ],
  en: [
    { icon: '🦠', title: 'Infectious diseases', description: 'Epidemics, disease outbreaks' },
    { icon: '🐕', title: 'Zoonoses', description: 'Animal-transmitted diseases' },
    { icon: '🍽️', title: 'Food safety', description: 'Poisoning, contamination' },
    { icon: '💧', title: 'Water quality', description: 'Pollution, waterborne diseases' },
    { icon: '☣️', title: 'Environmental risks', description: 'Spills, contamination' },
    { icon: '💉', title: 'Vaccination', description: 'Side effects, campaigns' },
  ],
};

export default async function COHRMSystemPage({ params }: PageProps) {
  const { lang } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const language = lang as Language;
  const t = getTranslation(language);

  const content = {
    fr: {
      badge: 'Gestion des Rumeurs',
      title: 'COHRM-SYSTEM',
      fullName: 'Cameroon One Health Rumor Management System',
      description: 'Système de détection précoce et de gestion des rumeurs sanitaires. Contribuez à la surveillance sanitaire nationale en signalant toute information suspecte concernant la santé humaine, animale ou environnementale.',
      comingSoon: 'Bientôt disponible',
      comingDesc: 'Le système COHRM est en cours de déploiement. Inscrivez-vous pour être notifié du lancement et pouvoir signaler des rumeurs.',
      notify: 'Me notifier',
      report: 'Signaler une rumeur',
      processTitle: 'Comment ça marche',
      typesTitle: 'Types de rumeurs à signaler',
      whyTitle: 'Pourquoi signaler ?',
      whyPoints: [
        'Protéger la santé publique',
        'Permettre une réponse rapide',
        'Éviter la propagation de fausses informations',
        'Contribuer à la surveillance sanitaire',
      ],
      back: 'Retour',
    },
    en: {
      badge: 'Rumor Management',
      title: 'COHRM-SYSTEM',
      fullName: 'Cameroon One Health Rumor Management System',
      description: 'Early detection and health rumor management system. Contribute to national health surveillance by reporting any suspicious information concerning human, animal or environmental health.',
      comingSoon: 'Coming Soon',
      comingDesc: 'The COHRM system is being deployed. Sign up to be notified of the launch and to be able to report rumors.',
      notify: 'Notify me',
      report: 'Report a rumor',
      processTitle: 'How it works',
      typesTitle: 'Types of rumors to report',
      whyTitle: 'Why report?',
      whyPoints: [
        'Protect public health',
        'Enable rapid response',
        'Prevent spread of misinformation',
        'Contribute to health surveillance',
      ],
      back: 'Back',
    },
  };

  const c = content[language];
  const statsData = stats[language];
  const processData = process[language];
  const typesData = rumorTypes[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-[5%]">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6">
            <AlertCircle size={18} />
            {c.badge}
          </span>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800 mb-4">
            {c.title}
          </h1>
          <p className="text-xl text-orange-600 font-semibold mb-6">
            {c.fullName}
          </p>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            {c.description}
          </p>

          {/* Coming Soon Card */}
          <Card className="max-w-xl mx-auto p-8 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
            <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">{c.comingSoon}</h2>
            <p className="text-slate-600 mb-6">{c.comingDesc}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" size="lg" className="bg-orange-600 hover:bg-orange-700">
                {c.notify}
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-[5%] bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center p-6 rounded-2xl bg-orange-50">
                  <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                    <Icon size={28} className="text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 px-[5%]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">{c.processTitle}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {processData.map((item, index) => (
              <div key={index} className="relative">
                {index < processData.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-orange-200 -translate-x-1/2" />
                )}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 relative z-10">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rumor Types */}
      <section className="py-16 px-[5%] bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">{c.typesTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {typesData.map((type, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">{type.icon}</span>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">{type.title}</h3>
                  <p className="text-sm text-slate-500">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Report */}
      <section className="py-16 px-[5%]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">{c.whyTitle}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {c.whyPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-200"
              >
                <Shield size={20} className="text-orange-500 flex-shrink-0" />
                <span className="text-slate-700 font-medium">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back Button */}
      <section className="py-12 px-[5%]">
        <div className="max-w-6xl mx-auto text-center">
          <Link href={`/${lang}`}>
            <Button variant="outline" leftIcon={<ArrowLeft size={18} />}>
              {c.back}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
