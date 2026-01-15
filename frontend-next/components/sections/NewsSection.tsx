import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, ArrowRight } from 'lucide-react';
import { Language, Post } from '@/lib/types';
import { Translation } from '@/lib/translations';
import { SectionTitle, Card, Button } from '@/components/ui';
import { getImageUrl, formatDate } from '@/lib/utils';

interface NewsSectionProps {
  lang: Language;
  t: Translation;
  posts: Post[];
}

export function NewsSection({ lang, t, posts }: NewsSectionProps) {
  return (
    <section className="py-24 px-[5%] bg-oh-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <SectionTitle
            badge={t.news.badge}
            title={t.news.title}
            subtitle={t.news.subtitle}
            align="left"
            className="mb-0"
          />
          <Link href={`/${lang}/news`}>
            <Button variant="outline" rightIcon={<ArrowRight size={18} />}>
              {t.news.viewAll}
            </Button>
          </Link>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(0, 6).map((post) => (
              <PostCard key={post.id} post={post} lang={lang} />
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center">
            <p className="text-oh-gray">{t.news.noNews}</p>
          </Card>
        )}
      </div>
    </section>
  );
}

interface PostCardProps {
  post: Post;
  lang: Language;
}

// Helper functions to get localized content
const getLocalizedTitle = (post: Post, lang: Language) => {
  return lang === 'en' ? (post.title_en || post.title_fr || post.title) : (post.title_fr || post.title);
};

const getLocalizedExcerpt = (post: Post, lang: Language) => {
  return lang === 'en' ? (post.excerpt_en || post.excerpt_fr || post.excerpt) : (post.excerpt_fr || post.excerpt);
};

function PostCard({ post, lang }: PostCardProps) {
  const title = getLocalizedTitle(post, lang);
  const excerpt = getLocalizedExcerpt(post, lang);

  return (
    <Link href={`/${lang}/news/${post.slug}`}>
      <Card padding="none" className="overflow-hidden group cursor-pointer">
        {/* Image */}
        <div className="relative h-52 bg-gradient-to-br from-oh-blue to-oh-green">
          {post.featured_image && (
            <Image
              src={getImageUrl(post.featured_image)}
              alt={title}
              fill
              className="object-cover"
            />
          )}
          {post.category_name && (
            <span className="absolute top-4 left-4 px-4 py-1.5 bg-white rounded-full text-xs font-semibold text-oh-blue">
              {post.category_name}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-oh-dark mb-3 line-clamp-2 group-hover:text-oh-blue transition-colors">
            {title}
          </h3>
          <p className="text-oh-gray text-sm leading-relaxed mb-5 line-clamp-2">
            {excerpt || '...'}
          </p>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex gap-4 text-sm text-oh-gray">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {formatDate(post.published_at || post.created_at, lang)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={14} />
                {post.view_count || 0}
              </span>
            </div>
            <ArrowRight
              size={18}
              className="text-oh-blue opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export { PostCard };
