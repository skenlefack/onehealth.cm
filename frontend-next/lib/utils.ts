import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, lang: 'fr' | 'en' = 'fr'): string {
  const d = new Date(date);
  return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/images/placeholder.jpg';
  if (path.startsWith('http')) return path;
  // Use relative URLs for uploads - they'll be proxied by Next.js rewrites
  // This works in both Docker (via internal network) and local dev
  if (path.startsWith('/uploads/') || path.startsWith('uploads/')) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  // For other paths, assume they're static assets
  return path.startsWith('/') ? path : `/${path}`;
}
