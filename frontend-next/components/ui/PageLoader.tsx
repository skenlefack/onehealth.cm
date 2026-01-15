'use client';

import { useEffect, useState } from 'react';

interface PageLoaderProps {
  isLoading: boolean;
}

export function PageLoader({ isLoading }: PageLoaderProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(135deg, #2196F3 0%, #00BCD4 30%, #4CAF50 70%, #FF9800 100%)',
      }}
    >
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-white/10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-white/5 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Loader Container */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Modern Spinner */}
        <div className="relative w-24 h-24">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-white/20"
          />
          {/* Spinning arc */}
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"
            style={{ animationDuration: '1s' }}
          />
          {/* Inner spinning arc (reverse) */}
          <div
            className="absolute inset-2 rounded-full border-4 border-transparent border-b-white/70 animate-spin"
            style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
          />
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-white text-xl font-semibold tracking-wide">
            Chargement...
          </p>
          {/* Animated dots */}
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full"
            style={{
              animation: 'loadingProgress 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes loadingProgress {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 70%;
            margin-left: 15%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </div>
  );
}
