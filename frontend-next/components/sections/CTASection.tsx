import { Map } from 'lucide-react';
import { Translation } from '@/lib/translations';
import { Button } from '@/components/ui';

interface CTASectionProps {
  t: Translation;
}

export function CTASection({ t }: CTASectionProps) {
  return (
    <section className="py-24 px-[5%] bg-gradient-to-br from-oh-blue to-oh-teal">
      <div className="max-w-3xl mx-auto text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-8">
          <Map size={50} className="text-white" />
        </div>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5">
          {t.cta.title}
        </h2>

        {/* Description */}
        <p className="text-lg text-white/90 leading-relaxed mb-8">
          {t.cta.description}
        </p>

        {/* Button */}
        <Button
          variant="ghost"
          size="lg"
          className="bg-white text-oh-blue hover:bg-white/90"
          leftIcon={<Map size={20} />}
        >
          {t.cta.button}
        </Button>
      </div>
    </section>
  );
}
