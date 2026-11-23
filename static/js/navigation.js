const SECTIONS = ["index", "playground", "about", "capabilities", "contact"];

export function initNavigation({ onSectionChange } = {}) {
  const buttons = [...document.querySelectorAll("[data-nav]")];
  const panels = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);
  const mobileNav = document.getElementById("mobile-nav");
  const mobileToggle = document.getElementById("mobile-nav-toggle");
  let current = "index";

  const navIsOpen = () => Boolean(mobileNav && !mobileNav.hasAttribute("hidden"));

  const syncBodyLock = () => {
    document.body.classList.toggle("is-nav-open", navIsOpen());
  };

  const closeMobileNav = () => {
    if (!mobileNav) return;
    mobileNav.setAttribute("hidden", "");
    mobileNav.setAttribute("aria-hidden", "true");
    mobileToggle?.setAttribute("aria-expanded", "false");
    syncBodyLock();
  };

  const openMobileNav = () => {
    if (!mobileNav) return;
    mobileNav.removeAttribute("hidden");
    mobileNav.setAttribute("aria-hidden", "false");
    mobileToggle?.setAttribute("aria-expanded", "true");
    syncBodyLock();
  };

  const toggleMobileNav = () => {
    if (navIsOpen()) closeMobileNav();
    else openMobileNav();
  };

  const setActive = (id) => {
    current = id;
    document.body.dataset.section = id;
    buttons.forEach((btn) => {
      const active = btn.getAttribute("data-nav") === id;
      btn.classList.toggle("is-active", active);
      if (btn.tagName === "A") {
        if (active) btn.setAttribute("aria-current", "true");
        else btn.removeAttribute("aria-current");
      }
    });
    onSectionChange?.(id);
  };

  const goTo = (id, { smooth = true } = {}) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Close overlays first so scroll isn't locked / offset wrong on iOS.
    closeMobileNav();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Prefer scrollIntoView; on iOS, requestAnimationFrame after unlock helps.
    requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: smooth && !reduce ? "smooth" : "auto",
        block: "start",
      });
    });
    setActive(id);
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.getAttribute("data-nav");
      if (!id) return;
      if (btn.tagName === "A") e.preventDefault();
      goTo(id);
      history.replaceState(null, "", `#${id}`);
    });
  });

  mobileToggle?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMobileNav();
  });

  document.addEventListener("click", (e) => {
    if (!navIsOpen()) return;
    const t = e.target;
    if (mobileNav?.contains(t) || mobileToggle?.contains(t)) return;
    closeMobileNav();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navIsOpen()) {
      e.preventDefault();
      closeMobileNav();
      mobileToggle?.focus();
    }
  });

  // Orientation / resize: keep menu closed so it doesn't float oddly.
  window.addEventListener("orientationchange", closeMobileNav);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActive(visible.target.id);
    },
    { rootMargin: "-35% 0px -45% 0px", threshold: [0.1, 0.35, 0.6] }
  );
  panels.forEach((p) => observer.observe(p));

  closeMobileNav();

  const hash = location.hash.replace("#", "");
  if (SECTIONS.includes(hash)) goTo(hash, { smooth: false });

  return { goTo, getCurrent: () => current, sections: SECTIONS, closeMobileNav };
}
