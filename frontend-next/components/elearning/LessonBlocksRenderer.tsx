'use client';

import { useState } from 'react';
import {
  Info, Lightbulb, AlertTriangle, ChevronDown, Download, Paperclip, CheckCircle, XCircle,
  HelpCircle, ExternalLink
} from 'lucide-react';
import { Language, ELearningLesson, LessonBlock } from '@/lib/types';
import { getImageUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { VideoPlayer, VideoProgressData } from './VideoPlayer';
import { DocumentViewer } from './DocumentViewer';

const newId = (i: number, type: string) => `legacy-${type}-${i}`;

/** Reconstitue des blocs à partir d'une ancienne leçon « Mixte » (vidéo + PDF + Word… + texte). */
export function legacyLessonToBlocks(lesson: ELearningLesson, html?: string): LessonBlock[] {
  const blocks: LessonBlock[] = [];
  const push = (type: LessonBlock['type'], data: LessonBlock['data']) =>
    blocks.push({ id: newId(blocks.length, type), type, title: '', data, settings: {} });
  if (lesson.video_url) push('video', { url: lesson.video_url, provider: lesson.video_provider });
  if (lesson.pptx_url) push('powerpoint', { url: lesson.pptx_url });
  if (lesson.pdf_url) push('pdf', { url: lesson.pdf_url });
  if (lesson.docx_url) push('word', { url: lesson.docx_url });
  if (lesson.xlsx_url) push('excel', { url: lesson.xlsx_url });
  if (html) push('text', { html });
  return blocks;
}

const BLOCK_LABELS: Record<string, { fr: string; en: string }> = {
  text: { fr: 'Lecture', en: 'Reading' },
  video: { fr: 'Vidéo', en: 'Video' },
  pdf: { fr: 'Document PDF', en: 'PDF document' },
  powerpoint: { fr: 'Présentation', en: 'Presentation' },
  word: { fr: 'Document Word', en: 'Word document' },
  excel: { fr: 'Tableur', en: 'Spreadsheet' },
  image: { fr: 'Illustration', en: 'Illustration' },
  audio: { fr: 'Audio', en: 'Audio' },
  embed: { fr: 'Activité', en: 'Activity' },
  files: { fr: 'Ressources', en: 'Resources' },
  callout: { fr: 'À retenir', en: 'Key point' },
  accordion: { fr: 'Pour approfondir', en: 'Learn more' },
  knowledge_check: { fr: 'Testez-vous', en: 'Check yourself' },
  divider: { fr: 'Partie', en: 'Part' },
};

/** Libellé d'une partie pour le plan de la leçon. */
export function blockLabel(block: LessonBlock, lang: Language): string {
  if (block.title) return block.title;
  const l = BLOCK_LABELS[block.type];
  return l ? l[lang] : block.type;
}

/** Les séparateurs sans titre ne sont pas des « parties » à suivre. */
export function isTrackableBlock(block: LessonBlock): boolean {
  return !(block.type === 'divider' && !block.title);
}

const formatSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

interface LessonBlocksRendererProps {
  blocks: LessonBlock[];
  lang: Language;
  lessonTitle: string;
  poster?: string;
  completedBlocks: Set<string>;
  /** Suivi de la première vidéo de la leçon (reprise + complétion) */
  videoTracking?: {
    initialPosition?: number;
    minWatchPercent?: number;
    onProgress?: (data: VideoProgressData) => void;
    onComplete?: () => void;
  };
}

export function LessonBlocksRenderer({
  blocks, lang, lessonTitle, poster, completedBlocks, videoTracking
}: LessonBlocksRendererProps) {
  const firstVideoId = blocks.find(b => b.type === 'video' && b.data?.url)?.id;
  let partNumber = 0;

  return (
    <div className="space-y-8">
      {blocks.map((block) => {
        const trackable = isTrackableBlock(block);
        if (trackable) partNumber += 1;
        const done = completedBlocks.has(block.id);

        if (block.type === 'divider') {
          return (
            <section key={block.id} id={`part-${block.id}`} data-block-id={trackable ? block.id : undefined} className="scroll-mt-24 pt-2">
              {block.title ? (
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-700" />
                  <h3 className="text-lg font-bold text-white text-center">{block.title}</h3>
                  <div className="h-px flex-1 bg-slate-700" />
                </div>
              ) : (
                <hr className="border-slate-700" />
              )}
            </section>
          );
        }

        return (
          <section key={block.id} id={`part-${block.id}`} data-block-id={block.id} className="scroll-mt-24">
            <header className="flex items-center gap-3 mb-3">
              <span className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
                done ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
              )}>
                {done ? <CheckCircle size={14} /> : partNumber}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  {BLOCK_LABELS[block.type]?.[lang] || block.type}
                </p>
                {block.title && <h3 className="text-lg font-semibold text-white leading-tight">{block.title}</h3>}
              </div>
            </header>
            <BlockBody
              block={block}
              lang={lang}
              lessonTitle={lessonTitle}
              poster={poster}
              videoTracking={block.id === firstVideoId ? videoTracking : undefined}
            />
          </section>
        );
      })}
    </div>
  );
}

function BlockBody({ block, lang, lessonTitle, poster, videoTracking }: {
  block: LessonBlock;
  lang: Language;
  lessonTitle: string;
  poster?: string;
  videoTracking?: LessonBlocksRendererProps['videoTracking'];
}) {
  const d = block.data || {};
  const allowDownload = block.settings?.downloadable !== false;

  switch (block.type) {
    case 'text':
      return (
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
          <div
            className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-a:text-blue-600 prose-strong:text-slate-800 prose-li:text-slate-700"
            dangerouslySetInnerHTML={{ __html: d.html || '' }}
          />
        </div>
      );

    case 'video': {
      if (!d.url) return null;
      const external = d.provider === 'youtube' || d.provider === 'vimeo' || d.url.startsWith('http');
      return (
        <div className="rounded-xl overflow-hidden shadow-lg bg-black">
          <VideoPlayer
            src={external ? d.url : getImageUrl(d.url)}
            provider={(d.provider as any) || 'upload'}
            poster={poster}
            title={block.title || lessonTitle}
            lang={lang}
            initialPosition={videoTracking?.initialPosition}
            minWatchPercent={videoTracking?.minWatchPercent || 80}
            onProgress={videoTracking?.onProgress}
            onComplete={videoTracking?.onComplete}
            autoSaveInterval={10000}
          />
        </div>
      );
    }

    case 'pdf':
    case 'powerpoint':
    case 'word':
    case 'excel':
      if (!d.url) return null;
      return (
        <DocumentViewer
          url={getImageUrl(d.url)}
          type={block.type}
          title={block.title || d.name || lessonTitle}
          lang={lang}
          allowDownload={allowDownload}
        />
      );

    case 'image':
      if (!d.url) return null;
      return (
        <figure className="bg-white rounded-xl overflow-hidden shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getImageUrl(d.url)} alt={d.alt || d.caption || block.title || ''} className="w-full h-auto" loading="lazy" />
          {d.caption && <figcaption className="px-5 py-3 text-sm text-slate-600 italic">{d.caption}</figcaption>}
        </figure>
      );

    case 'audio':
      if (!d.url) return null;
      return (
        <div className="bg-slate-800 rounded-xl p-5 shadow-lg">
          <audio controls preload="metadata" className="w-full" src={d.url.startsWith('http') ? d.url : getImageUrl(d.url)} />
          {d.transcript && (
            <details className="mt-4 group">
              <summary className="cursor-pointer text-sm text-blue-300 hover:text-blue-200 select-none">
                {lang === 'fr' ? 'Afficher la transcription' : 'Show transcript'}
              </summary>
              <p className="mt-3 text-sm text-slate-300 whitespace-pre-line leading-relaxed">{d.transcript}</p>
            </details>
          )}
        </div>
      );

    case 'embed':
      if (!d.url || !/^https:\/\//i.test(d.url)) return null;
      return (
        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          <iframe
            src={d.url}
            title={block.title || lessonTitle}
            className="w-full border-0"
            style={{ height: `${Math.min(Math.max(Number(d.height) || 480, 200), 1200)}px` }}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
            allow="fullscreen; autoplay; clipboard-write"
            allowFullScreen
            loading="lazy"
          />
          <div className="flex justify-end px-4 py-2 bg-slate-100 border-t border-slate-200">
            <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600">
              <ExternalLink size={12} /> {lang === 'fr' ? 'Ouvrir dans un nouvel onglet' : 'Open in new tab'}
            </a>
          </div>
        </div>
      );

    case 'files':
      if (!d.files?.length) return null;
      return (
        <div className="bg-slate-800 rounded-xl p-4 space-y-2">
          {d.files.map((f, i) => (
            <a key={i} href={getImageUrl(f.url)} target="_blank" rel="noopener noreferrer" download
              className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
              <Paperclip size={18} className="text-slate-400 flex-shrink-0" />
              <span className="text-sm text-white flex-1 truncate">{f.name || f.url.split('/').pop()}</span>
              {f.size ? <span className="text-xs text-slate-400">{formatSize(f.size)}</span> : null}
              <Download size={16} className="text-slate-400" />
            </a>
          ))}
        </div>
      );

    case 'callout': {
      const variants = {
        info: { box: 'bg-blue-50 border-blue-500', icon: <Info className="text-blue-600" size={20} />, label: { fr: 'À retenir', en: 'Key point' } },
        tip: { box: 'bg-emerald-50 border-emerald-500', icon: <Lightbulb className="text-emerald-600" size={20} />, label: { fr: 'Astuce', en: 'Tip' } },
        warning: { box: 'bg-amber-50 border-amber-500', icon: <AlertTriangle className="text-amber-600" size={20} />, label: { fr: 'Attention', en: 'Warning' } },
        important: { box: 'bg-red-50 border-red-500', icon: <AlertTriangle className="text-red-600" size={20} />, label: { fr: 'Important', en: 'Important' } },
      } as const;
      const v = variants[(d.variant as keyof typeof variants) || 'info'] || variants.info;
      return (
        <div className={cn('rounded-xl border-l-4 p-5 shadow-lg flex gap-4', v.box)}>
          <div className="flex-shrink-0 pt-0.5">{v.icon}</div>
          <div className="min-w-0">
            {!block.title && <p className="font-semibold text-slate-800 mb-1">{v.label[lang]}</p>}
            <div className="prose prose-slate prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: d.html || '' }} />
          </div>
        </div>
      );
    }

    case 'accordion':
      return (
        <div className="bg-white rounded-xl shadow-lg divide-y divide-slate-200 overflow-hidden">
          {(d.items || []).map((item, i) => (
            <details key={i} className="group">
              <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none hover:bg-slate-50 select-none">
                <span className="font-medium text-slate-800">{item.title || `${lang === 'fr' ? 'Section' : 'Section'} ${i + 1}`}</span>
                <ChevronDown size={18} className="text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5 prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: item.html || '' }} />
            </details>
          ))}
        </div>
      );

    case 'knowledge_check':
      return <KnowledgeCheck block={block} lang={lang} />;

    default:
      return null;
  }
}

function KnowledgeCheck({ block, lang }: { block: LessonBlock; lang: Language }) {
  const d = block.data || {};
  const options = (d.options || []).filter(o => o.text);
  const correctCount = options.filter(o => o.is_correct).length;
  const multiple = correctCount > 1;
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  if (!d.question || options.length === 0) return null;

  const isRight = checked &&
    selected.length === correctCount &&
    selected.every(i => options[i]?.is_correct);

  const toggle = (i: number) => {
    if (checked) return;
    setSelected(prev => multiple
      ? (prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
      : [i]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-start gap-3 mb-4">
        <HelpCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-semibold text-slate-800">{d.question}</p>
          {multiple && (
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'fr' ? 'Plusieurs réponses possibles' : 'Several answers possible'}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {options.map((opt, i) => {
          const isSel = selected.includes(i);
          const state = checked ? (opt.is_correct ? 'correct' : isSel ? 'wrong' : 'idle') : (isSel ? 'selected' : 'idle');
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              disabled={checked}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-colors flex items-center gap-3',
                state === 'idle' && 'border-slate-200 text-slate-700 hover:border-blue-300',
                state === 'selected' && 'border-blue-500 bg-blue-50 text-blue-900',
                state === 'correct' && 'border-emerald-500 bg-emerald-50 text-emerald-900',
                state === 'wrong' && 'border-red-400 bg-red-50 text-red-900'
              )}
            >
              <span className={cn(
                'w-5 h-5 flex-shrink-0 border-2 flex items-center justify-center',
                multiple ? 'rounded' : 'rounded-full',
                isSel ? 'border-current' : 'border-slate-300'
              )}>
                {isSel && <span className={cn('w-2.5 h-2.5 bg-current', multiple ? 'rounded-sm' : 'rounded-full')} />}
              </span>
              <span className="flex-1">{opt.text}</span>
              {state === 'correct' && <CheckCircle size={18} className="text-emerald-600" />}
              {state === 'wrong' && <XCircle size={18} className="text-red-500" />}
            </button>
          );
        })}
      </div>

      {!checked ? (
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => setChecked(true)}
          className="mt-4 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {lang === 'fr' ? 'Vérifier' : 'Check'}
        </button>
      ) : (
        <div className={cn('mt-4 rounded-lg p-4 text-sm', isRight ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900')}>
          <p className="font-semibold">
            {isRight
              ? (lang === 'fr' ? 'Bonne réponse !' : 'Correct!')
              : (lang === 'fr' ? 'Pas tout à fait. Les bonnes réponses sont indiquées en vert.' : 'Not quite. Correct answers are shown in green.')}
          </p>
          {d.explanation && <p className="mt-1">{d.explanation}</p>}
          <button
            type="button"
            onClick={() => { setChecked(false); setSelected([]); }}
            className="mt-3 text-xs font-semibold underline"
          >
            {lang === 'fr' ? 'Réessayer' : 'Try again'}
          </button>
        </div>
      )}
    </div>
  );
}
