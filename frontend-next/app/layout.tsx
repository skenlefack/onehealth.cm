import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

// Using system font stack for better Docker build compatibility
// Font family is defined in tailwind.config.ts

export const metadata: Metadata = {
  title: {
    default: 'One Health Cameroon | Plateforme Une Seule Santé',
    template: '%s | One Health Cameroon',
  },
  description:
    "Plateforme nationale de surveillance des zoonoses One Health Cameroun. Une approche collaborative reconnaissant l'interconnexion entre la santé humaine, animale et environnementale.",
  keywords: [
    'One Health',
    'Une Seule Santé',
    'Cameroun',
    'Zoonoses',
    'Santé publique',
    'Surveillance épidémiologique',
    'Rage',
    'Grippe aviaire',
    'Tuberculose bovine',
  ],
  authors: [{ name: 'One Health Cameroon' }],
  creator: 'One Health Cameroon',
  openGraph: {
    type: 'website',
    locale: 'fr_CM',
    alternateLocale: 'en_CM',
    url: 'https://onehealth.cm',
    siteName: 'One Health Cameroon',
    title: 'One Health Cameroon | Plateforme Une Seule Santé',
    description:
      "Plateforme nationale de surveillance des zoonoses One Health Cameroun.",
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'One Health Cameroon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'One Health Cameroon',
    description: 'Plateforme nationale de surveillance des zoonoses',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-oh-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
