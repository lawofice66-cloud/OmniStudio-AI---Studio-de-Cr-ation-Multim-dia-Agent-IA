import { onRequest } from './functions/api/[[path]]';

interface Env {
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
  GEMINI_API_KEY?: string;
  API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
  FAL_KEY?: string;
  VITE_FAL_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // If it's an API route or OPTIONS preflight, route to our Cloudflare edge API handler
    if (url.pathname.startsWith('/api') || request.method === 'OPTIONS') {
      return onRequest({
        request,
        env,
        params: {},
        waitUntil: (promise: Promise<any>) => {
          if (ctx && typeof ctx.waitUntil === 'function') {
            ctx.waitUntil(promise);
          }
        },
        next: async () => {
          if (env.ASSETS) {
            return env.ASSETS.fetch(request);
          }
          return new Response('Not Found', { status: 404 });
        },
        data: {},
      } as any);
    }

    // Otherwise serve static assets from ./dist (Single Page App)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
