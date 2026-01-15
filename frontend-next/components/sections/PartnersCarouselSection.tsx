'use client';

import { Language } from '@/lib/types';
import { Translation } from '@/lib/translations';

// Helper to get correct image URL (backend uploads vs frontend public images)
const getLogoUrl = (logoPath: string): string => {
  if (logoPath.startsWith('/uploads/')) {
    // Uploaded images are served from backend (remove /api suffix if present)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const baseUrl = apiUrl.replace(/\/api$/, '');
    return `${baseUrl}${logoPath}`;
  }
  // Public images are served from frontend
  return logoPath;
};

interface PartnersContent {
  title?: string;
  subtitle?: string;
  items?: Array<{
    name: string;
    logo: string;
    url?: string;
  }>;
}

interface PartnersCarouselSectionProps {
  lang: Language;
  t: Translation;
  content?: PartnersContent;
}

interface Partner {
  name: string;
  nameShort: string;
  logo: string;
  url?: string;
}

const partners: Partner[] = [
  { name: 'Services du Premier Ministère', nameShort: 'SPM', logo: '/images/partners/spm1.png', url: 'https://www.spm.gov.cm' },
  { name: 'Ministère de la Santé Publique', nameShort: 'MINSANTE', logo: '/images/partners/minsante.png', url: 'https://www.minsante.cm' },
  { name: 'Ministère de l\'Élevage, des Pêches et des Industries Animales', nameShort: 'MINEPIA', logo: '/images/partners/minepia.png', url: 'https://www.minepia.cm' },
  { name: 'Ministère de l\'Environnement, de la Protection de la Nature et du Développement Durable', nameShort: 'MINEPDED', logo: '/images/partners/minepdep.png', url: 'https://www.minepded.cm' },
  { name: 'Ministère du Tourisme et des Loisirs', nameShort: 'MINTOUR', logo: '/images/partners/mintour.jpg', url: 'https://www.mintour.cm' },
  { name: 'Organisation Mondiale de la Santé', nameShort: 'OMS/WHO', logo: '/images/partners/oms.png', url: 'https://www.who.int' },
  { name: 'Food and Agriculture Organization', nameShort: 'FAO', logo: '/images/partners/fao.png', url: 'https://www.fao.org' },
  { name: 'Centers for Disease Control', nameShort: 'CDC', logo: '/images/partners/cdc100.png', url: 'https://www.cdc.gov' },
  { name: 'U.S. Agency for International Development', nameShort: 'USAID', logo: '/images/partners/usaid.jpg', url: 'https://www.usaid.gov' },
  { name: 'Deutsche Gesellschaft für Internationale Zusammenarbeit', nameShort: 'GIZ', logo: '/images/partners/giz.jpg', url: 'https://www.giz.de' },
  { name: 'Africa One Health University Network', nameShort: 'AFROHUN', logo: '/images/partners/afrohun100.png', url: 'https://afrohun.org' },
  { name: 'DAI Global', nameShort: 'DAI', logo: '/images/partners/dai.jpg', url: 'https://www.dai.com' },
  { name: 'Fédération Internationale de la Croix-Rouge', nameShort: 'IFRC', logo: '/images/partners/ifrc.jpg', url: 'https://www.ifrc.org' },
  { name: 'Breakthrough ACTION', nameShort: 'Breakthrough', logo: '/images/partners/breakthrough100.jpg', url: 'https://breakthroughactionandresearch.org' },
];

export function PartnersCarouselSection({ lang, t, content: apiContent }: PartnersCarouselSectionProps) {
  // Use API partners if available, otherwise use static fallback
  const activePartners = apiContent?.items && apiContent.items.length > 0
    ? apiContent.items.map(item => ({
        name: item.name,
        nameShort: item.name,
        logo: item.logo,
        url: item.url
      }))
    : partners;

  // Duplicate for seamless infinite scroll (duplicate twice for smoother loop)
  const duplicatedPartners = [...activePartners, ...activePartners];

  // Calculate animation duration based on number of items (3 seconds per item)
  const animationDuration = activePartners.length * 3;

  // Each item is 144px (w-36) + 32px margin (mx-4 * 2) = 176px
  const itemWidth = 176;
  const totalWidth = activePartners.length * itemWidth;

  return (
    <section className="py-16 bg-oh-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-[5%]">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-oh-light-blue text-oh-blue text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
            {lang === 'fr' ? 'Partenaires' : 'Partners'}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-oh-dark">
            {apiContent?.title || t.partners.title}
          </h2>
          <p className="text-oh-gray mt-3 max-w-2xl mx-auto">
            {apiContent?.subtitle || (lang === 'fr'
              ? 'Nous travaillons avec des organisations nationales et internationales pour renforcer la surveillance One Health.'
              : 'We work with national and international organizations to strengthen One Health surveillance.'
            )}
          </p>
        </div>
      </div>

      {/* Carousel Track */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-oh-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-oh-background to-transparent z-10" />

        {/* Scrolling Container */}
        <div
          className="flex partners-carousel-track"
          style={{ width: 'fit-content' }}
        >
          {duplicatedPartners.map((partner, index) => (
            <div
              key={`partner-${index}`}
              className="flex-shrink-0 mx-4"
              style={{ width: '144px' }}
            >
              <a
                href={partner.url || '#'}
                target={partner.url ? '_blank' : '_self'}
                rel="noopener noreferrer"
                title={partner.name}
                className="block w-36 h-24 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-2 flex items-center justify-center group hover:scale-105"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getLogoUrl(partner.logo)}
                  alt={partner.name}
                  className="w-full h-full object-contain transition-all duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <span
                  className="text-sm font-bold text-oh-dark-gray text-center items-center justify-center"
                  style={{ display: 'none' }}
                >
                  {partner.nameShort}
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Animation keyframes with pixel-based translation for accuracy */}
      <style jsx global>{`
        @keyframes partnerScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${totalWidth}px);
          }
        }
        .partners-carousel-track {
          animation: partnerScroll ${animationDuration}s linear infinite;
        }
        .partners-carousel-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
