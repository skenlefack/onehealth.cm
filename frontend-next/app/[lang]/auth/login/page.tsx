import { Metadata } from 'next';
import { Language } from '@/lib/types';
import { LoginForm, AuthBackground } from '@/components/auth';

interface LoginPageProps {
  params: Promise<{ lang: Language }>;
  searchParams: Promise<{ redirect?: string }>;
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === 'fr' ? 'Connexion | One Health Cameroun' : 'Login | One Health Cameroon',
    description: lang === 'fr'
      ? 'Connectez-vous à votre compte One Health Cameroun'
      : 'Sign in to your One Health Cameroon account',
  };
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { lang } = await params;
  const { redirect } = await searchParams;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-md">
          <LoginForm lang={lang} redirectTo={redirect} />
        </div>
      </div>

      {/* Right side - Animated Background */}
      <AuthBackground lang={lang} variant="login" />
    </div>
  );
}
