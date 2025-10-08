/**
 * Converts relative image URLs to absolute URLs pointing to the backend
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';

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
  return urls.map(getImageUrl);
}
