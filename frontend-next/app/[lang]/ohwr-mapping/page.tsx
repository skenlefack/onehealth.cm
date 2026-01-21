'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin, Users, Building2, FlaskConical, FileText, Search, Filter,
  ChevronDown, ChevronRight, Mail, Phone, Globe, Download, Eye,
  Calendar, Star, X, User, Box, Home, Sparkles, TrendingUp,
  ArrowRight, ExternalLink, Loader2, SlidersHorizontal, Grid3X3, List
} from 'lucide-react';
import { Language } from '@/lib/types';
import {
  getOHWRStats, getOHWRRegions, getOHWRExperts, getOHWROrganizations,
  getOHWRMaterials, getOHWRDocuments, getOHWRMarkers
} from '@/lib/api';
import { OHWRStats, OHWRRegion, OHWRExpert, OHWROrganization, OHWRMaterial, OHWRDocument, OHWRMapMarker } from '@/lib/types';
import { cn, getImageUrl } from '@/lib/utils';

// OHWR Colors
const COLORS = {
  ohwr: '#8B9A2D',
  human: '#27AE60',
  material: '#3498DB',
  organization: '#E67E22',
  document: '#9B59B6'
};

type ResourceType = 'all' | 'expert' | 'organization' | 'material' | 'document';

interface SearchResult {
  id: number;
  type: ResourceType;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  location?: string;
  tags?: string[];
  meta?: Record<string, any>;
}

interface PageProps {
  params: { lang: string };
}

export default function OHWRMappingPage({ params }: PageProps) {
  const lang = (params.lang || 'fr') as Language;
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<ResourceType>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter state
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Data
  const [stats, setStats] = useState<OHWRStats | null>(null);
  const [regions, setRegions] = useState<OHWRRegion[]>([]);

  // Selected item for detail modal
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const ITEMS_PER_PAGE = 12;

  // Trending/Recent searches
  const trendingSearches = lang === 'fr'
    ? ['Épidémiologie', 'Laboratoire', 'Zoonoses', 'FAO', 'OMS', 'Vaccination']
    : ['Epidemiology', 'Laboratory', 'Zoonoses', 'FAO', 'WHO', 'Vaccination'];

  const resourceTypes = [
    { id: 'all', label: lang === 'fr' ? 'Tout' : 'All', icon: Sparkles, color: '#4285F4' },
    { id: 'expert', label: 'Experts', icon: Users, color: COLORS.human },
    { id: 'organization', label: 'Organisations', icon: Building2, color: COLORS.organization },
    { id: 'material', label: lang === 'fr' ? 'Matériels' : 'Materials', icon: FlaskConical, color: COLORS.material },
    { id: 'document', label: 'Documents', icon: FileText, color: COLORS.document },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const [statsRes, regionsRes] = await Promise.all([
      getOHWRStats(),
      getOHWRRegions()
    ]);
    if (statsRes.success) setStats(statsRes.data);
    if (regionsRes.success) setRegions(regionsRes.data);
  };

  const performSearch = useCallback(async (page: number = 1, forceType?: ResourceType) => {
    const activeType = forceType || searchType;

    // Allow search if there's a query, filters, OR if a specific type is selected (not 'all')
    const hasFilters = searchQuery.trim() || selectedRegion || selectedCategory;
    const isTypeSelected = activeType !== 'all';

    if (!hasFilters && !isTypeSelected) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setCurrentPage(page);

    const results: SearchResult[] = [];
    let total = 0;

    try {
      // Search Experts
      if (activeType === 'all' || activeType === 'expert') {
        const expertsRes = await getOHWRExperts({
          search: searchQuery,
          region: selectedRegion,
          category: selectedCategory,
          limit: activeType === 'expert' ? ITEMS_PER_PAGE : 20,
          page: activeType === 'expert' ? page : 1
        });
        if (expertsRes.success && expertsRes.data) {
          if (activeType === 'expert' && expertsRes.pagination) {
            total = expertsRes.pagination.total;
            setTotalPages(expertsRes.pagination.pages);
            setTotalResults(total);
          }
          expertsRes.data.forEach((expert: OHWRExpert) => {
            results.push({
              id: expert.id,
              type: 'expert',
              title: `${expert.first_name} ${expert.last_name}`,
              subtitle: expert.title || expert.category,
              description: expert.biography,
              image: expert.photo,
              location: expert.region ? `${expert.region}${expert.city ? `, ${expert.city}` : ''}` : undefined,
              tags: [expert.category, expert.organization_name].filter(Boolean) as string[],
              meta: expert
            });
          });
        }
      }

      // Search Organizations
      if (activeType === 'all' || activeType === 'organization') {
        const orgsRes = await getOHWROrganizations({
          search: searchQuery,
          region: selectedRegion,
          type: selectedCategory,
          limit: activeType === 'organization' ? ITEMS_PER_PAGE : 20,
          page: activeType === 'organization' ? page : 1
        });
        if (orgsRes.success && orgsRes.data) {
          if (activeType === 'organization' && orgsRes.pagination) {
            total = orgsRes.pagination.total;
            setTotalPages(orgsRes.pagination.pages);
            setTotalResults(total);
          }
          orgsRes.data.forEach((org: OHWROrganization) => {
            results.push({
              id: org.id,
              type: 'organization',
              title: org.name + (org.acronym ? ` (${org.acronym})` : ''),
              subtitle: org.type,
              description: org.description,
              image: org.logo,
              location: org.region ? `${org.region}${org.city ? `, ${org.city}` : ''}` : undefined,
              tags: [org.type, org.website ? 'Website' : null].filter(Boolean) as string[],
              meta: org
            });
          });
        }
      }

      // Search Materials
      if (activeType === 'all' || activeType === 'material') {
        const materialsRes = await getOHWRMaterials({
          search: searchQuery,
          region: selectedRegion,
          type: selectedCategory,
          limit: activeType === 'material' ? ITEMS_PER_PAGE : 20,
          page: activeType === 'material' ? page : 1
        });
        if (materialsRes.success && materialsRes.data) {
          if (activeType === 'material' && materialsRes.pagination) {
            total = materialsRes.pagination.total;
            setTotalPages(materialsRes.pagination.pages);
            setTotalResults(total);
          }
          materialsRes.data.forEach((mat: OHWRMaterial) => {
            results.push({
              id: mat.id,
              type: 'material',
              title: mat.name,
              subtitle: mat.type,
              description: mat.description,
              location: mat.region ? `${mat.region}${mat.city ? `, ${mat.city}` : ''}` : undefined,
              tags: [mat.type, mat.status, mat.organization_name].filter(Boolean) as string[],
              meta: mat
            });
          });
        }
      }

      // Search Documents
      if (activeType === 'all' || activeType === 'document') {
        const docsRes = await getOHWRDocuments({
          search: searchQuery,
          type: selectedCategory,
          language: lang,
          limit: activeType === 'document' ? ITEMS_PER_PAGE : 20,
          page: activeType === 'document' ? page : 1
        });
        if (docsRes.success && docsRes.data) {
          if (activeType === 'document' && docsRes.pagination) {
            total = docsRes.pagination.total;
            setTotalPages(docsRes.pagination.pages);
            setTotalResults(total);
          }
          docsRes.data.forEach((doc: OHWRDocument) => {
            results.push({
              id: doc.id,
              type: 'document',
              title: doc.title,
              subtitle: doc.type,
              description: doc.description,
              image: doc.thumbnail,
              tags: [doc.type, doc.language === 'fr' ? 'Français' : 'English', doc.is_featured ? 'Featured' : null].filter(Boolean) as string[],
              meta: doc
            });
          });
        }
      }

      // For 'all' type, calculate totals differently
      if (activeType === 'all') {
        setTotalResults(results.length);
        setTotalPages(1);
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchType, selectedRegion, selectedCategory, lang]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() || selectedRegion || selectedCategory || searchType !== 'all') {
        performSearch(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchType, selectedRegion, selectedCategory, performSearch]);

  // Handle page change
  const handlePageChange = (page: number) => {
    performSearch(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(1);
  };

  // Handle card click - show all items of that type
  const handleCardClick = (type: ResourceType) => {
    setSearchType(type);
    setCurrentPage(1);
    performSearch(1, type);
  };

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    searchInputRef.current?.focus();
  };

  const handleResultClick = async (result: SearchResult) => {
    setSelectedResult(result);
    setDetailData(result.meta);
  };

  const getTypeColor = (type: ResourceType) => {
    switch (type) {
      case 'expert': return COLORS.human;
      case 'organization': return COLORS.organization;
      case 'material': return COLORS.material;
      case 'document': return COLORS.document;
      default: return COLORS.ohwr;
    }
  };

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'expert': return Users;
      case 'organization': return Building2;
      case 'material': return FlaskConical;
      case 'document': return FileText;
      default: return Sparkles;
    }
  };

  const getTypeLabel = (type: ResourceType) => {
    const labels: Record<ResourceType, string> = {
      all: lang === 'fr' ? 'Tout' : 'All',
      expert: 'Expert',
      organization: 'Organisation',
      material: lang === 'fr' ? 'Matériel' : 'Material',
      document: 'Document'
    };
    return labels[type];
  };

  const resultsByType = searchResults.reduce((acc, result) => {
    acc[result.type] = (acc[result.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Search Section */}
      <div className="relative overflow-hidden bg-white">
        {/* Decorative Google-colored circular lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large outer rings - Google colors (thin & subtle) */}
          <div
            className="absolute -top-[250px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border opacity-[0.12]"
            style={{ borderColor: '#4285F4' }}
          />
          <div
            className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full border opacity-[0.10]"
            style={{ borderColor: '#EA4335' }}
          />
          <div
            className="absolute -top-[150px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border opacity-[0.12]"
            style={{ borderColor: '#FBBC05' }}
          />
          <div
            className="absolute -top-[100px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full border opacity-[0.10]"
            style={{ borderColor: '#34A853' }}
          />

          {/* Animated spinning ring */}
          <div
            className="absolute -top-[50px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full border border-dashed opacity-[0.15] animate-spin-slow"
            style={{ borderColor: '#4285F4', animationDuration: '60s' }}
          />

          {/* Side decorative arcs */}
          <div
            className="absolute top-10 -left-[80px] w-[280px] h-[280px] rounded-full border opacity-[0.08]"
            style={{ borderColor: '#EA4335' }}
          />
          <div
            className="absolute top-32 -right-[80px] w-[240px] h-[240px] rounded-full border opacity-[0.08]"
            style={{ borderColor: '#34A853' }}
          />
          <div
            className="absolute bottom-20 -left-[60px] w-[200px] h-[200px] rounded-full border opacity-[0.06]"
            style={{ borderColor: '#FBBC05' }}
          />

          {/* Colorful gradient orbs (subtle) */}
          <div
            className="absolute top-5 left-[10%] w-40 h-40 rounded-full blur-3xl opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, #4285F4 0%, transparent 70%)' }}
          />
          <div
            className="absolute top-16 right-[8%] w-48 h-48 rounded-full blur-3xl opacity-[0.10]"
            style={{ background: 'radial-gradient(circle, #EA4335 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-5 left-[25%] w-36 h-36 rounded-full blur-3xl opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, #FBBC05 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-10 right-[20%] w-32 h-32 rounded-full blur-3xl opacity-[0.10]"
            style={{ background: 'radial-gradient(circle, #34A853 0%, transparent 70%)' }}
          />

          {/* Floating colored dots (subtle) */}
          <div className="absolute top-[15%] left-[8%] w-2 h-2 rounded-full bg-blue-500/30 animate-pulse" />
          <div className="absolute top-[25%] right-[12%] w-2.5 h-2.5 rounded-full bg-red-500/25 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-[55%] left-[15%] w-2 h-2 rounded-full bg-yellow-500/30 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[35%] right-[20%] w-2.5 h-2.5 rounded-full bg-green-500/25 animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-[65%] right-[8%] w-2 h-2 rounded-full bg-blue-500/25 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[45%] left-[5%] w-1.5 h-1.5 rounded-full bg-red-500/20 animate-pulse" style={{ animationDelay: '2.5s' }} />
        </div>

        <div className={cn(
          "relative max-w-5xl mx-auto px-4 text-center transition-all duration-500",
          hasSearched ? "py-8" : "py-12 md:py-20"
        )}>
          {/* Logo & Title */}
          <div className={cn(
            "transition-all duration-500",
            hasSearched ? "mb-5" : "mb-8"
          )}>
            <div className="flex items-center justify-center gap-4 mb-3">
              <div
                className={cn(
                  "rounded-2xl flex items-center justify-center transition-all shadow-xl",
                  hasSearched ? "w-12 h-12" : "w-16 h-16"
                )}
                style={{
                  background: `linear-gradient(135deg, #4285F4 0%, #34A853 100%)`,
                }}
              >
                <MapPin size={hasSearched ? 24 : 32} className="text-white" />
              </div>
              <h1
                className={cn(
                  "font-black tracking-tight transition-all bg-clip-text text-transparent",
                  hasSearched ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl"
                )}
                style={{
                  backgroundImage: `linear-gradient(135deg, #4285F4 0%, #EA4335 25%, #FBBC05 50%, #34A853 100%)`
                }}
              >
                OHWR-MAPPING
              </h1>
            </div>
            {!hasSearched && (
              <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto">
                {lang === 'fr'
                  ? 'Trouvez les ressources One Health du Cameroun'
                  : 'Find One Health resources in Cameroon'}
              </p>
            )}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-4xl mx-auto">
            <div className={cn(
              "relative bg-white rounded-2xl transition-all border-2",
              hasSearched ? "shadow-lg border-gray-200" : "shadow-2xl shadow-blue-100/50 border-blue-200/60"
            )}>
              {/* Search Input */}
              <div className="flex items-center">
                <div className="pl-6">
                  <Search className="text-blue-500" size={26} />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'fr'
                    ? 'Rechercher experts, organisations, laboratoires, documents...'
                    : 'Search experts, organizations, laboratories, documents...'}
                  className="flex-1 px-5 py-5 text-lg text-gray-800 placeholder-gray-400 bg-transparent outline-none focus:outline-none focus:ring-0 border-none"
                />
                {isSearching && (
                  <Loader2 className="animate-spin text-blue-500 mr-4" size={26} />
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); setHasSearched(false); }}
                    className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={22} className="text-gray-400" />
                  </button>
                )}
                <button
                  type="submit"
                  className="m-2 px-8 py-3.5 rounded-xl font-bold text-white text-base transition-all hover:scale-105 hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)' }}
                >
                  {lang === 'fr' ? 'Rechercher' : 'Search'}
                </button>
              </div>

              {/* Type Filters */}
              <div className="flex items-center gap-2 px-4 pb-4 pt-3 border-t border-blue-100/50 overflow-x-auto">
                {resourceTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSearchType(type.id as ResourceType)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
                      searchType === type.id
                        ? "text-white shadow-lg"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                    )}
                    style={{
                      background: searchType === type.id ? type.color : undefined
                    }}
                  >
                    <type.icon size={18} />
                    {type.label}
                    {hasSearched && resultsByType[type.id] !== undefined && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold",
                        searchType === type.id ? "bg-white/25" : "bg-blue-100"
                      )}>
                        {type.id === 'all' ? searchResults.length : resultsByType[type.id] || 0}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Quick Stats (only when no search) */}
          {!hasSearched && stats && (
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { label: 'Experts', type: 'expert' as ResourceType, count: stats.human_resources?.total || 0, color: COLORS.human, icon: Users },
                { label: 'Organisations', type: 'organization' as ResourceType, count: stats.organizations?.total || 0, color: COLORS.organization, icon: Building2 },
                { label: lang === 'fr' ? 'Matériels' : 'Materials', type: 'material' as ResourceType, count: stats.material_resources?.total || 0, color: COLORS.material, icon: FlaskConical },
                { label: 'Documents', type: 'document' as ResourceType, count: stats.documents?.total || 0, color: COLORS.document, icon: FileText },
              ].map((stat) => (
                <button
                  key={stat.label}
                  onClick={() => handleCardClick(stat.type)}
                  className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50 transition-all group"
                >
                  <div
                    className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ background: `${stat.color}20` }}
                  >
                    <stat.icon size={28} style={{ color: stat.color }} />
                  </div>
                  <p className="text-3xl font-black text-gray-800">{stat.count}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">{stat.label}</p>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches (only when no search) */}
          {!hasSearched && (
            <div className="mt-8">
              <p className="text-gray-500 text-sm mb-3 flex items-center justify-center gap-2">
                <TrendingUp size={18} className="text-blue-500" />
                {lang === 'fr' ? 'Recherches populaires' : 'Popular searches'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleQuickSearch(term)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 text-gray-700 border border-blue-200/50 hover:border-blue-300 rounded-full text-sm font-semibold transition-all hover:shadow-md"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-600">
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    {lang === 'fr' ? 'Recherche en cours...' : 'Searching...'}
                  </span>
                ) : (
                  <>
                    <span className="font-bold text-gray-900">{searchResults.length}</span>
                    {' '}{lang === 'fr' ? 'résultats trouvés' : 'results found'}
                    {searchQuery && (
                      <> {lang === 'fr' ? 'pour' : 'for'} "<span className="font-semibold">{searchQuery}</span>"</>
                    )}
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                  showFilters ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                <SlidersHorizontal size={16} />
                Filtres
              </button>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-md transition-all",
                    viewMode === 'grid' ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  )}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-md transition-all",
                    viewMode === 'list' ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  )}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'fr' ? 'Région' : 'Region'}
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-oh-green/50"
                  >
                    <option value="">{lang === 'fr' ? 'Toutes les régions' : 'All regions'}</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'fr' ? 'Catégorie' : 'Category'}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-oh-green/50"
                  >
                    <option value="">{lang === 'fr' ? 'Toutes les catégories' : 'All categories'}</option>
                    <option value="expert">Expert</option>
                    <option value="researcher">{lang === 'fr' ? 'Chercheur' : 'Researcher'}</option>
                    <option value="laboratory">{lang === 'fr' ? 'Laboratoire' : 'Laboratory'}</option>
                    <option value="government">{lang === 'fr' ? 'Gouvernement' : 'Government'}</option>
                    <option value="ngo">ONG / NGO</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => { setSelectedRegion(''); setSelectedCategory(''); }}
                    className="px-4 py-2.5 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    {lang === 'fr' ? 'Réinitialiser' : 'Reset'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Grid/List */}
          {searchResults.length === 0 && !isSearching ? (
            <div className="text-center py-20">
              <Search size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {lang === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {lang === 'fr'
                  ? 'Essayez de modifier votre recherche ou utilisez des termes différents.'
                  : 'Try modifying your search or use different terms.'}
              </p>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-3"
            )}>
              {searchResults.map((result) => {
                const TypeIcon = getTypeIcon(result.type);
                const typeColor = getTypeColor(result.type);

                return viewMode === 'grid' ? (
                  // Grid Card
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg border border-gray-100 hover:border-gray-200 transition-all cursor-pointer group"
                  >
                    <div className="flex gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center"
                        style={{
                          background: result.image ? `url(${getImageUrl(result.image)}) center/cover` : `${typeColor}15`
                        }}
                      >
                        {!result.image && <TypeIcon size={24} color={typeColor} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-gray-900 truncate group-hover:text-oh-blue transition-colors">
                            {result.title}
                          </h3>
                          <ArrowRight size={16} className="text-gray-400 group-hover:text-oh-blue group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                        <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                        <span
                          className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md text-xs font-semibold"
                          style={{ background: `${typeColor}15`, color: typeColor }}
                        >
                          <TypeIcon size={10} />
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                    </div>
                    {result.description && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{result.description}</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                      {result.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={10} /> {result.location}
                        </span>
                      )}
                      {result.tags?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  // List Item
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200 transition-all cursor-pointer group flex items-center gap-4"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: result.image ? `url(${getImageUrl(result.image)}) center/cover` : `${typeColor}15`
                      }}
                    >
                      {!result.image && <TypeIcon size={20} color={typeColor} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 truncate group-hover:text-oh-blue transition-colors">
                          {result.title}
                        </h3>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold flex-shrink-0"
                          style={{ background: `${typeColor}15`, color: typeColor }}
                        >
                          <TypeIcon size={10} />
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{result.subtitle}</p>
                    </div>
                    {result.location && (
                      <span className="hidden md:inline-flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                        <MapPin size={12} /> {result.location}
                      </span>
                    )}
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-oh-blue group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {searchResults.length > 0 && totalPages > 1 && searchType !== 'all' && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                )}
              >
                {lang === 'fr' ? 'Précédent' : 'Previous'}
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        "w-10 h-10 rounded-lg font-medium transition-all",
                        currentPage === pageNum
                          ? "bg-blue-500 text-white"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                )}
              >
                {lang === 'fr' ? 'Suivant' : 'Next'}
              </button>
            </div>
          )}

          {/* Results info */}
          {searchResults.length > 0 && searchType !== 'all' && (
            <p className="mt-4 text-center text-sm text-gray-500">
              {lang === 'fr'
                ? `Page ${currentPage} sur ${totalPages} (${totalResults} résultats)`
                : `Page ${currentPage} of ${totalPages} (${totalResults} results)`}
            </p>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedResult && detailData && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setSelectedResult(null); setDetailData(null); }}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between"
            >
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                style={{ background: `${getTypeColor(selectedResult.type)}15`, color: getTypeColor(selectedResult.type) }}
              >
                {(() => { const Icon = getTypeIcon(selectedResult.type); return <Icon size={14} />; })()}
                {getTypeLabel(selectedResult.type)}
              </span>
              <button
                onClick={() => { setSelectedResult(null); setDetailData(null); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex gap-5 mb-6">
                <div
                  className="w-24 h-24 rounded-2xl flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: selectedResult.image
                      ? `url(${getImageUrl(selectedResult.image)}) center/cover`
                      : `${getTypeColor(selectedResult.type)}15`
                  }}
                >
                  {!selectedResult.image && (() => {
                    const Icon = getTypeIcon(selectedResult.type);
                    return <Icon size={40} color={getTypeColor(selectedResult.type)} />;
                  })()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedResult.title}</h2>
                  <p className="text-gray-500 text-lg">{selectedResult.subtitle}</p>
                  {selectedResult.location && (
                    <p className="flex items-center gap-2 text-gray-500 mt-2">
                      <MapPin size={14} /> {selectedResult.location}
                    </p>
                  )}
                </div>
              </div>

              {selectedResult.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {lang === 'fr' ? 'Description' : 'Description'}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{selectedResult.description}</p>
                </div>
              )}

              {/* Type-specific details */}
              <div className="space-y-4">
                {detailData.email && (
                  <a href={`mailto:${detailData.email}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Mail size={18} className="text-gray-400" />
                    <span className="text-gray-700">{detailData.email}</span>
                  </a>
                )}
                {detailData.contact_email && (
                  <a href={`mailto:${detailData.contact_email}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Mail size={18} className="text-gray-400" />
                    <span className="text-gray-700">{detailData.contact_email}</span>
                  </a>
                )}
                {(detailData.phone || detailData.contact_phone) && (
                  <a href={`tel:${detailData.phone || detailData.contact_phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Phone size={18} className="text-gray-400" />
                    <span className="text-gray-700">{detailData.phone || detailData.contact_phone}</span>
                  </a>
                )}
                {detailData.website && (
                  <a href={detailData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Globe size={18} className="text-gray-400" />
                    <span className="text-gray-700">{detailData.website}</span>
                    <ExternalLink size={14} className="text-gray-400 ml-auto" />
                  </a>
                )}
                {detailData.organization_name && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Building2 size={18} className="text-gray-400" />
                    <span className="text-gray-700">{detailData.organization_name}</span>
                  </div>
                )}
                {detailData.file_path && (
                  <a href={getImageUrl(detailData.file_path)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-oh-blue/10 text-oh-blue rounded-xl hover:bg-oh-blue/20 transition-colors font-semibold">
                    <Download size={18} />
                    <span>{lang === 'fr' ? 'Télécharger le document' : 'Download document'}</span>
                  </a>
                )}
              </div>

              {/* Tags */}
              {selectedResult.tags && selectedResult.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {selectedResult.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
