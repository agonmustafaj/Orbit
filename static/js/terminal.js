import { matchLore, loreHelpLine } from "./terminal-lore.js";

const HELP = `Available commands:
  help          list commands
  about         ORBIT philosophy
  projects      list work projects (when present)
  experiments   list playground experiments
  technologies  stack overview
  contact       contact channels
  topics        tech-history constellation
  clear         clear the screen
  exit          close terminal

Ask casually, e.g. "first phone" or "what was the internet called"
Hidden: orbit, matrix, whoami`;

export function initTerminal(data = {}) {
  const root = document.getElementById("terminal");
  const output = document.getElementById("terminal-output");
  const form = document.getElementById("terminal-form");
  const input = document.getElementById("terminal-input");
  const openBtn = document.getElementById("terminal-toggle");
  const closeBtn = document.getElementById("terminal-close");

  const isOpen = () => Boolean(root && !root.hasAttribute("hidden"));

  const print = (text) => {
    if (!output) return;
    output.textContent += `${text}\n`;
    output.scrollTop = output.scrollHeight;
  };

  const syncBodyLock = () => {
    document.body.classList.toggle("is-terminal-open", isOpen());
  };

  const fitToViewport = () => {
    if (!root || !isOpen()) return;
    const vv = window.visualViewport;
    if (!vv || window.innerWidth > 720) {
      root.style.bottom = "";
      root.style.height = "";
      return;
    }
    // Keep terminal above the iOS keyboard / shrinking visual viewport.
    const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    root.style.bottom = `${Math.max(8, inset + 8)}px`;
    root.style.height = `${Math.min(vv.height * 0.72, 520)}px`;
  };

  const open = () => {
    if (!root) return;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    openBtn?.setAttribute("aria-expanded", "true");
    if (output && !output.dataset.booted) {
      print("ORBIT terminal online. Type `help` or ask a tech-history question.");
      print(loreHelpLine());
      output.dataset.booted = "1";
    }
    syncBodyLock();
    fitToViewport();
    // Delay focus so iOS keyboard + layout settle without jump.
    requestAnimationFrame(() => input?.focus({ preventScroll: true }));
  };

  const close = () => {
    if (!root) return;
    root.setAttribute("hidden", "");
    root.setAttribute("aria-hidden", "true");
    openBtn?.setAttribute("aria-expanded", "false");
    root.style.bottom = "";
    root.style.height = "";
    syncBodyLock();
    openBtn?.focus({ preventScroll: true });
  };

  const run = (raw) => {
    const trimmed = raw.trim();
    const cmd = trimmed.toLowerCase();
    print(`› ${raw}`);

    switch (cmd) {
      case "help":
        print(HELP);
        return;
      case "about":
        print("ORBIT is a digital universe for ideas, experiments, and craft.\nExplore. Create. Evolve.");
        return;
      case "projects":
        print(
          (data.projects || [])
            .map((p) => `${p.number} — ${p.title} [${p.category}]`)
            .join("\n") || "No projects loaded."
        );
        return;
      case "experiments":
        print(
          (data.experiments || [])
            .map((e) => `${e.number} — ${e.title}`)
            .join("\n") || "No experiments loaded."
        );
        return;
      case "technologies":
        print(
          (data.capabilities || [])
            .map((c) => `${c.name} · ${c.category}`)
            .join("\n")
        );
        return;
      case "contact":
        print(
          `Operator: ${data.creator || "Agon Mustafaj"}\n` +
            `Email: ${data.email || "agonmustafaj01@gmail.com"}\n` +
            `Site: ${data.creatorUrl || "https://agonmustafaj.com/"}\n` +
            `Section: #contact`
        );
        return;
      case "clear":
        if (output) output.textContent = "";
        return;
      case "exit":
      case "quit":
      case "close":
        close();
        return;
      case "orbit":
        print("◯ ring synchronized · violet core stable · welcome traveler");
        return;
      case "matrix":
        print("There is no spoon — only wireframes and intention.");
        return;
      case "whoami":
        print(
          `${data.creator || "Agon Mustafaj"}\n` +
            `${data.email || "agonmustafaj01@gmail.com"}\n` +
            `${data.creatorUrl || "https://agonmustafaj.com/"}\n` +
            `Role: ORBIT operator`
        );
        return;
      case "":
        return;
      default:
        break;
    }

    const lore = matchLore(trimmed);
    if (lore) {
      print(lore);
      return;
    }

    print(
      `Signal unclear: “${trimmed}”.\nTry help, topics, or a history question like “who built the first pc”.`
    );
  };

  openBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen()) close();
    else open();
  });

  closeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    close();
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value;
    input.value = "";
    run(value);
  });

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (isOpen()) close();
      else open();
      return;
    }
    if (e.key === "Escape" && isOpen()) {
      e.preventDefault();
      close();
    }
  });

  window.visualViewport?.addEventListener("resize", fitToViewport);
  window.visualViewport?.addEventListener("scroll", fitToViewport);

  if (root) {
    root.setAttribute("hidden", "");
    root.setAttribute("aria-hidden", "true");
  }
  openBtn?.setAttribute("aria-expanded", "false");
  syncBodyLock();

  return { open, close, run };
}
