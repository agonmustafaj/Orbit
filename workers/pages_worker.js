/**
 * Cloudflare Pages Advanced Mode worker for ORBIT.
 * Serves static assets via ASSETS and handles /api/* routes.
 */

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

async function loadPortfolio(env, request) {
  const assetUrl = new URL("/static/data/portfolio.json", request.url);
  const res = await env.ASSETS.fetch(new Request(assetUrl));
  if (!res.ok) throw new Error("portfolio missing");
  return res.json();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        service: "orbit",
        env: "pages",
      });
    }

    if (url.pathname === "/api/site" && request.method === "GET") {
      const data = await loadPortfolio(env, request);
      return json({
        ok: true,
        site: data.site || {},
        capabilities: data.capabilities || [],
        experiments: data.experiments || [],
      });
    }

    if (url.pathname === "/api/projects" && request.method === "GET") {
      const data = await loadPortfolio(env, request);
      return json({ ok: true, projects: data.projects || [] });
    }

    const projectMatch = url.pathname.match(/^\/api\/projects\/([^/]+)$/);
    if (projectMatch && request.method === "GET") {
      const data = await loadPortfolio(env, request);
      const id = decodeURIComponent(projectMatch[1]);
      const project = (data.projects || []).find((p) => p.id === id || p.number === id);
      if (!project) return json({ ok: false, detail: "Project not found" }, 404);
      return json({ ok: true, project });
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ ok: false, detail: "Not found" }, 404);
    }

    // Static assets / HTML
    return env.ASSETS.fetch(request);
  },
};
