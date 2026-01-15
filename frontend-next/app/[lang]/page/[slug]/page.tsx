import { Metadata } from 'next';
import { Language } from '@/lib/types';
import { getTranslation, isValidLanguage } from '@/lib/translations';
import { getPage, PageSection } from '@/lib/api';
import { notFound } from 'next/navigation';
import { PageSectionRenderer } from '@/components/sections/PageSectionRenderer';
import { PageBanner } from '@/components/ui';

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const pageResponse = await getPage(slug);

  if (!pageResponse.success || !pageResponse.data) {
    return { title: 'Page not found' };
  }

  const page = pageResponse.data;

  return {
    title: page.meta_title || `${page.title} | One Health Cameroun`,
    description: page.meta_description || '',
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { lang, slug } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const t = getTranslation(lang as Language);
  const pageResponse = await getPage(slug);

  if (!pageResponse.success || !pageResponse.data) {
    notFound();
  }

  const page = pageResponse.data;

  // Parse sections if it's a string - handle both formats
  let sections: PageSection[] = [];
  if (page.sections) {
    try {
      const parsed = typeof page.sections === 'string'
        ? JSON.parse(page.sections)
        : page.sections;

      // Handle both formats: {sections: [...]} or direct array [...]
      if (Array.isArray(parsed)) {
        sections = parsed;
      } else if (parsed && Array.isArray(parsed.sections)) {
        sections = parsed.sections;
      }
    } catch (e) {
      console.error('Error parsing page sections:', e);
    }
  }

  // Build breadcrumbs
  const breadcrumbs = page.show_breadcrumb ? [
    { label: lang === 'fr' ? 'Accueil' : 'Home', href: `/${lang}` },
    { label: page.title }
  ] : undefined;

  return (
    <>
      {/* Page Banner */}
      {page.show_title && (
        <div className="pt-0">
          <PageBanner
            title={page.title}
            breadcrumbs={breadcrumbs}
            variant="blue"
          />
        </div>
      )}

      {/* Page Content */}
      <section className={`${page.show_title ? 'py-8 md:py-12' : 'pt-28 pb-16'} bg-gradient-to-b from-white to-gray-50/30 min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 md:px-[5%]">
          {/* Render structured sections */}
          {sections.length > 0 ? (
            <div className="space-y-4">
              {sections.map((section, index) => (
                <PageSectionRenderer
                  key={section.id}
                  section={section}
                  lang={lang as Language}
                  index={index}
                />
              ))}
            </div>
          ) : (
            /* Render raw HTML content if no sections */
            page.content && (
              <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
                <div
                  className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-oh-blue"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              </div>
            )
          )}
        </div>
      </section>
    </>
  );
}
