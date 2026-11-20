const SECTIONS = ["index", "work", "playground", "about", "capabilities", "contact"];

export function initNavigation({ onSectionChange } = {}) {
  const buttons = [...document.querySelectorAll("[data-nav]")];
  const panels = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);
  const mobileNav = document.getElementById("mobile-nav");
  const mobileToggle = document.getElementById("mobile-nav-toggle");
  let current = "index";

  const navIsOpen = () => Boolean(mobileNav && !mobileNav.hasAttribute("hidden"));

  const closeMobileNav = () => {
    if (!mobileNav) return;
    mobileNav.setAttribute("hidden", "");
    mobileNav.setAttribute("aria-hidden", "true");
    mobileToggle?.setAttribute("aria-expanded", "false");
  };

  const openMobileNav = () => {
    if (!mobileNav) return;
    mobileNav.removeAttribute("hidden");
    mobileNav.setAttribute("aria-hidden", "false");
    mobileToggle?.setAttribute("aria-expanded", "true");
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
    el.scrollIntoView({
      behavior:
        smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "smooth"
          : "auto",
      block: "start",
    });
    setActive(id);
    closeMobileNav();
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

  // Outside / overlay click closes menu
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
