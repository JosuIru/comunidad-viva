/**
 * Validates if an image source is valid
 * @param src - The image source to validate
 * @returns true if the image source is valid, false otherwise
 */
export function isValidImageSrc(src: string | null | undefined): boolean {
  if (!src) return false;
  if (src === 'null' || src === 'undefined') return false;
  if (src.trim() === '') return false;
  return true;
}

/**
 * Gets a valid image source or returns a fallback
 * @param src - The image source to validate
 * @param fallback - Optional fallback image URL
 * @returns The valid image source or fallback, or null if neither is valid
 */
export function getValidImageSrc(
  src: string | null | undefined,
  fallback?: string
): string | null {
  if (isValidImageSrc(src)) return src!;
  if (fallback && isValidImageSrc(fallback)) return fallback;
  return null;
}

/**
 * Error handler for broken images
 * @param e - The error event
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.target as HTMLImageElement;
  img.style.display = 'none';
}

/**
 * Converts relative image URLs to absolute URLs pointing to the backend
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';

  // Validate the image source first
  if (!isValidImageSrc(url)) return '';

  // If it's already an absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a relative URL starting with /uploads, prepend backend URL
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  if (url.startsWith('/uploads/')) {
    return `${backendUrl}${url}`;
  }

  // If it doesn't start with /, add it
  if (!url.startsWith('/')) {
    return `${backendUrl}/uploads/${url}`;
  }

  return `${backendUrl}${url}`;
}

/**
 * Converts an array of image URLs
 */
export function getImageUrls(urls: string[] | undefined | null): string[] {
  if (!urls || !Array.isArray(urls)) return [];
  return urls.filter(isValidImageSrc).map(getImageUrl);
}
