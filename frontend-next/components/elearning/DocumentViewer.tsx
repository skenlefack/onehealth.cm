'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, Download, RefreshCw, Maximize2, ExternalLink, AlertCircle } from 'lucide-react';

type DocumentType = 'pdf' | 'powerpoint' | 'word' | 'excel';
type Language = 'fr' | 'en';

interface DocumentViewerProps {
  url: string;
  type: DocumentType;
  title?: string;
  lang?: Language;
  className?: string;
  /** Afficher le bouton de téléchargement (true par défaut) */
  allowDownload?: boolean;
}

/**
 * Les visionneuses en ligne (Microsoft Office, Google Docs) téléchargent le fichier depuis
 * leurs serveurs : elles ne peuvent pas atteindre une adresse locale ou privée.
 */
function isPrivateHost(fileUrl: string): boolean {
  try {
    const h = new URL(fileUrl).hostname.replace(/^\[|\]$/g, '');
    return h === 'localhost' || h === '::1' || h.endsWith('.localhost') || h.endsWith('.local') ||
      h.endsWith('.test') || /^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h);
  } catch {
    return false;
  }
}

export function DocumentViewer({ url, type, title, lang = 'fr', className = '', allowDownload = true }: DocumentViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
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
  // Visionneuse en ligne + fichier non public : l'aperçu ne peut pas se charger
  const unreachable = viewerType !== 'native' && isPrivateHost(fullUrl);

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
    unreachableTitle: lang === 'fr' ? 'Aperçu indisponible sur ce serveur' : 'Preview unavailable on this server',
    unreachableText: lang === 'fr'
      ? 'La visionneuse en ligne doit pouvoir accéder au fichier depuis Internet. Elle fonctionnera une fois le site en ligne ; en attendant, ouvrez le fichier directement.'
      : 'The online viewer needs to reach the file over the Internet. It will work once the site is online; meanwhile, open the file directly.',
    nativeViewer: lang === 'fr' ? 'Revenir au lecteur natif' : 'Back to native viewer',
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
    // Plusieurs visionneuses peuvent coexister dans une leçon : on cible la sienne
    const iframe = iframeRef.current;
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
          {allowDownload && (
            <a
              href={fullUrl}
              download
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title={t.download}
            >
              <Download size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Viewer */}
      <div className="relative" style={{ paddingBottom: type === 'excel' ? '75%' : '56.25%' }}>
        {unreachable ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 p-6">
            <div className="text-center max-w-md">
              <FileText size={44} className="mx-auto text-slate-400 mb-3" />
              <p className="text-slate-800 font-semibold mb-1">{t.unreachableTitle}</p>
              <p className="text-sm text-slate-500 mb-4">{t.unreachableText}</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {type === 'pdf' && (
                  <button onClick={() => setViewerType('native')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    {t.nativeViewer}
                  </button>
                )}
                {allowDownload && (
                  <>
                    <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm inline-flex items-center gap-2">
                      <ExternalLink size={14} /> {t.openNew}
                    </a>
                    <a href={fullUrl} download className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm inline-flex items-center gap-2">
                      <Download size={14} /> {t.download}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
        <>
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
                {allowDownload && (
                  <a
                    href={fullUrl}
                    download
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm"
                  >
                    {t.download}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <iframe
          key={`${viewerType}-${fullUrl}`}
          ref={iframeRef}
          src={getViewerUrl()}
          className="document-viewer-iframe absolute inset-0 w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true); }}
          sandbox={type === 'pdf' && viewerType === 'native' ? undefined : 'allow-scripts allow-same-origin allow-popups allow-forms'}
          allow="fullscreen"
          title={title || (lang === 'fr' ? label.fr : label.en)}
        />
        </>
        )}
      </div>
    </div>
  );
}
