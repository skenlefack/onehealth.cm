import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-oh-background px-4">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-oh-blue mb-4">404</h1>
        <h2 className="text-3xl font-bold text-oh-dark mb-4">Page non trouvée</h2>
        <p className="text-oh-gray mb-8 max-w-md mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link href="/">
          <Button variant="primary" leftIcon={<Home size={20} />}>
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
