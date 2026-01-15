import { Metadata } from 'next';
import { Header, Footer, BackToTop } from '@/components/layout';
import { getTranslation, isValidLanguage, supportedLanguages } from '@/lib/translations';
import { Language } from '@/lib/types';
import { notFound } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return supportedLanguages.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const titles = {
    fr: 'One Health Cameroun | Plateforme Une Seule Santé',
    en: 'One Health Cameroon | One Health Platform',
  };

  const descriptions = {
    fr: "Plateforme nationale de surveillance des zoonoses One Health Cameroun.",
    en: "National platform for zoonoses surveillance One Health Cameroon.",
  };

  return {
    title: titles[lang as Language] || titles.fr,
    description: descriptions[lang as Language] || descriptions.fr,
    alternates: {
      canonical: `/${lang}`,
      languages: {
        fr: '/fr',
        en: '/en',
      },
    },
  };
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = await params;

  // Validate language
  if (!isValidLanguage(lang)) {
    notFound();
  }

  const t = getTranslation(lang as Language);

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={lang as Language} t={t} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang as Language} t={t} />
      <BackToTop />
    </div>
  );
}
