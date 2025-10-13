
export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

	// ============================
	// 1️⃣ Secure Cache Purge Endpoint
	// ============================
	const SECRET_KEY = "TuanTran0507"; 

	if (url.pathname === "/purge") {
	  const providedKey = url.searchParams.get("key");
	  if (providedKey !== SECRET_KEY) {
		return new Response("Unauthorized", { status: 403 });
	  }

	  // Delete everything in the cache
	  const cache = caches.default;
	  await cache.delete(new Request("https://*"));
	  return new Response("Cache purged successfully", { status: 200 });
	}
    
	  // Force HTTPS
	  if (url.protocol === "http:") {
		url.protocol = "https:";
		return Response.redirect(url.toString(), 301);
	  }

	// ============================
    // 3️⃣ Clean URLs (remove .php)
    // ============================
    if (url.pathname.endsWith(".php")) {
      url.pathname = url.pathname.replace(/\.php$/, "");
      return Response.redirect(url.toString(), 301);
    }

    // ============================
    // 4️⃣ Skip caching for certain paths or request types
    // ============================
    const noCachePaths = [
      "/wp-admin",
      "/wp-login",
      "/admin",
      "/api",
      "/form",
    ];

    const shouldBypassCache =
      request.method !== "GET" ||
      noCachePaths.some((p) => url.pathname.startsWith(p));

    if (shouldBypassCache) {
      return fetch(request);
    }

    // ============================
    // 5️⃣ Cache only solver-related requests
    // ============================
    const isSolverRequest =
       url.pathname.includes("/ws/data") ||
      url.pathname.includes("/ws/data1") ||
      url.pathname.endsWith(".php") ||
      url.pathname.endsWith(".json");

    if (!isSolverRequest) {
      return fetch(request);
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
