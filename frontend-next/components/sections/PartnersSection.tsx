import { Translation } from '@/lib/translations';

interface PartnersSectionProps {
  t: Translation;
}

const partners = ['OMS', 'FAO', 'CDC', 'USAID', 'GIZ', 'AFROHUN'];

export function PartnersSection({ t }: PartnersSectionProps) {
  return (
    <section className="py-20 px-[5%] bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm text-oh-gray font-semibold tracking-widest uppercase mb-8">
          {t.partners.title}
        </p>

        <div className="flex flex-wrap justify-center items-center gap-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="px-8 py-4 bg-oh-background rounded-xl text-lg font-bold text-oh-dark-gray
                hover:bg-oh-light-blue hover:text-oh-blue transition-colors cursor-pointer"
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
