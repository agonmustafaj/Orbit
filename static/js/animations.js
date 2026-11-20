export function initAnimations() {
  if (!window.gsap) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".hero-title span", {
    y: 40,
    opacity: 0,
    duration: 1,
    stagger: 0.12,
    ease: "power3.out",
    delay: 0.15,
  });

  gsap.utils.toArray(".section-head").forEach((el) => {
    gsap.from(el.children, {
      scrollTrigger: { trigger: el, start: "top 80%" },
      y: 28,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power2.out",
    });
  });

  gsap.utils.toArray(".project-card").forEach((card) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: "top 85%" },
      y: 36,
      opacity: 0,
      duration: 0.85,
      ease: "power2.out",
    });
  });

  gsap.from(".contact-title span", {
    scrollTrigger: { trigger: "#contact", start: "top 70%" },
    y: 50,
    opacity: 0,
    duration: 0.9,
    stagger: 0.1,
    ease: "power3.out",
  });
}

export function runLoader(onComplete) {
  const loader = document.getElementById("loader");
  const bar = loader?.querySelector(".loader__progress");
  const pct = document.getElementById("loader-pct");
  let progress = 0;

  const set = (value) => {
    progress = Math.max(progress, Math.min(100, value));
    if (bar) bar.style.width = `${progress}%`;
    if (pct) pct.textContent = `${Math.round(progress)}%`;
  };

  return {
    set,
    finish() {
      set(100);
      loader?.setAttribute("aria-busy", "false");
      loader?.classList.add("is-done");
      onComplete?.();
      setTimeout(() => loader?.remove(), 700);
    },
  };
}
