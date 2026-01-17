import { Heart, Activity, Leaf, Sprout, CheckCircle, LucideIcon } from 'lucide-react';
import { Translation } from '@/lib/translations';
import { SectionTitle, Card } from '@/components/ui';

// Dynamic pillar from Page Builder
interface DynamicPillar {
  icon?: string;
  color?: string;
  title_fr?: string;
  title_en?: string;
  description_fr?: string;
  description_en?: string;
  features?: Array<{ text_fr?: string; text_en?: string }>;
}

interface PillarsContent {
  title?: string;
  subtitle?: string;
  show_features?: boolean;
  pillars?: DynamicPillar[]; // Dynamic pillars array from Page Builder
  // Legacy fields for backward compatibility
  human_title?: string;
  human_description?: string;
  human_features?: string[];
  animal_title?: string;
  animal_description?: string;
  animal_features?: string[];
  environment_title?: string;
  environment_description?: string;
  environment_features?: string[];
  plant_title?: string;
  plant_description?: string;
  plant_features?: string[];
}

interface PillarsSectionProps {
  t: Translation;
  content?: PillarsContent;
  lang?: string;
}

interface PillarData {
  icon: LucideIcon | null;
  iconEmoji?: string;
  title: string;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

// Map icon names/emojis to Lucide icons
const iconMap: Record<string, LucideIcon> = {
  '❤️': Heart,
  '🐾': Activity,
  '🌿': Leaf,
  '🌱': Sprout,
  'heart': Heart,
  'activity': Activity,
  'leaf': Leaf,
  'sprout': Sprout,
};

// Color presets for dynamic pillars
const colorPresets: Record<string, { color: string; bgColor: string; borderColor: string }> = {
  '#2196F3': { color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-500' },
  '#FF9800': { color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-500' },
  '#4CAF50': { color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-600' },
  '#10B981': { color: 'text-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-500' },
  '#007A33': { color: 'text-oh-green', bgColor: 'bg-oh-light-green', borderColor: 'border-oh-green' },
};

const defaultColors = [
  { color: 'text-oh-blue', bgColor: 'bg-oh-light-blue', borderColor: 'border-oh-blue' },
  { color: 'text-oh-orange', bgColor: 'bg-oh-light-orange', borderColor: 'border-oh-orange' },
  { color: 'text-oh-green', bgColor: 'bg-oh-light-green', borderColor: 'border-oh-green' },
  { color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-500' },
];

export function PillarsSection({ t, content, lang = 'fr' }: PillarsSectionProps) {
  const showFeatures = content?.show_features !== false;


  // Check if we have dynamic pillars from Page Builder
  const hasDynamicPillars = content?.pillars && Array.isArray(content.pillars) && content.pillars.length > 0;

  let pillars: PillarData[];

  if (hasDynamicPillars) {
    // Use dynamic pillars from Page Builder (supports reordering)
    pillars = content!.pillars!.map((p, index) => {
      const colorStyle = colorPresets[p.color || ''] || defaultColors[index % defaultColors.length];
      const iconKey = p.icon || '';
      const lucideIcon = iconKey in iconMap ? iconMap[iconKey] : null;

      // Get features as string array
      const features = (p.features || []).map(f => {
        if (lang === 'en') return f.text_en || f.text_fr || '';
        return f.text_fr || f.text_en || '';
      }).filter(Boolean);

      // Get title and description based on language
      const title = lang === 'en' ? (p.title_en || p.title_fr || '') : (p.title_fr || p.title_en || '');
      const description = lang === 'en' ? (p.description_en || p.description_fr || '') : (p.description_fr || p.description_en || '');

      return {
        icon: lucideIcon,
        iconEmoji: lucideIcon ? undefined : iconKey,
        title,
        description,
        features,
        ...colorStyle,
      };
    });
  } else {
    // Legacy mode: use hardcoded fields
    pillars = [
      {
        icon: Heart,
        title: content?.human_title || t.pillars.human.title,
        description: content?.human_description || t.pillars.human.description,
        features: content?.human_features || t.pillars.human.features,
        color: 'text-oh-blue',
        bgColor: 'bg-oh-light-blue',
        borderColor: 'border-oh-blue',
      },
      {
        icon: Activity,
        title: content?.animal_title || t.pillars.animal.title,
        description: content?.animal_description || t.pillars.animal.description,
        features: content?.animal_features || t.pillars.animal.features,
        color: 'text-oh-orange',
        bgColor: 'bg-oh-light-orange',
        borderColor: 'border-oh-orange',
      },
      {
        icon: Leaf,
        title: content?.environment_title || t.pillars.environment.title,
        description: content?.environment_description || t.pillars.environment.description,
        features: content?.environment_features || t.pillars.environment.features,
        color: 'text-oh-green',
        bgColor: 'bg-oh-light-green',
        borderColor: 'border-oh-green',
      },
      {
        icon: Sprout,
        title: content?.plant_title || t.pillars.plant.title,
        description: content?.plant_description || t.pillars.plant.description,
        features: content?.plant_features || t.pillars.plant.features,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-500',
      },
    ];
  }

  // Dynamically set grid columns based on number of pillars
  const gridCols = pillars.length <= 2 ? 'lg:grid-cols-2' :
                   pillars.length === 3 ? 'lg:grid-cols-3' :
                   'lg:grid-cols-4';

  return (
    <section className="py-24 px-[5%] bg-oh-background">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          badge={t.pillars.badge}
          title={content?.title || t.pillars.title}
          subtitle={content?.subtitle || t.pillars.subtitle}
        />

        <div className={`grid md:grid-cols-2 ${gridCols} gap-6`}>
          {pillars.map((pillar, index) => (
            <Card key={index} className="text-center p-8">
              {/* Icon */}
              <div
                className={`w-24 h-24 rounded-full ${pillar.bgColor} border-4 ${pillar.borderColor}
                  flex items-center justify-center mx-auto mb-6 shadow-lg`}
              >
                {pillar.icon ? (
                  <pillar.icon size={45} className={pillar.color} />
                ) : (
                  <span className="text-5xl">{pillar.iconEmoji}</span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-oh-dark mb-4">{pillar.title}</h3>

              {/* Description */}
              <p className="text-oh-gray leading-relaxed mb-6">{pillar.description}</p>

              {/* Features */}
              {showFeatures && pillar.features && pillar.features.length > 0 && (
                <div className="flex flex-col gap-3">
                  {pillar.features.map((feature, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 px-4 py-3 ${pillar.bgColor} rounded-xl text-sm font-medium text-oh-dark-gray`}
                    >
                      <CheckCircle size={18} className={pillar.color} />
                      {feature}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
