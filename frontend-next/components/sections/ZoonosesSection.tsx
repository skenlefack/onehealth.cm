'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronRight, X } from 'lucide-react';
import { Translation } from '@/lib/translations';
import { Language } from '@/lib/types';

interface ZoonosesContent {
  title?: string;
  subtitle?: string;
  items?: Array<{
    name: string;
    description: string;
    status?: string;
    cases?: string;
  }>;
}

interface ZoonosesSectionProps {
  t: Translation;
  lang?: Language;
  fullPage?: boolean;
  content?: ZoonosesContent;
}

interface ZoonoseData {
  id: string;
  name: string;
  description: string;
  image: string;
  color: string;
  gradient: string;
}

const zoonosesData: ZoonoseData[] = [
  {
    id: 'rabies',
    name: 'Rabies',
    description: 'It is a deadly zoonotic disease of humans and most warm blooded animals caused by the Rabies virus.',
    image: '/images/zoonoses/z-rabie.jpg',
    color: '#E53935',
    gradient: 'from-red-500/80 to-red-700/90',
  },
  {
    id: 'anthrax',
    name: 'Anthrax',
    description: 'Zoonotic disease of humans, livestock and wildlife caused by the bacterium Bacillus anthracis.',
    image: '/images/zoonoses/z-anthrax.jpg',
    color: '#8E24AA',
    gradient: 'from-purple-500/80 to-purple-700/90',
  },
  {
    id: 'avian-influenza',
    name: 'Avian Influenza',
    description: 'It is a zoonotic disease of humans and most warm blooded animals caused by the Orthomyxovirus.',
    image: '/images/zoonoses/z-avian-influenza.jpg',
    color: '#FB8C00',
    gradient: 'from-orange-500/80 to-orange-700/90',
  },
  {
    id: 'ebola',
    name: 'Ebola',
    description: 'It is an acute viral zoonotic disease of epidemic proportions characterized by fever and hemorrhage.',
    image: '/images/zoonoses/z-ebola.jpg',
    color: '#D32F2F',
    gradient: 'from-rose-500/80 to-rose-700/90',
  },
  {
    id: 'bovine-tb',
    name: 'Bovine Tuberculosis',
    description: 'An infectious disease caused by the bacteria Mycobacterium bovis. It can be transmitted from animals to humans.',
    image: '/images/zoonoses/z-bovis-tuberculosis.jpg',
    color: '#00897B',
    gradient: 'from-teal-500/80 to-teal-700/90',
  },
  {
    id: 'salmonellosis',
    name: 'Salmonellosis',
    description: 'Is an infectious disease caused by bacteria Salmonella, which infect the intestinal tracts of humans, animals and birds.',
    image: '/images/zoonoses/z-salmonellosis1.jpg',
    color: '#43A047',
    gradient: 'from-green-500/80 to-green-700/90',
  },
  {
    id: 'brucellosis',
    name: 'Brucellosis',
    description: 'Is a contagious disease caused by various bacteria of the family Brucella that affect animals and can be transmitted to humans.',
    image: '/images/zoonoses/z-brucelosis1.jpg',
    color: '#1E88E5',
    gradient: 'from-blue-500/80 to-blue-700/90',
  },
  {
    id: 'monkeypox',
    name: 'Monkey Pox',
    description: 'Is a sylvatic zoonosis with incidental human infections that usually occur sporadically in forested parts of Central and West Africa.',
    image: '/images/zoonoses/z-monkey-pox1.jpg',
    color: '#6D4C41',
    gradient: 'from-amber-600/80 to-amber-800/90',
  },
  {
    id: 'trypanosomiasis',
    name: 'Trypanosomiasis',
    description: 'Also known as "sleeping sickness", is caused by microscopic parasites of the species Trypanosoma brucei.',
    image: '/images/zoonoses/z-trypanosoma1.jpg',
    color: '#5E35B1',
    gradient: 'from-indigo-500/80 to-indigo-700/90',
  },
  {
    id: 'lassa-fever',
    name: 'Lassa Fever',
    description: 'An acute, viral disease carried by a type of rat. It can be life-threatening. It is a hemorrhagic virus.',
    image: '/images/zoonoses/z-lassa-fever1.jpg',
    color: '#C62828',
    gradient: 'from-red-600/80 to-red-800/90',
  },
];

export function ZoonosesSection({ t, lang = 'en', fullPage = false, content: apiContent }: ZoonosesSectionProps) {
  const [selectedZoonose, setSelectedZoonose] = useState<ZoonoseData | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className={`${fullPage ? 'pt-40 pb-24' : 'py-20'} px-[5%] bg-gradient-to-b from-slate-50 to-white`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-2 bg-gradient-to-r from-red-100 to-orange-100 text-red-600 text-sm font-bold rounded-full mb-4 uppercase tracking-wider">
            {lang === 'fr' ? 'Maladies Zoonotiques' : 'Zoonotic Diseases'}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            {apiContent?.title || (lang === 'fr' ? 'Zoonoses Prioritaires' : 'Priority Zoonoses')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {apiContent?.subtitle || (lang === 'fr'
              ? 'Les maladies transmissibles entre animaux et humains sous surveillance au Cameroun'
              : 'Diseases transmissible between animals and humans under surveillance in Cameroon'
            )}
          </p>
        </div>

        {/* Grid of Zoonoses Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {zoonosesData.map((zoonose, index) => (
            <div
              key={zoonose.id}
              className="group relative cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setSelectedZoonose(zoonose)}
            >
              {/* Card */}
              <div className={`
                relative overflow-hidden rounded-2xl aspect-[3/4] shadow-lg
                transition-all duration-500 ease-out
                ${hoveredIndex === index ? 'shadow-2xl scale-[1.02]' : 'shadow-md'}
              `}>
                {/* Background Image */}
                <Image
                  src={zoonose.image}
                  alt={zoonose.name}
                  fill
                  className={`
                    object-cover transition-transform duration-700 ease-out
                    ${hoveredIndex === index ? 'scale-110' : 'scale-100'}
                  `}
                />

                {/* Gradient Overlay */}
                <div className={`
                  absolute inset-0 bg-gradient-to-t ${zoonose.gradient}
                  transition-opacity duration-300
                  ${hoveredIndex === index ? 'opacity-95' : 'opacity-70'}
                `} />

                {/* Content */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  {/* Name */}
                  <h3 className={`
                    text-white font-extrabold text-xl leading-tight mb-2 drop-shadow-lg
                    transition-transform duration-300
                    ${hoveredIndex === index ? 'translate-y-0' : 'translate-y-0'}
                  `}>
                    {zoonose.name}
                  </h3>

                  {/* Description - Shows on hover */}
                  <p className={`
                    text-white/95 text-sm leading-relaxed line-clamp-3
                    transition-all duration-300
                    ${hoveredIndex === index ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0'}
                  `}>
                    {zoonose.description}
                  </p>

                  {/* Learn More Button - Enhanced with glassmorphism */}
                  <button className={`
                    mt-3 px-4 py-2.5 rounded-xl
                    bg-white/20 backdrop-blur-md border border-white/30
                    text-white text-sm font-semibold
                    flex items-center justify-center gap-2
                    transition-all duration-300 ease-out
                    hover:bg-white hover:text-gray-900 hover:shadow-lg hover:border-white
                    active:scale-95
                    ${hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                  `}>
                    <span>{lang === 'fr' ? 'En savoir plus' : 'Learn more'}</span>
                    <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>

                {/* Top Accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: zoonose.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-red-500 mb-1">10</p>
              <p className="text-gray-600 text-sm">{lang === 'fr' ? 'Zoonoses surveillées' : 'Monitored Zoonoses'}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-blue-500 mb-1">9</p>
              <p className="text-gray-600 text-sm">{lang === 'fr' ? 'Ministères impliqués' : 'Ministries Involved'}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-green-500 mb-1">24/7</p>
              <p className="text-gray-600 text-sm">{lang === 'fr' ? 'Surveillance active' : 'Active Surveillance'}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-purple-500 mb-1">10+</p>
              <p className="text-gray-600 text-sm">{lang === 'fr' ? 'Régions couvertes' : 'Regions Covered'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for detailed view */}
      {selectedZoonose && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedZoonose(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Image */}
            <div className="relative h-64 md:h-80">
              <Image
                src={selectedZoonose.image}
                alt={selectedZoonose.name}
                fill
                className="object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${selectedZoonose.gradient} opacity-60`} />

              {/* Close Button */}
              <button
                onClick={() => setSelectedZoonose(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Title on Image */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-3xl font-extrabold text-white mb-2">{selectedZoonose.name}</h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {selectedZoonose.description}
              </p>

              <div className="flex gap-3">
                <button
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-colors"
                  style={{ backgroundColor: selectedZoonose.color }}
                >
                  {lang === 'fr' ? 'Voir les données' : 'View Data'}
                </button>
                <button
                  onClick={() => setSelectedZoonose(null)}
                  className="px-6 py-3 bg-gray-100 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {lang === 'fr' ? 'Fermer' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
