/**
 * Unified Media / Image URL helper for Cinema Booking frontend.
 * Ensures relative paths like 'movie/posters/abc.jpg' or '/movie/posters/abc.jpg'
 * get correctly prepended with NEXT_PUBLIC_IMAGE_URL and '/media/'.
 */

const BASE_IMAGE_URL = (
  process.env.NEXT_PUBLIC_IMAGE_URL || "https://api.devblog.io.vn"
).replace(/\/+$/, "");

/**
 * Normalizes any image or media URL path.
 * - null/empty/undefined -> fallbackUrl
 * - absolute (http:// or https:// or blob:) -> returns as is
 * - /media/... or media/... -> prepends NEXT_PUBLIC_IMAGE_URL
 * - any relative path (e.g. movie/posters/abc.jpg) -> prepends NEXT_PUBLIC_IMAGE_URL + /media/
 */
export function getMediaUrl(
  path?: string | null,
  fallbackUrl: string = "/poster/placeholder.jpg"
): string {
  if (!path || typeof path !== "string" || !path.trim()) {
    return fallbackUrl;
  }

  const trimmed = path.trim();

  // If full URL (http, https, blob, data), return as is
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  // Remove leading slashes to standardize
  const cleanPath = trimmed.replace(/^\/+/, "");

  // If path already starts with media/ (e.g., media/movie/posters/abc.jpg)
  if (cleanPath.startsWith("media/")) {
    return `${BASE_IMAGE_URL}/${cleanPath}`;
  }

  // Otherwise, insert /media/
  return `${BASE_IMAGE_URL}/media/${cleanPath}`;
}

export default getMediaUrl;
