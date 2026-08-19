'use client';

import { DocumentViewer } from './DocumentViewer';

type Language = 'fr' | 'en';

interface PowerPointViewerProps {
  pptxUrl: string;
  title?: string;
  lang?: Language;
  className?: string;
}

export function PowerPointViewer({ pptxUrl, title, lang = 'fr', className }: PowerPointViewerProps) {
  return (
    <DocumentViewer
      url={pptxUrl}
      type="powerpoint"
      title={title}
      lang={lang}
      className={className}
    />
  );
}
