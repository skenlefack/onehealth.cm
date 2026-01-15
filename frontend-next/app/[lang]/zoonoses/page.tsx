import { Metadata } from 'next';
import { Language } from '@/lib/types';
import { getTranslation, isValidLanguage } from '@/lib/translations';
import { notFound } from 'next/navigation';
import { ZoonosesSection } from '@/components/sections';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;

  const titles = {
    fr: 'Zoonoses | One Health Cameroun',
    en: 'Zoonoses | One Health Cameroon',
  };

  const descriptions = {
    fr: "Surveillance des zoonoses prioritaires au Cameroun : Rage, Grippe aviaire, Tuberculose bovine, Anthrax, Ebola.",
    en: "Priority zoonoses surveillance in Cameroon: Rabies, Avian Flu, Bovine TB, Anthrax, Ebola.",
  };

  return {
    title: titles[lang as Language] || titles.fr,
    description: descriptions[lang as Language] || descriptions.fr,
  };
}

export default async function ZoonosesPage({ params }: PageProps) {
  const { lang } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const t = getTranslation(lang as Language);

  return <ZoonosesSection t={t} fullPage />;
}
