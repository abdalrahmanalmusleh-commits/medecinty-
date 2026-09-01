export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 1. Direct fetch
    let res = await env.ASSETS.fetch(request);
    if (res.status !== 404) return res;

    // 2. Clean pathname without trailing slash
    const cleanPath = url.pathname.replace(/\/$/, "");

    // 3. Try directory index /path/index.html
    try {
      let dirRes = await env.ASSETS.fetch(new URL(`${cleanPath}/index.html`, request.url));
      if (dirRes.status !== 404) return dirRes;
    } catch (e) {}

    // 4. Try /path.html
    try {
      let htmlRes = await env.ASSETS.fetch(new URL(`${cleanPath}.html`, request.url));
      if (htmlRes.status !== 404) return htmlRes;
    } catch (e) {}

    // 5. Dynamic course routes fallback
    if (url.pathname.startsWith("/subject/") && url.pathname.includes("/exam")) {
      try {
        let examRes = await env.ASSETS.fetch(new URL("/subject/immunology/exam/index.html", request.url));
        if (examRes.status !== 404) return examRes;
      } catch (e) {}
    }

    if (url.pathname.startsWith("/subject/")) {
      try {
        let subjRes = await env.ASSETS.fetch(new URL("/subject/immunology/index.html", request.url));
        if (subjRes.status !== 404) return subjRes;
      } catch (e) {}
    }

    // 6. Root SPA fallback
    return await env.ASSETS.fetch(new URL("/index.html", request.url));
  }
};
