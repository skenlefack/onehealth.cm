import { Heart, Activity, Leaf, CheckCircle, LucideIcon } from 'lucide-react';
import { Translation } from '@/lib/translations';
import { SectionTitle, Card } from '@/components/ui';

interface PillarsContent {
  title?: string;
  subtitle?: string;
  show_features?: boolean;
  human_title?: string;
  human_description?: string;
  human_features?: string[];
  animal_title?: string;
  animal_description?: string;
  animal_features?: string[];
  environment_title?: string;
  environment_description?: string;
  environment_features?: string[];
}

interface PillarsSectionProps {
  t: Translation;
  content?: PillarsContent;
}

interface PillarData {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export function PillarsSection({ t, content }: PillarsSectionProps) {
  const showFeatures = content?.show_features !== false; // Default to true

  const pillars: PillarData[] = [
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
  ];

  return (
    <section className="py-24 px-[5%] bg-oh-background">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          badge={t.pillars.badge}
          title={content?.title || t.pillars.title}
          subtitle={content?.subtitle || t.pillars.subtitle}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <Card key={index} className="text-center p-8">
              {/* Icon */}
              <div
                className={`w-24 h-24 rounded-full ${pillar.bgColor} border-4 ${pillar.borderColor}
                  flex items-center justify-center mx-auto mb-6 shadow-lg`}
                style={{ boxShadow: `0 10px 30px ${pillar.color.replace('text-', '')}30` }}
              >
                <pillar.icon size={45} className={pillar.color} />
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
