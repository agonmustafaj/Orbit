import { createGlobe } from "./globe.js";
import { initNavigation } from "./navigation.js";
import { initAnimations, runLoader } from "./animations.js";
import { initProjects } from "./projects.js";
import { initPlayground } from "./playground.js";
import { initTerminal } from "./terminal.js";
import { initCapabilities } from "./capabilities.js";

const data = window.__ORBIT__ || {};

function initContact() {
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
    creatorUrl: data.creatorUrl,
  });
  initCapabilities(data.capabilities || []);
  initContact();
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
