import { Metadata } from 'next';
import { Language } from '@/lib/types';
import { getTranslation, isValidLanguage } from '@/lib/translations';
import { getFeaturedPosts, getHomepageSections, HomepageSection } from '@/lib/api';
import { notFound } from 'next/navigation';
import {
  HeroSection,
  PillarsSection,
  ZoonosesSection,
  PlatformsSection,
  FeaturedSliderSection,
  EditorNoteSection,
  ImplementationStrategySection,
  PartnersCarouselSection,
} from '@/components/sections';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;

  const titles = {
    fr: 'One Health Cameroon Home Page | Plateforme Nationale',
    en: 'One Health Cameroon Home Page | National Platform',
  };

  const descriptions = {
    fr: "Plateforme nationale de surveillance des zoonoses One Health Cameroun. Une approche collaborative pour la santé humaine, animale et environnementale.",
    en: "National platform for zoonoses surveillance One Health Cameroon. A collaborative approach for human, animal and environmental health.",
  };

  return {
    title: titles[lang as Language] || titles.fr,
    description: descriptions[lang as Language] || descriptions.fr,
  };
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const t = getTranslation(lang as Language);

  // Fetch posts for the featured slider (10 latest)
  const postsResponse = await getFeaturedPosts(10);
  const posts = postsResponse.success ? postsResponse.data : [];

  // Fetch homepage sections from API
  const sectionsResponse = await getHomepageSections(lang);
  const sections = sectionsResponse.success ? sectionsResponse.data : [];

  // Helper to get section content by key
  const getSection = (key: string): HomepageSection | undefined =>
    sections.find(s => s.section_key === key);

  return (
    <>
      {/* Section 1: À la Une + Note de l'Éditeur (Grid 9+3) */}
      <section className="py-8 px-[5%] bg-oh-background">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-oh-orange rounded-full" />
              <h2 className="text-2xl font-extrabold text-oh-dark">
                {lang === 'fr' ? 'À la Une' : 'Featured'}
              </h2>
            </div>
          </div>

          {/* Grid Layout 9+3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Slider - 9 columns */}
            <div className="lg:col-span-9">
              <FeaturedSliderSection lang={lang as Language} t={t} posts={posts} />
            </div>

            {/* Editor's Note - 3 columns */}
            <div className="lg:col-span-3">
              <EditorNoteSection lang={lang as Language} t={t} content={getSection('editor_note')?.content} />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: À propos / Hero Section */}
      <HeroSection lang={lang as Language} t={t} content={getSection('hero')?.content} />

      {/* Section 3: Notre Approche / Les Trois Piliers */}
      <PillarsSection t={t} content={getSection('pillars')?.content} />

      {/* Section 4: Stratégie de Mise en Oeuvre */}
      <ImplementationStrategySection lang={lang as Language} t={t} content={getSection('implementation')?.content} />

      {/* Section 5: Zoonoses Prioritaires */}
      <ZoonosesSection t={t} lang={lang as Language} content={getSection('zoonoses')?.content} />

      {/* Section 6: Nos Partenaires (Carousel) */}
      <PartnersCarouselSection lang={lang as Language} t={t} content={getSection('partners')?.content} />

      {/* Section 7: Nos Plateformes */}
      <PlatformsSection lang={lang as Language} t={t} />
    </>
  );
}
