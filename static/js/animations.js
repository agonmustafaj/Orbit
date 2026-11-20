export function initAnimations() {
  if (!window.gsap) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  gsap.registerPlugin(ScrollTrigger);

  const mobile =
    window.innerWidth < 720 || window.matchMedia("(pointer: coarse)").matches;
  // Lighter motion on phones — fewer ScrollTriggers = less jank while scrolling.
  const dist = mobile ? 18 : 40;
  const dur = mobile ? 0.55 : 1;

  gsap.from(".hero-title span", {
    y: dist,
    opacity: 0,
    duration: dur,
    stagger: mobile ? 0.06 : 0.12,
    ease: "power3.out",
    delay: 0.1,
  });

  if (mobile) {
    // One combined reveal per section head instead of per-child scroll triggers.
    gsap.utils.toArray(".section-head").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        y: 16,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    });
    return;
  }

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
