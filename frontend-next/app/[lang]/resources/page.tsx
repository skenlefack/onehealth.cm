'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  FileText, Download, Eye, Calendar, Building2, Search,
  ExternalLink, BookOpen, FileCheck, GraduationCap, Newspaper,
  AlertCircle, BarChart3, FolderOpen, Grid3X3, List, X, Loader2,
  ArrowRight, Layers, BookOpenCheck, Mail, ChevronLeft
} from 'lucide-react';
import { Language, OHWRDocument, OHWRStats } from '@/lib/types';
import { getOHWRDocuments, getOHWRDocumentTypes, getOHWRStats } from '@/lib/api';
import { cn, getImageUrl } from '@/lib/utils';

// Document type configuration with icons and colors
const documentTypeConfig: Record<string, { icon: typeof FileText; color: string; bgColor: string; gradient: string }> = {
  guide: { icon: BookOpen, color: '#27AE60', bgColor: 'bg-green-50', gradient: 'from-green-500 to-emerald-600' },
  protocol: { icon: FileCheck, color: '#3498DB', bgColor: 'bg-blue-50', gradient: 'from-blue-500 to-cyan-600' },
  article: { icon: Newspaper, color: '#9B59B6', bgColor: 'bg-purple-50', gradient: 'from-purple-500 to-violet-600' },
  thesis: { icon: GraduationCap, color: '#E67E22', bgColor: 'bg-orange-50', gradient: 'from-orange-500 to-amber-600' },
  awareness: { icon: AlertCircle, color: '#E74C3C', bgColor: 'bg-red-50', gradient: 'from-red-500 to-rose-600' },
  training: { icon: GraduationCap, color: '#1ABC9C', bgColor: 'bg-teal-50', gradient: 'from-teal-500 to-cyan-600' },
  report: { icon: BarChart3, color: '#34495E', bgColor: 'bg-slate-50', gradient: 'from-slate-600 to-slate-700' },
  newsletter: { icon: Mail, color: '#2196F3', bgColor: 'bg-blue-50', gradient: 'from-blue-500 to-indigo-600' },
  magazine: { icon: BookOpenCheck, color: '#E91E63', bgColor: 'bg-pink-50', gradient: 'from-pink-500 to-rose-600' },
  other: { icon: FolderOpen, color: '#95A5A6', bgColor: 'bg-gray-50', gradient: 'from-gray-500 to-slate-600' }
};

const getDocumentTypeConfig = (type: string) => {
  return documentTypeConfig[type?.toLowerCase()] || documentTypeConfig.other;
};

interface PageProps {
  params: { lang: string };
}

interface DocumentType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

export default function ResourcesPage({ params }: PageProps) {
  const lang = (params.lang || 'fr') as Language;

  // State
  const [documents, setDocuments] = useState<OHWRDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [stats, setStats] = useState<OHWRStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocument, setSelectedDocument] = useState<OHWRDocument | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const ITEMS_PER_PAGE = 12;

  // Translations
  const t = {
    fr: {
      title: 'Centre de Ressources',
      subtitle: 'Documents et ressources One Health du Cameroun',
      search: 'Rechercher un document...',
      allTypes: 'Tous les types',
      filters: 'Filtres',
      clearFilters: 'Effacer les filtres',
      documents: 'documents',
      document: 'document',
      noResults: 'Aucun document trouvé',
      noResultsDesc: 'Essayez de modifier vos critères de recherche',
      download: 'Télécharger',
      view: 'Consulter',
      publishedOn: 'Publié le',
      by: 'par',
      loading: 'Chargement des documents...',
      featured: 'En vedette',
      page: 'Page',
      of: 'sur',
      previous: 'Précédent',
      next: 'Suivant',
      browseByType: 'Parcourir par type',
      totalResources: 'Ressources disponibles',
      viewAll: 'Voir tout',
      results: 'résultats',
      close: 'Fermer',
      downloadDocument: 'Télécharger le document',
      previewNotAvailable: 'L\'aperçu n\'est pas disponible pour ce type de fichier.',
      clickToDownload: 'Cliquez sur le bouton ci-dessous pour télécharger.',
      views: 'vues',
      downloads: 'téléchargements'
    },
    en: {
      title: 'Resource Center',
      subtitle: 'One Health documents and resources from Cameroon',
      search: 'Search for a document...',
      allTypes: 'All types',
      filters: 'Filters',
      clearFilters: 'Clear filters',
      documents: 'documents',
      document: 'document',
      noResults: 'No documents found',
      noResultsDesc: 'Try adjusting your search criteria',
      download: 'Download',
      view: 'View',
      publishedOn: 'Published on',
      by: 'by',
      loading: 'Loading documents...',
      featured: 'Featured',
      page: 'Page',
      of: 'of',
      previous: 'Previous',
      next: 'Next',
      browseByType: 'Browse by type',
      totalResources: 'Available resources',
      viewAll: 'View all',
      results: 'results',
      close: 'Close',
      downloadDocument: 'Download document',
      previewNotAvailable: 'Preview is not available for this file type.',
      clickToDownload: 'Click the button below to download.',
      views: 'views',
      downloads: 'downloads'
    }
  };

  const text = t[lang];

  // Fetch document types and stats on mount
  useEffect(() => {
    async function fetchTypesAndStats() {
      setLoadingTypes(true);
      const [typesRes, statsRes] = await Promise.all([
        getOHWRDocumentTypes(),
        getOHWRStats()
      ]);
      if (typesRes.success && typesRes.data) {
        setDocumentTypes(typesRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      setLoadingTypes(false);
    }
    fetchTypesAndStats();
  }, []);

  // Fetch documents when filters change
  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true);
      const res = await getOHWRDocuments({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        type: selectedType !== 'all' ? selectedType : undefined,
        search: searchQuery || undefined,
        language: lang
      });

      if (res.success) {
        setDocuments(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || res.pagination.pages);
          setTotalDocuments(res.pagination.total);
        }
      }
      setLoading(false);
    }
    fetchDocuments();
  }, [currentPage, selectedType, searchQuery, lang]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, searchQuery]);

  // Close modal on Escape key + prevent body scroll
  useEffect(() => {
    if (!selectedDocument) return;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedDocument(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDocument]);

  // Get document count for a type
  const getTypeCount = (typeSlug: string): number => {
    if (!stats?.documents?.by_type) return 0;
    return stats.documents.by_type[typeSlug] || stats.documents.by_type[typeSlug.toLowerCase()] || 0;
  };

  const isPdf = (doc: OHWRDocument) => {
    if (doc.file_type === 'pdf' || doc.file_type === 'application/pdf') return true;
    if (doc.file_path?.toLowerCase().endsWith('.pdf')) return true;
    return false;
  };

  const handleDocumentClick = (doc: OHWRDocument) => {
    setSelectedDocument(doc);
  };

  const handleDownload = (doc: OHWRDocument) => {
    const url = doc.file_path || doc.external_url;
    if (url) {
      window.open(getImageUrl(url), '_blank');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDocumentTitle = (doc: OHWRDocument) => {
    return lang === 'en' && doc.title_en ? doc.title_en : doc.title_fr || doc.title;
  };

  const getDocumentDescription = (doc: OHWRDocument) => {
    return lang === 'en' && doc.description_en ? doc.description_en : doc.description_fr || doc.description;
  };

  const handleTypeClick = (typeSlug: string) => {
    setSelectedType(typeSlug);
    // Scroll to documents section
    document.getElementById('documents-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#8B9A2D] to-[#6B7A1D] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText size={40} />
              <h1 className="text-3xl md:text-5xl font-bold">{text.title}</h1>
            </div>
            <p className="text-lg md:text-xl text-white/90 mb-8">{text.subtitle}</p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder={text.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-slate-800 placeholder-slate-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Total Stats */}
            {stats && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/90">
                <Layers size={18} />
                <span className="font-semibold">{stats.documents?.total || 0}</span>
                <span>{text.totalResources}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Type Cards Section */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {/* All Types Card */}
          <button
            onClick={() => handleTypeClick('all')}
            className={cn(
              'group relative overflow-hidden rounded-xl p-4 md:p-5 text-left transition-all duration-300 hover:scale-105 hover:shadow-xl',
              selectedType === 'all'
                ? 'bg-gradient-to-br from-[#8B9A2D] to-[#6B7A1D] text-white shadow-lg ring-2 ring-[#8B9A2D] ring-offset-2'
                : 'bg-white text-slate-700 shadow-md hover:shadow-lg border border-slate-200'
            )}
          >
            <div className={cn(
              'w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 transition-colors',
              selectedType === 'all' ? 'bg-white/20' : 'bg-[#8B9A2D]/10'
            )}>
              <Layers size={24} className={selectedType === 'all' ? 'text-white' : 'text-[#8B9A2D]'} />
            </div>
            <h3 className="font-semibold text-sm md:text-base mb-1">{text.allTypes}</h3>
            <p className={cn(
              'text-xl md:text-2xl font-bold',
              selectedType === 'all' ? 'text-white' : 'text-[#8B9A2D]'
            )}>
              {stats?.documents?.total || 0}
            </p>
            {selectedType === 'all' && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </button>

          {/* Type Cards */}
          {loadingTypes ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 md:p-5 shadow-md border border-slate-200 animate-pulse">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-200 mb-3" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-6 bg-slate-200 rounded w-1/2" />
              </div>
            ))
          ) : (
            documentTypes.map((type) => {
              const config = getDocumentTypeConfig(type.slug);
              const Icon = config.icon;
              const count = getTypeCount(type.slug);
              const isSelected = selectedType === type.slug;

              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeClick(type.slug)}
                  className={cn(
                    'group relative overflow-hidden rounded-xl p-4 md:p-5 text-left transition-all duration-300 hover:scale-105 hover:shadow-xl',
                    isSelected
                      ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg ring-2 ring-offset-2`
                      : 'bg-white text-slate-700 shadow-md hover:shadow-lg border border-slate-200'
                  )}
                  style={isSelected ? { '--tw-ring-color': config.color } as React.CSSProperties : {}}
                >
                  {/* Background decoration */}
                  <div className={cn(
                    'absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10 transition-transform group-hover:scale-150',
                    isSelected ? 'bg-white' : ''
                  )} style={!isSelected ? { backgroundColor: config.color } : {}} />

                  <div className={cn(
                    'w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 transition-colors',
                    isSelected ? 'bg-white/20' : ''
                  )} style={!isSelected ? { backgroundColor: `${config.color}15` } : {}}>
                    <Icon size={24} style={!isSelected ? { color: config.color } : {}} className={isSelected ? 'text-white' : ''} />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-1">{type.name}</h3>
                  <p className={cn(
                    'text-xl md:text-2xl font-bold',
                    isSelected ? 'text-white' : ''
                  )} style={!isSelected ? { color: config.color } : {}}>
                    {count}
                  </p>
                  <span className={cn(
                    'text-xs',
                    isSelected ? 'text-white/80' : 'text-slate-400'
                  )}>
                    {count === 1 ? text.document : text.documents}
                  </span>

                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content */}
      <div id="documents-section" className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {selectedType !== 'all' && (
              <button
                onClick={() => setSelectedType('all')}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X size={16} />
                {text.clearFilters}
              </button>
            )}
            <h2 className="text-lg font-semibold text-slate-800">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  {text.loading}
                </span>
              ) : (
                <>
                  {totalDocuments} {text.results}
                  {selectedType !== 'all' && (
                    <span className="ml-2 text-slate-500 font-normal">
                      - {documentTypes.find(t => t.slug === selectedType)?.name}
                    </span>
                  )}
                </>
              )}
            </h2>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid' ? 'bg-white shadow-sm text-[#8B9A2D]' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list' ? 'bg-white shadow-sm text-[#8B9A2D]' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-[#8B9A2D] mb-4" />
            <p className="text-slate-500">{text.loading}</p>
          </div>
        )}

        {/* No Results */}
        {!loading && documents.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
            <FileText size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">{text.noResults}</h3>
            <p className="text-slate-500 mb-4">{text.noResultsDesc}</p>
            {(selectedType !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSearchQuery('');
                }}
                className="px-6 py-2 bg-[#8B9A2D] text-white rounded-lg hover:bg-[#7A8928] transition-colors"
              >
                {text.clearFilters}
              </button>
            )}
          </div>
        )}

        {/* Documents Grid/List */}
        {!loading && documents.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {documents.map((doc) => {
                  const config = getDocumentTypeConfig(doc.type || 'other');
                  const Icon = config.icon;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc)}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div className={cn('relative h-40', config.bgColor)}>
                        {doc.thumbnail ? (
                          <Image
                            src={getImageUrl(doc.thumbnail)}
                            alt={getDocumentTitle(doc)}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Icon size={48} style={{ color: config.color }} className="opacity-30" />
                          </div>
                        )}
                        {/* Type Badge */}
                        <div
                          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1"
                          style={{ backgroundColor: config.color }}
                        >
                          <Icon size={12} />
                          {doc.type}
                        </div>
                        {doc.is_featured && (
                          <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                            {text.featured}
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <Eye size={32} className="text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-[#8B9A2D] transition-colors">
                          {getDocumentTitle(doc)}
                        </h3>
                        {getDocumentDescription(doc) && (
                          <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                            {getDocumentDescription(doc)}
                          </p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                          {doc.publication_date && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(doc.publication_date)}
                            </span>
                          )}
                          {doc.organization_name && (
                            <span className="flex items-center gap-1 truncate">
                              <Building2 size={12} />
                              {doc.organization_name}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDocumentClick(doc); }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#8B9A2D] text-white text-sm font-medium rounded-lg hover:bg-[#7A8928] transition-colors"
                          >
                            <Eye size={14} />
                            {text.view}
                          </button>
                          {(doc.file_path || doc.external_url) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                              className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <Download size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {documents.map((doc) => {
                  const config = getDocumentTypeConfig(doc.type || 'other');
                  const Icon = config.icon;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc)}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-lg transition-all flex gap-4 cursor-pointer"
                    >
                      {/* Icon/Thumbnail */}
                      <div
                        className={cn(
                          'w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0',
                          config.bgColor
                        )}
                      >
                        {doc.thumbnail ? (
                          <Image
                            src={getImageUrl(doc.thumbnail)}
                            alt={getDocumentTitle(doc)}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Icon size={28} style={{ color: config.color }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                                style={{ backgroundColor: config.color }}
                              >
                                {doc.type}
                              </span>
                              {doc.is_featured && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                                  {text.featured}
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-slate-800 mb-1 hover:text-[#8B9A2D] transition-colors">
                              {getDocumentTitle(doc)}
                            </h3>
                            {getDocumentDescription(doc) && (
                              <p className="text-sm text-slate-500 line-clamp-1">
                                {getDocumentDescription(doc)}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDocumentClick(doc); }}
                              className="flex items-center gap-2 px-4 py-2 bg-[#8B9A2D] text-white text-sm font-medium rounded-lg hover:bg-[#7A8928] transition-colors"
                            >
                              <Eye size={14} />
                              {text.view}
                            </button>
                            {(doc.file_path || doc.external_url) && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                                className="flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <Download size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          {doc.publication_date && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(doc.publication_date)}
                            </span>
                          )}
                          {doc.organization_name && (
                            <span className="flex items-center gap-1">
                              <Building2 size={12} />
                              {doc.organization_name}
                            </span>
                          )}
                          {doc.view_count !== undefined && doc.view_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye size={12} />
                              {doc.view_count}
                            </span>
                          )}
                          {doc.download_count !== undefined && doc.download_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Download size={12} />
                              {doc.download_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {text.previous}
                </button>
                <span className="text-sm text-slate-500">
                  {text.page} {currentPage} {text.of} {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {text.next}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (() => {
        const doc = selectedDocument;
        const config = getDocumentTypeConfig(doc.type || 'other');
        const Icon = config.icon;
        const fileUrl = doc.file_path || doc.external_url;
        const isDocPdf = isPdf(doc);

        return (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col"
            onClick={() => setSelectedDocument(null)}
          >
            {/* Modal content - prevent close on click inside */}
            <div
              className="flex flex-col h-full w-full max-w-6xl mx-auto my-4 md:my-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 md:px-6 py-3 bg-white rounded-t-2xl border-b border-slate-200 flex-shrink-0">
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                >
                  <ChevronLeft size={20} />
                </button>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  <Icon size={16} style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-800 truncate text-sm md:text-base">
                    {getDocumentTitle(doc)}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: config.color }}
                    >
                      {doc.type}
                    </span>
                    {doc.publication_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(doc.publication_date)}
                      </span>
                    )}
                    {doc.view_count !== undefined && doc.view_count > 0 && (
                      <span className="hidden sm:flex items-center gap-1">
                        <Eye size={10} />
                        {doc.view_count} {text.views}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Document viewer */}
              <div className="flex-1 bg-slate-100 overflow-hidden min-h-0">
                {isDocPdf && fileUrl ? (
                  <iframe
                    src={getImageUrl(fileUrl)}
                    className="w-full h-full border-0"
                    title={getDocumentTitle(doc)}
                  />
                ) : fileUrl && doc.external_url ? (
                  <iframe
                    src={doc.external_url}
                    className="w-full h-full border-0"
                    title={getDocumentTitle(doc)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Icon size={80} style={{ color: config.color }} className="opacity-20 mb-6" />
                    {doc.thumbnail && (
                      <div className="relative w-64 h-80 mb-6 rounded-xl overflow-hidden shadow-lg">
                        <Image
                          src={getImageUrl(doc.thumbnail)}
                          alt={getDocumentTitle(doc)}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <p className="text-lg font-medium text-slate-600 mb-2">{text.previewNotAvailable}</p>
                    <p className="text-sm text-slate-400">{text.clickToDownload}</p>
                  </div>
                )}
              </div>

              {/* Footer with description & download */}
              <div className="px-4 md:px-6 py-4 bg-white rounded-b-2xl border-t border-slate-200 flex-shrink-0">
                {getDocumentDescription(doc) && (
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{getDocumentDescription(doc)}</p>
                )}
                <div className="flex items-center gap-3">
                  {fileUrl && (
                    <button
                      onClick={() => handleDownload(doc)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#8B9A2D] text-white font-medium rounded-xl hover:bg-[#7A8928] transition-colors shadow-sm"
                    >
                      <Download size={18} />
                      {text.downloadDocument}
                    </button>
                  )}
                  {doc.external_url && (
                    <a
                      href={doc.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  {doc.organization_name && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 ml-auto">
                      <Building2 size={12} />
                      {doc.organization_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
