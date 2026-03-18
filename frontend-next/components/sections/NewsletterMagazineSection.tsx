'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Mail, BookOpenCheck, Download, Eye, ArrowRight } from 'lucide-react';
import { Language, OHWRDocument } from '@/lib/types';
import { getOHWRDocuments } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

interface NewsletterMagazineSectionProps {
  lang: Language;
}

export function NewsletterMagazineSection({ lang }: NewsletterMagazineSectionProps) {
  const [documents, setDocuments] = useState<OHWRDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<OHWRDocument | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const t = {
    fr: {
      title: 'Newsletters & Magazines',
      subtitle: 'Nos dernières publications',
      viewAll: 'Voir tout',
      download: 'Télécharger',
      view: 'Consulter',
      newsletter: 'Newsletter',
      magazine: 'Magazine',
      noDocuments: 'Aucune publication disponible',
      close: 'Fermer',
      downloadDocument: 'Télécharger le document',
    },
    en: {
      title: 'Newsletters & Magazines',
      subtitle: 'Our latest publications',
      viewAll: 'View all',
      download: 'Download',
      view: 'View',
      newsletter: 'Newsletter',
      magazine: 'Magazine',
      noDocuments: 'No publications available',
      close: 'Close',
      downloadDocument: 'Download document',
    },
  };

  const text = t[lang];

  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true);
      const [newslettersRes, magazinesRes] = await Promise.all([
        getOHWRDocuments({ type: 'newsletter', limit: 20 }),
        getOHWRDocuments({ type: 'magazine', limit: 20 }),
      ]);

      const all: OHWRDocument[] = [];
      if (newslettersRes.success && newslettersRes.data) all.push(...newslettersRes.data);
      if (magazinesRes.success && magazinesRes.data) all.push(...magazinesRes.data);

      // Sort by publication_date descending
      all.sort((a, b) => {
        const da = a.publication_date ? new Date(a.publication_date).getTime() : 0;
        const db = b.publication_date ? new Date(b.publication_date).getTime() : 0;
        return db - da;
      });

      setDocuments(all);
      setLoading(false);
    }
    fetchDocuments();
  }, []);

  // Check scroll boundaries
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    setScrollPosition(el.scrollLeft);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [documents, updateScrollState]);

  // Auto-scroll
  useEffect(() => {
    if (documents.length === 0 || isPaused) return;

    autoScrollRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 220, behavior: 'smooth' });
      }
    }, 4000);

    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [documents, isPaused]);

  // Close modal on Escape
  useEffect(() => {
    if (!selectedDoc) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedDoc(null); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [selectedDoc]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -280 : 280;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const getTitle = (doc: OHWRDocument) =>
    lang === 'en' && doc.title_en ? doc.title_en : doc.title_fr || doc.title;

  const isNewsletter = (doc: OHWRDocument) => doc.type?.toLowerCase() === 'newsletter';

  const isPdf = (doc: OHWRDocument) =>
    doc.file_type === 'pdf' || doc.file_type === 'application/pdf' || doc.file_path?.toLowerCase().endsWith('.pdf');

  if (loading) {
    return (
      <section className="py-12 px-[5%] bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
            <div>
              <div className="h-6 w-56 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[180px]">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-[300px]">
                  <div className="h-[220px] bg-slate-200 animate-pulse" />
                  <div className="p-3">
                    <div className="h-3 bg-slate-200 rounded animate-pulse mb-2 w-3/4" />
                    <div className="h-2.5 bg-slate-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (documents.length === 0) return null;

  return (
    <>
      <section className="py-8 px-[5%] bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Mail size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">{text.title}</h2>
                <p className="text-slate-500 text-xs mt-0.5">{text.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Nav arrows */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              {/* View all */}
              <Link
                href={`/${lang}/resources`}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#8B9A2D] hover:text-[#6B7A1D] hover:bg-[#8B9A2D]/5 rounded-lg transition-colors"
              >
                {text.viewAll}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Carousel */}
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {documents.map((doc) => {
              const nl = isNewsletter(doc);
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="flex-shrink-0 w-[180px] md:w-[200px] group cursor-pointer snap-start"
                >
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 h-[300px] flex flex-col">
                    {/* Cover */}
                    <div className="relative h-[220px] flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                      {doc.thumbnail ? (
                        <Image
                          src={getImageUrl(doc.thumbnail)}
                          alt={getTitle(doc)}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {nl ? (
                            <Mail size={40} className="text-blue-300" />
                          ) : (
                            <BookOpenCheck size={40} className="text-pink-300" />
                          )}
                        </div>
                      )}

                      {/* Type badge */}
                      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white backdrop-blur-sm ${
                        nl ? 'bg-blue-500/90' : 'bg-pink-500/90'
                      }`}>
                        {nl ? text.newsletter : text.magazine}
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <span className="text-white text-xs font-medium flex items-center gap-1.5">
                          <Eye size={14} />
                          {text.view}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h3 className="font-semibold text-slate-800 text-xs line-clamp-2 group-hover:text-[#8B9A2D] transition-colors leading-snug">
                        {getTitle(doc)}
                      </h3>
                      {doc.publication_date && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(doc.publication_date).toLocaleDateString(
                            lang === 'fr' ? 'fr-FR' : 'en-US',
                            { year: 'numeric', month: 'short' }
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-6 flex justify-center">
            <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{
                  width: scrollRef.current
                    ? `${Math.max(10, (scrollPosition / (scrollRef.current.scrollWidth - scrollRef.current.clientWidth || 1)) * 100)}%`
                    : '10%',
                }}
              />
            </div>
          </div>

          {/* Mobile view all */}
          <div className="mt-6 flex md:hidden justify-center">
            <Link
              href={`/${lang}/resources`}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#8B9A2D] rounded-xl hover:bg-[#7A8928] transition-colors"
            >
              {text.viewAll}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Document Viewer Modal */}
      {selectedDoc && (() => {
        const doc = selectedDoc;
        const fileUrl = doc.file_path || doc.external_url;
        const isDocPdf = isPdf(doc);
        const nl = isNewsletter(doc);

        return (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col"
            onClick={() => setSelectedDoc(null)}
          >
            <div
              className="flex flex-col h-full w-full max-w-6xl mx-auto my-4 md:my-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 md:px-6 py-3 bg-white rounded-t-2xl border-b border-slate-200 flex-shrink-0">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${nl ? 'bg-blue-50' : 'bg-pink-50'}`}>
                  {nl ? <Mail size={16} className="text-blue-500" /> : <BookOpenCheck size={16} className="text-pink-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-800 truncate text-sm md:text-base">{getTitle(doc)}</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${nl ? 'bg-blue-500' : 'bg-pink-500'}`}>
                      {nl ? text.newsletter : text.magazine}
                    </span>
                    {doc.publication_date && (
                      <span>{new Date(doc.publication_date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long' })}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                >
                  <span className="sr-only">{text.close}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>

              {/* Viewer */}
              <div className="flex-1 bg-slate-100 overflow-hidden min-h-0">
                {isDocPdf && fileUrl ? (
                  <iframe
                    src={getImageUrl(fileUrl)}
                    className="w-full h-full border-0"
                    title={getTitle(doc)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    {doc.thumbnail ? (
                      <div className="relative w-64 h-80 rounded-xl overflow-hidden shadow-lg">
                        <Image src={getImageUrl(doc.thumbnail)} alt={getTitle(doc)} fill className="object-cover" />
                      </div>
                    ) : (
                      nl ? <Mail size={80} className="text-blue-200 mb-6" /> : <BookOpenCheck size={80} className="text-pink-200 mb-6" />
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 md:px-6 py-4 bg-white rounded-b-2xl border-t border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {fileUrl && (
                    <a
                      href={getImageUrl(fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#8B9A2D] text-white font-medium rounded-xl hover:bg-[#7A8928] transition-colors shadow-sm"
                    >
                      <Download size={18} />
                      {text.downloadDocument}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
