import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { User, Calendar, Eye, ArrowLeft, Tag } from 'lucide-react';
import { Language, Post } from '@/lib/types';
import { getTranslation, isValidLanguage } from '@/lib/translations';
import { getPost } from '@/lib/api';
import { getImageUrl, formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { Card, Button, PageBanner } from '@/components/ui';

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

// Helper functions to get localized content
const getLocalizedTitle = (post: Post, lang: Language) => {
  return lang === 'en' ? (post.title_en || post.title_fr || post.title) : (post.title_fr || post.title);
};

const getLocalizedExcerpt = (post: Post, lang: Language) => {
  return lang === 'en' ? (post.excerpt_en || post.excerpt_fr || post.excerpt) : (post.excerpt_fr || post.excerpt);
};

const getLocalizedContent = (post: Post, lang: Language) => {
  return lang === 'en' ? (post.content_en || post.content_fr || post.content) : (post.content_fr || post.content);
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const language = (lang === 'en' ? 'en' : 'fr') as Language;

  const postResponse = await getPost(slug);

  if (!postResponse.success || !postResponse.data) {
    return {
      title: lang === 'en' ? 'Article not found | One Health Cameroon' : 'Article non trouve | One Health Cameroon',
    };
  }

  const post = postResponse.data;
  const title = getLocalizedTitle(post, language);
  const excerpt = getLocalizedExcerpt(post, language);

  return {
    title: `${title} | One Health Cameroon`,
    description: excerpt || post.meta_description || '',
    openGraph: {
      title: title,
      description: excerpt || '',
      images: post.featured_image ? [getImageUrl(post.featured_image)] : [],
    },
  };
}

export default async function SinglePostPage({ params }: PageProps) {
  const { lang, slug } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const language = lang as Language;
  const t = getTranslation(language);

  const postResponse = await getPost(slug);

  if (!postResponse.success || !postResponse.data) {
    notFound();
  }

  const post = postResponse.data;
  const title = getLocalizedTitle(post, language);
  const content = getLocalizedContent(post, language);

  // Build breadcrumbs
  const breadcrumbs = [
    { label: lang === 'fr' ? 'Accueil' : 'Home', href: `/${lang}` },
    { label: lang === 'fr' ? 'Actualites' : 'News', href: `/${lang}/news` },
    { label: title.length > 40 ? title.substring(0, 40) + '...' : title }
  ];

  return (
    <>
      {/* Page Banner */}
      <div className="pt-0">
        <PageBanner
          title={title}
          breadcrumbs={breadcrumbs}
          variant="green"
        />
      </div>

      {/* Article Content */}
      <section className="py-12 px-[5%] bg-oh-background min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12">
            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 md:gap-6 mb-8 text-oh-gray text-sm border-b border-gray-100 pb-6">
              {post.author_username && (
                <span className="flex items-center gap-2">
                  <User size={16} className="text-oh-blue" />
                  {post.author_first_name && post.author_last_name
                    ? `${post.author_first_name} ${post.author_last_name}`
                    : post.author_username}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-oh-green" />
                {formatDate(post.published_at || post.created_at, language)}
              </span>
              <span className="flex items-center gap-2">
                <Eye size={16} className="text-oh-orange" />
                {post.view_count || 0} {t.common.views}
              </span>
              {post.category_name && (
                <span className="flex items-center gap-2">
                  <Tag size={16} className="text-purple-500" />
                  {post.category_name}
                </span>
              )}
            </div>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
                <Image
                  src={getImageUrl(post.featured_image)}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-lg max-w-none text-oh-dark-gray prose-headings:text-oh-dark prose-a:text-oh-blue"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </Card>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link href={`/${lang}/news`}>
              <Button variant="primary" leftIcon={<ArrowLeft size={18} />}>
                {t.common.back}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
