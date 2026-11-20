/**
 * Cloudflare Pages Advanced Mode worker for ORBIT.
 * Serves static assets via ASSETS and handles /api/* routes.
 */

const RATE = new Map();

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

function clientIp(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function allowRequest(ip, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const bucket = RATE.get(ip) || [];
  const fresh = bucket.filter((t) => now - t < windowMs);
  if (fresh.length >= limit) {
    RATE.set(ip, fresh);
    return false;
  }
  fresh.push(now);
  RATE.set(ip, fresh);
  return true;
}

async function loadPortfolio(env, request) {
  const assetUrl = new URL("/static/data/portfolio.json", request.url);
  const res = await env.ASSETS.fetch(new Request(assetUrl));
  if (!res.ok) throw new Error("portfolio missing");
  return res.json();
}

function validateContact(body) {
  const name = String(body.name || "").trim().replace(/\s+/g, " ");
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim().replace(/\s+/g, " ");
  const message = String(body.message || "").trim().replace(/\s+/g, " ");
  const website = String(body.website || "");
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (name.length < 2 || name.length > 80) return { ok: false, error: "Invalid name" };
  if (!emailOk) return { ok: false, error: "Invalid email" };
  if (subject.length < 3 || subject.length > 120) return { ok: false, error: "Invalid subject" };
  if (message.length < 10 || message.length > 4000) return { ok: false, error: "Invalid message" };
  return { ok: true, payload: { name, email, subject, message, website } };
}

async function handleContact(request, env) {
  if (!allowRequest(clientIp(request))) {
    return json(
      { ok: false, delivered: false, message: "Too many requests. Please wait a moment and try again." },
      429
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, delivered: false, message: "Invalid JSON body" }, 400);
  }

  const checked = validateContact(body);
  if (!checked.ok) {
    return json({ ok: false, delivered: false, message: checked.error }, 422);
  }

  // Honeypot
  if (checked.payload.website.trim()) {
    return json({ ok: true, delivered: false, message: "Message received." });
  }

  const canDeliver = Boolean(env.RESEND_API_KEY && env.CONTACT_FROM && env.CONTACT_TO);
  if (!canDeliver) {
    console.log("ORBIT contact (no delivery configured)", checked.payload.email, checked.payload.subject);
    return json({
      ok: true,
      delivered: false,
      message:
        "Message received and validated. Email delivery is not configured on this server yet — your note was logged for review.",
    });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: checked.payload.email,
      subject: `[ORBIT] ${checked.payload.subject}`,
      text: `Name: ${checked.payload.name}\nEmail: ${checked.payload.email}\nSubject: ${checked.payload.subject}\n\n${checked.payload.message}\n`,
    }),
  });

  if (!res.ok) {
    console.error("Resend failed", res.status, await res.text());
    return json(
      {
        ok: false,
        delivered: false,
        message: "Unable to deliver your message right now. Please email us directly.",
      },
      502
    );
  }

  return json({
    ok: true,
    delivered: true,
    message: "Message sent successfully. We'll be in touch soon.",
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        service: "orbit",
        env: "pages",
        emailDelivery: Boolean(env.RESEND_API_KEY && env.CONTACT_FROM && env.CONTACT_TO),
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

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env);
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ ok: false, detail: "Not found" }, 404);
    }

    // Static assets / HTML
    return env.ASSETS.fetch(request);
  },
};
