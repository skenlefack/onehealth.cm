'use client';

import { Building2, Heart, TreePine, Leaf, FlaskConical, GraduationCap, MapPin, Palmtree, Wheat, Radio, TrendingUp, Users, Factory, Wallet, Shield, LucideIcon } from 'lucide-react';
import { Translation } from '@/lib/translations';
import { SectionTitle, Card } from '@/components/ui';

// Ministry data structure
interface Ministry {
  icon?: string;
  color?: string;
  name_fr?: string;
  name_en?: string;
  abbreviation?: string;
  description_fr?: string;
  description_en?: string;
}

interface MinistriesContent {
  title?: string;
  subtitle?: string;
  description?: string;
  show_description?: boolean;
  layout?: 'grid' | 'list' | 'carousel';
  columns?: number;
  ministries?: Ministry[];
}

interface MinistriesSectionProps {
  t: Translation;
  content?: MinistriesContent;
  lang?: string;
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  'building': Building2,
  'heart': Heart,
  'tree': TreePine,
  'leaf': Leaf,
  'flask': FlaskConical,
  'graduation': GraduationCap,
  'map': MapPin,
  'palm': Palmtree,
  'wheat': Wheat,
  'radio': Radio,
  'trending': TrendingUp,
  'users': Users,
  'factory': Factory,
  'wallet': Wallet,
  'shield': Shield,
  // Emoji fallbacks
  '🐄': Building2,
  '🏥': Heart,
  '🌲': TreePine,
  '🌿': Leaf,
  '🔬': FlaskConical,
  '🎓': GraduationCap,
  '🗺️': MapPin,
  '🏝️': Palmtree,
  '🌾': Wheat,
  '📡': Radio,
  '📈': TrendingUp,
  '👥': Users,
  '🏭': Factory,
  '💰': Wallet,
  '🛡️': Shield,
};

// Color presets
const colorPresets: Record<string, { bg: string; text: string; border: string; light: string }> = {
  '#007A33': { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', light: 'bg-emerald-50' },
  '#2196F3': { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', light: 'bg-blue-50' },
  '#FF9800': { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', light: 'bg-orange-50' },
  '#4CAF50': { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500', light: 'bg-green-50' },
  '#9C27B0': { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-600', light: 'bg-purple-50' },
  '#E91E63': { bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500', light: 'bg-pink-50' },
  '#00BCD4': { bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500', light: 'bg-cyan-50' },
  '#795548': { bg: 'bg-amber-700', text: 'text-amber-700', border: 'border-amber-700', light: 'bg-amber-50' },
  '#607D8B': { bg: 'bg-slate-500', text: 'text-slate-500', border: 'border-slate-500', light: 'bg-slate-50' },
  '#F44336': { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', light: 'bg-red-50' },
  '#3F51B5': { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-600', light: 'bg-indigo-50' },
  '#009688': { bg: 'bg-teal-500', text: 'text-teal-500', border: 'border-teal-500', light: 'bg-teal-50' },
  '#8BC34A': { bg: 'bg-lime-500', text: 'text-lime-500', border: 'border-lime-500', light: 'bg-lime-50' },
  '#FFC107': { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500', light: 'bg-yellow-50' },
  '#673AB7': { bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-600', light: 'bg-violet-50' },
};

const defaultColors = [
  { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', light: 'bg-emerald-50' },
  { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', light: 'bg-blue-50' },
  { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', light: 'bg-orange-50' },
  { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-600', light: 'bg-purple-50' },
  { bg: 'bg-teal-500', text: 'text-teal-500', border: 'border-teal-500', light: 'bg-teal-50' },
];

// Default ministries data
const defaultMinistries: Ministry[] = [
  { icon: '🐄', color: '#007A33', name_fr: 'Élevage, Pêches et Industries Animales', name_en: 'Livestock, Fisheries and Animal Industries', abbreviation: 'MINEPIA' },
  { icon: '🏥', color: '#2196F3', name_fr: 'Santé Publique', name_en: 'Public Health', abbreviation: 'MINSANTE' },
  { icon: '🌲', color: '#4CAF50', name_fr: 'Forêts et Faune', name_en: 'Forestry and Wildlife', abbreviation: 'MINFOF' },
  { icon: '🌿', color: '#009688', name_fr: 'Environnement, Protection de la Nature et Développement Durable', name_en: 'Environment, Nature Protection and Sustainable Development', abbreviation: 'MINEPDED' },
  { icon: '🔬', color: '#9C27B0', name_fr: 'Recherche Scientifique et Innovation', name_en: 'Scientific Research and Innovation', abbreviation: 'MINRESI' },
  { icon: '🎓', color: '#3F51B5', name_fr: 'Enseignement Supérieur', name_en: 'Higher Education', abbreviation: 'MINESUP' },
  { icon: '🗺️', color: '#795548', name_fr: 'Administration Territoriale', name_en: 'Territorial Administration', abbreviation: 'MINAT' },
  { icon: '🏝️', color: '#00BCD4', name_fr: 'Tourisme et Loisirs', name_en: 'Tourism and Leisure', abbreviation: 'MINTOUL' },
  { icon: '🌾', color: '#8BC34A', name_fr: 'Agriculture et Développement Rural', name_en: 'Agriculture and Rural Development', abbreviation: 'MINADER' },
  { icon: '📡', color: '#E91E63', name_fr: 'Communication', name_en: 'Communication', abbreviation: 'MINCOM' },
  { icon: '📈', color: '#FF9800', name_fr: 'Économie, Planification et Aménagement du Territoire', name_en: 'Economy, Planning and Territorial Development', abbreviation: 'MINEPAT' },
  { icon: '👥', color: '#607D8B', name_fr: 'Décentralisation et Développement Local', name_en: 'Decentralization and Local Development', abbreviation: 'MINDDEVEL' },
  { icon: '🏭', color: '#673AB7', name_fr: 'Mines, Industrie et Développement Technologique', name_en: 'Mines, Industry and Technological Development', abbreviation: 'MINMIDT' },
  { icon: '💰', color: '#FFC107', name_fr: 'Finances', name_en: 'Finance', abbreviation: 'MINFI' },
  { icon: '🛡️', color: '#F44336', name_fr: 'Défense', name_en: 'Defense', abbreviation: 'MINDEF' },
];

export function MinistriesSection({ t, content, lang = 'fr' }: MinistriesSectionProps) {
  const showDescription = content?.show_description !== false;
  const layout = content?.layout || 'grid';
  const columns = content?.columns || 5;

  // Use dynamic ministries from PageBuilder or default
  const ministries = (content?.ministries && content.ministries.length > 0)
    ? content.ministries
    : defaultMinistries;

  // Grid columns class based on setting
  const gridColsClass = columns === 3 ? 'lg:grid-cols-3' :
                        columns === 4 ? 'lg:grid-cols-4' :
                        columns === 5 ? 'lg:grid-cols-5' :
                        columns === 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-5';

  return (
    <section className="py-20 px-[5%] bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
            <Building2 size={16} />
            {lang === 'fr' ? 'Gouvernance' : 'Governance'}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content?.title || (lang === 'fr' ? 'Ministères Sectoriels du Programme' : 'Program Sectoral Ministries')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {content?.subtitle || (lang === 'fr'
              ? 'Les ministères impliqués dans la mise en œuvre de l\'approche One Health au Cameroun'
              : 'Ministries involved in implementing the One Health approach in Cameroon')}
          </p>
        </div>

        {/* Ministries Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-3 ${gridColsClass} gap-4 md:gap-6`}>
          {ministries.map((ministry, index) => {
            const colorStyle = colorPresets[ministry.color || ''] || defaultColors[index % defaultColors.length];
            const iconKey = ministry.icon || '';
            const LucideIcon = iconMap[iconKey] || Building2;
            const isEmoji = iconKey && !iconMap[iconKey];

            const name = lang === 'en'
              ? (ministry.name_en || ministry.name_fr || '')
              : (ministry.name_fr || ministry.name_en || '');

            const description = lang === 'en'
              ? (ministry.description_en || ministry.description_fr || '')
              : (ministry.description_fr || ministry.description_en || '');

            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 overflow-hidden"
              >
                {/* Decorative gradient */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${colorStyle.bg} opacity-80`}
                />

                {/* Icon Container */}
                <div className={`w-14 h-14 rounded-xl ${colorStyle.light} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {isEmoji ? (
                    <span className="text-2xl">{iconKey}</span>
                  ) : (
                    <LucideIcon size={28} className={colorStyle.text} />
                  )}
                </div>

                {/* Abbreviation Badge */}
                {ministry.abbreviation && (
                  <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${colorStyle.light} ${colorStyle.text} mb-2`}>
                    {ministry.abbreviation}
                  </span>
                )}

                {/* Ministry Name */}
                <h3 className="text-sm font-semibold text-gray-800 leading-tight mb-2 line-clamp-2 group-hover:text-gray-900">
                  {name}
                </h3>

                {/* Description (optional) */}
                {showDescription && description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {description}
                  </p>
                )}

                {/* Hover Effect Overlay */}
                <div className={`absolute inset-0 ${colorStyle.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        {content?.description && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">
              {content.description}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
