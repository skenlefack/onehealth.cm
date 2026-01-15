import { Metadata } from 'next';
import Image from 'next/image';
import { Language } from '@/lib/types';
import { getTranslation, isValidLanguage } from '@/lib/translations';
import { notFound } from 'next/navigation';
import { SectionTitle, Card } from '@/components/ui';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;

  const titles = {
    fr: 'À propos | One Health Cameroun',
    en: 'About | One Health Cameroon',
  };

  const descriptions = {
    fr: "Découvrez One Health Cameroun, la plateforme nationale dédiée à l'approche Une Seule Santé.",
    en: "Discover One Health Cameroon, the national platform dedicated to the One Health approach.",
  };

  return {
    title: titles[lang as Language] || titles.fr,
    description: descriptions[lang as Language] || descriptions.fr,
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { lang } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const t = getTranslation(lang as Language);

  return (
    <section className="pt-32 pb-20 px-[5%] bg-oh-background min-h-screen">
      <div className="max-w-4xl mx-auto">
        <SectionTitle badge={t.about.badge} title={t.about.title} />

        <Card className="p-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg">
              <Image
                src="/images/one-health.jpg"
                alt="One Health"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <p className="text-xl text-oh-dark-gray font-semibold text-center leading-relaxed">
              {t.about.p1}
            </p>
            <p className="text-lg text-oh-gray leading-relaxed">
              {t.about.p2}
            </p>
            <p className="text-lg text-oh-gray leading-relaxed">
              {t.about.p3}
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-oh-light-blue rounded-2xl">
              <div className="text-4xl font-extrabold text-oh-blue mb-2">09</div>
              <p className="text-sm text-oh-gray font-medium">
                {lang === 'fr' ? 'Ministères partenaires' : 'Partner Ministries'}
              </p>
            </div>
            <div className="text-center p-6 bg-oh-light-orange rounded-2xl">
              <div className="text-4xl font-extrabold text-oh-orange mb-2">05</div>
              <p className="text-sm text-oh-gray font-medium">
                {lang === 'fr' ? 'Zoonoses prioritaires' : 'Priority Zoonoses'}
              </p>
            </div>
            <div className="text-center p-6 bg-oh-light-green rounded-2xl">
              <div className="text-4xl font-extrabold text-oh-green mb-2">10+</div>
              <p className="text-sm text-oh-gray font-medium">
                {lang === 'fr' ? 'Partenaires internationaux' : 'International Partners'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
