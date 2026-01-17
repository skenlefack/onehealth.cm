'use client';

import { FileText, Download, ExternalLink, File, FileImage, FileVideo } from 'lucide-react';
import { Language } from '@/lib/types';
import { OHWRDocument } from '@/lib/types';
import { getImageUrl } from '@/lib/api';

interface ResourceCardProps {
  lang: Language;
  resource: OHWRDocument;
}

const translations = {
  fr: {
    download: 'Télécharger',
    view: 'Voir',
    type: 'Type',
    language: 'Langue',
  },
  en: {
    download: 'Download',
    view: 'View',
    type: 'Type',
    language: 'Language',
  },
};

const typeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  image: FileImage,
  video: FileVideo,
  default: File,
};

const typeColors: Record<string, { bg: string; text: string }> = {
  pdf: { bg: 'bg-red-50', text: 'text-red-600' },
  guide: { bg: 'bg-blue-50', text: 'text-blue-600' },
  report: { bg: 'bg-purple-50', text: 'text-purple-600' },
  video: { bg: 'bg-pink-50', text: 'text-pink-600' },
  default: { bg: 'bg-gray-50', text: 'text-gray-600' },
};

export function ResourceCard({ lang, resource }: ResourceCardProps) {
  const t = translations[lang];

  const title = lang === 'fr' ? (resource.title_fr || resource.title_en) : (resource.title_en || resource.title_fr);
  const description = lang === 'fr'
    ? (resource.description_fr || resource.description_en)
    : (resource.description_en || resource.description_fr);

  const docType = resource.document_type || 'default';
  const Icon = typeIcons[docType] || typeIcons.default;
  const colors = typeColors[docType] || typeColors.default;

  const handleDownload = () => {
    if (resource.file_url) {
      window.open(getImageUrl(resource.file_url), '_blank');
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-lg ${colors.bg} flex-shrink-0`}>
          <Icon className={`h-6 w-6 ${colors.text}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{description}</p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mb-3">
            {resource.document_type && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                {resource.document_type}
              </span>
            )}
            {resource.language && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                {resource.language.toUpperCase()}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {resource.file_url && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-3 py-1.5 bg-oh-blue text-white rounded-lg text-sm font-medium hover:bg-oh-blue/90 transition-colors"
              >
                <Download size={14} />
                {t.download}
              </button>
            )}
            {resource.external_url && (
              <a
                href={resource.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <ExternalLink size={14} />
                {t.view}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
