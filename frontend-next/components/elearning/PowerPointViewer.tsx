'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, ExternalLink, AlertCircle, Presentation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { Button } from '@/components/ui';

interface PowerPointViewerProps {
  pptxUrl: string;
  title?: string;
  lang?: Language;
  className?: string;
}

export function PowerPointViewer({
  pptxUrl,
  title,
  lang = 'fr',
  className
}: PowerPointViewerProps) {
  const [viewerType, setViewerType] = useState<'microsoft' | 'google'>('microsoft');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [fullUrl, setFullUrl] = useState('');

  // Construire l'URL complète du fichier côté client
  useEffect(() => {
    if (pptxUrl.startsWith('http')) {
      setFullUrl(pptxUrl);
    } else {
      // Utiliser le domaine public actuel
      const publicDomain = typeof window !== 'undefined'
        ? window.location.origin.replace('www.', '')
        : 'https://onehealth.cm';
      const cleanPath = pptxUrl.startsWith('/') ? pptxUrl : `/${pptxUrl}`;
      setFullUrl(`${publicDomain}${cleanPath}`);
    }
  }, [pptxUrl]);

  const encodedUrl = encodeURIComponent(fullUrl);

  // URLs des viewers (Microsoft fonctionne mieux avec les fichiers .pptx)
  const microsoftViewerUrl = fullUrl ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}` : '';
  const googleViewerUrl = fullUrl ? `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true` : '';

  const currentViewerUrl = viewerType === 'microsoft' ? microsoftViewerUrl : googleViewerUrl;

  // Reset loading state when URL changes
  useEffect(() => {
    if (fullUrl) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [fullUrl, viewerType]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const switchViewer = () => {
    setIsLoading(true);
    setHasError(false);
    setViewerType(viewerType === 'google' ? 'microsoft' : 'google');
  };

  const refreshViewer = () => {
    setIsLoading(true);
    setHasError(false);
    // Force iframe refresh
    const iframe = document.getElementById('pptx-viewer-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = currentViewerUrl;
    }
  };

  const translations = {
    fr: {
      loading: 'Chargement de la présentation...',
      error: 'Impossible de charger la présentation',
      tryOther: 'Essayer un autre viewer',
      download: 'Télécharger le fichier',
      refresh: 'Rafraîchir',
      googleViewer: 'Google Docs Viewer',
      microsoftViewer: 'Microsoft Office Viewer',
      currentViewer: 'Viewer actuel',
      openExternal: 'Ouvrir dans une nouvelle fenêtre'
    },
    en: {
      loading: 'Loading presentation...',
      error: 'Unable to load presentation',
      tryOther: 'Try another viewer',
      download: 'Download file',
      refresh: 'Refresh',
      googleViewer: 'Google Docs Viewer',
      microsoftViewer: 'Microsoft Office Viewer',
      currentViewer: 'Current viewer',
      openExternal: 'Open in new window'
    }
  };

  const t = translations[lang];

  return (
    <div className={cn('bg-slate-800 rounded-xl overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-700 border-b border-slate-600">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300">
            {t.currentViewer}: <span className="font-medium text-white">
              {viewerType === 'google' ? t.googleViewer : t.microsoftViewer}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshViewer}
            className="text-slate-300 hover:text-white"
            title={t.refresh}
          >
            <RefreshCw size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={switchViewer}
            className="text-slate-300 hover:text-white"
            title={t.tryOther}
          >
            <ExternalLink size={16} />
            <span className="ml-2 hidden sm:inline">{t.tryOther}</span>
          </Button>
          <a
            href={fullUrl}
            download
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
          >
            <Download size={16} />
            <span className="hidden sm:inline">{t.download}</span>
          </a>
        </div>
      </div>

      {/* Viewer Container - 16:9 aspect ratio */}
      <div className="relative w-full bg-white" style={{ paddingBottom: '56.25%' }}>
        {/* Loading State */}
        {(isLoading || !fullUrl) && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600">{t.loading}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="text-center max-w-md px-6">
              <Presentation size={48} className="mx-auto text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {lang === 'fr' ? 'Présentation PowerPoint' : 'PowerPoint Presentation'}
              </h3>
              <p className="text-slate-600 mb-6">
                {lang === 'fr'
                  ? 'Téléchargez le fichier pour le visualiser sur votre ordinateur.'
                  : 'Download the file to view it on your computer.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={switchViewer}
                  className="text-slate-600 border-slate-400 hover:bg-slate-200"
                >
                  <ExternalLink size={18} className="mr-2" />
                  {t.tryOther}
                </Button>
                <a
                  href={fullUrl}
                  download
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
                >
                  <Download size={18} />
                  {t.download}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Iframe Viewer */}
        {fullUrl && currentViewerUrl && (
          <iframe
            id="pptx-viewer-iframe"
            src={currentViewerUrl}
            className={cn(
              'absolute inset-0 w-full h-full border-0 bg-white',
              (isLoading || hasError) && 'invisible'
            )}
            title={title || 'PowerPoint Presentation'}
            onLoad={handleLoad}
            onError={handleError}
            allowFullScreen
          />
        )}
      </div>

      {/* Title Bar (optional) */}
      {title && (
        <div className="px-4 py-3 bg-slate-700 border-t border-slate-600">
          <h3 className="text-sm font-medium text-white truncate">{title}</h3>
        </div>
      )}
    </div>
  );
}
