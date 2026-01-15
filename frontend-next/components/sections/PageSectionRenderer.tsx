'use client';

import Image from 'next/image';
import { Language } from '@/lib/types';
import { PageSection, getImageUrl } from '@/lib/api';

interface PageSectionRendererProps {
  section: PageSection;
  lang: Language;
}

export function PageSectionRenderer({ section, lang }: PageSectionRendererProps) {
  // Handle different title formats
  const getTitle = () => {
    if (!section.title) return '';
    if (typeof section.title === 'string') return section.title;
    return lang === 'en' ? (section.title.en || section.title.fr || '') : (section.title.fr || '');
  };

  // Handle different content formats
  const getContent = () => {
    if (!section.content) return [];
    // Direct format: section.content = { fr: [...], en: [...] }
    if (section.content.fr || section.content.en) {
      return lang === 'en' ? (section.content.en || section.content.fr || []) : (section.content.fr || []);
    }
    // Nested format: section.content.content = { fr: [...], en: [...] }
    if (section.content.content) {
      const nested = section.content.content;
      return lang === 'en' ? (nested.en || nested.fr || []) : (nested.fr || []);
    }
    // Array format
    if (Array.isArray(section.content)) return section.content;
    return [];
  };

  const title = getTitle();
  const content = getContent();
  const imageAlt = section.image?.alt ? (lang === 'en' ? (section.image.alt.en || '') : (section.image.alt.fr || '')) : '';

  // Get alignment class for image container
  const getAlignClass = () => {
    const align = section.image?.align || 'center';
    switch (align) {
      case 'left': return 'justify-start';
      case 'right': return 'justify-end';
      default: return 'justify-center';
    }
  };

  // Render content blocks
  const renderContent = () => {
    return content.map((block, index) => {
      if (block.type === 'paragraph') {
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-4">
            {block.text}
          </p>
        );
      }
      if (block.type === 'list' && block.items) {
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-4 ml-4">
            {block.items.map((item, i) => (
              <li key={i} className="text-gray-700">{item}</li>
            ))}
          </ul>
        );
      }
      return null;
    });
  };

  // Layout: text-left-image-right
  if (section.layout === 'text-left-image-right') {
    return (
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 border-b-2 border-oh-blue pb-4">
          {title}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="prose prose-lg max-w-none">
            {renderContent()}
          </div>
          {section.image && (
            <div className={`flex ${getAlignClass()} items-start`}>
              <div className="relative w-full max-w-md">
                <Image
                  src={getImageUrl(section.image.src)}
                  alt={imageAlt}
                  width={section.image.width || 400}
                  height={section.image.height || 400}
                  className="object-contain rounded-lg"
                  unoptimized
                />
                {section.image.caption && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {lang === 'en' ? section.image.caption.en : section.image.caption.fr}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Layout: image-left-text-right
  if (section.layout === 'image-left-text-right') {
    return (
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 border-b-2 border-oh-blue pb-4">
          {title}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {section.image && (
            <div className={`flex ${getAlignClass()} items-start`}>
              <div className="relative w-full max-w-md">
                <Image
                  src={getImageUrl(section.image.src)}
                  alt={imageAlt}
                  width={section.image.width || 400}
                  height={section.image.height || 400}
                  className="object-contain rounded-lg"
                  unoptimized
                />
              </div>
            </div>
          )}
          <div className="prose prose-lg max-w-none">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // Default layout: full-width
  return (
    <div className="mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 border-b-2 border-oh-blue pb-4">
        {title}
      </h2>
      <div className="prose prose-lg max-w-none">
        {renderContent()}
      </div>
      {section.image && (
        <div className={`flex ${getAlignClass()} mt-8`}>
          <Image
            src={getImageUrl(section.image.src)}
            alt={imageAlt}
            width={section.image.width || 600}
            height={section.image.height || 400}
            className="object-contain rounded-lg"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
