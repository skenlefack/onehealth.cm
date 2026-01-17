'use client';

import Image from 'next/image';
import { Language } from '@/lib/types';
import { PageSection, getImageUrl } from '@/lib/api';

interface PageSectionRendererProps {
  section: PageSection;
  lang: Language;
  index?: number;
}

export function PageSectionRenderer({ section, lang, index = 0 }: PageSectionRendererProps) {
  // Handle different title formats
  const getTitle = () => {
    if (!section.title) return '';
    if (typeof section.title === 'string') return section.title;
    return lang === 'en' ? (section.title.en || section.title.fr || '') : (section.title.fr || '');
  };

  type ContentBlock = { type: string; text?: string; style?: string; items?: string[] };

  // Handle different content formats
  const getContent = (): ContentBlock[] => {
    if (!section.content) return [];
    // Direct format: section.content = { fr: [...], en: [...] }
    if (section.content.fr || section.content.en) {
      return lang === 'en' ? (section.content.en || section.content.fr || []) : (section.content.fr || []);
    }
    // Nested format: section.content.content = { fr: [...], en: [...] }
    const contentAny = section.content as Record<string, unknown>;
    if (contentAny.content && typeof contentAny.content === 'object') {
      const nested = contentAny.content as { fr?: ContentBlock[]; en?: ContentBlock[] };
      return lang === 'en' ? (nested.en || nested.fr || []) : (nested.fr || []);
    }
    // Array format
    if (Array.isArray(section.content)) return section.content as ContentBlock[];
    return [];
  };

  const title = getTitle();
  const content = getContent();
  const imageAlt = section.image?.alt ? (lang === 'en' ? (section.image.alt.en || '') : (section.image.alt.fr || '')) : '';
  const imageCaption = section.image?.caption ? (lang === 'en' ? (section.image.caption.en || '') : (section.image.caption.fr || '')) : '';

  // Get alignment class for image container
  const getAlignClass = () => {
    const align = section.image?.align || 'center';
    switch (align) {
      case 'left': return 'justify-start';
      case 'right': return 'justify-end';
      default: return 'justify-center';
    }
  };

  // Alternate background colors for visual rhythm
  const isEven = index % 2 === 0;

  // Render content blocks with enhanced styling
  const renderContent = () => {
    return content.map((block, idx) => {
      if (block.type === 'paragraph') {
        return (
          <p
            key={idx}
            className="text-gray-600 leading-relaxed mb-5 text-[16px] md:text-[17px]"
            style={{ textAlign: 'justify', textJustify: 'inter-word' }}
          >
            {block.text}
          </p>
        );
      }
      if (block.type === 'list' && block.items) {
        return (
          <ul key={idx} className="space-y-3 mb-6 ml-1">
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600">
                <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-gradient-to-r from-oh-green to-oh-blue"></span>
                <span className="text-[16px] md:text-[17px]">{item}</span>
              </li>
            ))}
          </ul>
        );
      }
      return null;
    });
  };

  // Enhanced Image Component
  const renderImage = () => {
    if (!section.image?.src) return null;

    return (
      <div className={`flex ${getAlignClass()} items-start`}>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-oh-green/20 to-oh-blue/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-white p-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <Image
              src={getImageUrl(section.image.src)}
              alt={imageAlt}
              width={section.image.width || 400}
              height={section.image.height || 400}
              className="object-contain rounded-lg"
              unoptimized
            />
          </div>
          {imageCaption && (
            <p className="text-center text-sm text-gray-500 mt-3 italic">
              {imageCaption}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Section Title Component
  const renderTitle = () => {
    if (!title) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <div className="h-1 w-16 bg-gradient-to-r from-oh-green to-oh-blue rounded-full"></div>
          <div className="h-1 w-8 bg-oh-green/30 rounded-full"></div>
          <div className="h-1 w-4 bg-oh-blue/30 rounded-full"></div>
        </div>
      </div>
    );
  };

  // Layout: text-left-image-right
  if (section.layout === 'text-left-image-right') {
    return (
      <div className={`py-12 md:py-16 ${isEven ? 'bg-white' : 'bg-gray-50/50'} rounded-2xl transition-all duration-300`}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {renderTitle()}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="prose prose-lg max-w-none">
                {renderContent()}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              {renderImage()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Layout: image-left-text-right
  if (section.layout === 'image-left-text-right') {
    return (
      <div className={`py-12 md:py-16 ${isEven ? 'bg-white' : 'bg-gray-50/50'} rounded-2xl transition-all duration-300`}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {renderTitle()}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-1">
              {renderImage()}
            </div>
            <div className="order-2">
              <div className="prose prose-lg max-w-none">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Layout: full-width (explicit or default)
  // For full-width: centered title, content, then image below
  const isFullWidth = section.layout === 'full-width' || !section.layout;

  // Centered title for full-width layout
  const renderCenteredTitle = () => {
    if (!title) return null;

    return (
      <div className="mb-10 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          {title}
        </h2>
        <div className="flex items-center gap-2 justify-center">
          <div className="h-1 w-16 bg-gradient-to-r from-oh-green to-oh-blue rounded-full"></div>
          <div className="h-1 w-8 bg-oh-green/30 rounded-full"></div>
          <div className="h-1 w-4 bg-oh-blue/30 rounded-full"></div>
        </div>
      </div>
    );
  };

  return (
    <div className={`py-12 md:py-16 ${isEven ? 'bg-white' : 'bg-gray-50/50'} rounded-2xl transition-all duration-300`}>
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {isFullWidth ? renderCenteredTitle() : renderTitle()}
        <div className="prose prose-lg max-w-none">
          {renderContent()}
        </div>
        {section.image?.src && (
          <div className="flex justify-center mt-10">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-oh-green/20 to-oh-blue/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Image
                  src={getImageUrl(section.image.src)}
                  alt={imageAlt}
                  width={section.image.width || 600}
                  height={section.image.height || 400}
                  className="object-contain rounded-lg"
                  unoptimized
                />
              </div>
              {imageCaption && (
                <p className="text-center text-sm text-gray-500 mt-3 italic">
                  {imageCaption}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
