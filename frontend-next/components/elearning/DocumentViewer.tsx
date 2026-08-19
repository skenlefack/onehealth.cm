'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, RefreshCw, Maximize2, ExternalLink, AlertCircle } from 'lucide-react';

type DocumentType = 'pdf' | 'powerpoint' | 'word' | 'excel';
type Language = 'fr' | 'en';

interface DocumentViewerProps {
  url: string;
  type: DocumentType;
  title?: string;
  lang?: Language;
  className?: string;
}

export function DocumentViewer({ url, type, title, lang = 'fr', className = '' }: DocumentViewerProps) {
  const [viewerType, setViewerType] = useState<'microsoft' | 'google' | 'native'>('native');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [fullUrl, setFullUrl] = useState('');

  useEffect(() => {
    if (url.startsWith('http')) {
      setFullUrl(url);
    } else {
      // Use the public domain (not API domain) since files are served by nginx
      const publicDomain = typeof window !== 'undefined'
        ? window.location.origin.replace('admin.', '').replace('www.', '')
        : 'https://onehealth.cm';
      const cleanPath = url.startsWith('/') ? url : `/${url}`;
      setFullUrl(`${publicDomain}${cleanPath}`);
    }

    // PDF uses native browser viewer by default, office docs use Microsoft viewer
    if (type === 'pdf') {
      setViewerType('native');
    } else {
      setViewerType('microsoft');
    }
  }, [url, type]);

  const encodedUrl = encodeURIComponent(fullUrl);

  const getViewerUrl = () => {
    if (type === 'pdf' && viewerType === 'native') {
      return fullUrl;
    }
    if (viewerType === 'microsoft') {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
    }
    return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
  };

  const typeLabels: Record<DocumentType, { fr: string; en: string; icon: string }> = {
    pdf: { fr: 'Document PDF', en: 'PDF Document', icon: '📄' },
    powerpoint: { fr: 'Présentation PowerPoint', en: 'PowerPoint Presentation', icon: '📊' },
    word: { fr: 'Document Word', en: 'Word Document', icon: '📝' },
    excel: { fr: 'Feuille de calcul Excel', en: 'Excel Spreadsheet', icon: '📈' },
  };

  const label = typeLabels[type];
  const t = {
    switchViewer: lang === 'fr' ? 'Changer de lecteur' : 'Switch viewer',
    refresh: lang === 'fr' ? 'Rafraîchir' : 'Refresh',
    download: lang === 'fr' ? 'Télécharger' : 'Download',
    fullscreen: lang === 'fr' ? 'Plein écran' : 'Fullscreen',
    loading: lang === 'fr' ? 'Chargement du document...' : 'Loading document...',
    error: lang === 'fr' ? 'Impossible de charger le document' : 'Unable to load document',
    tryAnother: lang === 'fr' ? 'Essayer un autre lecteur' : 'Try another viewer',
    openNew: lang === 'fr' ? 'Ouvrir dans un nouvel onglet' : 'Open in new tab',
    currentViewer: viewerType === 'microsoft' ? 'Microsoft Office' : viewerType === 'google' ? 'Google Docs' : lang === 'fr' ? 'Lecteur natif' : 'Native viewer',
  };

  const handleSwitchViewer = () => {
    setIsLoading(true);
    setHasError(false);
    if (type === 'pdf') {
      // PDF cycles: native -> microsoft -> google -> native
      setViewerType(prev => prev === 'native' ? 'microsoft' : prev === 'microsoft' ? 'google' : 'native');
    } else {
      // Office docs cycle: microsoft -> google -> microsoft
      setViewerType(prev => prev === 'microsoft' ? 'google' : 'microsoft');
    }
  };

  const handleFullscreen = () => {
    const iframe = document.querySelector('.document-viewer-iframe') as HTMLIFrameElement;
    if (iframe?.requestFullscreen) iframe.requestFullscreen();
  };

  if (!fullUrl) return null;

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">{label.icon}</span>
          <span className="text-sm font-medium text-slate-700">
            {title || (lang === 'fr' ? label.fr : label.en)}
          </span>
          <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
            {t.currentViewer}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSwitchViewer}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={t.switchViewer}
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={t.fullscreen}
          >
            <Maximize2 size={16} />
          </button>
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title={t.openNew}
          >
            <ExternalLink size={16} />
          </a>
          <a
            href={fullUrl}
            download
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title={t.download}
          >
            <Download size={16} />
          </a>
        </div>
      </div>

      {/* Viewer */}
      <div className="relative" style={{ paddingBottom: type === 'excel' ? '75%' : '56.25%' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm text-slate-500">{t.loading}</p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <div className="text-center p-6">
              <AlertCircle size={48} className="mx-auto text-amber-500 mb-3" />
              <p className="text-slate-700 font-medium mb-2">{t.error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSwitchViewer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  {t.tryAnother}
                </button>
                <a
                  href={fullUrl}
                  download
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm"
                >
                  {t.download}
                </a>
              </div>
            </div>
          </div>
        )}

        <iframe
          key={`${viewerType}-${fullUrl}`}
          src={getViewerUrl()}
          className="document-viewer-iframe absolute inset-0 w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true); }}
          sandbox={type === 'pdf' && viewerType === 'native' ? undefined : 'allow-scripts allow-same-origin allow-popups allow-forms'}
          allow="fullscreen"
          title={title || (lang === 'fr' ? label.fr : label.en)}
        />
      </div>
    </div>
  );
}
