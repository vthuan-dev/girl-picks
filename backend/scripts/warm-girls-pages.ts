/**
 * Simple script to warm girls listing pages in cache.
 *
 * Usage (from backend folder):
 *   npx ts-node scripts/warm-girls-pages.ts
 *
 * You can override the target site and page range via env:
 *   WARM_SITE_URL=https://gaigo1.net WARM_GIRLS_MAX_PAGE=20 npx ts-node scripts/warm-girls-pages.ts
 */

const SITE =
  process.env.WARM_SITE_URL?.replace(/\/$/, '') || 'https://gaigo1.net';

const MAX_PAGE = Number(process.env.WARM_GIRLS_MAX_PAGE || 20);

async function warmGirlsPages() {
  console.log(
    `Warming girls pages 1..${MAX_PAGE} on ${SITE} (this will hit /girls?page=X)`,
  );

  for (let page = 1; page <= MAX_PAGE; page++) {
    const url = `${SITE}/girls?page=${page}`;
    const startedAt = Date.now();

    try {
      const res = await fetch(url, {
        method: 'GET',
        // Avoid downloading images / other assets, we only care about HTML/JSON response
        headers: {
          'User-Agent': 'WarmGirlsCacheScript/1.0',
        },
      });

      const duration = Date.now() - startedAt;

      if (!res.ok) {
        console.error(
          `[warm-girls-pages] ${url} -> HTTP ${res.status} in ${duration}ms`,
        );
      } else {
        console.log(
          `[warm-girls-pages] OK ${url} -> ${res.status} in ${duration}ms`,
        );
      }
    } catch (error: any) {
      const duration = Date.now() - startedAt;
      console.error(
        `[warm-girls-pages] ERROR ${url} in ${duration}ms ->`,
        error?.message || error,
      );
    }

    // Small delay between requests to avoid hammering the server/CDN
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log('[warm-girls-pages] Done.');
}

warmGirlsPages().catch((err) => {
  console.error('[warm-girls-pages] Unexpected error:', err);
  process.exit(1);
});


