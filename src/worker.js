export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 1. Try direct fetch
    let res = await env.ASSETS.fetch(request);
    if (res.status !== 404) return res;

    // 2. Try with .html appended (e.g. /settings -> /settings.html)
    if (!url.pathname.includes(".")) {
      const htmlUrl = new URL(request.url);
      const cleanPath = url.pathname.replace(/\/$/, "");
      htmlUrl.pathname = `${cleanPath}.html`;
      let htmlRes = await env.ASSETS.fetch(new Request(htmlUrl.toString(), request));
      if (htmlRes.status !== 404) return htmlRes;
    }

    // 3. For any dynamic /subject/*/exam routes, serve the exam client template
    if (url.pathname.startsWith("/subject/") && url.pathname.includes("/exam")) {
      const examUrl = new URL("/subject/immunology/exam.html", request.url);
      let examRes = await env.ASSETS.fetch(new Request(examUrl.toString(), request));
      if (examRes.status !== 404) return examRes;
    }

    // 4. For any dynamic /subject/* course routes, serve the subject client template
    if (url.pathname.startsWith("/subject/")) {
      const subjectUrl = new URL("/subject/immunology.html", request.url);
      let subjectRes = await env.ASSETS.fetch(new Request(subjectUrl.toString(), request));
      if (subjectRes.status !== 404) return subjectRes;
    }

    // 5. Fallback to /index.html for general SPA dynamic routing
    const rootUrl = new URL("/index.html", request.url);
    let rootRes = await env.ASSETS.fetch(new Request(rootUrl.toString(), request));
    if (rootRes.status !== 404) return rootRes;

    return res;
  }
};
