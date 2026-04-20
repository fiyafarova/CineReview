export const IMAGE_FALLBACK_URL =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 800%22%3E%3Crect width=%22800%22 height=%22800%22 fill=%22%23f3f4f6%22/%3E%3Cg fill=%22%2394a3b8%22 text-anchor=%22middle%22 font-family=%22Arial,sans-serif%22%3E%3Ctext x=%22400%22 y=%22370%22 font-size=%2244%22%3EShopEasy%3C/text%3E%3Ctext x=%22400%22 y=%22430%22 font-size=%2228%22%3ENo image available%3C/text%3E%3C/g%3E%3C/svg%3E';

const CATEGORY_STYLES: Record<string, { start: string; end: string; accent: string }> = {
  smartphones: { start: '#1d4ed8', end: '#38bdf8', accent: '#dbeafe' },
  laptops: { start: '#4f46e5', end: '#22d3ee', accent: '#e0e7ff' },
  'tv-audio': { start: '#7c3aed', end: '#ec4899', accent: '#f5d0fe' },
  'home-appliances': { start: '#0f766e', end: '#34d399', accent: '#ccfbf1' },
  tablets: { start: '#2563eb', end: '#2dd4bf', accent: '#dbeafe' },
  clothing: { start: '#be123c', end: '#fb7185', accent: '#ffe4e6' },
  books: { start: '#92400e', end: '#f59e0b', accent: '#fef3c7' },
  'sports-outdoors': { start: '#166534', end: '#84cc16', accent: '#dcfce7' },
  default: { start: '#334155', end: '#64748b', accent: '#e2e8f0' },
};

function getCategoryKey(categoryName: string | null | undefined): string {
  return (categoryName ?? '')
    .trim()
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/\s+/g, '-') || 'default';
}

function shortenText(value: string | null | undefined, maxLength: number): string {
  const normalized = (value ?? '').trim();

  if (!normalized) {
    return 'ShopEasy';
  }

  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
}

export function createProductPlaceholder(
  productName: string | null | undefined,
  categoryName?: string | null,
  secondaryText?: string | null
): string {
  const categoryKey = getCategoryKey(categoryName);
  const palette = CATEGORY_STYLES[categoryKey] ?? CATEGORY_STYLES['default'];
  const title = shortenText(productName, 28);
  const category = shortenText(categoryName || 'Product', 24).toUpperCase();
  const subtitle = shortenText(secondaryText || 'Image coming soon', 30);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${palette.start}" />
          <stop offset="100%" stop-color="${palette.end}" />
        </linearGradient>
      </defs>
      <rect width="800" height="800" rx="48" fill="url(#bg)" />
      <circle cx="640" cy="160" r="96" fill="rgba(255,255,255,0.12)" />
      <circle cx="150" cy="680" r="120" fill="rgba(255,255,255,0.08)" />
      <rect x="72" y="86" width="220" height="52" rx="26" fill="rgba(15,23,42,0.16)" />
      <text x="182" y="119" fill="${palette.accent}" font-size="24" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="700">${category}</text>
      <text x="72" y="390" fill="#ffffff" font-size="58" font-family="Segoe UI, Arial, sans-serif" font-weight="700">${title}</text>
      <text x="72" y="456" fill="rgba(255,255,255,0.92)" font-size="32" font-family="Segoe UI, Arial, sans-serif">${subtitle}</text>
      <text x="72" y="706" fill="rgba(255,255,255,0.82)" font-size="30" font-family="Segoe UI, Arial, sans-serif" font-weight="600">ShopEasy</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function resolveImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl || !imageUrl.trim()) {
    return IMAGE_FALLBACK_URL;
  }

  return imageUrl;
}

export function applyImageFallback(event: Event): void {
  const target = event.target as HTMLImageElement | null;

  if (!target) {
    return;
  }

  const customFallback = target.dataset['fallbackSrc'];
  const fallback = customFallback && customFallback.trim() ? customFallback : IMAGE_FALLBACK_URL;

  if (target.src !== fallback) {
    target.src = fallback;
  }
}