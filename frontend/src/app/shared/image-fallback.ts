export const IMAGE_FALLBACK_URL =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 800%22%3E%3Crect width=%22800%22 height=%22800%22 fill=%22%23f3f4f6%22/%3E%3Cg fill=%22%2394a3b8%22 text-anchor=%22middle%22 font-family=%22Arial,sans-serif%22%3E%3Ctext x=%22400%22 y=%22370%22 font-size=%2244%22%3EShopEasy%3C/text%3E%3Ctext x=%22400%22 y=%22430%22 font-size=%2228%22%3ENo image available%3C/text%3E%3C/g%3E%3C/svg%3E';

export function applyImageFallback(event: Event): void {
  const target = event.target as HTMLImageElement | null;

  if (target && target.src !== IMAGE_FALLBACK_URL) {
    target.src = IMAGE_FALLBACK_URL;
  }
}