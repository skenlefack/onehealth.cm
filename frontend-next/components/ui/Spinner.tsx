import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-3',
  lg: 'w-14 h-14 border-4',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className="flex justify-center items-center p-8">
      <div
        className={cn(
          'rounded-full border-oh-light-blue border-t-oh-blue animate-spin',
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-oh-background">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-oh-gray font-medium">Chargement...</p>
      </div>
    </div>
  );
}
