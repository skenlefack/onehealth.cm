'use client';

import { ArrowRight } from 'lucide-react';
import { Language } from '@/lib/types';
import { Translation } from '@/lib/translations';

interface ImplementationContent {
  title?: string;
  subtitle?: string;
  coordination_title?: string;
  coordination_description?: string;
  surveillance_title?: string;
  surveillance_description?: string;
  capacity_title?: string;
  capacity_description?: string;
  communication_title?: string;
  communication_description?: string;
}

interface ImplementationStrategySectionProps {
  lang: Language;
  t: Translation;
  content?: ImplementationContent;
}

interface StrategyCard {
  title: string;
  color: string;
  hoverColor: string;
}

export function ImplementationStrategySection({ lang, t, content: apiContent }: ImplementationStrategySectionProps) {
  const content = {
    fr: {
      badge: 'Stratégie',
      title: 'Stratégie de Mise en Oeuvre',
      subtitle: 'La Stratégie Nationale est au coeur d\'un ensemble de projets et programmes satellites sur la mise en oeuvre d\'instruments ou solutions validés dans la lettre et l\'esprit de cette approche.',
      cards: [
        { title: '(09) Départements ministériels clés pour la mise en oeuvre', color: 'bg-[#F5A623]', hoverColor: 'hover:bg-[#E09612]' },
        { title: 'Renforcer et promouvoir l\'intégration des systèmes existants', color: 'bg-[#00BCD4]', hoverColor: 'hover:bg-[#00ACC1]' },
        { title: 'Identification et élimination des pathogènes dangereux', color: 'bg-[#CE1126]', hoverColor: 'hover:bg-[#B30E20]' },
        { title: 'Garantir la promotion du concept "One Health"', color: 'bg-[#7CB342]', hoverColor: 'hover:bg-[#6B9B37]' },
      ] as StrategyCard[],
    },
    en: {
      badge: 'Strategy',
      title: 'Implementation Strategy',
      subtitle: 'The National Strategy is at the nucleus of a whole range of satellite projects and programs on the implementation of validated instruments or solutions in the letter and spirit of this approach.',
      cards: [
        { title: '(09) Key ministerial departments for the implementation', color: 'bg-[#F5A623]', hoverColor: 'hover:bg-[#E09612]' },
        { title: 'Reinforce and promote integration of existing systems', color: 'bg-[#00BCD4]', hoverColor: 'hover:bg-[#00ACC1]' },
        { title: 'Identification and elimination of dangerous pathogens', color: 'bg-[#CE1126]', hoverColor: 'hover:bg-[#B30E20]' },
        { title: 'Guarantee promotion of "One Health" concept', color: 'bg-[#7CB342]', hoverColor: 'hover:bg-[#6B9B37]' },
      ] as StrategyCard[],
    },
  };

  const currentContent = content[lang];

  return (
    <section className="py-20 px-[5%] bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <span className="inline-block px-4 py-1.5 bg-oh-light-green text-oh-green text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
            {currentContent.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-oh-green mb-4">
            {apiContent?.title || currentContent.title}
          </h2>
          <p className="text-oh-gray text-lg max-w-4xl leading-relaxed">
            {apiContent?.subtitle || currentContent.subtitle}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentContent.cards.map((card, index) => (
            <div
              key={index}
              className={`${card.color} ${card.hoverColor} rounded-2xl p-6 min-h-[200px] flex flex-col justify-between cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl group`}
            >
              <p className="text-white font-bold text-lg leading-snug">
                {card.title}
              </p>
              <div className="mt-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ArrowRight className="text-white" size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
