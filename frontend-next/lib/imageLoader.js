// Custom image loader for Next.js
// Serves all images directly without Next.js optimization
// This avoids issues with internal Docker networking for uploads
export default function imageLoader({ src, width, quality }) {
  // For absolute URLs, use them directly
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // For all local paths (/uploads, /images, etc.), serve directly
  // Next.js custom loader disables built-in optimization anyway
  return src;
}
