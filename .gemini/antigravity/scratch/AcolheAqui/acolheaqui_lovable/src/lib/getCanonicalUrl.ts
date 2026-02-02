/**
 * Returns the canonical base URL for the application.
 * Always uses the production domain to avoid preview/staging URLs.
 */
export const CANONICAL_DOMAIN = "https://www.acolheaqui.com.br";

/**
 * Generates a canonical URL path.
 * @param path - The path to append (should start with /)
 * @returns The full canonical URL
 */
export const getCanonicalUrl = (path: string = ""): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${CANONICAL_DOMAIN}${cleanPath}`;
};

/**
 * Generates the virtual room URL
 * @param roomCode - The room code
 * @returns The full virtual room URL
 */
export const getVirtualRoomUrl = (roomCode: string): string => {
  return `${CANONICAL_DOMAIN}/sala/${roomCode}`;
};

/**
 * Generates the professional profile URL
 * @param slug - The professional's slug or ID
 * @returns The full profile URL
 */
export const getProfileUrl = (slug: string): string => {
  return `${CANONICAL_DOMAIN}/site/${slug}`;
};

/**
 * Generates the checkout URL
 * @param serviceId - The service ID
 * @param userSlug - Optional user slug for subpath domain
 * @returns The full checkout URL
 */
export const getCheckoutUrl = (serviceId: string, userSlug?: string): string => {
  if (userSlug) {
    return `${CANONICAL_DOMAIN}/${userSlug}/checkout/${serviceId}`;
  }
  return `${CANONICAL_DOMAIN}/checkout/${serviceId}`;
};

/**
 * Generates the reschedule URL
 * @param token - The access token
 * @returns The full reschedule URL
 */
export const getRescheduleUrl = (token: string): string => {
  return `${CANONICAL_DOMAIN}/reagendar?token=${token}`;
};
