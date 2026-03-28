import { Metadata } from 'next';
import PublicReportForm from '@/components/cohrm/PublicReportForm';

type Props = { params: { lang: 'fr' | 'en' } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = params;
  return {
    title: lang === 'fr'
      ? 'Signaler un événement sanitaire | COHRM - One Health Cameroon'
      : 'Report a health event | COHRM - One Health Cameroon',
    description: lang === 'fr'
      ? 'Formulaire public de signalement d\'événements sanitaires pour le système COHRM du Cameroun.'
      : 'Public health event reporting form for the Cameroon COHRM system.',
  };
}

export default function ReportPage({ params }: Props) {
  return <PublicReportForm lang={params.lang} />;
}
