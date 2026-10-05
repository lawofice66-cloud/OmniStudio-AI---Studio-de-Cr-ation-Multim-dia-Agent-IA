/**
 * Safe API Client & Standalone Engine Fallback
 * Prevents "Unexpected end of JSON input" errors across all hosting environments (Cloudflare Pages, Workers, Static SPA, Offline).
 */

export interface SafeApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status: number;
}

/**
 * Safely fetches an API route and safely parses JSON without ever throwing "Unexpected end of JSON input".
 */
export async function safeFetchJson<T = any>(
  url: string,
  options: RequestInit,
  timeoutMs = 12000
): Promise<SafeApiResponse<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const contentType = res.headers.get('content-type') || '';
    const rawText = await res.text();

    if (!rawText || rawText.trim().length === 0) {
      return {
        ok: false,
        error: `Réponse vide du serveur (${res.status})`,
        status: res.status,
      };
    }

    // Detect if static server (e.g. Cloudflare Pages SPA fallback) returned index.html instead of JSON
    if (
      !contentType.includes('application/json') &&
      (rawText.startsWith('<!DOCTYPE') || rawText.startsWith('<html') || rawText.includes('<div id="root">'))
    ) {
      return {
        ok: false,
        error: 'Point de terminaison API non disponible en mode statique.',
        status: 404,
      };
    }

    try {
      const data = JSON.parse(rawText);
      if (!res.ok) {
        return {
          ok: false,
          error: data.error || `Erreur serveur (${res.status})`,
          status: res.status,
          data,
        };
      }
      return {
        ok: true,
        data,
        status: res.status,
      };
    } catch {
      return {
        ok: false,
        error: 'Format JSON invalide reçu.',
        status: res.status,
      };
    }
  } catch (err: any) {
    clearTimeout(timer);
    const isAbort = err?.name === 'AbortError';
    return {
      ok: false,
      error: isAbort ? 'Délai d\'attente dépassé' : (err?.message || 'Erreur réseau'),
      status: 0,
    };
  }
}
