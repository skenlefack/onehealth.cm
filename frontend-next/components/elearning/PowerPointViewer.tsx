'use client';

import { useState } from 'react';
import { Download, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
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
  const [viewerType, setViewerType] = useState<'google' | 'microsoft'>('google');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Construire l'URL complète du fichier
  const getFullUrl = () => {
    if (pptxUrl.startsWith('http')) {
      return pptxUrl;
    }
    // Utiliser l'URL du serveur backend
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${baseUrl}${pptxUrl}`;
  };

  const fullUrl = getFullUrl();
  const encodedUrl = encodeURIComponent(fullUrl);

  // URLs des viewers
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
  const microsoftViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;

  const currentViewerUrl = viewerType === 'google' ? googleViewerUrl : microsoftViewerUrl;

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
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400">{t.loading}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center max-w-md px-6">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{t.error}</h3>
              <p className="text-slate-400 mb-6">
                {lang === 'fr'
                  ? 'Le fichier PowerPoint ne peut pas être affiché dans le navigateur.'
                  : 'The PowerPoint file cannot be displayed in the browser.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={switchViewer}
                  className="text-slate-300 border-slate-500"
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
        <iframe
          id="pptx-viewer-iframe"
          src={currentViewerUrl}
          className={cn(
            'absolute inset-0 w-full h-full border-0',
            (isLoading || hasError) && 'invisible'
          )}
          title={title || 'PowerPoint Presentation'}
          onLoad={handleLoad}
          onError={handleError}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
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
