/**
 * External URLs - opens in new tab without affecting kiosk flow
 */
export const TIENDA_CAMSA_URL = 'https://tienda-camsa-production.up.railway.app/';
export const RESTAURANTES_CAMSA_URL = 'https://tienda-camsa-production.up.railway.app/restaurantes';

/**
 * YouTube video IDs used by kiosk commercial landing.
 * Priority: env variable, then fallback IDs below.
 *
 * Configure env as:
 * VITE_KIOSK_LANDING_YOUTUBE_IDS=id1,id2,id3
 */
const envVideoIds = (import.meta.env.VITE_KIOSK_LANDING_YOUTUBE_IDS || '')
  .split(',')
  .map((id: string) => id.trim())
  .filter(Boolean);

const fallbackVideoIds = [
  'FKRxvkO7BO4',
  'puNTSPXyrrQ',
];

export const KIOSK_LANDING_VIDEO_IDS = envVideoIds.length > 0 ? envVideoIds : fallbackVideoIds;

/** Base URL for media files (category icons, etc.) - same origin as API */
const MEDIA_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const CATEGORY_ICONS_PATH = '/media/category-icons';

/**
 * Product showcase images for the landing page orbit circles.
 * Images are loaded from project media/category-icons folder (served by backend).
 * Each entry has a label and filename; all link to the store when clicked.
 */
export const KIOSK_PRODUCT_IMAGES: { label: string; filename: string }[] = [
  { label: 'Acuaminerales', filename: 'ACUAMINERALES.png' },
  { label: 'Nanopartículas', filename: 'MANOPARTICULASDECOBREIONICO.png' },
  { label: 'Nano exom', filename: 'Nano-exom.png' },
  { label: 'Nasagest', filename: 'NASAGEST.png' },
  { label: 'Sales', filename: 'SALES.png' },
  { label: 'Shot 5', filename: 'Shot5-2.png' },
];

export const getProductImageUrl = (filename: string): string =>
  MEDIA_BASE ? `${MEDIA_BASE}${CATEGORY_ICONS_PATH}/${filename}` : `${CATEGORY_ICONS_PATH}/${filename}`;

export const getYoutubeEmbedUrl = (videoId: string): string => {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    rel: '0',
    modestbranding: '1',
    loop: '1',
    playlist: videoId,
    playsinline: '1',
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};
