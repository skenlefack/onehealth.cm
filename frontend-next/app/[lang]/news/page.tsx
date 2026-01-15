import { Metadata } from 'next';
import { Language } from '@/lib/types';
import { getTranslation, isValidLanguage } from '@/lib/translations';
import { getPosts, getCategory } from '@/lib/api';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/ui';
import { PostCard } from '@/components/sections';

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const { category } = await searchParams;

  // If category filter is applied, use category name in title
  if (category) {
    const categoryResponse = await getCategory(category);
    if (categoryResponse.success && categoryResponse.data) {
      const categoryName = categoryResponse.data.name;
      return {
        title: `${categoryName} | One Health ${lang === 'fr' ? 'Cameroun' : 'Cameroon'}`,
        description: lang === 'fr'
          ? `Articles de la categorie ${categoryName}.`
          : `Articles in ${categoryName} category.`,
      };
    }
  }

  const titles = {
    fr: 'Actualites | One Health Cameroun',
    en: 'News | One Health Cameroon',
  };

  const descriptions = {
    fr: "Dernieres actualites et publications de One Health Cameroun.",
    en: "Latest news and publications from One Health Cameroon.",
  };

  return {
    title: titles[lang as Language] || titles.fr,
    description: descriptions[lang as Language] || descriptions.fr,
  };
}

export default async function NewsPage({ params, searchParams }: PageProps) {
  const { lang } = await params;
  const { category } = await searchParams;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const t = getTranslation(lang as Language);

  // Fetch category details if filter is applied
  let categoryName = '';
  if (category) {
    const categoryResponse = await getCategory(category);
    if (categoryResponse.success && categoryResponse.data) {
      categoryName = categoryResponse.data.name;
    }
  }

  // Fetch posts, optionally filtered by category, sorted by publication date (newest first)
  const postsResponse = await getPosts({
    status: 'published',
    limit: 12,
    category: category || undefined,
    sort: 'published_at',
    order: 'DESC'
  });
  const posts = postsResponse.success ? postsResponse.data : [];

  // Page title - use category name if filtering by category
  const pageTitle = categoryName || t.news.title;

  // Build breadcrumbs
  const breadcrumbs = categoryName
    ? [
        { label: lang === 'fr' ? 'Accueil' : 'Home', href: `/${lang}` },
        { label: t.news.title, href: `/${lang}/news` },
        { label: categoryName }
      ]
    : [
        { label: lang === 'fr' ? 'Accueil' : 'Home', href: `/${lang}` },
        { label: t.news.title }
      ];

  return (
    <>
      {/* Page Banner */}
      <div className="pt-0">
        <PageBanner
          title={pageTitle}
          breadcrumbs={breadcrumbs}
          variant="green"
        />
      </div>

      {/* News Grid */}
      <section className="py-12 px-[5%] bg-oh-background min-h-screen">
        <div className="max-w-7xl mx-auto">
          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} lang={lang as Language} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-oh-gray text-lg">{t.news.noNews}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
