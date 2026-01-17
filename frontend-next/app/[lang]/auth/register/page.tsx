import { Metadata } from 'next';
import { Language } from '@/lib/types';
import { RegisterForm, AuthBackground } from '@/components/auth';

interface RegisterPageProps {
  params: Promise<{ lang: Language }>;
}

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === 'fr' ? 'Inscription | One Health Cameroun' : 'Sign Up | One Health Cameroon',
    description: lang === 'fr'
      ? 'Créez votre compte One Health Cameroun'
      : 'Create your One Health Cameroon account',
  };
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white py-12">
        <div className="mx-auto w-full max-w-md">
          <RegisterForm lang={lang} />
        </div>
      </div>

      {/* Right side - Animated Background */}
      <AuthBackground lang={lang} variant="register" />
    </div>
  );
}
