import { MetadataRoute } from 'next';
import { supportedLanguages } from '@/lib/translations';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://onehealth.cm';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  // Add homepage
  routes.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  });

  // Add language-specific pages
  const pages = ['', '/about', '/news', '/zoonoses', '/contact'];

  for (const lang of supportedLanguages) {
    for (const page of pages) {
      routes.push({
        url: `${BASE_URL}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 0.9 : 0.8,
        alternates: {
          languages: {
            fr: `${BASE_URL}/fr${page}`,
            en: `${BASE_URL}/en${page}`,
          },
        },
      });
    }
  }

  return routes;
}
