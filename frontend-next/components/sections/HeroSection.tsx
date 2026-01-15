'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play, Building, Shield, Users, Heart, Activity, Leaf } from 'lucide-react';
import { Language } from '@/lib/types';
import { Translation } from '@/lib/translations';
import { Button } from '@/components/ui';

interface HeroContent {
  badge?: string;
  title1?: string;
  title2?: string;
  description?: string;
  discover_btn?: string;
  news_btn?: string;
  ministries_label?: string;
  ministries_value?: string;
  zoonoses_label?: string;
  zoonoses_value?: string;
  partners_label?: string;
  partners_value?: string;
  image?: string;
}

interface HeroSectionProps {
  lang: Language;
  t: Translation;
  content?: HeroContent;
}

export function HeroSection({ lang, t, content }: HeroSectionProps) {
  const pillars = [
    { icon: Heart, label: t.pillars.human.title, color: 'bg-oh-light-blue', iconColor: 'text-oh-blue', angle: -90 },
    { icon: Activity, label: t.pillars.animal.title, color: 'bg-oh-light-orange', iconColor: 'text-oh-orange', angle: 30 },
    { icon: Leaf, label: t.pillars.environment.title, color: 'bg-oh-light-green', iconColor: 'text-oh-green', angle: 150 },
  ];

  const stats = [
    { value: content?.ministries_value || '09', label: content?.ministries_label || t.hero.ministries, icon: Building },
    { value: content?.zoonoses_value || '05', label: content?.zoonoses_label || t.hero.zoonoses, icon: Shield },
    { value: content?.partners_value || '10+', label: content?.partners_label || t.hero.partners, icon: Users },
  ];

  return (
    <section className="bg-hero-gradient min-h-[90vh] relative overflow-hidden flex items-center pb-24">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-[5%] py-20 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left Content */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-oh-green animate-pulse" />
            <span className="text-white text-sm font-semibold">{content?.badge || t.hero.badge}</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            {content?.title1 || t.hero.title1}
            <br />
            <span className="text-cameroon-yellow">{content?.title2 || t.hero.title2}</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-white/90 leading-relaxed mb-8 max-w-lg">
            {content?.description || t.hero.description}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Link href={`/${lang}/about`}>
              <Button
                variant="ghost"
                size="lg"
                className="bg-white text-oh-blue hover:bg-white/90"
                rightIcon={<ArrowRight size={20} />}
              >
                {content?.discover_btn || t.hero.discover}
              </Button>
            </Link>
            <Link href={`/${lang}/news`}>
              <Button
                variant="ghost"
                size="lg"
                className="bg-oh-orange text-white hover:bg-oh-orange/90"
                leftIcon={<Play size={18} />}
              >
                {content?.news_btn || t.hero.news}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <stat.icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-sm text-white/80">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content - Strategy Image in Circle */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-[450px] h-[450px] rounded-full bg-white p-0 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.5)]">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src={content?.image || "/images/onehealthnationalstrategy.jpg"}
                alt="One Health National Strategy"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z"
            fill="#F5F7FA"
            opacity="1"
          />
        </svg>
      </div>
    </section>
  );
}
