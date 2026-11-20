import { createGlobe } from "./globe.js";
import { initNavigation } from "./navigation.js";
import { initAnimations, runLoader } from "./animations.js";
import { initProjects } from "./projects.js";
import { initPlayground } from "./playground.js";
import { initTerminal } from "./terminal.js";
import { initCapabilities } from "./capabilities.js";

const data = window.__ORBIT__ || {};

function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const submit = document.getElementById("contact-submit");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form-status mono";
    status.textContent = "";

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
      website: form.website.value.trim(),
    };

    if (payload.name.length < 2 || payload.subject.length < 3 || payload.message.length < 10) {
      status.classList.add("is-error");
      status.textContent = "Please complete all fields with enough detail.";
      return;
    }

    submit.disabled = true;
    status.textContent = "Sending…";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      status.classList.add(json.ok ? "is-ok" : "is-error");
      status.textContent = json.message || (json.ok ? "Message received." : "Something went wrong.");
      if (json.ok) form.reset();
    } catch {
      status.classList.add("is-error");
      status.textContent = "Network error. Please try again or email us directly.";
    } finally {
      submit.disabled = false;
    }
  });

  const copyBtn = document.getElementById("copy-email");
  const feedback = document.getElementById("copy-feedback");
  copyBtn?.addEventListener("click", async () => {
    const email = copyBtn.getAttribute("data-email") || data.email;
    try {
      await navigator.clipboard.writeText(email);
      if (feedback) feedback.textContent = "Copied";
      setTimeout(() => {
        if (feedback) feedback.textContent = "Copy";
      }, 1600);
    } catch {
      if (feedback) feedback.textContent = "Select & copy";
    }
  });
}

async function boot() {
  window.lucide?.createIcons();
  const loader = runLoader();
  loader.set(12);

  const canvas = document.getElementById("globe-canvas");
  const fallback = document.getElementById("webgl-fallback");
  let globe = null;

  const cssGlobe = document.getElementById("globe-fallback");
  const showGlobeFallback = (reason) => {
    console.warn("[ORBIT] WebGL globe fallback:", reason || "unknown");
    if (fallback) fallback.hidden = false;
    if (cssGlobe) {
      cssGlobe.hidden = false;
      cssGlobe.setAttribute("aria-hidden", "false");
    }
    if (canvas) canvas.style.opacity = "0";
    loader.set(55);
  };

  try {
    globe = createGlobe(canvas, {
      onReady: () => {
        if (fallback) fallback.hidden = true;
        if (cssGlobe) {
          cssGlobe.hidden = true;
          cssGlobe.setAttribute("aria-hidden", "true");
        }
        if (canvas) canvas.style.opacity = "";
        loader.set(55);
      },
      onFallback: showGlobeFallback,
    });
    if (!globe) {
      // createGlobe already invoked onFallback when it returns null
    }
  } catch (err) {
    showGlobeFallback(String(err?.message || err));
  }

  loader.set(70);
  const nav = initNavigation({
    onSectionChange: (id) => globe?.setSectionInfluence?.(id),
  });
  initProjects(data.projects || []);
  initPlayground();
  initTerminal({
    projects: data.projects,
    experiments: data.experiments,
    capabilities: data.capabilities,
    email: data.email,
    creator: data.creator,
  });
  initCapabilities(data.capabilities || []);
  initContactForm();
  initAnimations();
  loader.set(92);

  // Reflect actual readiness
  requestAnimationFrame(() => {
    loader.finish();
    if (location.hash) {
      const id = location.hash.slice(1);
      nav.goTo(id, { smooth: false });
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
