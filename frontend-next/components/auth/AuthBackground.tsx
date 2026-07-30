'use client';

import { useEffect, useState } from 'react';
import { Shield, Heart, Leaf, Users, BookOpen, Award, MapPin, Globe, AlertTriangle, Radar, FileText, Building } from 'lucide-react';
import { Language } from '@/lib/types';

interface AuthBackgroundProps {
  lang: Language;
  variant: 'login' | 'register';
  redirectTo?: string;
}

// Detect which module the user is coming from
function detectModule(redirectTo?: string): 'elearning' | 'ohwr' | 'cohrm' | 'default' {
  if (!redirectTo) return 'default';
  if (redirectTo.includes('oh-elearning')) return 'elearning';
  if (redirectTo.includes('ohwr-mapping')) return 'ohwr';
  if (redirectTo.includes('cohrm')) return 'cohrm';
  if (redirectTo.includes('dashboard')) return 'elearning';
  return 'default';
}

const moduleIcons = {
  elearning: [
    { Icon: BookOpen, delay: 0 },
    { Icon: Award, delay: 1 },
    { Icon: Users, delay: 2 },
    { Icon: FileText, delay: 0.5 },
    { Icon: Shield, delay: 1.5 },
    { Icon: Heart, delay: 2.5 },
  ],
  ohwr: [
    { Icon: MapPin, delay: 0 },
    { Icon: Globe, delay: 1 },
    { Icon: Building, delay: 2 },
    { Icon: Users, delay: 0.5 },
    { Icon: FileText, delay: 1.5 },
    { Icon: Leaf, delay: 2.5 },
  ],
  cohrm: [
    { Icon: Radar, delay: 0 },
    { Icon: AlertTriangle, delay: 1 },
    { Icon: Shield, delay: 2 },
    { Icon: Heart, delay: 0.5 },
    { Icon: Leaf, delay: 1.5 },
    { Icon: MapPin, delay: 2.5 },
  ],
  default: [
    { Icon: Shield, delay: 0 },
    { Icon: Heart, delay: 1 },
    { Icon: Leaf, delay: 2 },
    { Icon: Users, delay: 0.5 },
    { Icon: BookOpen, delay: 1.5 },
    { Icon: Award, delay: 2.5 },
  ],
};

const moduleGradients = {
  elearning: 'bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800',
  ohwr: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800',
  cohrm: 'bg-gradient-to-br from-red-600 via-rose-700 to-orange-800',
  default: 'bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800',
};

const moduleContent = {
  elearning: {
    fr: {
      badge: 'OH E-Learning',
      title: 'Formation One Health',
      subtitle: 'Connectez-vous pour continuer',
      description: "Accédez à vos cours, suivez votre progression et obtenez des certificats reconnus dans l'approche One Health.",
      stats: [
        { value: '50+', label: 'Cours disponibles' },
        { value: '1000+', label: 'Apprenants actifs' },
        { value: '100%', label: 'Certifiant' },
      ],
    },
    en: {
      badge: 'OH E-Learning',
      title: 'One Health Training',
      subtitle: 'Sign in to continue',
      description: 'Access your courses, track your progress and earn recognized certificates in the One Health approach.',
      stats: [
        { value: '50+', label: 'Available courses' },
        { value: '1000+', label: 'Active learners' },
        { value: '100%', label: 'Certified' },
      ],
    },
  },
  ohwr: {
    fr: {
      badge: 'OHWR-Mapping',
      title: 'Cartographie des Ressources',
      subtitle: 'Connectez-vous pour continuer',
      description: "Explorez la cartographie interactive des experts, organisations, matériels et documents One Health à travers les 10 régions du Cameroun.",
      stats: [
        { value: '10', label: 'Régions couvertes' },
        { value: '500+', label: 'Experts répertoriés' },
        { value: '200+', label: 'Organisations' },
      ],
    },
    en: {
      badge: 'OHWR-Mapping',
      title: 'Resource Mapping',
      subtitle: 'Sign in to continue',
      description: 'Explore the interactive mapping of One Health experts, organizations, materials and documents across Cameroon\'s 10 regions.',
      stats: [
        { value: '10', label: 'Regions covered' },
        { value: '500+', label: 'Listed experts' },
        { value: '200+', label: 'Organizations' },
      ],
    },
  },
  cohrm: {
    fr: {
      badge: 'COHRM-System',
      title: 'Surveillance Sanitaire',
      subtitle: 'Connectez-vous pour continuer',
      description: "Accédez au système de gestion des rumeurs sanitaires One Health : signalement, vérification, évaluation des risques et coordination de la réponse.",
      stats: [
        { value: '24/7', label: 'Veille sanitaire' },
        { value: '5', label: "Niveaux de validation" },
        { value: '10', label: 'Régions surveillées' },
      ],
    },
    en: {
      badge: 'COHRM-System',
      title: 'Health Surveillance',
      subtitle: 'Sign in to continue',
      description: 'Access the One Health rumor management system: reporting, verification, risk assessment and response coordination.',
      stats: [
        { value: '24/7', label: 'Health monitoring' },
        { value: '5', label: 'Validation levels' },
        { value: '10', label: 'Regions monitored' },
      ],
    },
  },
  default: {
    fr: {
      badge: 'One Health Cameroun',
      title: 'Bienvenue',
      subtitle: 'Connectez-vous pour continuer',
      description: "Accédez à l'ensemble des ressources de la plateforme One Health Cameroun : formations, cartographie, surveillance sanitaire.",
      stats: [
        { value: '50+', label: 'Cours disponibles' },
        { value: '500+', label: 'Experts répertoriés' },
        { value: '2500+', label: 'Ressources' },
      ],
    },
    en: {
      badge: 'One Health Cameroon',
      title: 'Welcome',
      subtitle: 'Sign in to continue',
      description: 'Access the full One Health Cameroon platform: training, resource mapping, health surveillance.',
      stats: [
        { value: '50+', label: 'Available courses' },
        { value: '500+', label: 'Listed experts' },
        { value: '2500+', label: 'Resources' },
      ],
    },
  },
};

const registerContent = {
  fr: {
    badge: 'One Health Cameroun',
    title: 'Rejoignez-nous',
    subtitle: 'Créez votre compte gratuitement',
    description: "Accédez à des formations de qualité sur l'approche One Health et obtenez des certificats reconnus.",
    stats: [
      { value: '50+', label: 'Cours' },
      { value: '1000+', label: 'Apprenants' },
      { value: '2500+', label: 'Ressources' },
    ],
  },
  en: {
    badge: 'One Health Cameroon',
    title: 'Join Us',
    subtitle: 'Create your account for free',
    description: 'Access quality training on the One Health approach and earn recognized certificates.',
    stats: [
      { value: '50+', label: 'Courses' },
      { value: '1000+', label: 'Learners' },
      { value: '2500+', label: 'Resources' },
    ],
  },
};

export function AuthBackground({ lang, variant, redirectTo }: AuthBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const module = detectModule(redirectTo);
  const isLogin = variant === 'login';
  const t = isLogin ? moduleContent[module][lang] : registerContent[lang];
  const floatingIcons = moduleIcons[module];
  const gradientClass = isLogin ? moduleGradients[module] : 'bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800';

  return (
    <div className="hidden lg:block relative w-0 flex-1 overflow-hidden">
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${gradientClass}`} />

      {/* Animated Circles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large circle - top right */}
        <div
          className={`absolute -top-20 -right-20 w-96 h-96 rounded-full border-2 border-white/10 transition-all duration-1000 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{ animationDelay: '0s' }}
        />
        <div
          className={`absolute -top-10 -right-10 w-80 h-80 rounded-full border border-white/20 transition-all duration-1000 delay-100 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        />

        {/* Medium circle - bottom left */}
        <div
          className={`absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full border-2 border-white/10 transition-all duration-1000 delay-200 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        />
        <div
          className={`absolute -bottom-20 -left-20 w-96 h-96 rounded-full border border-white/15 transition-all duration-1000 delay-300 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        />

        {/* Animated rotating circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={`w-[600px] h-[600px] rounded-full border border-white/10 animate-spin transition-opacity duration-1000 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ animationDuration: '30s' }}
          />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={`w-[450px] h-[450px] rounded-full border border-dashed border-white/20 animate-spin transition-opacity duration-1000 delay-200 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ animationDuration: '25s', animationDirection: 'reverse' }}
          />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={`w-[300px] h-[300px] rounded-full border-2 border-white/10 animate-spin transition-opacity duration-1000 delay-300 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ animationDuration: '20s' }}
          />
        </div>

        {/* Floating dots on circle path */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="w-[450px] h-[450px] animate-spin"
            style={{ animationDuration: '15s' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/40 rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/30 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white/20 rounded-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white/50 rounded-full" />
          </div>
        </div>

        {/* Floating icons */}
        {floatingIcons.map(({ Icon, delay }, index) => (
          <div
            key={index}
            className={`absolute transition-all duration-1000 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{
              top: `${15 + (index * 13) % 70}%`,
              left: `${10 + (index * 17) % 80}%`,
              transitionDelay: `${delay}s`,
            }}
          >
            <div
              className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl animate-bounce"
              style={{
                animationDuration: `${3 + index * 0.5}s`,
                animationDelay: `${delay}s`,
              }}
            >
              <Icon className="w-6 h-6 text-white/70" />
            </div>
          </div>
        ))}

        {/* Glowing orbs */}
        <div
          className={`absolute top-20 right-40 w-32 h-32 bg-white/5 rounded-full blur-3xl transition-opacity duration-1000 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute bottom-40 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl transition-opacity duration-1000 delay-500 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
        <div
          className={`text-center text-white max-w-lg transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 transition-all duration-700 delay-100 ${
              mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">{t.badge}</span>
          </div>

          {/* Title */}
          <h2
            className={`text-5xl font-bold mb-3 transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {t.title}
          </h2>

          {/* Subtitle */}
          <p
            className={`text-xl text-white/90 mb-4 transition-all duration-700 delay-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {t.subtitle}
          </p>

          {/* Description */}
          <p
            className={`text-white/70 mb-10 leading-relaxed transition-all duration-700 delay-400 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {t.description}
          </p>

          {/* Stats */}
          <div
            className={`grid grid-cols-3 gap-4 transition-all duration-700 delay-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {t.stats.map((stat, index) => (
              <div
                key={index}
                className="relative group"
              >
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-white/20 transition-all duration-300" />
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-300 cursor-default">
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs text-white/70">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom decoration */}
          <div
            className={`flex items-center justify-center gap-2 mt-10 transition-all duration-700 delay-700 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-white/30" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
            <div className="w-3 h-3 rounded-full bg-white/50" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
