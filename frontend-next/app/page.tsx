'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageLoader } from '@/components/ui/PageLoader';

const slides = [
  {
    image: '/images/1.png',
    title: 'The "One Health" concept',
    description: 'Achieving optimal health outcomes by recognizing the interconnection between people, animals and their shared environment.'
  },
  {
    image: '/images/2.png',
    title: 'Handling emerging zoonotic diseases',
    description: 'A holistic approach for tackling zoonoses.'
  },
  {
    image: '/images/3.png',
    title: 'Prevention and control of Zoonotic diseases',
    description: 'Surveillance, preparedness, research and communication are the tools we use to fight against emerging and re-emerging zoonoses.'
  },
  {
    image: '/images/4.png',
    title: 'Antimicrobial Resistance',
    description: 'We all have a role to play in the fight against antimicrobial resistance by avoiding auto medication and respecting hygiene.'
  },
  {
    image: '/images/5.png',
    title: 'Climate change and One Health',
    description: 'Integrated community-based surveillance of zoonoses is a promising approach to reduce the health effects of climate change.'
  }
] as const;

const colors = {
  cameroonGreen: '#007A33',
  cameroonRed: '#CE1126',
  cameroonYellow: '#FCD116',
  blue: '#2196F3',
  green: '#4CAF50',
  teal: '#009688',
};

export default function LandingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleLanguageSelect = (lang: 'fr' | 'en') => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push(`/${lang}`);
    }, 600);
  };

  return (
    <>
      <PageLoader isLoading={isTransitioning} />
      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-all duration-600"
        style={{
          background: `linear-gradient(135deg, ${colors.blue} 0%, #00BCD4 30%, ${colors.green} 70%, #FF9800 100%)`,
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'scale(1.05)' : 'scale(1)',
        }}
      >
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />

      {/* Animated circles */}
      <div className="absolute top-[5%] left-[5%] w-[300px] h-[300px] rounded-full border border-white/10 animate-spin-slow" />
      <div className="absolute bottom-[5%] right-[5%] w-[400px] h-[400px] rounded-full border border-white/10 animate-spin-slow" style={{ animationDirection: 'reverse' }} />

      {/* Main Container */}
      <div className="w-full max-w-[1200px] px-5 flex flex-col items-center gap-0 z-10">

        {/* ========== BANNIÈRE AVEC EFFETS SPECTACULAIRES ========== */}
        <div className="w-full relative overflow-hidden min-h-[150px]" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {/* Fond de base avec dégradé */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(90deg, ${colors.cameroonGreen} 0%, ${colors.cameroonGreen} 28%, ${colors.cameroonRed} 33%, ${colors.cameroonRed} 67%, ${colors.cameroonYellow} 72%, ${colors.cameroonYellow} 100%)` }}
          />

          {/* Vague verte animée 1 */}
          <svg className="absolute left-0 top-0 h-full w-1/2 z-[1]" viewBox="0 0 300 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.cameroonGreen} />
                <stop offset="70%" stopColor={colors.cameroonGreen} />
                <stop offset="100%" stopColor={colors.cameroonGreen} stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <path d="M0,0 L0,120 L300,120 C250,120 280,100 260,80 C240,60 270,40 250,20 C230,0 260,-10 220,0 Z" fill="url(#greenGrad)">
              <animate attributeName="d" dur="8s" repeatCount="indefinite" values="
                M0,0 L0,120 L300,120 C250,120 280,100 260,80 C240,60 270,40 250,20 C230,0 260,-10 220,0 Z;
                M0,0 L0,120 L300,120 C260,120 240,95 270,75 C300,55 250,35 280,15 C260,0 240,5 200,0 Z;
                M0,0 L0,120 L300,120 C250,120 280,100 260,80 C240,60 270,40 250,20 C230,0 260,-10 220,0 Z
              "/>
            </path>
          </svg>

          {/* Vague verte animée 2 */}
          <svg className="absolute left-0 top-0 h-full w-[45%] z-[2]" viewBox="0 0 250 120" preserveAspectRatio="none">
            <path d="M0,0 L0,120 L250,120 C200,110 220,85 200,65 C180,45 210,25 190,10 C170,0 200,0 160,0 Z" fill={colors.cameroonGreen}>
              <animate attributeName="d" dur="6s" repeatCount="indefinite" values="
                M0,0 L0,120 L250,120 C200,110 220,85 200,65 C180,45 210,25 190,10 C170,0 200,0 160,0 Z;
                M0,0 L0,120 L250,120 C220,115 190,90 220,70 C250,50 200,30 230,10 C210,0 180,5 140,0 Z;
                M0,0 L0,120 L250,120 C200,110 220,85 200,65 C180,45 210,25 190,10 C170,0 200,0 160,0 Z
              "/>
            </path>
          </svg>

          {/* Vague jaune animée 1 */}
          <svg className="absolute right-0 top-0 h-full w-1/2 z-[1]" viewBox="0 0 300 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="yellowGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={colors.cameroonYellow} />
                <stop offset="70%" stopColor={colors.cameroonYellow} />
                <stop offset="100%" stopColor={colors.cameroonYellow} stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <path d="M300,0 L300,120 L0,120 C50,120 20,100 40,80 C60,60 30,40 50,20 C70,0 40,-10 80,0 Z" fill="url(#yellowGrad)">
              <animate attributeName="d" dur="7s" repeatCount="indefinite" values="
                M300,0 L300,120 L0,120 C50,120 20,100 40,80 C60,60 30,40 50,20 C70,0 40,-10 80,0 Z;
                M300,0 L300,120 L0,120 C40,120 60,95 30,75 C0,55 50,35 20,15 C40,0 60,5 100,0 Z;
                M300,0 L300,120 L0,120 C50,120 20,100 40,80 C60,60 30,40 50,20 C70,0 40,-10 80,0 Z
              "/>
            </path>
          </svg>

          {/* Vague jaune animée 2 */}
          <svg className="absolute right-0 top-0 h-full w-[45%] z-[2]" viewBox="0 0 250 120" preserveAspectRatio="none">
            <path d="M250,0 L250,120 L0,120 C50,110 30,85 50,65 C70,45 40,25 60,10 C80,0 50,0 90,0 Z" fill={colors.cameroonYellow}>
              <animate attributeName="d" dur="5s" repeatCount="indefinite" values="
                M250,0 L250,120 L0,120 C50,110 30,85 50,65 C70,45 40,25 60,10 C80,0 50,0 90,0 Z;
                M250,0 L250,120 L0,120 C30,115 60,90 30,70 C0,50 50,30 20,10 C40,0 70,5 110,0 Z;
                M250,0 L250,120 L0,120 C50,110 30,85 50,65 C70,45 40,25 60,10 C80,0 50,0 90,0 Z
              "/>
            </path>
          </svg>

          {/* Bulles décoratives animées */}
          <div
            className="absolute left-[8%] top-[20%] w-[45px] h-[45px] rounded-full z-[3] animate-float"
            style={{
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${colors.cameroonGreen})`,
              boxShadow: `0 0 15px ${colors.cameroonGreen}80`
            }}
          />
          <div
            className="absolute left-[18%] bottom-[15%] w-[30px] h-[30px] rounded-full z-[3] animate-float-delay-1"
            style={{
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${colors.cameroonGreen})`,
              boxShadow: `0 0 10px ${colors.cameroonGreen}80`
            }}
          />
          <div
            className="absolute right-[8%] top-[25%] w-[40px] h-[40px] rounded-full z-[3] animate-float-delay-2"
            style={{
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), ${colors.cameroonYellow})`,
              boxShadow: `0 0 15px ${colors.cameroonYellow}80`
            }}
          />
          <div
            className="absolute right-[15%] bottom-[20%] w-[25px] h-[25px] rounded-full z-[3] animate-float"
            style={{
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${colors.cameroonYellow})`,
              boxShadow: `0 0 10px ${colors.cameroonYellow}80`,
              animationDelay: '2s'
            }}
          />

          {/* Étoile centrale avec effet glow pulsant */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[4]">
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full animate-pulse"
              style={{ background: `radial-gradient(circle, ${colors.cameroonYellow}60 0%, transparent 70%)` }}
            />
            <Star
              size={60}
              color={colors.cameroonYellow}
              fill={colors.cameroonYellow}
              className="relative animate-spin-slow"
              style={{
                filter: `drop-shadow(0 0 8px ${colors.cameroonYellow}) drop-shadow(0 0 20px rgba(252, 209, 22, 0.8)) drop-shadow(0 0 40px rgba(252, 209, 22, 0.4))`
              }}
            />
          </div>

          {/* Particules flottantes */}
          <div className="absolute left-[25%] top-[30%] w-1.5 h-1.5 rounded-full bg-white/80 z-[3] animate-float" />
          <div className="absolute left-[35%] bottom-[25%] w-1 h-1 rounded-full bg-white/60 z-[3] animate-float-delay-1" />
          <div className="absolute right-[25%] top-[35%] w-1.5 h-1.5 rounded-full bg-white/70 z-[3] animate-float-delay-2" />
          <div className="absolute right-[32%] bottom-[30%] w-1 h-1 rounded-full bg-white/50 z-[3] animate-float" style={{ animationDelay: '2s' }} />

          {/* Overlay avec dégradé radial pour effet de profondeur */}
          <div
            className="absolute inset-0 z-[5]"
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.2) 100%)' }}
          />

          {/* Effet de brillance qui traverse */}
          <div
            className="absolute top-0 -left-full w-[80%] h-full z-[6] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              animation: 'bannerShine 5s ease-in-out infinite'
            }}
          />

          {/* Contenu de la bannière */}
          <div className="relative z-10 flex items-center justify-between px-9 py-5">
            {/* Left Logo - Programme Zoonoses */}
            <div
              className="w-[115px] h-[115px] rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ boxShadow: `0 4px 20px rgba(0,0,0,0.25), 0 0 0 3px ${colors.cameroonGreen}60, 0 0 20px ${colors.cameroonGreen}30` }}
            >
              <Image
                src="/images/Logo_Programme_Zoonoses.png"
                alt="Programme Zoonoses"
                width={105}
                height={105}
                className="object-contain rounded-full"
              />
            </div>

            {/* Center Text */}
            <div className="text-center flex-1 px-6">
              <h1 className="text-[34px] font-extrabold tracking-wide flex items-center justify-center gap-3 flex-wrap">
                <span style={{ color: '#1B5E20', textShadow: '0 2px 4px rgba(27,94,32,0.4), 0 0 10px rgba(27,94,32,0.3)' }}>CAMEROON</span>
                <span style={{ color: colors.cameroonRed, textShadow: '0 2px 4px rgba(206,17,38,0.3)' }}>ONE HEALTH</span>
                <span className="text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4), 0 0 8px rgba(255,255,255,0.5)' }}>PLATFORM</span>
              </h1>
              <p className="mt-2.5 text-base text-gray-700 font-bold tracking-[5px] uppercase" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
                Plateforme Une Seule Santé du Cameroun
              </p>
            </div>

            {/* Right Logo - One Health */}
            <div
              className="w-[115px] h-[115px] rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ boxShadow: `0 4px 20px rgba(0,0,0,0.25), 0 0 0 3px ${colors.blue}60, 0 0 20px ${colors.blue}30` }}
            >
              <Image
                src="/images/one-health.jpg"
                alt="One Health"
                width={105}
                height={105}
                className="object-contain rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Slideshow */}
        <div className="w-full h-[480px] relative overflow-hidden shadow-lg" style={{ background: '#87d5fb' }}>
          {/* Decorative rounded lines */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full border-[40px] border-white/20" />
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full border-[30px] border-white/15" />
            <div className="absolute -bottom-24 -right-24 w-[450px] h-[450px] rounded-full border-[35px] border-white/20" />
            <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full border-[25px] border-white/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border-[15px] border-white/10" />
          </div>

          {/* Slides Container */}
          <div className="relative w-full h-full">
            {slides.map((slide, index) => (
              <div
                key={index}
                className="absolute inset-0 flex items-center px-16 transition-all duration-700 ease-out"
                style={{
                  opacity: currentSlide === index ? 1 : 0,
                  transform: currentSlide === index
                    ? 'translateX(0) scale(1)'
                    : index < currentSlide
                      ? 'translateX(-100px) scale(0.95)'
                      : 'translateX(100px) scale(0.95)',
                  pointerEvents: currentSlide === index ? 'auto' : 'none',
                }}
              >
                {/* Image */}
                <div className="relative w-[400px] h-[400px] flex-shrink-0">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-contain"
                    priority={index === 0}
                  />
                </div>

                {/* Text Content */}
                <div
                  className="ml-14 flex-1 transition-all duration-700 delay-200"
                  style={{
                    opacity: currentSlide === index ? 1 : 0,
                    transform: currentSlide === index ? 'translateY(0)' : 'translateY(20px)',
                  }}
                >
                  <h2 className="text-5xl font-extrabold mb-6 leading-tight" style={{ color: '#006400', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {slide.title}
                  </h2>
                  <p className="text-xl text-black leading-relaxed max-w-xl">
                    {slide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>

          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="group relative h-3 border-none transition-all duration-500 ease-out rounded-full"
                style={{
                  width: currentSlide === index ? '40px' : '12px',
                  background: currentSlide === index ? 'white' : 'rgba(255,255,255,0.4)',
                }}
              >
                {currentSlide === index && (
                  <span className="absolute inset-0 rounded-full bg-white animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30 shadow-xl flex items-center justify-center z-10 transition-all duration-300 hover:bg-white hover:scale-110 group"
          >
            <ChevronLeft size={28} className="text-white group-hover:text-gray-800 transition-colors" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30 shadow-xl flex items-center justify-center z-10 transition-all duration-300 hover:bg-white hover:scale-110 group"
          >
            <ChevronRight size={28} className="text-white group-hover:text-gray-800 transition-colors" />
          </button>

          {/* Slide Counter */}
          <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 text-white font-semibold text-sm">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>

        {/* Navigation Bar */}
        <div
          className="w-full py-4 px-8 shadow-lg flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${colors.blue} 0%, ${colors.teal} 50%, ${colors.green} 100%)` }}
        >
          {/* Left - Platform Links */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="px-5 py-2.5 rounded-full bg-white/20 text-white text-sm font-semibold cursor-pointer transition-all flex items-center gap-2 backdrop-blur-sm hover:bg-white hover:text-blue-600 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                <path d="m9 9.5 2 2 4-4"/>
              </svg>
              OH E-Learning
            </a>
            <a
              href="#"
              className="px-5 py-2.5 rounded-full bg-white/20 text-white text-sm font-semibold cursor-pointer transition-all flex items-center gap-2 backdrop-blur-sm hover:bg-white hover:text-teal-600 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              OHWR-Map
            </a>
            <a
              href="#"
              className="px-5 py-2.5 rounded-full bg-white/20 text-white text-sm font-semibold cursor-pointer transition-all flex items-center gap-2 backdrop-blur-sm hover:bg-white hover:text-green-600 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              COHRM-SYSTEM
            </a>
          </div>

          {/* Right - Language Selection */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLanguageSelect('fr')}
              className="px-5 py-2.5 rounded-full bg-white/20 text-white text-sm font-semibold cursor-pointer transition-all flex items-center gap-2 backdrop-blur-sm hover:bg-white hover:text-blue-600 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="text-base">🇫🇷</span> Français
            </button>
            <button
              onClick={() => handleLanguageSelect('en')}
              className="px-5 py-2.5 rounded-full bg-white/20 text-white text-sm font-semibold cursor-pointer transition-all flex items-center gap-2 backdrop-blur-sm hover:bg-white hover:text-green-600 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="text-base">🇬🇧</span> English
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
