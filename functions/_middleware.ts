
export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  // Force HTTPS
  if (url.protocol === "http:") {
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }

  // Example caching logic
  const cache = caches.default;
  const cacheKey = new Request(url.toString(), context.request);
  let response = await cache.match(cacheKey);
  if (!response) {
    response = await context.next();
    response.headers.set("Cache-Control", "public, max-age=86400");
    cache.put(cacheKey, response.clone());
  }
  return response;
};
