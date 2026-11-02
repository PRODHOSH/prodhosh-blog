// Shared plumbing for the text/XML endpoints (robots, sitemaps, feeds, llms).
// They are rendered from the database on every request and cached briefly at the CDN,
// so a post published in /admin appears in all of them within ~a minute — no redeploy.
export function sendText(res, body, contentType, { maxAge = 60, swr = 600, headers = {} } = {}) {
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`);
  res.setHeader("X-Content-Type-Options", "nosniff");
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.write(body);
  res.end();
  return { props: {} };
}
